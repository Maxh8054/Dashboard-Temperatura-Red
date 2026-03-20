/**
 * MaxReport Pro - Draft Recovery Dialog
 * Shows when there's a saved draft to recover
 */

'use client'

import { useReportStore } from '@/lib/store'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FileText, Trash2, RotateCcw, Calendar, Clock, Truck } from 'lucide-react'

export function DraftRecovery() {
  const { currentReport, clearDraft, isWizardOpen } = useReportStore()

  // Show dialog if there's a saved draft without reportNumber (not completed) and wizard is not open
  const showDialog = Boolean(currentReport && !currentReport.reportNumber && !isWizardOpen)

  const handleDiscard = () => {
    clearDraft()
  }

  const handleContinue = () => {
    // Open the wizard with the existing draft
    useReportStore.setState({ isWizardOpen: true })
  }

  // Fechar o diálogo NÃO descarta o rascunho - apenas fecha
  // O rascunho continua salvo e pode ser recuperado pelo Dashboard

  if (!showDialog) return null

  // Count machines and services
  const machineCount = currentReport?.machines?.length || 0
  const serviceCount = currentReport?.machines?.reduce(
    (acc, m) => acc + (m.services?.length || 0), 0
  ) || 0
  const hasPhotos = currentReport?.machines?.some(
    m => m.services?.some(s => s.photos?.length > 0) || m.machinePhoto
  )

  return (
    <Dialog open={showDialog}>
      <DialogContent className="max-w-md w-[95vw]" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-orange-500">
            <FileText className="w-5 h-5" />
            Rascunho Encontrado
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-text-muted">
            Você tem um relatório não finalizado. Deseja continuar de onde parou?
          </p>
          
          {/* Draft Info */}
          <div className="bg-surface-hover rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-primary" />
              <span>Data: {currentReport?.date || 'Não definida'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-primary" />
              <span>Turno: {currentReport?.shift === 'day' ? 'Diurno' : currentReport?.shift === 'night' ? 'Noturno' : 'Não definido'}</span>
            </div>
            {currentReport?.technicianName && (
              <div className="flex items-center gap-2 text-sm">
                <FileText className="w-4 h-4 text-primary" />
                <span>Técnico: {currentReport.technicianName}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <Truck className="w-4 h-4 text-primary" />
              <span>Equipamentos: {machineCount}</span>
            </div>
            {serviceCount > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <FileText className="w-4 h-4 text-success" />
                <span>Serviços: {serviceCount}</span>
              </div>
            )}
            {hasPhotos && (
              <div className="flex items-center gap-2 text-sm text-success">
                <FileText className="w-4 h-4" />
                <span>Contém fotos anexadas</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleDiscard}
              className="flex-1 text-danger border-danger hover:bg-danger/10"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Descartar
            </Button>
            <Button
              onClick={handleContinue}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Continuar
            </Button>
          </div>
          
          <p className="text-xs text-center text-text-muted">
            O rascunho ficará salvo até você continuar ou descartar
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
