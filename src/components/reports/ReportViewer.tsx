/**
 * MaxReport Pro - Report Viewer
 * Professional fullscreen slide-based presentation view for completed reports
 * RESPONSIVE - Mobile First
 * Cores: Branco e Laranja #ff6600
 */

'use client'

import { useState, useEffect } from 'react'
import { type ReportDraft } from '@/lib/store'
import {
  ChevronLeft,
  ChevronRight,
  X,
  Truck,
  Wrench,
  User,
  Info,
  CheckCircle,
  List,
  Camera,
  FileText,
  Download,
  ChevronUp,
  ChevronDown,
  Calendar,
  MapPin,
  Clock,
} from 'lucide-react'
import JSZip from 'jszip'

interface ReportViewerProps {
  report: ReportDraft | null
  onClose: () => void
}

// Cor principal
const ORANGE = '#ff6600'

// Tipo para foto ampliada
interface PhotoView {
  data: string
  type: string
  serviceName: string
  machineName: string
  photoIndex: number
}

export function ReportViewer({ report, onClose }: ReportViewerProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isDownloadingPhotos, setIsDownloadingPhotos] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoView | null>(null)

  const totalSlides = 2 + (report?.machines?.length || 0) + 1

  const nextSlide = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(currentSlide + 1)
    }
  }

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    }
  }

  const getShiftTime = (shift: string) => {
    if (shift === 'day') return '07:00 às 19:00'
    if (shift === 'night') return '19:00 às 07:00'
    return '-'
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    // Converte de 2026-03-06 para 06/03/2026
    const parts = dateStr.split('-')
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`
    }
    return dateStr
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      preventive: 'Preventiva',
      corrective: 'Corretiva',
      programada: 'Programada',
      inspection: 'Inspeção',
      operando: 'Operando'
    }
    return labels[type] || '-'
  }

  // SVG Icons for HTML export - WHITE versions for headers
  const ICONS_WHITE = {
    truck: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18h4a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-3.35A1 1 0 0 0 15.52 9H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>`,
    truck18: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18h4a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-3.35A1 1 0 0 0 15.52 9H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>`,
    list: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>`,
    info: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`,
    wrench: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
    camera: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>`,
    check: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff6600" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`,
    checkCircle: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>`,
    fileText: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>`,
    user: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    mapPin: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#666666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`,
    clock: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#666666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  }

  // SVG Icons for HTML export - ORANGE versions for cover slide
  const ICONS_ORANGE = {
    calendar: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff6600" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>`,
    truck: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff6600" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18h4a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-3.35A1 1 0 0 0 15.52 9H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>`,
    user: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff6600" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  }

  // Touch navigation
  const [touchStart, setTouchStart] = useState(0)
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX)
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStart - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextSlide()
      else prevSlide()
    }
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextSlide()
      if (e.key === 'ArrowLeft') prevSlide()
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentSlide, onClose])

  // Download all photos organized by machine and service
  const downloadAllPhotos = async () => {
    if (!report?.machines?.length) return

    // Check if there are any photos or services
    const hasContent = report.machines.some(m => 
      m.machinePhoto || 
      (m.services && m.services.some(s => s.photos && s.photos.length > 0))
    )

    if (!hasContent) {
      alert('Nenhuma foto para baixar')
      return
    }

    setIsDownloadingPhotos(true)

    try {
      const zip = new JSZip()
      
      // Process each machine
      for (const machine of report.machines) {
        const machineName = machine.equipmentName || 'Maquina_Sem_Nome'
        const machineFolder = zip.folder(machineName)
        
        if (!machineFolder) continue
        
        // Create info.txt for this machine
        const infoLines: string[] = []
        infoLines.push('═══════════════════════════════════════════════════════════════')
        infoLines.push(`              INFORMAÇÕES DO EQUIPAMENTO: ${machineName}`)
        infoLines.push('═══════════════════════════════════════════════════════════════')
        infoLines.push('')
        infoLines.push(`📅 Data: ${formatDate(report.date)}`)
        infoLines.push(`⏰ Turno: ${report.shift === 'day' ? 'Diurno (07:00 - 19:00)' : 'Noturno (19:00 - 07:00)'}`)
        infoLines.push(`🌤️ Clima: ${report.weather || '-'}`)
        infoLines.push(`👤 Técnico: ${report.technicianName || '-'}`)
        infoLines.push('')
        infoLines.push('───────────────────────────────────────────────────────────────')
        infoLines.push('                    DADOS DO EQUIPAMENTO')
        infoLines.push('───────────────────────────────────────────────────────────────')
        infoLines.push(`📍 Localização: ${machine.location || '-'}`)
        infoLines.push(`⏱️ Horímetro: ${machine.hourMeter || '-'} h`)
        infoLines.push(`🔧 Tipo de Manutenção: ${getTypeLabel(machine.maintenanceType)}`)
        infoLines.push(`⚡ Prioridade: ${machine.priority || 'Normal'}`)
        
        if (machine.downtimeHours) {
          infoLines.push(`⏳ Tempo de Parada: ${machine.downtimeHours} h`)
        }
        infoLines.push('')
        
        // Categories if applicable
        if (machine.correctiveCategories && machine.correctiveCategories.length > 0) {
          infoLines.push(`📋 Categorias Corretiva: ${machine.correctiveCategories.join(', ')}${machine.correctiveOther ? ` - ${machine.correctiveOther}` : ''}`)
        }
        if (machine.preventiveInterval) {
          infoLines.push(`📋 Intervalo Preventiva: ${machine.preventiveInterval}`)
          if (machine.preventiveCategories && machine.preventiveCategories.length > 0) {
            infoLines.push(`📋 Categorias Preventiva: ${machine.preventiveCategories.join(', ')}${machine.preventiveOther ? ` - ${machine.preventiveOther}` : ''}`)
          }
        }
        if (machine.programadaEvent) {
          infoLines.push(`📋 Evento Programada: ${machine.programadaEvent}`)
          if (machine.programadaCategories && machine.programadaCategories.length > 0) {
            infoLines.push(`📋 Categorias Programada: ${machine.programadaCategories.join(', ')}${machine.programadaOther ? ` - ${machine.programadaOther}` : ''}`)
          }
        }
        infoLines.push('')
        
        infoLines.push('───────────────────────────────────────────────────────────────')
        infoLines.push('                   SERVIÇOS REALIZADOS')
        infoLines.push('───────────────────────────────────────────────────────────────')
        if (machine.services && machine.services.length > 0) {
          machine.services.forEach((service, idx) => {
            const photoCount = service.photos?.length || 0
            infoLines.push(`${idx + 1}. ${service.description}`)
            if (photoCount > 0) {
              infoLines.push(`   📷 ${photoCount} ${photoCount === 1 ? 'foto' : 'fotos'} anexada${photoCount === 1 ? '' : 's'}`)
            }
          })
        } else {
          infoLines.push('Nenhum serviço registrado.')
        }
        infoLines.push('')
        
        // Interventions
        if (machine.intervencoes && machine.intervencoes.length > 0) {
          infoLines.push('───────────────────────────────────────────────────────────────')
          infoLines.push('                       INTERVENÇÕES')
          infoLines.push('───────────────────────────────────────────────────────────────')
          machine.intervencoes.forEach((interv, idx) => {
            infoLines.push(`${idx + 1}. ${interv.description} (${interv.time}${interv.endTime ? ` - ${interv.endTime}` : ''})`)
          })
          infoLines.push('')
        }
        
        // Displacements
        if (machine.deslocamentos && machine.deslocamentos.length > 0) {
          infoLines.push('───────────────────────────────────────────────────────────────')
          infoLines.push('                      DESLOCAMENTOS')
          infoLines.push('───────────────────────────────────────────────────────────────')
          machine.deslocamentos.forEach((desloc, idx) => {
            infoLines.push(`${idx + 1}. ${desloc.from} → ${desloc.to} (${desloc.startTime} - ${desloc.endTime})`)
          })
          infoLines.push('')
        }
        
        // Conclusion
        if (machine.conclusao) {
          infoLines.push('───────────────────────────────────────────────────────────────')
          infoLines.push('                        CONCLUSÃO')
          infoLines.push('───────────────────────────────────────────────────────────────')
          infoLines.push(machine.conclusao)
          infoLines.push('')
        }
        
        // Pending items
        if (machine.pendingItems) {
          infoLines.push('───────────────────────────────────────────────────────────────')
          infoLines.push('                       PENDÊNCIAS')
          infoLines.push('───────────────────────────────────────────────────────────────')
          infoLines.push(machine.pendingItems)
          infoLines.push('')
        }
        
        infoLines.push('═══════════════════════════════════════════════════════════════')
        infoLines.push(`        Gerado por MaxReport Pro - ${new Date().toLocaleString('pt-BR')}`)
        infoLines.push('═══════════════════════════════════════════════════════════════')
        
        // Save info.txt
        machineFolder.file('informações.txt', infoLines.join('\n'))
        
        // Save machine photo if exists
        if (machine.machinePhoto) {
          try {
            const response = await fetch(machine.machinePhoto)
            const blob = await response.blob()
            machineFolder.file('Foto_Equipamento.jpg', blob)
          } catch (e) {
            console.error('Erro ao salvar foto do equipamento:', e)
          }
        }
        
        // Create folder for each service with photos
        if (machine.services) {
          for (const service of machine.services) {
            if (service.photos && service.photos.length > 0) {
              // Clean service name for folder
              const serviceFolderName = service.description
                .substring(0, 50)
                .replace(/[^a-zA-Z0-9À-ÿ\s]/g, '')
                .replace(/\s+/g, '_')
                .trim()
              
              const serviceFolder = machineFolder.folder(serviceFolderName)
              
              // Save each photo
              for (let photoIdx = 0; photoIdx < service.photos.length; photoIdx++) {
                const photo = service.photos[photoIdx]
                const photoData = photo.editedImageData || photo.imageData
                
                if (photoData && photoData.startsWith('data:image')) {
                  try {
                    const response = await fetch(photoData)
                    const blob = await response.blob()
                    const typeLabel = photo.type === 'before' ? 'ANTES' : photo.type === 'after' ? 'DEPOIS' : 'GERAL'
                    const fileName = `${String(photoIdx + 1).padStart(2, '0')}_${typeLabel}.jpg`
                    serviceFolder.file(fileName, blob)
                  } catch (e) {
                    console.error('Erro ao salvar foto:', e)
                  }
                }
              }
            }
          }
        }
      }
      
      // Save main signature at root level
      if (report.signaturePhoto) {
        try {
          const response = await fetch(report.signaturePhoto)
          const blob = await response.blob()
          zip.file('Assinatura_Tecnico.jpg', blob)
        } catch (e) {
          console.error('Erro ao salvar assinatura:', e)
        }
      }

      // Generate and download
      const content = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(content)
      const a = document.createElement('a')
      a.href = url
      a.download = `Fotos_${report.date}_${report.technicianName?.replace(/\s+/g, '_') || 'Tecnico'}.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

    } catch (error) {
      console.error('Erro ao baixar fotos:', error)
      alert('Erro ao baixar fotos.')
    } finally {
      setIsDownloadingPhotos(false)
    }
  }

  // Export to HTML - 100% identical to preview
  const exportToHTML = () => {
    if (!report) return

    // Get first machine photo for cover
    const coverMachinePhoto = report.machines?.find(m => m.machinePhoto)?.machinePhoto

    // Generate machines HTML - matching preview exactly
    const machinesHTML = report.machines?.map((machine, idx) => {
      // Services with photos
      const servicesWithPhotosHTML = machine.services?.filter(s => s.photos && s.photos.length > 0).map((service) => `
        <div style="background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 12px;">
          <div style="background: #ff6600; padding: 10px 16px; display: flex; align-items: center; gap: 8px;">
            ${ICONS_WHITE.camera}
            <span style="font-weight: 600; color: #ffffff; font-size: 13px; flex: 1;">${service.description}</span>
            <span style="background: rgba(255,255,255,0.2); padding: 2px 8px; border-radius: 12px; font-size: 12px; color: #ffffff;">
              ${service.photos.length} ${service.photos.length === 1 ? 'foto' : 'fotos'}
            </span>
          </div>
          <div style="padding: 12px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
            ${service.photos.map((photo, photoIdx) => `
              <div style="position: relative;">
                <img src="${photo.editedImageData || photo.imageData}" alt="Foto ${photoIdx + 1}" style="width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 8px;" />
                <div style="position: absolute; top: 4px; left: 4px; background: ${photo.type === 'before' ? '#ef4444' : photo.type === 'after' ? '#22c55e' : '#ff6600'}; padding: 2px 6px; border-radius: 4px; font-size: 8px; color: #ffffff; font-weight: 600;">
                  ${photo.type === 'before' ? 'ANTES' : photo.type === 'after' ? 'DEPOIS' : 'GERAL'}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('') || ''

      return `
        <!-- EQUIPAMENTO ${idx + 1} -->
        <div style="background: #fafafa; min-height: 100vh; padding-bottom: 40px;">
          <!-- Header -->
          <div style="background: #ff6600; padding: 12px 20px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              ${ICONS_WHITE.truck}
              <span style="font-size: 18px; font-weight: bold; color: #ffffff;">${machine.equipmentName || `Máquina ${idx + 1}`}</span>
              <span style="margin-left: auto; font-size: 14px; color: rgba(255,255,255,0.7);">${String(idx + 1).padStart(2, '0')}</span>
            </div>
          </div>
          
          <!-- Content -->
          <div style="padding: 16px;">
            <!-- Info Card -->
            <div style="background: #ffffff; border-radius: 12px; margin-bottom: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <div style="background: #ff6600; padding: 8px 16px; display: flex; align-items: center; gap: 8px;">
                ${ICONS_WHITE.info}
                <span style="font-weight: 600; color: #ffffff; font-size: 14px;">Informações</span>
              </div>
              <div style="padding: 12px 16px;">
                <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px;">
                  <span style="color: #787878;">Localização:</span>
                  <span style="font-weight: 500; color: #333333;">${machine.location || '-'}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px;">
                  <span style="color: #787878;">Horímetro:</span>
                  <span style="font-weight: 500; color: #333333;">${machine.hourMeter || '-'}h</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px;">
                  <span style="color: #787878;">Tipo:</span>
                  <span style="font-weight: 500; color: #22c55e;">${getTypeLabel(machine.maintenanceType)}</span>
                </div>
              </div>
            </div>

            <!-- Activities Card -->
            <div style="background: #ffffff; border-radius: 12px; margin-bottom: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <div style="background: #ff6600; padding: 8px 16px; display: flex; align-items: center; gap: 8px;">
                ${ICONS_WHITE.wrench}
                <span style="font-weight: 600; color: #ffffff; font-size: 14px;">Atividades (${machine.services?.length || 0})</span>
              </div>
              <div style="padding: 12px 16px;">
                ${machine.services?.length > 0 
                  ? machine.services.map(s => `
                    <div style="display: flex; align-items: flex-start; gap: 8px; margin-bottom: 6px;">
                      ${ICONS_WHITE.check}
                      <span style="font-size: 13px; color: #333333;">${s.description}</span>
                    </div>
                  `).join('')
                  : '<span style="font-size: 13px; color: #787878;">Nenhuma atividade</span>'
                }
              </div>
            </div>

            <!-- Services with Photos -->
            ${servicesWithPhotosHTML}

            <!-- Machine Photo -->
            ${machine.machinePhoto ? `
              <div style="background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-top: 12px;">
                <img src="${machine.machinePhoto}" alt="Foto do equipamento" style="width: 100%; max-height: 200px; object-fit: cover;" />
              </div>
            ` : ''}
          </div>
        </div>
      `
    }).join('') || ''

    // Summary cards HTML
    const summaryCardsHTML = report.machines?.map((m, idx) => `
      <div style="background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="background: #ff6600; padding: 10px 16px; display: flex; align-items: center; gap: 8px;">
          ${ICONS_WHITE.truck18}
          <span style="color: #ffffff; font-weight: 600;">${m.equipmentName || `Máquina ${idx + 1}`}</span>
          <span style="margin-left: auto; background: rgba(255,255,255,0.2); padding: 2px 8px; border-radius: 12px; font-size: 12px; color: #ffffff;">
            ${getTypeLabel(m.maintenanceType)}
          </span>
        </div>
        ${m.machinePhoto ? `<img src="${m.machinePhoto}" alt="${m.equipmentName}" style="width: 100%; height: 150px; object-fit: cover;" />` : ''}
        <div style="padding: 12px 16px;">
          <div style="display: flex; gap: 16px; font-size: 12px; color: #666666;">
            <span style="display: flex; align-items: center; gap: 4px;">${ICONS_WHITE.mapPin} ${m.location || '-'}</span>
            <span style="display: flex; align-items: center; gap: 4px;">${ICONS_WHITE.clock} ${m.hourMeter || '-'}h</span>
          </div>
          <div style="margin-top: 8px; font-size: 12px; color: #787878;">${m.services?.length || 0} serviços</div>
        </div>
      </div>
    `).join('') || ''

    const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório ${report.reportNumber || report.date} - MaxReport Pro</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #fafafa; color: #333; line-height: 1.5; }
  </style>
</head>
<body>

  <!-- SLIDE 1: COVER -->
  <div style="background: #1a1a1a; min-height: 100vh; display: flex; flex-direction: column; position: relative; overflow: hidden;">
    ${coverMachinePhoto ? `
      <div style="position: absolute; inset: 0; z-index: 0;">
        <img src="${coverMachinePhoto}" alt="Máquina" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.8;" />
        <div style="position: absolute; inset: 0; background: linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.5) 100%);"></div>
      </div>
    ` : ''}
    
    <div style="position: relative; z-index: 1; flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 24px; text-align: center;">
      <!-- Logo -->
      <img src="data:image/png;base64,LOGO_PLACEHOLDER" alt="Logo" style="height: 44px; width: auto; margin-bottom: 40px;" onerror="this.style.display='none'" />
      
      <!-- Título -->
      <h1 style="font-size: 22px; font-weight: 600; color: #ffffff; margin-bottom: 24px; text-shadow: 0 2px 8px rgba(0,0,0,0.8); letter-spacing: 0.5px;">
        RELATÓRIO TURNO <span style="color: #ff6600;">4X4 HITACHI</span>
      </h1>
      
      <!-- Linha divisória -->
      <div style="width: 60px; height: 2px; background: #ff6600; margin-bottom: 24px;"></div>
      
      <!-- Info Grid -->
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px; font-size: 16px; color: #ffffff;">
          ${ICONS_ORANGE.calendar}
          <span>${formatDate(report.date)}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 12px; font-size: 16px; color: #ffffff;">
          ${ICONS_ORANGE.truck}
          <span>${report.machines?.length || 0} Equipamentos Monitorados</span>
        </div>
        <div style="display: flex; align-items: center; gap: 12px; font-size: 16px; color: rgba(255,255,255,0.85);">
          ${ICONS_ORANGE.user}
          <span>${report.technicianName}</span>
        </div>
      </div>
    </div>
  </div>

  <!-- SLIDE 2: SUMMARY -->
  <div style="background: #fafafa; min-height: 100vh;">
    <!-- Header -->
    <div style="background: #ff6600; padding: 16px 20px;">
      <h1 style="font-size: 18px; font-weight: bold; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 8px;">
        ${ICONS_WHITE.list}
        Resumo dos Equipamentos
      </h1>
    </div>
    
    <!-- Machine Cards -->
    <div style="padding: 16px; display: flex; flex-direction: column; gap: 12px;">
      ${summaryCardsHTML}
    </div>

    <!-- Stats Row -->
    <div style="display: flex; gap: 8px; padding: 0 16px 16px;">
      <div style="flex: 1; background: #ffffff; border-radius: 8px; padding: 12px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="font-size: 24px; font-weight: bold; color: #ff6600;">${report.machines?.length || 0}</div>
        <div style="font-size: 10px; color: #787878;">Equipamentos</div>
      </div>
      <div style="flex: 1; background: #ffffff; border-radius: 8px; padding: 12px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="font-size: 24px; font-weight: bold; color: #22c55e;">${report.machines?.filter(m => m.maintenanceType !== 'operando').length || 0}</div>
        <div style="font-size: 10px; color: #787878;">Manutenções</div>
      </div>
      <div style="flex: 1; background: #ffffff; border-radius: 8px; padding: 12px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="font-size: 24px; font-weight: bold; color: #f59e0b;">${report.machines?.reduce((acc, m) => acc + (m.intervencoes?.length || 0), 0) || 0}</div>
        <div style="font-size: 10px; color: #787878;">Intervenções</div>
      </div>
    </div>
  </div>

  <!-- EQUIPAMENTOS -->
  ${machinesHTML}

  <!-- SLIDE FINAL: PONTOS DE AÇÃO -->
  <div style="background: #fafafa; min-height: 100vh;">
    <!-- Header -->
    <div style="background: #ff6600; padding: 16px 20px;">
      <h1 style="font-size: 18px; font-weight: bold; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 8px;">
        ${ICONS_WHITE.checkCircle}
        Pontos de Ação
      </h1>
    </div>
    
    <div style="padding: 16px;">
      <!-- Info Card -->
      <div style="background: #ffffff; border-radius: 12px; margin-bottom: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="background: #ff6600; padding: 8px 16px;">
          <span style="font-weight: 600; color: #ffffff; font-size: 14px; display: flex; align-items: center; gap: 6px;">${ICONS_WHITE.fileText} Informações</span>
        </div>
        <div style="padding: 12px 16px;">
          <div style="display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px;">
            <span style="color: #787878;">Data:</span>
            <span style="color: #333333;">${formatDate(report.date)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px;">
            <span style="color: #787878;">Horário:</span>
            <span style="color: #333333;">${getShiftTime(report.shift)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px;">
            <span style="color: #787878;">Técnico:</span>
            <span style="color: #333333;">${report.technicianName}</span>
          </div>
          ${report.ddsTheme ? `
          <div style="padding: 8px 0 4px; font-size: 13px;">
            <span style="color: #787878;">Tema do DDS:</span>
            <p style="color: #333333; margin-top: 4px; font-weight: 500;">${report.ddsTheme}</p>
          </div>
          ` : ''}
        </div>
      </div>

      <!-- Signature -->
      ${report.signaturePhoto ? `
        <div style="background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <div style="background: #ff6600; padding: 8px 16px;">
            <span style="font-weight: 600; color: #ffffff; font-size: 14px; display: flex; align-items: center; gap: 6px;">${ICONS_WHITE.user} Assinatura</span>
          </div>
          <div style="padding: 16px; display: flex; justify-content: center;">
            <img src="${report.signaturePhoto}" alt="Assinatura" style="max-width: 200px; max-height: 150px; object-fit: contain;" />
          </div>
        </div>
      ` : ''}
    </div>
  </div>

  <!-- Footer -->
  <div style="text-align: center; padding: 20px; color: #787878; font-size: 12px; background: #fafafa;">
    <p>Gerado por MaxReport Pro em ${new Date().toLocaleString('pt-BR')}</p>
  </div>

</body>
</html>`

    // Convert logo to base64 and embed in HTML
    const convertLogoToBase64 = async (): Promise<string> => {
      try {
        const response = await fetch('/logo.png')
        const blob = await response.blob()
        return new Promise((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => {
            const base64 = reader.result as string
            const finalHtml = htmlContent.replace(/data:image\/png;base64,LOGO_PLACEHOLDER/g, base64)
            resolve(finalHtml)
          }
          reader.readAsDataURL(blob)
        })
      } catch {
        return htmlContent.replace(/data:image\/png;base64,LOGO_PLACEHOLDER/g, '')
      }
    }

    convertLogoToBase64().then(finalHtml => {
      const blob = new Blob([finalHtml], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Relatorio_${report.date}_${report.technicianName?.replace(/\s+/g, '_') || 'Tecnico'}.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    })
  }

  // Get machine photos
  const getMachinePhotos = (machine: typeof report.machines[0]) => {
    const photos: { data: string; type: string; serviceName: string }[] = []
    machine.services.forEach(service => {
      service.photos.forEach(photo => {
        photos.push({
          data: photo.editedImageData || photo.imageData,
          type: photo.type,
          serviceName: service.description
        })
      })
    })
    return photos
  }

  // Download individual photo
  const downloadSinglePhoto = async (photo: PhotoView) => {
    try {
      // Criar nome do arquivo: Servico_Tipo_Data.jpg
      const serviceNameClean = photo.serviceName
        .substring(0, 30) // Limitar tamanho
        .replace(/[^a-zA-Z0-9\s]/g, '') // Remover caracteres especiais
        .replace(/\s+/g, '_') // Substituir espaços por underscore
        .trim()
      
      const typeLabel = photo.type === 'before' ? 'ANTES' : photo.type === 'after' ? 'DEPOIS' : 'GERAL'
      const machineNameClean = photo.machineName.replace(/[^a-zA-Z0-9]/g, '_')
      const fileName = `${machineNameClean}_${serviceNameClean}_${typeLabel}.jpg`
      
      const response = await fetch(photo.data)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erro ao baixar foto:', error)
      alert('Erro ao baixar foto.')
    }
  }

  // Get all photos from all machines for navigation
  const getAllPhotos = (): PhotoView[] => {
    const allPhotos: PhotoView[] = []
    report?.machines?.forEach((machine, machineIdx) => {
      const machineName = machine.equipmentName || `Maquina_${machineIdx + 1}`
      machine.services.forEach(service => {
        service.photos.forEach((photo, photoIdx) => {
          allPhotos.push({
            data: photo.editedImageData || photo.imageData,
            type: photo.type,
            serviceName: service.description,
            machineName,
            photoIndex: photoIdx
          })
        })
      })
    })
    return allPhotos
  }

  // Navigate between photos in fullscreen mode
  const navigatePhoto = (direction: 'prev' | 'next') => {
    if (!selectedPhoto) return
    const allPhotos = getAllPhotos()
    const currentIndex = allPhotos.findIndex(p => 
      p.data === selectedPhoto.data && p.serviceName === selectedPhoto.serviceName
    )
    
    if (direction === 'prev' && currentIndex > 0) {
      setSelectedPhoto(allPhotos[currentIndex - 1])
    } else if (direction === 'next' && currentIndex < allPhotos.length - 1) {
      setSelectedPhoto(allPhotos[currentIndex + 1])
    }
  }

  if (!report) return null

  const machine = currentSlide >= 2 && currentSlide < totalSlides - 1 ? report.machines[currentSlide - 2] : null
  const machinePhotos = machine ? getMachinePhotos(machine) : []

  return (
    <div 
      style={{ 
        position: 'fixed', 
        inset: 0, 
        zIndex: 9999, 
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        touchAction: 'pan-y'
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Navigation Bar */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: '8px 12px',
        backgroundColor: '#1a1a1a',
        borderBottom: '1px solid #333333',
        flexShrink: 0,
        gap: '8px'
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#1a1a1a', padding: '4px 8px', borderRadius: '4px' }}>
          <img 
            src="/logo.png" 
            alt="Logo" 
            style={{ height: '28px', width: 'auto' }}
          />
        </div>
        
        <button
          onClick={onClose}
          style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '50%', 
            border: '1px solid #333333', 
            backgroundColor: '#1a1a1a',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0
          }}
        >
          <X style={{ width: 20, height: 20, color: '#ffffff' }} />
        </button>

        <span style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff' }}>
          {currentSlide + 1} / {totalSlides}
        </span>

        {/* Export Buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={exportToHTML}
            style={{ 
              padding: '8px 12px', 
              borderRadius: '20px', 
              border: '1px solid #dcdcdc', 
              backgroundColor: '#ffffff', 
              color: '#333333',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <FileText style={{ width: 14, height: 14, color: 'inherit' }} />
            HTML
          </button>
          <button
            onClick={downloadAllPhotos}
            disabled={isDownloadingPhotos}
            style={{ 
              padding: '8px 12px', 
              borderRadius: '20px', 
              border: 'none', 
              backgroundColor: ORANGE, 
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              opacity: isDownloadingPhotos ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Camera style={{ width: 14, height: 14, color: '#ffffff' }} />
            {isDownloadingPhotos ? '...' : 'Fotos'}
          </button>
        </div>
      </div>

      {/* Slide Content */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        
        {/* SLIDE 1: Cover */}
        {currentSlide === 0 && (
          <div 
            className="report-cover-slide"
            style={{ 
              width: '100%', 
              height: '100%', 
              backgroundColor: '#1a1a1a',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Machine Photo - Full background with dark overlay */}
            {report.machines?.find(m => m.machinePhoto)?.machinePhoto && (
              <div style={{
                position: 'absolute',
                inset: 0,
                zIndex: 0
              }}>
                <img 
                  src={report.machines.find(m => m.machinePhoto)?.machinePhoto}
                  alt="Máquina"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    opacity: 0.8
                  }}
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.5) 100%)'
                }} />
              </div>
            )}
            
            {/* Content */}
            <div style={{ 
              position: 'relative',
              zIndex: 1,
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px 24px',
              textAlign: 'center'
            }}>
              {/* Logo */}
              <img 
                src="/logo.png" 
                alt="Logo" 
                style={{ 
                  height: '44px', 
                  width: 'auto',
                  marginBottom: '40px'
                }}
              />
              
              {/* Título Principal */}
              <h1 style={{ 
                fontSize: '22px', 
                fontWeight: '600', 
                color: '#ffffff', 
                marginBottom: '24px',
                textShadow: '0 2px 8px rgba(0,0,0,0.8)',
                letterSpacing: '0.5px'
              }}>
                RELATÓRIO TURNO <span className="orange-text">4X4 HITACHI</span>
              </h1>
              
              {/* Linha divisória */}
              <div style={{
                width: '60px',
                height: '2px',
                backgroundColor: '#ff6600',
                marginBottom: '24px'
              }} />
              
              {/* Info Grid */}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '12px'
              }}>
                {/* Data */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  fontSize: '16px',
                  color: '#ffffff'
                }}>
                  <Calendar style={{ width: 18, height: 18, color: '#ff6600' }} />
                  <span>{formatDate(report.date)}</span>
                </div>
                
                {/* Equipamentos */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  fontSize: '16px',
                  color: '#ffffff'
                }}>
                  <Truck style={{ width: 18, height: 18, color: '#ff6600' }} />
                  <span>{report.machines?.length || 0} Equipamentos Monitorados</span>
                </div>
                
                {/* Técnico */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  fontSize: '16px',
                  color: 'rgba(255,255,255,0.85)'
                }}>
                  <User style={{ width: 18, height: 18, color: '#ff6600' }} />
                  <span>{report.technicianName}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 2: Summary */}
        {currentSlide === 1 && (
          <div style={{ 
            width: '100%', 
            height: '100%', 
            backgroundColor: '#fafafa',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'auto'
          }}>
            {/* Header */}
            <div style={{ 
              backgroundColor: ORANGE, 
              padding: '16px 20px',
              position: 'sticky',
              top: 0
            }}>
              <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <List style={{ width: 20, height: 20, color: '#ffffff' }} />
                Resumo dos Equipamentos
              </h1>
            </div>
            
            {/* Machine Cards */}
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {report.machines?.map((m, idx) => (
                <div key={m.id} style={{ 
                  backgroundColor: '#ffffff', 
                  borderRadius: '12px', 
                  overflow: 'hidden',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ 
                    backgroundColor: ORANGE, 
                    padding: '10px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <Truck style={{ color: '#ffffff', width: 18, height: 18 }} />
                    <span style={{ color: '#ffffff', fontWeight: 600 }}>{m.equipmentName || `Máquina ${idx + 1}`}</span>
                    <span style={{ 
                      marginLeft: 'auto',
                      backgroundColor: 'rgba(255,255,255,0.2)', 
                      padding: '2px 8px', 
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#ffffff'
                    }}>
                      {getTypeLabel(m.maintenanceType)}
                    </span>
                  </div>
                  
                  {/* Machine Photo */}
                  {m.machinePhoto && (
                    <img 
                      src={m.machinePhoto} 
                      alt={m.equipmentName || `Máquina ${idx + 1}`}
                      style={{ 
                        width: '100%', 
                        height: '150px', 
                        objectFit: 'cover'
                      }}
                    />
                  )}
                  
                  <div style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#666666' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin style={{ width: 12, height: 12 }} /> {m.location || '-'}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock style={{ width: 12, height: 12 }} /> {m.hourMeter || '-'}h</span>
                    </div>
                    <div style={{ marginTop: '8px', fontSize: '12px', color: '#787878' }}>
                      {m.services?.length || 0} serviços
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Stats */}
            <div style={{ 
              display: 'flex', 
              gap: '8px', 
              padding: '0 16px 16px'
            }}>
              <div style={{ 
                flex: 1, 
                backgroundColor: '#ffffff', 
                borderRadius: '8px', 
                padding: '12px',
                textAlign: 'center',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: ORANGE }}>
                  {report.machines?.length || 0}
                </div>
                <div style={{ fontSize: '10px', color: '#787878' }}>Equipamentos</div>
              </div>
              <div style={{ 
                flex: 1, 
                backgroundColor: '#ffffff', 
                borderRadius: '8px', 
                padding: '12px',
                textAlign: 'center',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#22c55e' }}>
                  {report.machines?.filter(m => m.maintenanceType !== 'operando').length || 0}
                </div>
                <div style={{ fontSize: '10px', color: '#787878' }}>Manutenções</div>
              </div>
              <div style={{ 
                flex: 1, 
                backgroundColor: '#ffffff', 
                borderRadius: '8px', 
                padding: '12px',
                textAlign: 'center',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>
                  {report.machines?.reduce((acc, m) => acc + (m.intervencoes?.length || 0), 0) || 0}
                </div>
                <div style={{ fontSize: '10px', color: '#787878' }}>Intervenções</div>
              </div>
            </div>
          </div>
        )}

        {/* SLIDES 3 to N-2: Individual Equipment */}
        {machine && (
          <div style={{ 
            width: '100%', 
            height: '100%', 
            backgroundColor: '#fafafa',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{ 
              backgroundColor: ORANGE, 
              padding: '12px 20px',
              flexShrink: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck style={{ color: '#ffffff', width: 20, height: 20 }} />
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff' }}>
                  {machine.equipmentName}
                </span>
                <span style={{ 
                  marginLeft: 'auto',
                  fontSize: '14px',
                  color: 'rgba(255,255,255,0.7)'
                }}>
                  {String(currentSlide - 1).padStart(2, '0')}
                </span>
              </div>
            </div>
            
            {/* Content - Scrollable */}
            <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
              {/* Info Card */}
              <div style={{ 
                backgroundColor: '#ffffff', 
                borderRadius: '12px', 
                marginBottom: '12px',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <div style={{ 
                  backgroundColor: ORANGE, 
                  padding: '8px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Info style={{ color: '#ffffff', width: 16, height: 16 }} />
                  <span style={{ fontWeight: 600, color: '#ffffff', fontSize: '14px' }}>Informações</span>
                </div>
                <div style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px' }}>
                    <span style={{ color: '#787878' }}>Localização:</span>
                    <span style={{ fontWeight: 500, color: '#333333' }}>{machine.location || '-'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px' }}>
                    <span style={{ color: '#787878' }}>Horímetro:</span>
                    <span style={{ fontWeight: 500, color: '#333333' }}>{machine.hourMeter || '-'}h</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px' }}>
                    <span style={{ color: '#787878' }}>Tipo:</span>
                    <span style={{ fontWeight: 500, color: '#22c55e' }}>{getTypeLabel(machine.maintenanceType)}</span>
                  </div>
                </div>
              </div>

              {/* Activities Card */}
              <div style={{ 
                backgroundColor: '#ffffff', 
                borderRadius: '12px', 
                marginBottom: '12px',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <div style={{ 
                  backgroundColor: ORANGE, 
                  padding: '8px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Wrench style={{ color: '#ffffff', width: 16, height: 16 }} />
                  <span style={{ fontWeight: 600, color: '#ffffff', fontSize: '14px' }}>Atividades ({machine.services?.length || 0})</span>
                </div>
                <div style={{ padding: '12px 16px', maxHeight: '150px', overflowY: 'auto' }}>
                  {machine.services?.length > 0 ? (
                    machine.services.map((s, i) => (
                      <div key={s.id || i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
                        <CheckCircle style={{ color: ORANGE, width: 14, height: 14, flexShrink: 0, marginTop: 2 }} />
                        <span style={{ fontSize: '13px', color: '#333333' }}>{s.description}</span>
                      </div>
                    ))
                  ) : (
                    <span style={{ fontSize: '13px', color: '#787878' }}>Nenhuma atividade</span>
                  )}
                </div>
              </div>

              {/* Photos by Service */}
              {machine.services?.filter(s => s.photos && s.photos.length > 0).map((service, serviceIdx) => (
                <div 
                  key={service.id || serviceIdx} 
                  style={{ 
                    backgroundColor: '#ffffff', 
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    marginBottom: '12px'
                  }}
                >
                  <div style={{ 
                    backgroundColor: ORANGE, 
                    padding: '10px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <Camera style={{ color: '#ffffff', width: 16, height: 16 }} />
                    <span style={{ fontWeight: 600, color: '#ffffff', fontSize: '13px', flex: 1 }}>
                      {service.description}
                    </span>
                    <span style={{ 
                      backgroundColor: 'rgba(255,255,255,0.2)', 
                      padding: '2px 8px', 
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#ffffff'
                    }}>
                      {service.photos.length} {service.photos.length === 1 ? 'foto' : 'fotos'}
                    </span>
                  </div>
                  <div style={{ 
                    padding: '12px', 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(3, 1fr)', 
                    gap: '8px' 
                  }}>
                    {service.photos.map((photo, photoIdx) => (
                      <div 
                        key={photo.id || photoIdx} 
                        style={{ 
                          position: 'relative',
                          cursor: 'pointer',
                          transition: 'transform 0.2s'
                        }}
                        onClick={() => setSelectedPhoto({
                          data: photo.editedImageData || photo.imageData,
                          type: photo.type,
                          serviceName: service.description,
                          machineName: machine.equipmentName || `Máquina`,
                          photoIndex: photoIdx
                        })}
                      >
                        <img 
                          src={photo.editedImageData || photo.imageData} 
                          alt={`Foto ${photoIdx + 1}`}
                          style={{ 
                            width: '100%', 
                            aspectRatio: '1', 
                            objectFit: 'cover', 
                            borderRadius: '8px' 
                          }}
                        />
                        {/* Tipo da foto (ANTES/DEPOIS/GERAL) */}
                        <div style={{ 
                          position: 'absolute', 
                          top: '4px', 
                          left: '4px',
                          backgroundColor: photo.type === 'before' ? '#ef4444' : photo.type === 'after' ? '#22c55e' : ORANGE,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '8px',
                          color: '#ffffff',
                          fontWeight: 600
                        }}>
                          {photo.type === 'before' ? 'ANTES' : photo.type === 'after' ? 'DEPOIS' : 'GERAL'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Machine Photo */}
              {machine.machinePhoto && (
                <div style={{ 
                  backgroundColor: '#ffffff', 
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  marginTop: '12px'
                }}>
                  <img 
                    src={machine.machinePhoto} 
                    alt="Foto do equipamento"
                    style={{ width: '100%', maxHeight: '200px', objectFit: 'cover' }}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* SLIDE N: Final */}
        {currentSlide === totalSlides - 1 && (
          <div style={{ 
            width: '100%', 
            height: '100%', 
            backgroundColor: '#fafafa',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'auto'
          }}>
            {/* Header */}
            <div style={{ 
              backgroundColor: ORANGE, 
              padding: '16px 20px',
              position: 'sticky',
              top: 0
            }}>
              <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle style={{ width: 20, height: 20, color: '#ffffff' }} />
                Pontos de Ação
              </h1>
            </div>
            
            <div style={{ padding: '16px' }}>
              {/* Info Card */}
              <div style={{ 
                backgroundColor: '#ffffff', 
                borderRadius: '12px', 
                marginBottom: '12px',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <div style={{ 
                  backgroundColor: ORANGE, 
                  padding: '8px 16px'
                }}>
                  <span style={{ fontWeight: 600, color: '#ffffff', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}><FileText style={{ width: 14, height: 14 }} /> Informações</span>
                </div>
                <div style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '13px' }}>
                    <span style={{ color: '#787878' }}>Data:</span>
                    <span style={{ color: '#333333' }}>{formatDate(report.date)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '13px' }}>
                    <span style={{ color: '#787878' }}>Horário:</span>
                    <span style={{ color: '#333333' }}>{getShiftTime(report.shift)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '13px' }}>
                    <span style={{ color: '#787878' }}>Técnico:</span>
                    <span style={{ color: '#333333' }}>{report.technicianName}</span>
                  </div>
                  {report.ddsTheme && (
                    <div style={{ padding: '8px 0 4px', fontSize: '13px' }}>
                      <span style={{ color: '#787878' }}>Tema do DDS:</span>
                      <p style={{ color: '#333333', marginTop: '4px', fontWeight: 500 }}>{report.ddsTheme}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Signature */}
              {report.signaturePhoto && (
                <div style={{ 
                  backgroundColor: '#ffffff', 
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ 
                    backgroundColor: ORANGE, 
                    padding: '8px 16px'
                  }}>
                    <span style={{ fontWeight: 600, color: '#ffffff', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}><User style={{ width: 14, height: 14 }} /> Assinatura</span>
                  </div>
                  <div style={{ padding: '16px', display: 'flex', justifyContent: 'center' }}>
                    <img 
                      src={report.signaturePhoto} 
                      alt="Assinatura"
                      style={{ maxWidth: '200px', maxHeight: '150px', objectFit: 'contain' }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: '12px 20px',
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e5e5e5',
        flexShrink: 0
      }}>
        <button
          onClick={prevSlide}
          disabled={currentSlide === 0}
          style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '24px',
            border: 'none',
            backgroundColor: currentSlide === 0 ? '#e5e5e5' : ORANGE,
            color: currentSlide === 0 ? '#999999' : '#ffffff',
            fontSize: '14px',
            fontWeight: 600,
            cursor: currentSlide === 0 ? 'not-allowed' : 'pointer',
            opacity: currentSlide === 0 ? 0.5 : 1
          }}
        >
          <ChevronLeft style={{ width: 18, height: 18, color: 'inherit' }} />
          Anterior
        </button>

        {/* Slide Indicators */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {Array.from({ length: Math.min(totalSlides, 7) }).map((_, i) => (
            <div 
              key={i}
              style={{ 
                width: currentSlide === i ? '20px' : '6px',
                height: '6px',
                borderRadius: '3px',
                backgroundColor: currentSlide === i ? ORANGE : '#dcdcdc',
                transition: 'width 0.2s'
              }}
            />
          ))}
          {totalSlides > 7 && <span style={{ fontSize: '10px', color: '#999999' }}>...</span>}
        </div>

        <button
          onClick={nextSlide}
          disabled={currentSlide === totalSlides - 1}
          style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '24px',
            border: 'none',
            backgroundColor: currentSlide === totalSlides - 1 ? '#e5e5e5' : ORANGE,
            color: currentSlide === totalSlides - 1 ? '#999999' : '#ffffff',
            fontSize: '14px',
            fontWeight: 600,
            cursor: currentSlide === totalSlides - 1 ? 'not-allowed' : 'pointer',
            opacity: currentSlide === totalSlides - 1 ? 0.5 : 1
          }}
        >
          Próximo
          <ChevronRight style={{ width: 18, height: 18, color: 'inherit' }} />
        </button>
      </div>

      {/* Photo Fullscreen Modal */}
      {selectedPhoto && (
        <div 
          style={{ 
            position: 'fixed', 
            inset: 0, 
            zIndex: 99999, 
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            display: 'flex',
            flexDirection: 'column'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedPhoto(null)
          }}
        >
          {/* Top Bar */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            padding: '12px 16px',
            backgroundColor: 'rgba(0, 0, 0, 0.8)'
          }}>
            <button
              onClick={() => setSelectedPhoto(null)}
              style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '20px',
                border: '1px solid rgba(255,255,255,0.3)',
                backgroundColor: 'transparent',
                color: '#ffffff',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              <X style={{ width: 18, height: 18, color: 'inherit' }} />
              Fechar
            </button>
            
            {/* Photo Type Badge */}
            <div style={{ 
              backgroundColor: selectedPhoto.type === 'before' ? '#ef4444' : selectedPhoto.type === 'after' ? '#22c55e' : ORANGE,
              padding: '6px 16px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 600,
              color: '#ffffff'
            }}>
              {selectedPhoto.type === 'before' ? 'ANTES' : selectedPhoto.type === 'after' ? 'DEPOIS' : 'GERAL'}
            </div>
            
            {/* Download Button */}
            <button
              onClick={() => downloadSinglePhoto(selectedPhoto)}
              style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '20px',
                border: 'none',
                backgroundColor: ORANGE,
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Download style={{ width: 18, height: 18, color: 'inherit' }} />
              Baixar
            </button>
          </div>
          
          {/* Photo Container with Navigation */}
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            position: 'relative',
            padding: '0 60px'
          }}>
            {/* Previous Button */}
            <button
              onClick={() => navigatePhoto('prev')}
              style={{ 
                position: 'absolute',
                left: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.3)',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ChevronLeft style={{ width: 24, height: 24, color: '#ffffff' }} />
            </button>
            
            {/* Photo */}
            <img 
              src={selectedPhoto.data} 
              alt="Foto ampliada"
              style={{ 
                maxWidth: '100%', 
                maxHeight: '100%', 
                objectFit: 'contain',
                borderRadius: '8px'
              }}
            />
            
            {/* Next Button */}
            <button
              onClick={() => navigatePhoto('next')}
              style={{ 
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.3)',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ChevronRight style={{ width: 24, height: 24, color: '#ffffff' }} />
            </button>
          </div>
          
          {/* Bottom Info Bar */}
          <div style={{ 
            padding: '16px',
            backgroundColor: 'rgba(0, 0, 0, 0.8)'
          }}>
            <div style={{ 
              maxWidth: '600px', 
              margin: '0 auto',
              textAlign: 'center'
            }}>
              {/* Machine Name */}
              <div style={{ 
                display: 'inline-block',
                backgroundColor: ORANGE,
                padding: '4px 12px',
                borderRadius: '4px',
                marginBottom: '8px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#ffffff'
              }}>
                🚛 {selectedPhoto.machineName}
              </div>
              
              {/* Service Name */}
              <div style={{ 
                fontSize: '14px', 
                color: '#ffffff',
                fontWeight: 500,
                lineHeight: '1.4'
              }}>
                🔧 {selectedPhoto.serviceName}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
