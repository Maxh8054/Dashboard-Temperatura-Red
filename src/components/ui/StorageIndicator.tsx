/**
 * Storage Indicator Component
 * Shows localStorage usage and warns when approaching limit
 */

'use client'

import { useState, useEffect } from 'react'
import { HardDrive, AlertTriangle, Trash2, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'

// LocalStorage limit is typically 5-10MB
const STORAGE_LIMIT = 5 * 1024 * 1024 // 5MB

export function getStorageUsage() {
  let totalSize = 0
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key) {
      const value = localStorage.getItem(key)
      if (value) {
        // Calculate size in bytes (2 bytes per char for UTF-16)
        totalSize += (key.length + value.length) * 2
      }
    }
  }
  
  return {
    used: totalSize,
    limit: STORAGE_LIMIT,
    percentage: Math.round((totalSize / STORAGE_LIMIT) * 100),
    usedMB: (totalSize / (1024 * 1024)).toFixed(2),
    limitMB: (STORAGE_LIMIT / (1024 * 1024)).toFixed(0)
  }
}

export function StorageIndicator() {
  const [usage, setUsage] = useState({ used: 0, limit: STORAGE_LIMIT, percentage: 0, usedMB: '0', limitMB: '5' })
  const [showDialog, setShowDialog] = useState(false)

  useEffect(() => {
    const updateUsage = () => {
      setUsage(getStorageUsage())
    }
    
    updateUsage()
    
    // Update on storage changes
    window.addEventListener('storage', updateUsage)
    
    // Check every 30 seconds
    const interval = setInterval(updateUsage, 30000)
    
    return () => {
      window.removeEventListener('storage', updateUsage)
      clearInterval(interval)
    }
  }, [])

  const getStatusColor = () => {
    if (usage.percentage >= 90) return 'text-danger'
    if (usage.percentage >= 70) return 'text-warning'
    return 'text-success'
  }

  const getProgressColor = () => {
    if (usage.percentage >= 90) return 'bg-danger'
    if (usage.percentage >= 70) return 'bg-warning'
    return 'bg-success'
  }

  const handleClearOldReports = () => {
    // Keep only last 3 reports
    const reportsKey = 'maxreport-reports'
    const existing = localStorage.getItem(reportsKey)
    if (existing) {
      try {
        const data = JSON.parse(existing)
        if (data?.state?.reportHistory && Array.isArray(data.state.reportHistory)) {
          data.state.reportHistory = data.state.reportHistory.slice(-3)
          localStorage.setItem(reportsKey, JSON.stringify(data))
          setUsage(getStorageUsage())
          alert('Relatórios antigos removidos com sucesso!')
        }
      } catch (e) {
        console.error('Error clearing old reports:', e)
      }
    }
  }

  return (
    <>
      <button
        onClick={() => setShowDialog(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface hover:bg-surface-hover transition-colors"
      >
        <HardDrive className={`w-4 h-4 ${getStatusColor()}`} />
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted">Armazenamento:</span>
          <span className={`text-xs font-medium ${getStatusColor()}`}>
            {usage.usedMB}MB / {usage.limitMB}MB
          </span>
        </div>
        {usage.percentage >= 80 && (
          <AlertTriangle className="w-4 h-4 text-warning animate-pulse" />
        )}
      </button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-primary" />
              Armazenamento Local
            </DialogTitle>
            <DialogDescription>
              Gerencie o espaço de armazenamento do navegador
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Usage Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Espaço utilizado</span>
                <span className={getStatusColor()}>{usage.percentage}%</span>
              </div>
              <Progress 
                value={usage.percentage} 
                className="h-3"
              />
              <p className="text-xs text-text-muted text-center">
                {usage.usedMB}MB de {usage.limitMB}MB utilizados
              </p>
            </div>

            {/* Warning */}
            {usage.percentage >= 70 && (
              <div className={`p-3 rounded-lg ${usage.percentage >= 90 ? 'bg-danger/10' : 'bg-warning/10'}`}>
                <div className="flex items-start gap-2">
                  <AlertTriangle className={`w-5 h-5 ${usage.percentage >= 90 ? 'text-danger' : 'text-warning'}`} />
                  <div>
                    <p className={`font-medium ${usage.percentage >= 90 ? 'text-danger' : 'text-warning'}`}>
                      {usage.percentage >= 90 ? 'Armazenamento quase cheio!' : 'Armazenamento elevado'}
                    </p>
                    <p className="text-xs text-text-muted mt-1">
                      {usage.percentage >= 90 
                        ? 'Exporte seus relatórios e limpe o histórico para evitar perda de dados.'
                        : 'Considere exportar relatórios antigos e limpar o histórico.'
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  // Trigger export
                  const event = new CustomEvent('export-all-json')
                  window.dispatchEvent(event)
                  setShowDialog(false)
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar todos os relatórios (JSON)
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start text-danger hover:text-danger"
                onClick={handleClearOldReports}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Limpar relatórios antigos (manter 3 últimos)
              </Button>
            </div>

            {/* Info */}
            <div className="text-xs text-text-muted p-3 bg-surface rounded-lg">
              <p className="font-medium mb-1">💡 Dicas:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Os relatórios são salvos localmente no navegador</li>
                <li>Fotos em alta qualidade ocupam mais espaço</li>
                <li>Exporte regularmente para backup</li>
                <li>Limpe o histórico após exportar</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
