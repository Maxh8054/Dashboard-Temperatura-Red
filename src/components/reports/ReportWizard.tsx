/**
 * MaxReport Pro - Report Wizard
 * Multi-step form for creating technical reports with multiple machines
 */

'use client'

import { useState, useRef } from 'react'
import { useReportStore, useAuthStore, type ServicePerformed, type ServicePhoto, type Desvio, type Displacement, USERS, CORRECTIVE_CATEGORIES, PROGRAMADA_CATEGORIES, WEATHER_TYPES } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  ArrowLeft,
  ArrowRight,
  X,
  Calendar,
  Clock,
  Truck,
  MapPin,
  Wrench,
  FileText,
  Camera,
  User,
  CheckCircle,
  Plus,
  Trash2,
  Edit,
  Image as ImageIcon,
  Sun,
  Moon,
  List,
  ChevronDown,
  ChevronUp,
  Download,
  AlertTriangle,
  Route,
  Cloud,
  CloudRain,
  CloudSun,
} from 'lucide-react'

// Wizard steps for machine flow
const WIZARD_STEPS = [
  { id: 'general', title: 'Dados Gerais', icon: Calendar },
  { id: 'equipment', title: 'Equipamento', icon: Truck },
  { id: 'maintenance', title: 'Manutenção', icon: Wrench },
  { id: 'services', title: 'Serviços', icon: FileText },
  { id: 'machine-summary', title: 'Resumo Máquina', icon: CheckCircle },
  { id: 'signature', title: 'Assinatura', icon: User },
  { id: 'summary', title: 'Resumo Final', icon: List },
]

// Predefined equipment
const PREDEFINED_EQUIPMENT = [
  { id: 'eh-01', code: 'EH-01', name: 'EH-01' },
  { id: 'eh-02', code: 'EH-02', name: 'EH-02' },
  { id: 'eh-03', code: 'EH-03', name: 'EH-03' },
]

