/**
 * MaxReport Pro - Dashboard
 * Main dashboard with real data only
 * Light Theme - White Background + Orange Accent
 */

'use client'

import { useReportStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  FileText,
  Clock,
  Wrench,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  HardHat,
  Plus,
  RotateCcw,
  Trash2,
  Truck,
} from 'lucide-react'

export function Dashboard() {
  const { reportHistory, openWizard, startNewReport, currentReport, clearDraft, isWizardOpen } = useReportStore()

  // Check if there's a pending draft
  const hasDraft = currentReport && !currentReport.reportNumber && !isWizardOpen

  // Calculate real stats from history
  const thisMonthReports = reportHistory.filter(r => {
    const reportDate = new Date(r.date)
    const now = new Date()
    return reportDate.getMonth() === now.getMonth() && 
           reportDate.getFullYear() === now.getFullYear()
  }).length

  const totalReports = reportHistory.length

  // Calculate operational stats from reports
  const operationalReports = reportHistory.filter(r => r.operationalStatus === 'operational').length
  const stoppedReports = reportHistory.filter(r => r.operationalStatus === 'stopped').length

  // Draft stats
  const draftMachineCount = currentReport?.machines?.length || 0
  const draftServiceCount = currentReport?.machines?.reduce(
    (acc, m) => acc + (m.services?.length || 0), 0
  ) || 0
  const draftHasPhotos = currentReport?.machines?.some(
    m => m.services?.some(s => s.photos?.length > 0) || m.machinePhoto
  )

  return (
    <div style={{ padding: '16px', paddingBottom: '100px' }}>
      {/* Welcome Section */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#333333' }}>Dashboard</h2>
        <p style={{ color: '#787878' }}>Bem-vindo ao MaxReport Pro</p>
      </div>

      {/* Quick Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '16px' }}>
        {/* Total Reports */}
        <div style={{ 
          backgroundColor: '#ffffff', 
          borderRadius: '8px', 
          padding: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e5e5'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              width: '40px', 
              height: '40px', 
              borderRadius: '8px', 
              backgroundColor: 'rgba(255, 102, 0, 0.1)' 
            }}>
              <FileText style={{ width: '20px', height: '20px', color: '#ff6600' }} />
            </div>
            <div>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#333333' }}>{totalReports}</p>
              <p style={{ fontSize: '12px', color: '#787878' }}>Total de Relatórios</p>
            </div>
          </div>
        </div>

        {/* This Month */}
        <div style={{ 
          backgroundColor: '#ffffff', 
          borderRadius: '8px', 
          padding: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e5e5'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              width: '40px', 
              height: '40px', 
              borderRadius: '8px', 
              backgroundColor: 'rgba(255, 102, 0, 0.1)' 
            }}>
              <Calendar style={{ width: '20px', height: '20px', color: '#ff6600' }} />
            </div>
            <div>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#333333' }}>{thisMonthReports}</p>
              <p style={{ fontSize: '12px', color: '#787878' }}>Este Mês</p>
            </div>
          </div>
        </div>

        {/* Operational */}
        <div style={{ 
          backgroundColor: '#ffffff', 
          borderRadius: '8px', 
          padding: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e5e5'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              width: '40px', 
              height: '40px', 
              borderRadius: '8px', 
              backgroundColor: 'rgba(34, 197, 94, 0.1)' 
            }}>
              <CheckCircle style={{ width: '20px', height: '20px', color: '#22c55e' }} />
            </div>
            <div>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#22c55e' }}>{operationalReports}</p>
              <p style={{ fontSize: '12px', color: '#787878' }}>Operacionais</p>
            </div>
          </div>
        </div>

        {/* Stopped */}
        <div style={{ 
          backgroundColor: '#ffffff', 
          borderRadius: '8px', 
          padding: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e5e5'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              width: '40px', 
              height: '40px', 
              borderRadius: '8px', 
              backgroundColor: 'rgba(239, 68, 68, 0.1)' 
            }}>
              <XCircle style={{ width: '20px', height: '20px', color: '#ef4444' }} />
            </div>
            <div>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>{stoppedReports}</p>
              <p style={{ fontSize: '12px', color: '#787878' }}>Parados</p>
            </div>
          </div>
        </div>
      </div>

      {/* Create Report Button */}
      <div style={{ 
        backgroundColor: '#ffffff', 
        borderRadius: '8px', 
        padding: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid rgba(255, 102, 0, 0.3)',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {hasDraft && (
            <Button
              onClick={openWizard}
              style={{ 
                height: '56px', 
                padding: '0 16px', 
                backgroundColor: '#ff6600', 
                color: '#ffffff',
                flexShrink: 0
              }}
            >
              <RotateCcw style={{ width: '20px', height: '20px', marginRight: '8px' }} />
              Rascunho
            </Button>
          )}
          <Button
            onClick={startNewReport}
            style={{ 
              width: '100%', 
              height: '56px', 
              fontSize: '18px', 
              fontWeight: 'bold', 
              backgroundColor: '#ff6600', 
              color: '#ffffff',
              border: 'none'
            }}
          >
            <Plus style={{ width: '24px', height: '24px', marginRight: '8px' }} />
            NOVO RELATÓRIO
          </Button>
        </div>
        {hasDraft && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e5e5e5' }}>
            <span style={{ fontSize: '12px', color: '#787878' }}>
              Rascunho: {currentReport?.date || 'Sem data'} • {draftMachineCount} equip. • {draftServiceCount} serviços
              {draftHasPhotos && ' • Com fotos'}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearDraft}
              style={{ height: '28px', padding: '0 8px', fontSize: '12px', color: '#ef4444' }}
            >
              <Trash2 style={{ width: '12px', height: '12px', marginRight: '4px' }} />
              Limpar
            </Button>
          </div>
        )}
      </div>

      {/* Recent Reports */}
      {reportHistory.length > 0 && (
        <div style={{ 
          backgroundColor: '#ffffff', 
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e5e5'
        }}>
          <div style={{ padding: '16px', paddingBottom: '8px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', color: '#333333' }}>
              <FileText style={{ width: '16px', height: '16px', color: '#ff6600' }} />
              Relatórios Recentes
            </h3>
          </div>
          <div style={{ padding: '0 16px 16px' }}>
            {reportHistory.slice(0, 5).map((report) => (
              <div 
                key={report.id || report.reportNumber} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  padding: '12px', 
                  borderRadius: '8px', 
                  backgroundColor: '#fafafa',
                  marginBottom: '8px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '8px', 
                    backgroundColor: 'rgba(255, 102, 0, 0.1)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    <Wrench style={{ width: '16px', height: '16px', color: '#ff6600' }} />
                  </div>
                  <div>
                    <p style={{ fontWeight: 500, fontSize: '14px', color: '#333333' }}>{report.reportNumber}</p>
                    <p style={{ fontSize: '12px', color: '#787878' }}>{report.equipmentName || 'Sem equipamento'}</p>
                  </div>
                </div>
                <Badge 
                  style={{ 
                    fontSize: '12px',
                    backgroundColor: report.status === 'completed' ? '#ff6600' : '#e5e5e5',
                    color: report.status === 'completed' ? '#ffffff' : '#333333'
                  }}
                >
                  {report.status === 'completed' ? 'Concluído' : report.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {reportHistory.length === 0 && !hasDraft && (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <HardHat style={{ width: '64px', height: '64px', margin: '0 auto 16px', color: 'rgba(255, 102, 0, 0.3)' }} />
          <p style={{ fontSize: '18px', fontWeight: 500, marginBottom: '4px', color: '#333333' }}>Nenhum relatório ainda</p>
          <p style={{ fontSize: '14px', color: '#787878' }}>Crie seu primeiro relatório para começar</p>
        </div>
      )}
    </div>
  )
}
