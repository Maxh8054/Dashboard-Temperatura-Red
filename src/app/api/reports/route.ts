import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET all reports
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reportId = searchParams.get('id')

    if (reportId) {
      // Get single report with all relations
      const report = await db.report.findUnique({
        where: { id: reportId },
        include: {
          machines: {
            include: {
              services: {
                include: {
                  photos: true
                }
              },
              desvios: true,
              displacements: true
            }
          }
        }
      })

      if (!report) {
        return NextResponse.json({ error: 'Relatório não encontrado' }, { status: 404 })
      }

      // Transform to match frontend format
      const transformedReport = transformReportToFrontend(report)
      return NextResponse.json({ report: transformedReport })
    }

    // Get all reports
    const reports = await db.report.findMany({
      include: {
        machines: {
          include: {
            services: {
              include: {
                photos: true
              }
            },
            desvios: true,
            displacements: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const transformedReports = reports.map(transformReportToFrontend)

    return NextResponse.json({ reports: transformedReports })
  } catch (error) {
    console.error('Get reports error:', error)
    return NextResponse.json({ reports: [] })
  }
}

// POST create new report
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { report, createdBy } = body

    // Generate report number
    const shiftLabel = report.shift === 'day' ? 'Diurno' : 'Noturno'
    const reportNumber = `Relatório ${shiftLabel} ${report.date} ${report.technicianName || 'Técnico'}`

    // Create report with machines
    const newReport = await db.report.create({
      data: {
        reportNumber,
        status: 'completed',
        date: report.date,
        startTime: report.startTime || '',
        endTime: report.endTime,
        shift: report.shift,
        weather: report.weather,
        ddsTheme: report.ddsTheme,
        technicianName: report.technicianName,
        signaturePhoto: report.signaturePhoto,
        createdById: createdBy || null,
        machines: {
          create: report.machines.map((machine: any) => ({
            equipmentName: machine.equipmentName,
            hourMeter: machine.hourMeter,
            location: machine.location,
            machinePhoto: machine.machinePhoto,
            maintenanceType: machine.maintenanceType,
            priority: machine.priority || 'normal',
            downtimeTime: machine.downtimeTime,  // Mudou de downtimeHours
            correctiveCategories: JSON.stringify(machine.correctiveCategories || []),
            correctiveOther: machine.correctiveOther,
            // Removido: preventiveInterval, preventiveCategories, preventiveOther
            programadaEvent: machine.programadaEvent,
            programadaCategories: JSON.stringify(machine.programadaCategories || []),
            programadaOther: machine.programadaOther,
            download: machine.download || false,
            downloadPhoto: machine.downloadPhoto,
            conclusao: machine.conclusao,
            // Removido: interferencia
            pendingItems: machine.pendingItems,
            isComplete: machine.isComplete || false,
            services: {
              create: machine.services?.map((service: any) => ({
                description: service.description,
                photos: {
                  create: service.photos?.map((photo: any) => ({
                    type: photo.type,
                    imageData: photo.imageData,
                    editedImageData: photo.editedImageData,
                    annotations: photo.annotations
                  })) || []
                }
              })) || []
            },
            desvios: {
              create: machine.desvios?.map((desvio: any) => ({
                description: desvio.description,
                time: desvio.time,
                endTime: desvio.endTime
              })) || []
            },
            displacements: {
              create: machine.deslocamentos?.map((desloc: any) => ({
                from: desloc.from,
                to: desloc.to,
                startTime: desloc.startTime,
                endTime: desloc.endTime,
                observacao: desloc.observacao  // Novo campo
              })) || []
            }
          }))
        }
      },
      include: {
        machines: {
          include: {
            services: {
              include: { photos: true }
            },
            desvios: true,
            displacements: true
          }
        }
      }
    })

    const transformedReport = transformReportToFrontend(newReport)

    return NextResponse.json({ report: transformedReport })
  } catch (error) {
    console.error('Create report error:', error)
    return NextResponse.json({ error: 'Erro ao criar relatório' }, { status: 500 })
  }
}

// PUT update report
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { reportId, report } = body

    if (!reportId) {
      return NextResponse.json({ error: 'ID do relatório é obrigatório' }, { status: 400 })
    }

    // Delete existing machines and recreate (simpler than updating nested relations)
    await db.machine.deleteMany({
      where: { reportId }
    })

    // Update report
    const updatedReport = await db.report.update({
      where: { id: reportId },
      data: {
        date: report.date,
        startTime: report.startTime || '',
        endTime: report.endTime,
        shift: report.shift,
        weather: report.weather,
        ddsTheme: report.ddsTheme,
        technicianName: report.technicianName,
        signaturePhoto: report.signaturePhoto,
        machines: {
          create: report.machines.map((machine: any) => ({
            equipmentName: machine.equipmentName,
            hourMeter: machine.hourMeter,
            location: machine.location,
            machinePhoto: machine.machinePhoto,
            maintenanceType: machine.maintenanceType,
            priority: machine.priority || 'normal',
            downtimeTime: machine.downtimeTime,  // Mudou de downtimeHours
            correctiveCategories: JSON.stringify(machine.correctiveCategories || []),
            correctiveOther: machine.correctiveOther,
            // Removido: preventiveInterval, preventiveCategories, preventiveOther
            programadaEvent: machine.programadaEvent,
            programadaCategories: JSON.stringify(machine.programadaCategories || []),
            programadaOther: machine.programadaOther,
            download: machine.download || false,
            downloadPhoto: machine.downloadPhoto,
            conclusao: machine.conclusao,
            // Removido: interferencia
            pendingItems: machine.pendingItems,
            isComplete: machine.isComplete || false,
            services: {
              create: machine.services?.map((service: any) => ({
                description: service.description,
                photos: {
                  create: service.photos?.map((photo: any) => ({
                    type: photo.type,
                    imageData: photo.imageData,
                    editedImageData: photo.editedImageData,
                    annotations: photo.annotations
                  })) || []
                }
              })) || []
            },
            desvios: {
              create: machine.desvios?.map((desvio: any) => ({
                description: desvio.description,
                time: desvio.time,
                endTime: desvio.endTime
              })) || []
            },
            displacements: {
              create: machine.deslocamentos?.map((desloc: any) => ({
                from: desloc.from,
                to: desloc.to,
                startTime: desloc.startTime,
                endTime: desloc.endTime,
                observacao: desloc.observacao  // Novo campo
              })) || []
            }
          }))
        }
      },
      include: {
        machines: {
          include: {
            services: {
              include: { photos: true }
            },
            desvios: true,
            displacements: true
          }
        }
      }
    })

    const transformedReport = transformReportToFrontend(updatedReport)

    return NextResponse.json({ report: transformedReport })
  } catch (error) {
    console.error('Update report error:', error)
    return NextResponse.json({ error: 'Erro ao atualizar relatório' }, { status: 500 })
  }
}