export function ReportWizard() {
  const { 
    currentReport, 
    updateCurrentReport, 
    wizardStep, 
    nextStep, 
    prevStep, 
    closeWizard, 
    saveReport,
    currentMachineIndex,
    addMachine,
    selectMachine,
    markMachineComplete,
    removeMachine,
  } = useReportStore()
  
  const { user } = useAuthStore()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const progress = ((wizardStep + 1) / WIZARD_STEPS.length) * 100
  const currentStepData = WIZARD_STEPS[wizardStep]
  const StepIcon = currentStepData?.icon || FileText

  const handleNext = () => {
    if (wizardStep < WIZARD_STEPS.length - 1) {
      nextStep()
    }
  }

  const handlePrev = () => {
    if (wizardStep > 0) {
      prevStep()
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    saveReport()
    setIsSubmitting(false)
  }

  const canProceed = () => {
    const currentMachine = currentReport?.machines?.[currentMachineIndex]
    
    switch (wizardStep) {
      case 0: // Step 1 - All fields mandatory
        return currentReport?.date && 
               currentReport?.shift && 
               currentReport?.technicianName && 
               currentReport?.ddsTheme &&
               currentReport?.weather
      case 1: // Step 2 - Equipment mandatory, location and hourMeter required
        return currentMachine?.equipmentName && 
               currentMachine?.location && 
               currentMachine?.hourMeter
      case 2: // Step 3 - Maintenance type mandatory
        if (!currentMachine?.maintenanceType) return false
        // Additional requirements based on type
        if (currentMachine.maintenanceType === 'corrective' && 
            (!currentMachine.correctiveCategories || currentMachine.correctiveCategories.length === 0)) return false
        if (currentMachine.maintenanceType === 'programada' && !currentMachine.programadaEvent) return false
        return true
      case 3: // Step 4 - Services and Conclusion mandatory for non-operando
        if (currentMachine?.maintenanceType && 
            currentMachine.maintenanceType !== 'operando') {
          return currentMachine?.services && 
                 currentMachine.services.length > 0 && 
                 currentMachine?.conclusao && 
                 currentMachine.conclusao.trim().length > 0
        }
        return true // For "Operando", no services required
      case 4: return true // Machine summary
      case 5: return currentReport?.signaturePhoto
      default: return true
    }
  }

  const handleAddAnotherMachine = () => {
    markMachineComplete()
    addMachine()
  }

  const handleSelectMachine = (index: number) => {
    markMachineComplete()
    selectMachine(index)
  }

  return (
    <Dialog open={true} onOpenChange={(open) => !open && closeWizard()}>
      <DialogContent className="max-w-lg w-[95vw] h-[90vh] p-0 gap-0 flex flex-col overflow-hidden">
        {/* Header - Fixed */}
        <div className="flex-shrink-0 bg-surface border-b border-border">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/20">
                <StepIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold">
                  {currentStepData?.title}
                </DialogTitle>
                <p className="text-xs text-text-muted">
                  Passo {wizardStep + 1} de {WIZARD_STEPS.length}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={closeWizard}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Progress Bar */}
          <div className="px-4 pb-3">
            <Progress value={progress} className="h-1" />
          </div>
          
          {/* Machine Navigation */}
          {wizardStep >= 1 && wizardStep < 5 && currentReport?.machines && currentReport.machines.length > 0 && (
            <div className="px-4 pb-3">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {currentReport.machines.map((machine, idx) => (
                  <div key={machine.id} className="relative group">
                    <button
                      type="button"
                      onClick={() => handleSelectMachine(idx)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 whitespace-nowrap transition-all ${
                        idx === currentMachineIndex
                          ? 'border-primary bg-primary/20'
                          : machine.isComplete
                            ? 'border-success bg-success/10'
                            : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <Truck className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {machine.equipmentName || `Máquina ${idx + 1}`}
                      </span>
                      {machine.isComplete && idx !== currentMachineIndex && (
                        <CheckCircle className="w-4 h-4 text-success" />
                      )}
                    </button>
                    {currentReport.machines.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (confirm('Deseja remover esta máquina?')) {
                            removeMachine(idx)
                          }
                        }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-danger text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-danger"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="p-4 pb-24">
            {wizardStep === 0 && <GeneralStep />}
            {wizardStep === 1 && <EquipmentStep />}
            {wizardStep === 2 && <MaintenanceStep />}
            {wizardStep === 3 && <ServicesStep />}
            {wizardStep === 4 && (
              <MachineSummaryStep 
                onAddAnotherMachine={handleAddAnotherMachine}
                onSelectMachine={handleSelectMachine}
              />
            )}
            {wizardStep === 5 && <SignatureStep />}
            {wizardStep === 6 && <SummaryStep onSave={handleSubmit} isSubmitting={isSubmitting} />}
          </div>
        </div>

        {/* Footer - Fixed at bottom */}
        {wizardStep < 6 && (
          <div className="absolute bottom-0 left-0 right-0 bg-surface border-t border-border p-4">
            <div className="flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrev}
                disabled={wizardStep === 0}
                className="flex-1 h-12"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Anterior
              </Button>
              
              <Button
                type="button"
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex-1 h-12 bg-primary hover:bg-primary/90"
              >
                Próximo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ============================================
// STEP 1: GENERAL DATA
// ============================================

function GeneralStep() {
  const { currentReport, updateCurrentReport } = useReportStore()

  const getWeatherIcon = (weather: string) => {
    switch (weather) {
      case 'Ensolarado': return <Sun className="w-5 h-5" />
      case 'Nublado': return <Cloud className="w-5 h-5" />
      case 'Chuva': return <CloudRain className="w-5 h-5" />
      default: return <CloudSun className="w-5 h-5" />
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 space-y-4">
          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date" className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Data *
            </Label>
            <Input
              id="date"
              type="date"
              value={currentReport?.date || ''}
              onChange={(e) => updateCurrentReport({ date: e.target.value })}
              className="h-12"
            />
          </div>

          {/* Shift Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Turno *
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => updateCurrentReport({ shift: 'day', startTime: '07:00', endTime: '19:00' })}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  currentReport?.shift === 'day'
                    ? 'border-primary bg-primary/20'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Sun className={`w-5 h-5 ${currentReport?.shift === 'day' ? 'text-primary' : 'text-text-muted'}`} />
                  <span className="font-bold">Diurno</span>
                </div>
                <p className="text-sm text-text-muted">07:00 - 19:00</p>
              </button>
              
              <button
                type="button"
                onClick={() => updateCurrentReport({ shift: 'night', startTime: '19:00', endTime: '07:00' })}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  currentReport?.shift === 'night'
                    ? 'border-primary bg-primary/20'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Moon className={`w-5 h-5 ${currentReport?.shift === 'night' ? 'text-primary' : 'text-text-muted'}`} />
                  <span className="font-bold">Noturno</span>
                </div>
                <p className="text-sm text-text-muted">19:00 - 07:00</p>
              </button>
            </div>
          </div>

          {/* Weather */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <CloudSun className="w-4 h-4 text-primary" />
              Clima *
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {WEATHER_TYPES.map((weather) => (
                <button
                  type="button"
                  key={weather}
                  onClick={() => updateCurrentReport({ weather })}
                  className={`p-3 rounded-lg border-2 text-center transition-all ${
                    currentReport?.weather === weather
                      ? 'border-primary bg-primary/20'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    {getWeatherIcon(weather)}
                    <span className="text-sm">{weather}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Technician Name */}
          <div className="space-y-2">
            <Label htmlFor="technicianName" className="flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Nome do Técnico *
            </Label>
            <select
              id="technicianName"
              value={currentReport?.technicianName || ''}
              onChange={(e) => updateCurrentReport({ technicianName: e.target.value })}
              className="w-full h-12 px-3 rounded-lg border border-border bg-surface text-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Selecione o técnico</option>
              {USERS.map((u) => (
                <option key={u.id} value={u.name}>{u.name}</option>
              ))}
            </select>
          </div>

          {/* DDS Theme */}
          <div className="space-y-2">
            <Label htmlFor="ddsTheme" className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Tema do DDS *
            </Label>
            <Textarea
              id="ddsTheme"
              value={currentReport?.ddsTheme || ''}
              onChange={(e) => updateCurrentReport({ ddsTheme: e.target.value })}
              placeholder="Descreva o tema do DDS..."
              className="min-h-[80px] resize-none"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================
// STEP 2: EQUIPMENT
// ============================================

function EquipmentStep() {
  const { currentReport, updateCurrentMachine, currentMachineIndex } = useReportStore()
  const [showManualInput, setShowManualInput] = useState(false)
  const [manualEquipment, setManualEquipment] = useState({
    name: '',
    location: '',
    hourMeter: ''
  })

  const currentMachine = currentReport?.machines?.[currentMachineIndex]

  const handleSelectPredefined = (eq: typeof PREDEFINED_EQUIPMENT[0]) => {
    updateCurrentMachine({ 
      equipmentId: eq.id, 
      equipmentName: eq.name,
    })
    setShowManualInput(false)
  }

  const handleManualSubmit = () => {
    if (manualEquipment.name) {
      updateCurrentMachine({
        equipmentId: 'manual-' + Date.now(),
        equipmentName: manualEquipment.name,
        location: manualEquipment.location,
        hourMeter: parseFloat(manualEquipment.hourMeter) || 0
      })
      setShowManualInput(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Predefined Equipment */}
      {!showManualInput && (
        <>
          <div className="space-y-2">
            <Label>Selecione o Equipamento</Label>
            <div className="space-y-2">
              {PREDEFINED_EQUIPMENT.map((eq) => (
                <Card 
                  key={eq.id}
                  className={`cursor-pointer transition-all ${
                    currentMachine?.equipmentId === eq.id 
                      ? 'ring-2 ring-primary bg-primary/10' 
                      : 'hover:bg-surface-hover'
                  }`}
                  onClick={() => handleSelectPredefined(eq)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                          <Truck className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-lg">{eq.code}</span>
                      </div>
                      {currentMachine?.equipmentId === eq.id && (
                        <CheckCircle className="w-6 h-6 text-primary" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full h-12"
            onClick={() => setShowManualInput(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Equipamento Manualmente
          </Button>
        </>
      )}

      {/* Manual Input Form */}
      {showManualInput && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Adicionar Equipamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label>Nome/Identificação</Label>
              <Input
                value={manualEquipment.name}
                onChange={(e) => setManualEquipment({ ...manualEquipment, name: e.target.value })}
                placeholder="Ex: EH-04"
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Local
              </Label>
              <Input
                value={manualEquipment.location}
                onChange={(e) => setManualEquipment({ ...manualEquipment, location: e.target.value })}
                placeholder="Ex: Área de Extração A"
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Horímetro
              </Label>
              <Input
                type="number"
                value={manualEquipment.hourMeter}
                onChange={(e) => setManualEquipment({ ...manualEquipment, hourMeter: e.target.value })}
                placeholder="Ex: 12500"
                className="h-12"
              />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setShowManualInput(false)} className="flex-1">
                Cancelar
              </Button>
              <Button type="button" onClick={handleManualSubmit} className="flex-1 bg-primary">
                Confirmar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Location and HourMeter for Predefined Equipment */}
      {currentMachine?.equipmentId && !showManualInput && !currentMachine.equipmentId?.startsWith('manual-') && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Local *
              </Label>
              <Input
                value={currentMachine?.location || ''}
                onChange={(e) => updateCurrentMachine({ location: e.target.value })}
                placeholder="Informe o local"
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Horímetro *
              </Label>
              <Input
                type="number"
                value={currentMachine?.hourMeter || ''}
                onChange={(e) => updateCurrentMachine({ hourMeter: e.target.value })}
                placeholder="Informe o horímetro"
                className="h-12"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ============================================
// STEP 3: MAINTENANCE
// ============================================

function MaintenanceStep() {
  const { currentReport, updateCurrentMachine, currentMachineIndex } = useReportStore()
  const [showAllCorrective, setShowAllCorrective] = useState(false)
  const [showAllProgramada, setShowAllProgramada] = useState(false)
  
  const currentMachine = currentReport?.machines?.[currentMachineIndex]

  const maintenanceTypes = [
    { value: 'operando', label: 'Operando', color: 'bg-success' },
    { value: 'preventive', label: 'Preventiva', color: 'bg-info' },
    { value: 'corrective', label: 'Corretiva', color: 'bg-warning' },
    { value: 'programada', label: 'Programada', color: 'bg-secondary' },
    { value: 'inspection', label: 'Inspeção', color: 'bg-primary' },
  ]

  const priorities = [
    { value: 'low', label: 'Baixa' },
    { value: 'normal', label: 'Normal' },
    { value: 'high', label: 'Alta' },
    { value: 'critical', label: 'Crítica' },
  ]

  // Toggle functions for each category type
  const toggleCorrectiveCategory = (category: string) => {
    const current = currentMachine?.correctiveCategories || []
    if (current.includes(category)) {
      updateCurrentMachine({ 
        correctiveCategories: current.filter(c => c !== category),
        correctiveOther: category === 'Outros' ? undefined : currentMachine?.correctiveOther
      })
    } else {
      updateCurrentMachine({ correctiveCategories: [...current, category] })
    }
  }

  const toggleProgramadaCategory = (category: string) => {
    const current = currentMachine?.programadaCategories || []
    if (current.includes(category)) {
      updateCurrentMachine({ 
        programadaCategories: current.filter(c => c !== category),
        programadaOther: category === 'Outros' ? undefined : currentMachine?.programadaOther
      })
    } else {
      updateCurrentMachine({ programadaCategories: [...current, category] })
    }
  }

  const displayedCorrective = showAllCorrective 
    ? CORRECTIVE_CATEGORIES 
    : CORRECTIVE_CATEGORIES.slice(0, 8)

  const displayedProgramada = showAllProgramada 
    ? PROGRAMADA_CATEGORIES 
    : PROGRAMADA_CATEGORIES.slice(0, 8)

  return (
    <div className="space-y-4">
      {/* Maintenance Type */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Tipo de Manutenção *</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2">
          {maintenanceTypes.map((type) => (
            <button
              type="button"
              key={type.value}
              onClick={() => updateCurrentMachine({ 
                maintenanceType: type.value as any,
                correctiveCategories: [],
                correctiveOther: undefined,
                programadaEvent: undefined,
                programadaCategories: [],
                programadaOther: undefined
              })}
              className={`p-3 rounded-lg border-2 text-left transition-all ${
                currentMachine?.maintenanceType === type.value
                  ? 'border-primary bg-primary/20'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${type.color}`} />
                <span className="font-medium">{type.label}</span>
              </div>
              {currentMachine?.maintenanceType === type.value && (
                <CheckCircle className="w-4 h-4 text-primary mt-1" />
              )}
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Corrective Categories */}
      {currentMachine?.maintenanceType === 'corrective' && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Categorias da Corretiva *</CardTitle>
            <p className="text-xs text-text-muted">Selecione uma ou mais categorias</p>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              {displayedCorrective.map((category) => (
                <button
                  type="button"
                  key={category}
                  onClick={() => toggleCorrectiveCategory(category)}
                  className={`p-2 rounded-lg border-2 text-left text-sm transition-all ${
                    currentMachine?.correctiveCategories?.includes(category)
                      ? 'border-primary bg-primary/20'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded border-2 flex items-center justify-center ${
                      currentMachine?.correctiveCategories?.includes(category)
                        ? 'border-primary bg-primary'
                        : 'border-border'
                    }`}>
                      {currentMachine?.correctiveCategories?.includes(category) && (
                        <CheckCircle className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <span className="font-medium">{category}</span>
                  </div>
                </button>
              ))}
            </div>

            {CORRECTIVE_CATEGORIES.length > 8 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowAllCorrective(!showAllCorrective)}
                className="w-full mt-2"
              >
                {showAllCorrective ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-1" />
                    Mostrar menos
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-1" />
                    Mostrar mais ({CORRECTIVE_CATEGORIES.length - 8} categorias)
                  </>
                )}
              </Button>
            )}

            {currentMachine?.correctiveCategories?.includes('Outros') && (
              <div className="mt-3 space-y-2">
                <Label>Especifique "Outros":</Label>
                <Input
                  value={currentMachine?.correctiveOther || ''}
                  onChange={(e) => updateCurrentMachine({ correctiveOther: e.target.value })}
                  placeholder="Descreva a categoria..."
                  className="h-12"
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Programada Event and Categories */}
      {currentMachine?.maintenanceType === 'programada' && (
        <>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Evento da Manutenção Programada *</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Label>Descreva o evento:</Label>
              <Textarea
                value={currentMachine?.programadaEvent || ''}
                onChange={(e) => updateCurrentMachine({ programadaEvent: e.target.value })}
                placeholder="Ex: Parada programada para troca de componentes..."
                className="min-h-[100px] resize-none"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Categorias da Programada *</CardTitle>
              <p className="text-xs text-text-muted">Selecione uma ou mais categorias</p>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                {displayedProgramada.map((category) => (
                  <button
                    type="button"
                    key={category}
                    onClick={() => toggleProgramadaCategory(category)}
                    className={`p-2 rounded-lg border-2 text-left text-sm transition-all ${
                      currentMachine?.programadaCategories?.includes(category)
                        ? 'border-primary bg-primary/20'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded border-2 flex items-center justify-center ${
                        currentMachine?.programadaCategories?.includes(category)
                          ? 'border-primary bg-primary'
                          : 'border-border'
                      }`}>
                        {currentMachine?.programadaCategories?.includes(category) && (
                          <CheckCircle className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <span className="font-medium">{category}</span>
                    </div>
                  </button>
                ))}
              </div>

              {PROGRAMADA_CATEGORIES.length > 8 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllProgramada(!showAllProgramada)}
                  className="w-full mt-2"
                >
                  {showAllProgramada ? (
                    <>
                      <ChevronUp className="w-4 h-4 mr-1" />
                      Mostrar menos
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4 mr-1" />
                      Mostrar mais ({PROGRAMADA_CATEGORIES.length - 8} categorias)
                    </>
                  )}
                </Button>
              )}

              {currentMachine?.programadaCategories?.includes('Outros') && (
                <div className="mt-3 space-y-2">
                  <Label>Especifique "Outros":</Label>
                  <Input
                    value={currentMachine?.programadaOther || ''}
                    onChange={(e) => updateCurrentMachine({ programadaOther: e.target.value })}
                    placeholder="Descreva a categoria..."
                    className="h-12"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Priority */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Prioridade</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-4 gap-2">
          {priorities.map((priority) => (
            <button
              type="button"
              key={priority.value}
              onClick={() => updateCurrentMachine({ priority: priority.value as any })}
              className={`p-2 rounded-lg border-2 text-center transition-all ${
                currentMachine?.priority === priority.value
                  ? 'border-primary bg-primary/20'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <span className="text-sm font-medium">{priority.label}</span>
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Downtime */}
      {currentMachine?.maintenanceType && currentMachine.maintenanceType !== 'operando' && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <Label htmlFor="downtime" className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-warning" />
                Tempo de Parada (horas)
              </Label>
              <Input
                id="downtime"
                type="number"
                step="0.5"
                min="0"
                value={currentMachine?.downtimeHours || ''}
                onChange={(e) => updateCurrentMachine({ downtimeHours: parseFloat(e.target.value) || 0 })}
                placeholder="0"
                className="h-12"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ============================================
// STEP 4: SERVICES WITH PHOTOS
// ============================================

function ServicesStep() {
  const { 
    currentReport, 
    addService, 
    updateService, 
    removeService, 
    addPhotoToService, 
    updatePhotoInService, 
    removePhotoFromService, 
    currentMachineIndex,
    updateCurrentMachine,
    setDownload,
    setDownloadPhoto,
    addDesvio,
    removeDesvio,
    addDeslocamento,
    removeDeslocamento,
  } = useReportStore()
  
  const [newServiceDesc, setNewServiceDesc] = useState('')
  const [editingPhoto, setEditingPhoto] = useState<{ serviceId: string; photo: ServicePhoto } | null>(null)
  
  // New states for desvios
  const [showDesvioForm, setShowDesvioForm] = useState(false)
  const [newDesvio, setNewDesvio] = useState({ description: '', time: '', endTime: '' })
  
  // New states for displacements
  const [showDeslocamentoForm, setShowDeslocamentoForm] = useState(false)
  const [newDeslocamento, setNewDeslocamento] = useState({ from: '', to: '', startTime: '', endTime: '', observacao: '' })

  const currentMachine = currentReport?.machines?.[currentMachineIndex]

  const handleAddService = () => {
    if (newServiceDesc.trim()) {
      // Split by newlines and filter empty lines
      const lines = newServiceDesc
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
      
      // Add each line as a separate service
      lines.forEach((line, index) => {
        const newService: ServicePerformed = {
          id: `service-${Date.now()}-${index}`,
          description: line,
          photos: []
        }
        addService(newService)
      })
      
      setNewServiceDesc('')
    }
  }

  const handleFileSelect = (serviceId: string, type: 'before' | 'after' | 'general', e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      // Process each file sequentially with unique timestamps
      Array.from(files).forEach((file, index) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          const newPhoto: ServicePhoto = {
            id: `photo-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
            type,
            imageData: reader.result as string,
          }
          addPhotoToService(serviceId, newPhoto)
        }
        reader.readAsDataURL(file)
      })
    }
    // Reset input to allow selecting same files again
    e.target.value = ''
  }

  const handleMachinePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        updateCurrentMachine({ machinePhoto: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDownloadPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setDownloadPhoto(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddDesvio = () => {
    if (newDesvio.description.trim()) {
      const desvio: Desvio = {
        id: `desvio-${Date.now()}`,
        description: newDesvio.description,
        time: newDesvio.time || new Date().toTimeString().slice(0, 5),
        endTime: newDesvio.endTime || undefined
      }
      addDesvio(desvio)
      setNewDesvio({ description: '', time: '', endTime: '' })
      setShowDesvioForm(false)
    }
  }

  const handleAddDeslocamento = () => {
    if (newDeslocamento.from.trim() && newDeslocamento.to.trim()) {
      const deslocamento: Displacement = {
        id: `deslocamento-${Date.now()}`,
        from: newDeslocamento.from,
        to: newDeslocamento.to,
        startTime: newDeslocamento.startTime,
        endTime: newDeslocamento.endTime,
        observacao: newDeslocamento.observacao
      }
      addDeslocamento(deslocamento)
      setNewDeslocamento({ from: '', to: '', startTime: '', endTime: '', observacao: '' })
      setShowDeslocamentoForm(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Machine Photo Section */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Camera className="w-4 h-4 text-primary" />
            Foto da Máquina
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {currentMachine?.machinePhoto ? (
            <div className="relative">
              <img 
                src={currentMachine.machinePhoto} 
                alt="Foto da máquina" 
                className="w-full max-h-48 object-contain rounded-lg border border-border"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => updateCurrentMachine({ machinePhoto: undefined })}
                className="absolute top-2 right-2 bg-surface/80"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <label className="h-16 flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border hover:border-primary cursor-pointer transition-all">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleMachinePhoto}
                />
                <Camera className="w-5 h-5 text-primary" />
                <span className="text-xs">Tirar Foto</span>
              </label>
              <label className="h-16 flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border hover:border-primary cursor-pointer transition-all">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleMachinePhoto}
                />
                <ImageIcon className="w-5 h-5 text-primary" />
                <span className="text-xs">Galeria</span>
              </label>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add New Service */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Adicionar Serviço Realizado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={newServiceDesc}
            onChange={(e) => setNewServiceDesc(e.target.value)}
            placeholder="Descreva o serviço realizado..."
            className="min-h-[80px] resize-none"
          />
          <Button type="button" onClick={handleAddService} className="w-full bg-primary">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Serviço
          </Button>
        </CardContent>
      </Card>

      {/* Services List */}
      {currentMachine?.services.map((service, serviceIndex) => (
        <Card key={service.id} className="border-l-4 border-l-primary">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold px-2 py-1 bg-primary text-white rounded">
                    Serviço {serviceIndex + 1}
                  </span>
                </div>
                <Textarea
                  value={service.description}
                  onChange={(e) => updateService(service.id, { description: e.target.value })}
                  className="min-h-[60px] resize-none"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeService(service.id)}
                className="text-danger hover:bg-danger/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label className="text-sm">Fotos</Label>
              
              {/* Before Photos */}
              <div className="space-y-1">
                <p className="text-xs text-text-muted">Antes:</p>
                <div className="flex gap-2 flex-wrap">
                  {service.photos.filter(p => p.type === 'before').map((photo) => (
                    <div key={photo.id} className="relative">
                      <img 
                        src={photo.editedImageData || photo.imageData} 
                        alt="Foto antes" 
                        className="w-16 h-16 object-cover rounded-lg border border-border"
                      />
                      <button
                        type="button"
                        className="absolute -top-1 -right-1 w-5 h-5 bg-danger text-white rounded-full flex items-center justify-center"
                        onClick={() => removePhotoFromService(service.id, photo.id)}
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center"
                        onClick={() => setEditingPhoto({ serviceId: service.id, photo })}
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <label className="w-16 h-16 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border hover:border-primary cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handleFileSelect(service.id, 'before', e)}
                    />
                    <Camera className="w-4 h-4 text-text-muted" />
                    <span className="text-[8px] text-text-muted">+1</span>
                  </label>
                </div>
              </div>

              {/* After Photos */}
              <div className="space-y-1">
                <p className="text-xs text-text-muted">Depois:</p>
                <div className="flex gap-2 flex-wrap">
                  {service.photos.filter(p => p.type === 'after').map((photo) => (
                    <div key={photo.id} className="relative">
                      <img 
                        src={photo.editedImageData || photo.imageData} 
                        alt="Foto depois" 
                        className="w-16 h-16 object-cover rounded-lg border border-border"
                      />
                      <button
                        type="button"
                        className="absolute -top-1 -right-1 w-5 h-5 bg-danger text-white rounded-full flex items-center justify-center"
                        onClick={() => removePhotoFromService(service.id, photo.id)}
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center"
                        onClick={() => setEditingPhoto({ serviceId: service.id, photo })}
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <label className="w-16 h-16 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border hover:border-primary cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handleFileSelect(service.id, 'after', e)}
                    />
                    <Camera className="w-4 h-4 text-text-muted" />
                    <span className="text-[8px] text-text-muted">+1</span>
                  </label>
                </div>
              </div>

              {/* General/Random Photos */}
              <div className="space-y-1">
                <p className="text-xs text-text-muted">Fotos Gerais:</p>
                <div className="flex gap-2 flex-wrap">
                  {service.photos.filter(p => p.type === 'general').map((photo) => (
                    <div key={photo.id} className="relative">
                      <img 
                        src={photo.editedImageData || photo.imageData} 
                        alt="Foto geral" 
                        className="w-16 h-16 object-cover rounded-lg border border-border"
                      />
                      <button
                        type="button"
                        className="absolute -top-1 -right-1 w-5 h-5 bg-danger text-white rounded-full flex items-center justify-center"
                        onClick={() => removePhotoFromService(service.id, photo.id)}
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center"
                        onClick={() => setEditingPhoto({ serviceId: service.id, photo })}
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <label className="w-16 h-16 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border hover:border-primary cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handleFileSelect(service.id, 'general', e)}
                    />
                    <Camera className="w-4 h-4 text-text-muted" />
                    <span className="text-[8px] text-text-muted">+1</span>
                  </label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Download Section */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Download className="w-4 h-4 text-primary" />
            Download
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <button
            type="button"
            onClick={() => setDownload(!currentMachine?.download)}
            className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
              currentMachine?.download
                ? 'border-primary bg-primary/20'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                currentMachine?.download
                  ? 'border-primary bg-primary'
                  : 'border-border'
              }`}>
                {currentMachine?.download && <CheckCircle className="w-3 h-3 text-white" />}
              </div>
              <span className="font-medium">Download realizado</span>
            </div>
          </button>

          {currentMachine?.download && (
            <div className="space-y-2">
              <Label>Foto do Download:</Label>
              {currentMachine.downloadPhoto ? (
                <div className="relative">
                  <img 
                    src={currentMachine.downloadPhoto} 
                    alt="Foto download" 
                    className="w-full max-h-48 object-contain rounded-lg border border-border"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setDownloadPhoto('')}
                    className="absolute top-2 right-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <label className="h-16 flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border hover:border-primary cursor-pointer transition-all">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleDownloadPhoto}
                    />
                    <Camera className="w-5 h-5 text-primary" />
                    <span className="text-xs">Tirar Foto</span>
                  </label>
                  <label className="h-16 flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border hover:border-primary cursor-pointer transition-all">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleDownloadPhoto}
                    />
                    <ImageIcon className="w-5 h-5 text-primary" />
                    <span className="text-xs">Galeria</span>
                  </label>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Desvios Section */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            Desvios ({currentMachine?.desvios?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {currentMachine?.desvios?.map((desvio) => (
            <div key={desvio.id} className="flex items-start justify-between gap-2 p-2 rounded-lg bg-surface-hover">
              <div>
                <p className="text-sm">{desvio.description}</p>
                <p className="text-xs text-text-muted">
                  {desvio.time}{desvio.endTime ? ` - ${desvio.endTime}` : ''}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeDesvio(desvio.id)}
                className="text-danger hover:bg-danger/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}

          {showDesvioForm ? (
            <div className="space-y-2 p-3 rounded-lg border border-border">
              <Textarea
                value={newDesvio.description}
                onChange={(e) => setNewDesvio({ ...newDesvio, description: e.target.value })}
                placeholder="Descreva o desvio..."
                className="min-h-[60px] resize-none"
              />
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Início:</Label>
                  <Input
                    type="time"
                    value={newDesvio.time}
                    onChange={(e) => setNewDesvio({ ...newDesvio, time: e.target.value })}
                    className="h-10"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Fim:</Label>
                  <Input
                    type="time"
                    value={newDesvio.endTime}
                    onChange={(e) => setNewDesvio({ ...newDesvio, endTime: e.target.value })}
                    className="h-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setShowDesvioForm(false)} className="flex-1 h-10">
                  Cancelar
                </Button>
                <Button type="button" onClick={handleAddDesvio} className="flex-1 h-10 bg-primary">
                  Adicionar
                </Button>
              </div>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDesvioForm(true)}
              className="w-full h-10"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Desvio
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Displacements Section */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Route className="w-4 h-4 text-info" />
            Deslocamentos ({currentMachine?.deslocamentos?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {currentMachine?.deslocamentos?.map((deslocamento) => (
            <div key={deslocamento.id} className="flex items-start justify-between gap-2 p-2 rounded-lg bg-surface-hover">
              <div className="flex-1">
                <p className="text-sm">
                  <span className="text-text-muted">De:</span> {deslocamento.from}
                </p>
                <p className="text-sm">
                  <span className="text-text-muted">Para:</span> {deslocamento.to}
                </p>
                <p className="text-xs text-text-muted">
                  {deslocamento.startTime} - {deslocamento.endTime}
                </p>
                {deslocamento.observacao && (
                  <p className="text-xs text-text-muted mt-1">
                    <span className="font-medium">Obs:</span> {deslocamento.observacao}
                  </p>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeDeslocamento(deslocamento.id)}
                className="text-danger hover:bg-danger/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}

          {showDeslocamentoForm ? (
            <div className="space-y-2 p-3 rounded-lg border border-border">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">De:</Label>
                  <Input
                    value={newDeslocamento.from}
                    onChange={(e) => setNewDeslocamento({ ...newDeslocamento, from: e.target.value })}
                    placeholder="Origem"
                    className="h-10"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Para:</Label>
                  <Input
                    value={newDeslocamento.to}
                    onChange={(e) => setNewDeslocamento({ ...newDeslocamento, to: e.target.value })}
                    placeholder="Destino"
                    className="h-10"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Início:</Label>
                  <Input
                    type="time"
                    value={newDeslocamento.startTime}
                    onChange={(e) => setNewDeslocamento({ ...newDeslocamento, startTime: e.target.value })}
                    className="h-10"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Fim:</Label>
                  <Input
                    type="time"
                    value={newDeslocamento.endTime}
                    onChange={(e) => setNewDeslocamento({ ...newDeslocamento, endTime: e.target.value })}
                    className="h-10"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Observação:</Label>
                <Textarea
                  value={newDeslocamento.observacao}
                  onChange={(e) => setNewDeslocamento({ ...newDeslocamento, observacao: e.target.value })}
                  placeholder="Adicione uma observação..."
                  className="min-h-[60px] resize-none"
                />
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setShowDeslocamentoForm(false)} className="flex-1 h-10">
                  Cancelar
                </Button>
                <Button type="button" onClick={handleAddDeslocamento} className="flex-1 h-10 bg-primary">
                  Adicionar
                </Button>
              </div>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDeslocamentoForm(true)}
              className="w-full h-10"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Deslocamento
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Conclusion Section */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Conclusão</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={currentMachine?.conclusao || ''}
            onChange={(e) => updateCurrentMachine({ conclusao: e.target.value })}
            placeholder="Descreva a conclusão do serviço realizado nesta máquina..."
            className="min-h-[100px] resize-none"
          />
        </CardContent>
      </Card>

      {/* Pending Items */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Pendências para Próximo Turno</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={currentMachine?.pendingItems || ''}
            onChange={(e) => updateCurrentMachine({ pendingItems: e.target.value })}
            placeholder="Descreva pendências para o próximo turno..."
            className="min-h-[80px] resize-none"
          />
        </CardContent>
      </Card>

      {/* Photo Editor Modal */}
      {editingPhoto && (
        <PhotoEditor
          photo={editingPhoto.photo}
          onSave={(editedImage) => {
            updatePhotoInService(editingPhoto.serviceId, editingPhoto.photo.id, { editedImageData: editedImage })
            setEditingPhoto(null)
          }}
          onClose={() => setEditingPhoto(null)}
        />
      )}

      {/* Empty State */}
      {(!currentMachine?.services || currentMachine.services.length === 0) && (
        <div className="text-center py-8 text-text-muted">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Nenhum serviço adicionado</p>
          <p className="text-sm">Adicione os serviços realizados</p>
        </div>
      )}
    </div>
  )
}

// ============================================
// PHOTO EDITOR COMPONENT
// ============================================

function PhotoEditor({ photo, onSave, onClose }: { photo: ServicePhoto; onSave: (editedImage: string) => void; onClose: () => void }) {
  const [tool, setTool] = useState<'pen' | 'arrow' | 'circle' | 'rectangle' | 'text'>('pen')
  const [color, setColor] = useState('#FF6600')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const colors = ['#FF6600', '#FFFFFF', '#000000', '#EF4444', '#22C55E', '#3B82F6']
  const tools = [
    { id: 'pen', label: 'Caneta' },
    { id: 'arrow', label: 'Seta' },
    { id: 'circle', label: 'Círculo' },
    { id: 'rectangle', label: 'Retângulo' },
    { id: 'text', label: 'Texto' },
  ]

  const handleSave = () => {
    if (canvasRef.current) {
      onSave(canvasRef.current.toDataURL())
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editor de Foto</DialogTitle>
        </DialogHeader>
        
        <div className="relative bg-surface rounded-lg overflow-hidden">
          <img src={photo.imageData} alt="Editando" className="w-full" />
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        </div>

        <div className="space-y-3">
          <div className="flex gap-2 justify-center">
            {tools.map((t) => (
              <button
                type="button"
                key={t.id}
                onClick={() => setTool(t.id as any)}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all text-xs ${
                  tool === t.id ? 'bg-primary text-white' : 'bg-surface hover:bg-surface-hover'
                }`}
              >
                {t.label.slice(0, 3)}
              </button>
            ))}
          </div>

          <div className="flex gap-2 justify-center">
            {colors.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-full border-2 ${color === c ? 'border-primary' : 'border-border'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button type="button" onClick={handleSave} className="flex-1 bg-primary">Salvar</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ============================================
// STEP 5: MACHINE SUMMARY
// ============================================

function MachineSummaryStep({ onAddAnotherMachine, onSelectMachine }: { 
  onAddAnotherMachine: () => void
  onSelectMachine: (index: number) => void 
}) {
  const { currentReport, currentMachineIndex } = useReportStore()
  const currentMachine = currentReport?.machines?.[currentMachineIndex]

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

  const getMaintenanceDetails = () => {
    if (!currentMachine) return '-'
    
    switch (currentMachine.maintenanceType) {
      case 'corrective':
        const categories = currentMachine.correctiveCategories || []
        const cats = categories.filter(c => c !== 'Outros').join(', ')
        const other = currentMachine.correctiveOther
        return cats + (other ? (cats ? ', ' : '') + `Outros: ${other}` : '')
      case 'preventive':
        return currentMachine.preventiveInterval || '-'
      case 'programada':
        return currentMachine.programadaEvent || '-'
      default:
        return '-'
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Truck className="w-5 h-5 text-primary" />
            {currentMachine?.equipmentName || `Máquina ${currentMachineIndex + 1}`}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Machine Photo */}
          {currentMachine?.machinePhoto && (
            <div className="mb-3">
              <img 
                src={currentMachine.machinePhoto} 
                alt="Foto da máquina" 
                className="w-full max-h-40 object-contain rounded-lg border border-border"
              />
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-text-muted">Horímetro:</span>
              <span className="ml-2">{currentMachine?.hourMeter || '-'}h</span>
            </div>
            <div>
              <span className="text-text-muted">Local:</span>
              <span className="ml-2">{currentMachine?.location || '-'}</span>
            </div>
            <div>
              <span className="text-text-muted">Tipo:</span>
              <span className="ml-2">{getTypeLabel(currentMachine?.maintenanceType || '')}</span>
            </div>
            <div>
              <span className="text-text-muted">Prioridade:</span>
              <span className="ml-2 capitalize">{currentMachine?.priority}</span>
            </div>
          </div>

          {/* Maintenance Details */}
          {currentMachine?.maintenanceType && currentMachine.maintenanceType !== 'operando' && (
            <div className="border-t border-border pt-3">
              <h4 className="font-medium text-primary text-sm mb-1">
                {currentMachine.maintenanceType === 'corrective' ? 'Categorias:' : 
                 currentMachine.maintenanceType === 'preventive' ? 'Intervalo:' :
                 currentMachine.maintenanceType === 'programada' ? 'Evento:' : 'Detalhes:'}
              </h4>
              <p className="text-sm">{getMaintenanceDetails()}</p>
            </div>
          )}

          {/* Services */}
          <div className="border-t border-border pt-3 space-y-2">
            <h4 className="font-medium text-primary text-sm">Serviços ({currentMachine?.services.length || 0})</h4>
            {currentMachine?.services.map((service, idx) => (
              <div key={service.id} className="text-sm">
                <span className="text-text-muted">{idx + 1}.</span>
                <span className="ml-2">{service.description}</span>
              </div>
            ))}
          </div>

          {/* Desvios */}
          {currentMachine?.desvios && currentMachine.desvios.length > 0 && (
            <div className="border-t border-border pt-3 space-y-2">
              <h4 className="font-medium text-primary text-sm">Desvios ({currentMachine.desvios.length})</h4>
              {currentMachine.desvios.map((i, idx) => (
                <div key={i.id} className="text-sm">
                  <span className="text-text-muted">{idx + 1}.</span>
                  <span className="ml-2">{i.description} ({i.time}{i.endTime ? ` - ${i.endTime}` : ''})</span>
                </div>
              ))}
            </div>
          )}

          {/* Displacements */}
          {currentMachine?.deslocamentos && currentMachine.deslocamentos.length > 0 && (
            <div className="border-t border-border pt-3 space-y-2">
              <h4 className="font-medium text-primary text-sm">Deslocamentos ({currentMachine.deslocamentos.length})</h4>
              {currentMachine.deslocamentos.map((d, idx) => (
                <div key={d.id} className="text-sm">
                  <span className="text-text-muted">{idx + 1}.</span>
                  <span className="ml-2">{d.from} → {d.to} ({d.startTime} - {d.endTime}){d.observacao ? ` [${d.observacao}]` : ''}</span>
                </div>
              ))}
            </div>
          )}

          {/* Other info */}
          {currentMachine?.download && (
            <div className="border-t border-border pt-3">
              <p className="text-sm"><span className="text-text-muted">Download:</span> Realizado ✓</p>
            </div>
          )}

          {currentMachine?.conclusao && (
            <div className="border-t border-border pt-3">
              <h4 className="font-medium text-primary text-sm">Conclusão</h4>
              <p className="text-sm">{currentMachine.conclusao}</p>
            </div>
          )}

          {currentMachine?.pendingItems && (
            <div className="border-t border-border pt-3">
              <h4 className="font-medium text-primary text-sm">Pendências</h4>
              <p className="text-sm">{currentMachine.pendingItems}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Other Machines */}
      {currentReport?.machines && currentReport.machines.length > 1 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Outras Máquinas no Relatório</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {currentReport.machines.map((machine, idx) => (
              idx !== currentMachineIndex && (
                <button
                  key={machine.id}
                  type="button"
                  onClick={() => onSelectMachine(idx)}
                  className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                    machine.isComplete 
                      ? 'border-success bg-success/10' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{machine.equipmentName || `Máquina ${idx + 1}`}</span>
                    {machine.isComplete && <CheckCircle className="w-4 h-4 text-success" />}
                  </div>
                  <p className="text-xs text-text-muted mt-1">
                    {machine.services.length} serviços • {getTypeLabel(machine.maintenanceType)}
                  </p>
                </button>
              )
            ))}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="space-y-3">
        <Button type="button" variant="outline" onClick={onAddAnotherMachine} className="w-full h-12">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Outra Máquina
        </Button>
      </div>
    </div>
  )
}

// ============================================
// STEP 6: SIGNATURE
// ============================================

function SignatureStep() {
  const { setSignaturePhoto, currentReport } = useReportStore()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setSignaturePhoto(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            Foto de Assinatura (Selfie)
          </CardTitle>
          <p className="text-xs text-text-muted">Tire uma foto sua para confirmar o relatório</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentReport?.signaturePhoto ? (
            <div className="relative">
              <img
                src={currentReport.signaturePhoto}
                alt="Assinatura"
                className="w-full max-h-64 object-contain rounded-lg border border-border bg-surface"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSignaturePhoto('')}
                className="absolute top-2 right-2"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Remover
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <label className="h-24 flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-border hover:border-primary cursor-pointer transition-all">
                <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                <Camera className="w-8 h-8 text-primary" />
                <span className="text-sm">Tirar Selfie</span>
              </label>
              <label className="h-24 flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-border hover:border-primary cursor-pointer transition-all">
                <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                <ImageIcon className="w-8 h-8 text-primary" />
                <span className="text-sm">Galeria</span>
              </label>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================
// STEP 7: FINAL SUMMARY
// ============================================

function SummaryStep({ onSave, isSubmitting }: { onSave: () => void; isSubmitting: boolean }) {
  const { currentReport } = useReportStore()

  const getShiftLabel = (shift: string) => {
    if (shift === 'day') return 'Diurno (07:00 - 19:00)'
    if (shift === 'night') return 'Noturno (19:00 - 07:00)'
    return '-'
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

  const handleShareWhatsApp = () => {
    const machinesText = currentReport?.machines?.map((machine, idx) => {
      const services = machine.services.map((s, i) => `  ${i + 1}. ${s.description}`).join('\n')
      
      let maintenanceDetails = ''
      switch (machine.maintenanceType) {
        case 'corrective':
          const categories = machine.correctiveCategories || []
          const cats = categories.filter(c => c !== 'Outros')
          maintenanceDetails = `📋 Categorias: ${cats.join(', ')}${machine.correctiveOther ? `, Outros: ${machine.correctiveOther}` : ''}`
          break
        case 'preventive':
          maintenanceDetails = `⏰ Intervalo: ${machine.preventiveInterval || '-'}`
          break
        case 'programada':
          maintenanceDetails = `📅 Evento: ${machine.programadaEvent || '-'}`
          break
      }

      const desviosText = machine.desvios?.length 
        ? `\n⚠️ *Desvios:*\n${machine.desvios.map(i => `  • ${i.description} (${i.time}${i.endTime ? ` - ${i.endTime}` : ''})`).join('\n')}` 
        : ''
      
      const deslocamentosText = machine.deslocamentos?.length 
        ? `\n🚚 *Deslocamentos:*\n${machine.deslocamentos.map(d => `  • ${d.from} → ${d.to} (${d.startTime}-${d.endTime})${d.observacao ? ` [${d.observacao}]` : ''}`).join('\n')}` 
        : ''

      return `
🚜 *MÁQUINA ${idx + 1}: ${machine.equipmentName}*
📍 Local: ${machine.location || '-'}
⏱️ Horímetro: ${machine.hourMeter || '-'}h
🔧 Tipo: ${getTypeLabel(machine.maintenanceType)}
${maintenanceDetails}
⚡ Prioridade: ${machine.priority}${machine.downtimeTime ? `\n⏳ Parada: ${machine.downtimeTime}` : ''}

📝 Serviços:
${services || '  Nenhum serviço registrado'}
${machine.download ? '\n✅ Download realizado' : ''}
${machine.conclusao ? `\n✅ Conclusão: ${machine.conclusao}` : ''}
${machine.pendingItems ? `\n⚠️ Pendências:\n  ${machine.pendingItems}` : ''}
${desviosText}
${deslocamentosText}`
    }).join('\n━━━━━━━━━━━━━━━━━━━━━')

    const weatherEmoji = currentReport?.weather === 'Ensolarado' ? '☀️' : 
                         currentReport?.weather === 'Nublado' ? '☁️' : 
                         currentReport?.weather === 'Chuva' ? '🌧️' : ''

    const text = `📋 *RELATÓRIO*

📅 Data: ${currentReport?.date}
🔄 Turno: ${getShiftLabel(currentReport?.shift || '')}
${weatherEmoji} Clima: ${currentReport?.weather || '-'}
👤 Técnico: ${currentReport?.technicianName || '-'}

━━━━━━━━━━━━━━━━━━━━━
${machinesText}

━━━━━━━━━━━━━━━━━━━━━
✅ *TOTAL: ${currentReport?.machines?.length || 0} MÁQUINA(S)*

---
Enviado via MaxReport Pro`
    
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  return (
    <div className="space-y-4 pb-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Resumo do Relatório</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <h4 className="font-medium text-primary text-sm">Dados Gerais</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-text-muted">Data:</span>
                <span className="ml-2">{currentReport?.date}</span>
              </div>
              <div>
                <span className="text-text-muted">Turno:</span>
                <span className="ml-2">{getShiftLabel(currentReport?.shift || '')}</span>
              </div>
              <div>
                <span className="text-text-muted">Clima:</span>
                <span className="ml-2">{currentReport?.weather || '-'}</span>
              </div>
              <div>
                <span className="text-text-muted">Técnico:</span>
                <span className="ml-2">{currentReport?.technicianName || '-'}</span>
              </div>
            </div>
          </div>

          {currentReport?.machines?.map((machine, machineIdx) => (
            <div key={machine.id} className="border-t border-border pt-3 space-y-2">
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
                  <span className="text-text-muted">Tipo:</span>
                  <span className="ml-2">{getTypeLabel(machine.maintenanceType || '')}</span>
                </div>
              </div>
              
              <div className="ml-2 text-xs text-text-muted">
                {machine.services.length} serviços
                {machine.intervencoes?.length ? ` • ${machine.intervencoes.length} intervenções` : ''}
                {machine.deslocamentos?.length ? ` • ${machine.deslocamentos.length} deslocamentos` : ''}
                {machine.pendingItems && ' • Com pendências'}
              </div>
            </div>
          ))}

          <div className="border-t border-border pt-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Total de Máquinas:</span>
              <span className="text-primary font-bold">{currentReport?.machines?.length || 0}</span>
            </div>
          </div>

          {currentReport?.signaturePhoto && (
            <div className="border-t border-border pt-3">
              <h4 className="font-medium text-primary text-sm mb-2">Assinatura</h4>
              <img src={currentReport.signaturePhoto} alt="Assinatura" className="w-24 h-24 object-cover rounded-lg" />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-3">
        <Button
          type="button"
          onClick={onSave}
          disabled={isSubmitting}
          className="w-full h-12 bg-primary hover:bg-primary/90"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Salvando...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Finalizar Relatório
            </>
          )}
        </Button>
        
        <Button type="button" variant="outline" onClick={handleShareWhatsApp} className="w-full h-12">
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Compartilhar no WhatsApp
        </Button>
      </div>
    </div>
  )
}
