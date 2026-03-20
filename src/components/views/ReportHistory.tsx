/**
 * MaxReport Pro - Report History
 * List of saved reports with search, filters, export and management
 */

'use client'

import { useState } from 'react'
import { useReportStore, useAuthStore, type ReportDraft } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Search,
  FileText,
  Calendar,
  Clock,
  MapPin,
  Wrench,
  Download,
  Share2,
  Eye,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  Sun,
  Moon,
  Image as ImageIcon,
  Filter,
  X,
  Truck,
  Package,
  AlertTriangle,
  Presentation,
} from 'lucide-react'
import { ReportViewer } from '@/components/reports/ReportViewer'

// Technician names for filter
const TECHNICIANS = ['Max Henrique', 'Marcos Paulo', 'Marcelo Gonçalves', 'Wesley Ferreira', 'Higor Ataides']

// Delete password
const DELETE_PASSWORD = '2004182Mh@'

export function ReportHistory() {
  const { reportHistory, editReport, deleteReport } = useReportStore()
  const { user } = useAuthStore()
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [filterShift, setFilterShift] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [filterTechnician, setFilterTechnician] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  
  const [expandedReport, setExpandedReport] = useState<string | null>(null)
  const [viewingReport, setViewingReport] = useState<ReportDraft | null>(null)
  const [slideReport, setSlideReport] = useState<ReportDraft | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [exportMenuReport, setExportMenuReport] = useState<ReportDraft | null>(null)

  // Apply filters
  const filteredReports = reportHistory.filter(report => {
    // Search filter - search in report number, technician name, and machine names
    const matchesSearch = 
      report.reportNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.technicianName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.machines?.some(m => m.equipmentName?.toLowerCase().includes(searchTerm.toLowerCase()))
    
    // Date filter
    const matchesDate = !filterDate || report.date === filterDate
    
    // Shift filter
    const matchesShift = filterShift === 'all' || report.shift === filterShift
    
    // Type filter - check if any machine has this type
    const matchesType = filterType === 'all' || 
      report.machines?.some(m => m.maintenanceType === filterType)
    
    // Technician filter
    const matchesTechnician = filterTechnician === 'all' || report.technicianName === filterTechnician
    
    return matchesSearch && matchesDate && matchesShift && matchesType && matchesTechnician
  })

  const clearFilters = () => {
    setSearchTerm('')
    setFilterDate('')
    setFilterShift('all')
    setFilterType('all')
    setFilterTechnician('all')
  }

  const hasActiveFilters = filterDate || filterShift !== 'all' || 
    filterType !== 'all' || filterTechnician !== 'all'

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'preventive': return 'bg-blue-500/20 text-blue-600'
      case 'corrective': return 'bg-red-500/20 text-red-600'
      case 'programada': return 'bg-info/20 text-info'
      case 'inspection': return 'bg-primary/20 text-primary'
      case 'operando': return 'bg-green-500/20 text-green-600'
      default: return 'bg-surface text-text-secondary'
    }
  }

  // Format date to DD/MM/YYYY
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
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
    return labels[type] || type
  }

  const getShiftLabel = (shift: string) => {
    if (shift === 'day') return 'Diurno'
    if (shift === 'night') return 'Noturno'
    return '-'
  }

  // WhatsApp Share - Clean text without emojis
  const handleShareWhatsApp = (report: ReportDraft) => {
    const machinesText = report.machines?.map((machine, idx) => {
      const services = machine.services.map((s, i) => `  ${i + 1}. ${s.description}`).join('\n')
      
      let maintenanceDetails = ''
      switch (machine.maintenanceType) {
        case 'corrective':
          const categories = machine.correctiveCategories || []
          maintenanceDetails = `Categorias: ${categories.join(', ')}${machine.correctiveOther ? `, Outros: ${machine.correctiveOther}` : ''}`
          break
        case 'preventive':
          maintenanceDetails = `Intervalo: ${machine.preventiveInterval || '-'}`
          break
        case 'programada':
          maintenanceDetails = `Evento: ${machine.programadaEvent || '-'}`
          break
      }

      const intervencoesText = machine.intervencoes?.length 
        ? `\nIntervencoes:\n${machine.intervencoes.map(i => `  - ${i.description} (${i.time}${i.endTime ? ` - ${i.endTime}` : ''})`).join('\n')}` 
        : ''
      
      const deslocamentosText = machine.deslocamentos?.length 
        ? `\nDeslocamentos:\n${machine.deslocamentos.map(d => `  - ${d.from} -> ${d.to} (${d.startTime}-${d.endTime})`).join('\n')}` 
        : ''

      return `
Maquina: ${machine.equipmentName}
Local: ${machine.location || '-'}
Horimetro: ${machine.hourMeter || '-'}h
Tipo: ${getTypeLabel(machine.maintenanceType)}
${maintenanceDetails}
Prioridade: ${machine.priority}${machine.downtimeHours ? `\nParada: ${machine.downtimeHours}h` : ''}

Servicos:
${services || '  Nenhum servico registrado'}
${machine.download ? '\nDownload realizado' : ''}
${machine.interferencia ? `\nInterferencia: ${machine.interferencia}` : ''}
${machine.conclusao ? `\nConclusao: ${machine.conclusao}` : ''}
${machine.pendingItems ? `\nPendencias:\n  ${machine.pendingItems}` : ''}
${intervencoesText}
${deslocamentosText}`
    }).join('\n-------------------\n')

    const weatherText = report.weather === 'Ensolarado' ? 'Ensolarado' : 
                         report.weather === 'Nublado' ? 'Nublado' : 
                         report.weather === 'Chuva' ? 'Chuva' : '-'

    const shiftText = report.shift === 'day' ? 'Diurno' : 'Noturno'
    
    const text = `*RELATORIO DE TURNO*
===================

Data: ${report.date}
Turno: ${shiftText}
Clima: ${weatherText}
Tecnico: ${report.technicianName || '-'}
Tema DDS: ${report.ddsTheme || '-'}

-------------------
${machinesText}

===================
Enviado via MaxReport Pro`
    
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
    setExportMenuReport(null)
  }

  // Export Photos as ZIP
  const handleExportPhotos = async (report: ReportDraft) => {
    // Collect all photos from all machines
    const allPhotos: { machineName: string; serviceIdx: number; type: string; data: string; filename: string }[] = []
    
    report.machines?.forEach((machine, machineIdx) => {
      const machineName = machine.equipmentName || `Maquina${machineIdx + 1}`
      
      // Add machine photo if exists
      if (machine.machinePhoto) {
        allPhotos.push({
          machineName: machineName,
          serviceIdx: 0,
          type: 'machine',
          data: machine.machinePhoto,
          filename: `${machineName}_FotoMaquina.jpg`
        })
      }
      
      // Add service photos
      machine.services.forEach((service, serviceIdx) => {
        service.photos.forEach((photo, photoIdx) => {
          const filename = `${machineName}_Servico${serviceIdx + 1}_${photo.type}_${photoIdx + 1}.jpg`
          allPhotos.push({
            machineName: machineName,
            serviceIdx: serviceIdx + 1,
            type: photo.type,
            data: photo.editedImageData || photo.imageData,
            filename
          })
        })
      })
    })

    if (allPhotos.length === 0) {
      alert('Nenhuma foto encontrada neste relatório.')
      return
    }

    // Create a simple HTML file for download (since we can't use JSZip in this context)
    const reportName = `Relatorio_${report.date}_${report.technicianName?.replace(/\s+/g, '_') || 'Tecnico'}`
    
    // Create downloadable content
    let htmlContent = `<!DOCTYPE html>
<html>
<head>
  <title>${reportName} - Fotos</title>
  <style>
    body { font-family: Arial, sans-serif; background: #1a1a1a; color: white; padding: 20px; }
    h1 { color: #FF6600; }
    .machine-section { margin: 20px 0; padding: 15px; background: #2a2a2a; border-radius: 8px; }
    .machine-title { color: #FF6600; font-size: 18px; margin-bottom: 10px; }
    .photos-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; }
    .photo-item { background: #333; padding: 10px; border-radius: 8px; text-align: center; }
    .photo-item img { max-width: 100%; max-height: 150px; object-fit: cover; border-radius: 4px; }
    .photo-label { font-size: 12px; margin-top: 5px; color: #999; }
    .download-instructions { background: #FF6600; color: black; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
  </style>
</head>
<body>
  <h1>📸 ${reportName}</h1>
  <div class="download-instructions">
    <strong>Para baixar as fotos:</strong> Clique com o botão direito em cada foto e selecione "Salvar imagem como..."
  </div>
`

    // Group by machine
    const photosByMachine: Record<string, typeof allPhotos> = {}
    allPhotos.forEach(photo => {
      if (!photosByMachine[photo.machineName]) {
        photosByMachine[photo.machineName] = []
      }
      photosByMachine[photo.machineName].push(photo)
    })

    Object.entries(photosByMachine).forEach(([machineName, photos]) => {
      htmlContent += `
  <div class="machine-section">
    <div class="machine-title">🚜 ${machineName} (${photos.length} fotos)</div>
    <div class="photos-grid">
`
      photos.forEach(photo => {
        const getTypeLabel = (type: string) => {
          switch(type) {
            case 'before': return 'Antes'
            case 'after': return 'Depois'
            case 'general': return 'Geral'
            case 'machine': return 'Foto da Máquina'
            default: return type
          }
        }
        const label = photo.type === 'machine' ? 'Foto da Máquina' : `Serviço ${photo.serviceIdx} - ${getTypeLabel(photo.type)}`
        htmlContent += `      <div class="photo-item">
        <img src="${photo.data}" alt="Foto ${photo.type}">
        <div class="photo-label">${label}</div>
      </div>
`
      })
      htmlContent += `    </div>
  </div>
`
    })

    htmlContent += `</body>
</html>`

    // Download HTML file
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${reportName}_fotos.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    setExportMenuReport(null)
    alert(`HTML com ${allPhotos.length} fotos foi baixado. Abra o arquivo para visualizar e salvar as fotos individualmente.`)
  }

  const handleEdit = (report: ReportDraft) => {
    setViewingReport(null)
    setExportMenuReport(null)
    editReport(report)
  }

  const handleDelete = () => {
    if (deletePassword === DELETE_PASSWORD) {
      if (deleteConfirm) {
        deleteReport(deleteConfirm)
        setDeleteConfirm(null)
        setViewingReport(null)
        setDeletePassword('')
        setDeleteError('')
      }
    } else {
      setDeleteError('Senha incorreta!')
    }
  }

  // Count photos in a report
  const countPhotos = (report: ReportDraft) => {
    return report.machines?.reduce((acc, machine) => 
      acc + machine.services.reduce((sAcc, service) => sAcc + service.photos.length, 0)
    , 0) || 0
  }

  // Get maintenance types from a report
  const getReportTypes = (report: ReportDraft) => {
    const types = new Set(report.machines?.map(m => m.maintenanceType).filter(Boolean))
    return Array.from(types)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }} className="animate-fade-in">
      {/* Header */}
      <div style={{ padding: '16px', borderBottom: '1px solid #e5e5e5', backgroundColor: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#333333' }}>Relatórios</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? 'bg-primary/10 border-primary' : ''}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros
            {hasActiveFilters && (
              <Badge className="ml-2 bg-primary text-xs px-1.5">Ativos</Badge>
            )}
          </Button>
        </div>
        
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#787878' }} />
          <Input
            placeholder="Buscar relatórios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '40px', height: '48px', backgroundColor: '#ffffff', color: '#333333', borderColor: '#dcdcdc' }}
          />
        </div>
        
        {/* Filters Panel */}
        {showFilters && (
          <div style={{ marginTop: '12px', padding: '12px', borderRadius: '8px', backgroundColor: '#f5f5f5' }}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Filtros</span>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-1" />
                  Limpar
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Data</Label>
                <Input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="h-10"
                />
              </div>
              
              <div className="space-y-1">
                <Label className="text-xs">Turno</Label>
                <Select value={filterShift} onValueChange={setFilterShift}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="day">Diurno</SelectItem>
                    <SelectItem value="night">Noturno</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1">
                <Label className="text-xs">Tipo Manutenção</Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="preventive">Preventiva</SelectItem>
                    <SelectItem value="corrective">Corretiva</SelectItem>
                    <SelectItem value="programada">Programada</SelectItem>
                    <SelectItem value="inspection">Inspeção</SelectItem>
                    <SelectItem value="operando">Operando</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1">
                <Label className="text-xs">Técnico</Label>
                <Select value={filterTechnician} onValueChange={setFilterTechnician}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {TECHNICIANS.map(tech => (
                      <SelectItem key={tech} value={tech}>{tech}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Report List */}
      <ScrollArea style={{ flex: 1 }}>
        <div style={{ padding: '16px', paddingBottom: '100px' }}>
          <p style={{ fontSize: '14px', color: '#787878', marginBottom: '12px' }}>
            {filteredReports.length} de {reportHistory.length} relatórios
          </p>

          {filteredReports.length > 0 ? (
            filteredReports.map((report) => (
              <Card key={report.id || report.reportNumber} style={{ overflow: 'hidden', backgroundColor: '#ffffff', border: '1px solid #e5e5e5', marginBottom: '12px' }}>
                <CardContent style={{ padding: 0 }}>
                  {/* Header */}
                  <div 
                    style={{ padding: '12px', cursor: 'pointer', backgroundColor: '#ffffff' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                    onClick={() => setExpandedReport(
                      expandedReport === report.reportNumber ? null : report.reportNumber || null
                    )}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(255, 102, 0, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div style={{ flex: 1 }}>
                          {/* Main Title: Relatório DD/MM/YYYY */}
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-base" style={{ color: '#333333' }}>
                              Relatório {formatDate(report.date)}
                            </span>
                          </div>
                          {/* Subdescription: Person name and shift */}
                          <p className="text-sm" style={{ color: '#666666' }}>
                            {report.technicianName} • {getShiftLabel(report.shift)}
                          </p>
                          {/* Machine Status Spoiler */}
                          <div className="flex flex-wrap gap-1 mt-1">
                            {report.machines?.filter(m => m.maintenanceType === 'preventive').map((m, i) => (
                              <Badge key={`prev-${i}`} className="text-xs bg-blue-500/20 text-blue-600">
                                {m.equipmentName}
                              </Badge>
                            ))}
                            {report.machines?.filter(m => m.maintenanceType === 'corrective').map((m, i) => (
                              <Badge key={`corr-${i}`} className="text-xs bg-red-500/20 text-red-600">
                                {m.equipmentName}
                              </Badge>
                            ))}
                            {report.machines?.filter(m => m.maintenanceType === 'operando').map((m, i) => (
                              <Badge key={`op-${i}`} className="text-xs bg-green-500/20 text-green-600">
                                {m.equipmentName}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {expandedReport === report.reportNumber ? (
                          <ChevronUp className="w-5 h-5 text-text-muted" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-text-muted" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedReport === report.reportNumber && (
                    <div className="border-t border-border p-3 space-y-3 bg-surface/50">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-text-muted" />
                          <span>{report.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {report.shift === 'day' ? <Sun className="w-4 h-4 text-warning" /> : <Moon className="w-4 h-4 text-info" />}
                          <span>{getShiftLabel(report.shift)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-text-muted" />
                          <span>{countPhotos(report)} fotos</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-text-muted" />
                          <span>{report.machines?.length || 0} máquinas</span>
                        </div>
                      </div>

                      {/* Machines Summary */}
                      {report.machines && report.machines.length > 0 && (
                        <div className="space-y-1">
                          {report.machines.slice(0, 3).map((machine, idx) => (
                            <div key={machine.id} className="text-sm text-text-muted flex items-center gap-2">
                              <Truck className="w-3 h-3" />
                              <span>{machine.equipmentName}</span>
                              <Badge className={`text-xs ${getTypeColor(machine.maintenanceType)}`}>
                                {getTypeLabel(machine.maintenanceType)}
                              </Badge>
                            </div>
                          ))}
                          {report.machines.length > 3 && (
                            <p className="text-xs text-text-muted">+{report.machines.length - 3} mais...</p>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-2 flex-wrap">
                        <Button 
                          variant="default" 
                          size="sm"
                          className="bg-primary"
                          onClick={() => setSlideReport(report)}
                        >
                          <Presentation className="w-4 h-4 mr-1" />
                          Slides
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setExportMenuReport(report)}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Exportar
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setViewingReport(report)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Ver
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleEdit(report)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-danger"
                          onClick={() => setDeleteConfirm(report.id || null)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Excluir
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto mb-4 text-text-muted opacity-30" />
              <p className="text-lg font-medium mb-1">Nenhum relatório encontrado</p>
              <p className="text-sm text-text-muted">
                {hasActiveFilters ? 'Tente ajustar os filtros' : 'Crie seu primeiro relatório'}
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Export Menu Modal */}
      {exportMenuReport && (
        <Dialog open={true} onOpenChange={() => setExportMenuReport(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Exportar Relatório</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Button 
                className="w-full h-14 justify-start bg-green-600 hover:bg-green-700"
                onClick={() => handleShareWhatsApp(exportMenuReport)}
              >
                <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </Button>
              <Button 
                variant="outline"
                className="w-full h-14 justify-start"
                onClick={() => handleExportPhotos(exportMenuReport)}
              >
                <Package className="w-6 h-6 mr-3 text-primary" />
                Exportar Fotos (HTML)
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Full Report View Modal */}
      {viewingReport && (
        <Dialog open={true} onOpenChange={() => setViewingReport(null)}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-base">{viewingReport.reportNumber}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* General Data */}
              <Card>
                <CardContent className="p-3 space-y-2">
                  <h4 className="font-medium text-primary text-sm">Dados Gerais</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-text-muted">Data:</span>
                      <span className="ml-2">{viewingReport.date}</span>
                    </div>
                    <div>
                      <span className="text-text-muted">Turno:</span>
                      <span className="ml-2">{getShiftLabel(viewingReport.shift)}</span>
                    </div>
                    <div>
                      <span className="text-text-muted">Clima:</span>
                      <span className="ml-2">{viewingReport.weather || '-'}</span>
                    </div>
                    <div>
                      <span className="text-text-muted">Técnico:</span>
                      <span className="ml-2">{viewingReport.technicianName}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-text-muted">DDS:</span>
                      <span className="ml-2">{viewingReport.ddsTheme || '-'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Machines */}
              {viewingReport.machines?.map((machine, machineIdx) => (
                <Card key={machine.id}>
                  <CardContent className="p-3 space-y-2">
                    <h4 className="font-medium text-primary text-sm flex items-center gap-2">
                      <Truck className="w-4 h-4" />
                      {machine.equipmentName || `Máquina ${machineIdx + 1}`}
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-text-muted">Horímetro:</span>
                        <span className="ml-2">{machine.hourMeter || '-'}h</span>
                      </div>
                      <div>
                        <span className="text-text-muted">Local:</span>
                        <span className="ml-2">{machine.location || '-'}</span>
                      </div>
                      <div>
                        <span className="text-text-muted">Tipo:</span>
                        <span className="ml-2">{getTypeLabel(machine.maintenanceType)}</span>
                      </div>
                      <div>
                        <span className="text-text-muted">Prioridade:</span>
                        <span className="ml-2 capitalize">{machine.priority}</span>
                      </div>
                    </div>

                    {/* Services */}
                    {machine.services.length > 0 && (
                      <div className="border-t border-border pt-2 mt-2">
                        <p className="text-xs font-medium text-primary mb-1">Serviços ({machine.services.length})</p>
                        {machine.services.slice(0, 2).map((s, i) => (
                          <p key={i} className="text-xs text-text-muted truncate">• {s.description}</p>
                        ))}
                        {machine.services.length > 2 && (
                          <p className="text-xs text-text-muted">+{machine.services.length - 2} mais</p>
                        )}
                      </div>
                    )}

                    {/* Photos count */}
                    {machine.services.some(s => s.photos.length > 0) && (
                      <div className="flex items-center gap-2 text-xs text-text-muted">
                        <ImageIcon className="w-3 h-3" />
                        <span>
                          {machine.services.reduce((acc, s) => acc + s.photos.length, 0)} fotos
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {/* Signature */}
              {viewingReport.signaturePhoto && (
                <Card>
                  <CardContent className="p-3">
                    <h4 className="font-medium text-primary text-sm mb-2">Assinatura</h4>
                    <img 
                      src={viewingReport.signaturePhoto} 
                      alt="Assinatura" 
                      className="w-32 h-32 object-cover rounded-lg border border-border"
                    />
                  </CardContent>
                </Card>
              )}

              {/* Export Buttons */}
              <div className="flex gap-2">
                <Button 
                  className="flex-1 bg-primary"
                  onClick={() => handleEdit(viewingReport)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 bg-green-600 text-white hover:bg-green-700"
                  onClick={() => {
                    handleShareWhatsApp(viewingReport)
                    setViewingReport(null)
                  }}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Slide Presentation Viewer */}
      {slideReport && (
        <ReportViewer 
          report={slideReport} 
          onClose={() => setSlideReport(null)} 
        />
      )}

      {/* Delete Confirmation with Password */}
      {deleteConfirm && (
        <Dialog open={true} onOpenChange={() => {
          setDeleteConfirm(null)
          setDeletePassword('')
          setDeleteError('')
        }}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-danger">
                <AlertTriangle className="w-5 h-5" />
                Confirmar Exclusão
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm text-text-muted">
              Digite a senha para excluir o relatório:
            </p>
            <Input
              type="password"
              value={deletePassword}
              onChange={(e) => {
                setDeletePassword(e.target.value)
                setDeleteError('')
              }}
              placeholder="Senha"
              className="h-12"
            />
            {deleteError && (
              <p className="text-sm text-danger">{deleteError}</p>
            )}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setDeleteConfirm(null)
                  setDeletePassword('')
                  setDeleteError('')
                }} 
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button 
                className="flex-1 bg-danger hover:bg-danger/90" 
                onClick={handleDelete}
              >
                Excluir
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