// DELETE report
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reportId = searchParams.get('id')

    if (!reportId) {
      return NextResponse.json({ error: 'ID do relatório é obrigatório' }, { status: 400 })
    }

    await db.report.delete({
      where: { id: reportId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete report error:', error)
    return NextResponse.json({ error: 'Erro ao excluir relatório' }, { status: 500 })
  }
}

// Transform database report to frontend format
function transformReportToFrontend(report: any) {
  return {
    id: report.id,
    reportNumber: report.reportNumber,
    status: report.status,
    date: report.date,
    startTime: report.startTime,
    endTime: report.endTime,
    shift: report.shift,
    weather: report.weather,
    ddsTheme: report.ddsTheme,
    technicianName: report.technicianName,
    signaturePhoto: report.signaturePhoto,
    createdBy: report.createdById,
    createdAt: report.createdAt?.toISOString(),
    machines: report.machines?.map((machine: any) => ({
      id: machine.id,
      equipmentName: machine.equipmentName,
      hourMeter: machine.hourMeter,
      location: machine.location,
      machinePhoto: machine.machinePhoto,
      maintenanceType: machine.maintenanceType,
      priority: machine.priority,
      downtimeTime: machine.downtimeTime,  // Mudou de downtimeHours
      correctiveCategories: JSON.parse(machine.correctiveCategories || '[]'),
      correctiveOther: machine.correctiveOther,
      // Removido: preventiveInterval, preventiveCategories, preventiveOther
      programadaEvent: machine.programadaEvent,
      programadaCategories: JSON.parse(machine.programadaCategories || '[]'),
      programadaOther: machine.programadaOther,
      download: machine.download,
      downloadPhoto: machine.downloadPhoto,
      conclusao: machine.conclusao,
      // Removido: interferencia
      pendingItems: machine.pendingItems,
      isComplete: machine.isComplete,
      services: machine.services?.map((service: any) => ({
        id: service.id,
        description: service.description,
        photos: service.photos?.map((photo: any) => ({
          id: photo.id,
          type: photo.type,
          imageData: photo.imageData,
          editedImageData: photo.editedImageData,
          annotations: photo.annotations
        })) || []
      })) || [],
      desvios: machine.desvios?.map((desvio: any) => ({
        id: desvio.id,
        description: desvio.description,
        time: desvio.time,
        endTime: desvio.endTime
      })) || [],
      deslocamentos: machine.displacements?.map((desloc: any) => ({
        id: desloc.id,
        from: desloc.from,
        to: desloc.to,
        startTime: desloc.startTime,
        endTime: desloc.endTime,
        observacao: desloc.observacao  // Novo campo
      })) || []
    })) || []
  }
}
