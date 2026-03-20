/**
 * MaxReport Pro - Export/Import API
 * Export and import reports as JSON
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import JSZip from 'jszip'

// Helper to convert base64 to buffer
function base64ToBuffer(base64: string): Buffer {
  const base64Data = base64.replace(/^data:image\/\w+;base64,/, '')
  return Buffer.from(base64Data, 'base64')
}

// GET - Export reports as JSON or ZIP with photos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reportId = searchParams.get('id')
    const format = searchParams.get('format') || 'json' // json or zip
    const includePhotos = searchParams.get('photos') === 'true'
    
    if (reportId) {
      // Export single report
      const report = await db.sharedReport.findUnique({
        where: { id: reportId }
      })
      
      if (!report) {
        return NextResponse.json({ error: 'Relatório não encontrado' }, { status: 404 })
      }
      
      const reportData = {
        ...report,
        data: JSON.parse(report.data)
      }
      
      if (format === 'zip' && includePhotos) {
        // Export as ZIP with photos
        return await exportReportAsZip(reportData)
      }
      
      // Export as JSON
      return new NextResponse(JSON.stringify(reportData, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="relatorio_${report.reportNumber?.replace(/\s+/g, '_') || report.id}.json"`
        }
      })
    }
    
    // Export all reports
    const reports = await db.sharedReport.findMany({
      orderBy: { createdAt: 'desc' }
    })
    
    const reportsData = reports.map(r => ({
      ...r,
      data: JSON.parse(r.data)
    }))
    
    if (format === 'zip' && includePhotos) {
      // Export all as ZIP with photos
      return await exportAllReportsAsZip(reportsData)
    }
    
    // Export all as JSON
    return new NextResponse(JSON.stringify(reportsData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="todos_relatorios_${new Date().toISOString().split('T')[0]}.json"`
      }
    })
  } catch (error) {
    console.error('Error exporting reports:', error)
    return NextResponse.json({ error: 'Erro ao exportar relatórios' }, { status: 500 })
  }
}

// POST - Import reports from JSON
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Support both single report and array of reports
    const reports = Array.isArray(body) ? body : [body]
    
    const importedReports = []
    
    for (const reportData of reports) {
      // Check if report with this number already exists
      const existing = await db.sharedReport.findFirst({
        where: { reportNumber: reportData.reportNumber }
      })
      
      if (existing) {
        // Update existing report
        const updated = await db.sharedReport.update({
          where: { id: existing.id },
          data: {
            status: reportData.status,
            date: reportData.date,
            startTime: reportData.startTime,
            endTime: reportData.endTime,
            shift: reportData.shift,
            technicianName: reportData.technicianName,
            ddsTheme: reportData.ddsTheme,
            weather: reportData.weather,
            data: JSON.stringify(reportData.data || reportData),
            signaturePhoto: reportData.signaturePhoto,
          }
        })
        importedReports.push({ ...updated, data: JSON.parse(updated.data), imported: 'updated' })
      } else {
        // Create new report
        const created = await db.sharedReport.create({
          data: {
            reportNumber: reportData.reportNumber || `REL-${Date.now()}`,
            status: reportData.status || 'completed',
            date: reportData.date || new Date().toISOString().split('T')[0],
            startTime: reportData.startTime || '',
            endTime: reportData.endTime,
            shift: reportData.shift,
            technicianName: reportData.technicianName,
            ddsTheme: reportData.ddsTheme,
            weather: reportData.weather,
            data: JSON.stringify(reportData.data || reportData),
            signaturePhoto: reportData.signaturePhoto,
          }
        })
        importedReports.push({ ...created, data: JSON.parse(created.data), imported: 'created' })
      }
    }
    
    return NextResponse.json({
      success: true,
      imported: importedReports.length,
      reports: importedReports
    })
  } catch (error) {
    console.error('Error importing reports:', error)
    return NextResponse.json({ error: 'Erro ao importar relatórios' }, { status: 500 })
  }
}

// Export single report as ZIP with photos
async function exportReportAsZip(report: Record<string, unknown>) {
  const zip = new JSZip()
  const folderName = `Relatorio_${report.reportNumber?.toString().replace(/\s+/g, '_') || report.id}`
  const folder = zip.folder(folderName)
  
  if (!folder) {
    throw new Error('Error creating folder')
  }
  
  // Add JSON file
  const jsonToExport = { ...report }
  folder.file('relatorio.json', JSON.stringify(jsonToExport, null, 2))
  
  // Extract photos from report data
  const reportData = report.data as {
    machines?: Array<{
      equipmentName?: string
      machinePhoto?: string
      services?: Array<{
        description: string
        photos?: Array<{
          type: string
          imageData: string
          editedImageData?: string
        }>
      }>
    }>
    signaturePhoto?: string
  }
  
  // Add machine photos
  const photosFolder = folder.folder('fotos')
  if (photosFolder && reportData.machines) {
    for (let machineIdx = 0; machineIdx < reportData.machines.length; machineIdx++) {
      const machine = reportData.machines[machineIdx]
      const machineFolderName = machine.equipmentName || `Maquina_${machineIdx + 1}`
      const machineFolder = photosFolder.folder(machineFolderName)
      
      if (machineFolder) {
        // Machine photo
        if (machine.machinePhoto && typeof machine.machinePhoto === 'string' && machine.machinePhoto.startsWith('data:image')) {
          const buffer = base64ToBuffer(machine.machinePhoto)
          machineFolder.file('00_Foto_Equipamento.jpg', buffer)
        }
        
        // Service photos
        if (machine.services) {
          let photoCount = 1
          for (const service of machine.services) {
            if (service.photos) {
              for (const photo of service.photos) {
                const photoData = photo.editedImageData || photo.imageData
                if (photoData && typeof photoData === 'string' && photoData.startsWith('data:image')) {
                  const buffer = base64ToBuffer(photoData)
                  const typeLabel = photo.type === 'before' ? 'ANTES' : photo.type === 'after' ? 'DEPOIS' : 'GERAL'
                  const safeServiceName = service.description.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30)
                  const fileName = `${String(photoCount).padStart(2, '0')}_${safeServiceName}_${typeLabel}.jpg`
                  machineFolder.file(fileName, buffer)
                  photoCount++
                }
              }
            }
          }
        }
      }
    }
    
    // Signature photo
    if (reportData.signaturePhoto && typeof reportData.signaturePhoto === 'string' && reportData.signaturePhoto.startsWith('data:image')) {
      const buffer = base64ToBuffer(reportData.signaturePhoto)
      photosFolder.file('assinatura.jpg', buffer)
    }
  }
  
  // Generate ZIP
  const content = await zip.generateAsync({ type: 'arraybuffer' })
  
  return new NextResponse(content, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${folderName}.zip"`
    }
  })
}

// Export all reports as ZIP
async function exportAllReportsAsZip(reports: Record<string, unknown>[]) {
  const zip = new JSZip()
  const mainFolderName = `Todos_Relatorios_${new Date().toISOString().split('T')[0]}`
  const mainFolder = zip.folder(mainFolderName)
  
  if (!mainFolder) {
    throw new Error('Error creating folder')
  }
  
  // Add all reports JSON
  mainFolder.file('relatorios.json', JSON.stringify(reports, null, 2))
  
  // Add photos for each report
  const photosFolder = mainFolder.folder('fotos')
  
  if (photosFolder) {
    for (const report of reports) {
      const reportFolderName = report.reportNumber?.toString().replace(/\s+/g, '_') || report.id?.toString() || 'report'
      const reportFolder = photosFolder.folder(reportFolderName)
      
      if (reportFolder) {
        const reportData = report.data as {
          machines?: Array<{
            equipmentName?: string
            machinePhoto?: string
            services?: Array<{
              description: string
              photos?: Array<{
                type: string
                imageData: string
                editedImageData?: string
              }>
            }>
          }>
        }
        
        if (reportData.machines) {
          for (let machineIdx = 0; machineIdx < reportData.machines.length; machineIdx++) {
            const machine = reportData.machines[machineIdx]
            const machineFolderName = machine.equipmentName || `Maquina_${machineIdx + 1}`
            const machineFolder = reportFolder.folder(machineFolderName)
            
            if (machineFolder) {
              // Machine photo
              if (machine.machinePhoto && typeof machine.machinePhoto === 'string' && machine.machinePhoto.startsWith('data:image')) {
                const buffer = base64ToBuffer(machine.machinePhoto)
                machineFolder.file('00_Foto_Equipamento.jpg', buffer)
              }
              
              // Service photos
              if (machine.services) {
                let photoCount = 1
                for (const service of machine.services) {
                  if (service.photos) {
                    for (const photo of service.photos) {
                      const photoData = photo.editedImageData || photo.imageData
                      if (photoData && typeof photoData === 'string' && photoData.startsWith('data:image')) {
                        const buffer = base64ToBuffer(photoData)
                        const typeLabel = photo.type === 'before' ? 'ANTES' : photo.type === 'after' ? 'DEPOIS' : 'GERAL'
                        const safeServiceName = service.description.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30)
                        const fileName = `${String(photoCount).padStart(2, '0')}_${safeServiceName}_${typeLabel}.jpg`
                        machineFolder.file(fileName, buffer)
                        photoCount++
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  
  // Generate ZIP
  const content = await zip.generateAsync({ type: 'arraybuffer' })
  
  return new NextResponse(content, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${mainFolderName}.zip"`
    }
  })
}
