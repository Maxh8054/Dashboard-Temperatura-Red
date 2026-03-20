/**
 * MaxReport Pro - PDF Export API
 * Export reports to PDF format
 */

import { NextRequest, NextResponse } from 'next/server'

// POST /api/reports/export/pdf
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { reportData } = body

    if (!reportData) {
      return NextResponse.json(
        { error: 'No report data provided' },
        { status: 400 }
      )
    }

    // Generate PDF content (HTML for client-side rendering)
    const pdfContent = generatePDFHTML(reportData)

    return NextResponse.json({
      success: true,
      filename: `relatorio-${reportData.reportNumber || Date.now()}.pdf`,
      content: pdfContent,
      report: reportData
    })
  } catch (error) {
    console.error('PDF export error:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}

function generatePDFHTML(report: any): string {
  const formatDate = (date: Date | string) => {
    const d = new Date(date)
    return d.toLocaleDateString('pt-BR')
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      operational: 'Operacional',
      stopped: 'Parado',
      limited: 'Limitado'
    }
    return labels[status] || status
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      preventive: 'Preventiva',
      corrective: 'Corretiva',
      emergency: 'Emergencial',
      inspection: 'Inspeção'
    }
    return labels[type] || type
  }

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>Relatório ${report.reportNumber || ''}</title>
      <style>
        @page {
          size: A4;
          margin: 2cm;
        }
        body {
          font-family: Arial, sans-serif;
          font-size: 12px;
          line-height: 1.5;
          color: #333;
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #FF6600;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #FF6600;
        }
        .report-number {
          font-size: 18px;
          margin-top: 10px;
        }
        .section {
          margin-bottom: 25px;
        }
        .section-title {
          background: #FF6600;
          color: white;
          padding: 8px 15px;
          font-weight: bold;
          margin-bottom: 15px;
        }
        .field {
          margin-bottom: 10px;
          display: flex;
        }
        .field-label {
          font-weight: bold;
          width: 180px;
          flex-shrink: 0;
        }
        .field-value {
          flex: 1;
        }
        .status-badge {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 3px;
          font-size: 11px;
          font-weight: bold;
        }
        .status-operational { background: #22c55e; color: white; }
        .status-stopped { background: #ef4444; color: white; }
        .status-limited { background: #f59e0b; color: white; }
        .photos-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
        }
        .photo-item {
          border: 1px solid #ddd;
          padding: 10px;
        }
        .photo-item img {
          max-width: 100%;
          height: auto;
        }
        .checklist-table {
          width: 100%;
          border-collapse: collapse;
        }
        .checklist-table th,
        .checklist-table td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        .checklist-table th {
          background: #f5f5f5;
        }
        .signature-area {
          margin-top: 50px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
        }
        .signature-box {
          width: 300px;
          height: 100px;
          border: 1px solid #ddd;
          margin-top: 10px;
        }
        .footer {
          margin-top: 50px;
          text-align: center;
          font-size: 10px;
          color: #999;
          border-top: 1px solid #ddd;
          padding-top: 15px;
        }
        @media print {
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">MaxReport Pro</div>
        <div class="report-number">Relatório ${report.reportNumber || 'N/A'}</div>
        <div> ${formatDate(report.date || new Date())}</div>
      </div>

      <div class="section">
        <div class="section-title">1. INFORMAÇÕES GERAIS</div>
        <div class="field">
          <span class="field-label">Data:</span>
          <span class="field-value">${formatDate(report.date || new Date())}</span>
        </div>
        <div class="field">
          <span class="field-label">Horário:</span>
          <span class="field-value">${report.startTime || '-'} - ${report.endTime || '-'}</span>
        </div>
        <div class="field">
          <span class="field-label">Turno:</span>
          <span class="field-value">${report.shift || '-'}</span>
        </div>
        <div class="field">
          <span class="field-label">Local:</span>
          <span class="field-value">${report.location || '-'}</span>
        </div>
      </div>

      <div class="section">
        <div class="section-title">2. EQUIPAMENTO</div>
        <div class="field">
          <span class="field-label">Equipamento:</span>
          <span class="field-value">${report.equipmentName || '-'}</span>
        </div>
        <div class="field">
          <span class="field-label">Horímetro:</span>
          <span class="field-value">${report.hourMeter ? report.hourMeter + 'h' : '-'}</span>
        </div>
      </div>

      <div class="section">
        <div class="section-title">3. MANUTENÇÃO</div>
        <div class="field">
          <span class="field-label">Tipo:</span>
          <span class="field-value">${getTypeLabel(report.maintenanceType || '')}</span>
        </div>
        <div class="field">
          <span class="field-label">Status Operacional:</span>
          <span class="field-value">
            <span class="status-badge status-${report.operationalStatus}">
              ${getStatusLabel(report.operationalStatus || '')}
            </span>
          </span>
        </div>
        <div class="field">
          <span class="field-label">Prioridade:</span>
          <span class="field-value">${report.priority || '-'}</span>
        </div>
        <div class="field">
          <span class="field-label">Tempo de Parada:</span>
          <span class="field-value">${report.downtimeHours ? report.downtimeHours + 'h' : '-'}</span>
        </div>
      </div>

      <div class="section">
        <div class="section-title">4. DESCRIÇÃO TÉCNICA</div>
        <div class="field">
          <span class="field-label">Atividade:</span>
          <span class="field-value">${report.activityDescription || '-'}</span>
        </div>
        <div class="field">
          <span class="field-label">Causa Raiz:</span>
          <span class="field-value">${report.rootCause || '-'}</span>
        </div>
        <div class="field">
          <span class="field-label">Ação Corretiva:</span>
          <span class="field-value">${report.correctiveAction || '-'}</span>
        </div>
        <div class="field">
          <span class="field-label">Peças Substituídas:</span>
          <span class="field-value">${report.partsReplaced || '-'}</span>
        </div>
        <div class="field">
          <span class="field-label">Observações:</span>
          <span class="field-value">${report.observations || '-'}</span>
        </div>
      </div>

      ${report.photos && report.photos.length > 0 ? `
      <div class="section">
        <div class="section-title">5. FOTOS (${report.photos.length})</div>
        <div class="photos-grid">
          ${report.photos.map((photo: any, index: number) => `
            <div class="photo-item">
              <img src="${photo.originalPath}" alt="Foto ${index + 1}" />
              <p>${photo.caption || `Foto ${index + 1}`}</p>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}

      ${report.checklists && report.checklists.length > 0 ? `
      <div class="section">
        <div class="section-title">6. CHECKLIST</div>
        ${report.checklists.map((checklist: any) => `
          <h4>${checklist.name}</h4>
          <table class="checklist-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Status</th>
                <th>Comentário</th>
              </tr>
            </thead>
            <tbody>
              ${checklist.items.map((item: any) => `
                <tr>
                  <td>${item.description}</td>
                  <td>${item.status}</td>
                  <td>${item.comment || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `).join('')}
      </div>
      ` : ''}

      <div class="signature-area">
        <div class="section-title">7. ASSINATURA</div>
        ${report.signature ? `
          <img src="${report.signature}" alt="Assinatura" style="max-width: 300px; max-height: 100px;" />
        ` : `
          <div class="signature-box"></div>
        `}
        <p>Técnico Responsável</p>
      </div>

      <div class="footer">
        <p>MaxReport Pro - Sistema de Relatórios Técnicos</p>
        <p>Documento gerado em ${new Date().toLocaleString('pt-BR')}</p>
        <p>© 2026 Zamine - Todos os direitos reservados</p>
      </div>
    </body>
    </html>
  `
}
