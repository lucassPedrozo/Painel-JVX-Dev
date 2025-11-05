import { formatCurrency, formatDate } from './utils'

interface PDFWork {
  id?: number
  site_type: string
  payment_status: string
  value: number | string
  domain: string
  delivery_date: string | number
  developer?: string
  deadline_type?: string
  observations?: string
}

export function generatePDF(works: PDFWork[], title: string = 'Relatório de Trabalhos', autoPrint: boolean = true) {
  // Criar uma nova janela para o PDF
  const printWindow = window.open('', '_blank')
  
  if (!printWindow) {
    alert('Por favor, permita pop-ups para exportar o PDF')
    return
  }

  // Calcular estatísticas
  const totalWorks = works.length
  const paidWorks = works.filter(w => w.payment_status?.toLowerCase() === 'pago').length
  const pendingWorks = totalWorks - paidWorks
  const totalValue = works.reduce((sum, w) => {
    const value = typeof w.value === 'string' ? parseFloat(w.value.replace(/[^\d,.-]/g, '').replace(',', '.')) : w.value
    return sum + (isNaN(value) ? 0 : value)
  }, 0)
  const paidValue = works
    .filter(w => w.payment_status?.toLowerCase() === 'pago')
    .reduce((sum, w) => {
      const value = typeof w.value === 'string' ? parseFloat(w.value.replace(/[^\d,.-]/g, '').replace(',', '.')) : w.value
      return sum + (isNaN(value) ? 0 : value)
    }, 0)
  const pendingValue = totalValue - paidValue

  // HTML do PDF
  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          padding: 40px;
          color: #1a1a1a;
          background: #ffffff;
        }
        
        .header {
          text-align: center;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 3px solid #5A7AB7;
        }
        
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #5A7AB7;
          margin-bottom: 8px;
        }
        
        .title {
          font-size: 24px;
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 8px;
        }
        
        .subtitle {
          font-size: 14px;
          color: #7f8c8d;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 40px;
        }
        
        @media screen and (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        .stat-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
          border-radius: 12px;
          color: white;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .stat-card:nth-child(2) {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }
        
        .stat-card:nth-child(3) {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        }
        
        .stat-card:nth-child(4) {
          background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
        }
        
        .stat-label {
          font-size: 12px;
          opacity: 0.9;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .stat-value {
          font-size: 24px;
          font-weight: bold;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 40px;
          background: white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          overflow: hidden;
        }
        
        thead {
          background: linear-gradient(135deg, #5A7AB7 0%, #4a6ba0 100%);
          color: white;
        }
        
        th {
          padding: 16px 12px;
          text-align: left;
          font-weight: 600;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        td {
          padding: 14px 12px;
          border-bottom: 1px solid #ecf0f1;
          font-size: 13px;
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        td.url-cell {
          max-width: 150px;
          white-space: nowrap;
        }
        
        tbody tr:hover {
          background-color: #f8f9fa;
        }
        
        tbody tr:last-child td {
          border-bottom: none;
        }
        
        .badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .badge-pago {
          background-color: #d4edda;
          color: #155724;
        }
        
        .badge-pendente {
          background-color: #fff3cd;
          color: #856404;
        }
        
        .value-positive {
          color: #27ae60;
          font-weight: 600;
        }
        
        .value-negative {
          color: #e74c3c;
          font-weight: 600;
        }
        
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #ecf0f1;
          text-align: center;
          color: #7f8c8d;
          font-size: 12px;
        }
        
        .url-link {
          color: #3498db;
          text-decoration: none;
          word-break: break-all;
        }
        
        @media print {
          body {
            padding: 20px;
          }
          
          .stats-grid {
            page-break-inside: avoid;
          }
          
          table {
            page-break-inside: auto;
          }
          
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          
          thead {
            display: table-header-group;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">JVX Desenvolvimento</div>
        <div class="title">${title}</div>
        <div class="subtitle">Gerado em ${new Date().toLocaleDateString('pt-BR', { 
          day: '2-digit', 
          month: 'long', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}</div>
      </div>
      
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">Total de Trabalhos</div>
          <div class="stat-value">${totalWorks}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Trabalhos Pagos</div>
          <div class="stat-value">${paidWorks}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Trabalhos Pendentes</div>
          <div class="stat-value">${pendingWorks}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Valor Total</div>
          <div class="stat-value">${formatCurrency(totalValue)}</div>
        </div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Tipo</th>
            <th>URL</th>
            <th>Desenvolvedor</th>
            <th>Valor</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${works.map(work => {
            const value = typeof work.value === 'string' 
              ? parseFloat(work.value.replace(/[^\d,.-]/g, '').replace(',', '.'))
              : work.value
            const isPaid = work.paymentStatus?.toLowerCase() === 'pago'
            
            return `
              <tr>
                <td style="white-space: nowrap;">${formatDate(work.date)}</td>
                <td>${work.typeWork}</td>
                <td class="url-cell"><a href="${work.url}" class="url-link" target="_blank" title="${work.url}">${work.url}</a></td>
                <td>${work.developer || '-'}</td>
                <td class="${isPaid ? 'value-positive' : 'value-negative'}" style="white-space: nowrap;">${formatCurrency(value)}</td>
                <td>
                  <span class="badge ${isPaid ? 'badge-pago' : 'badge-pendente'}">
                    ${work.paymentStatus}
                  </span>
                </td>
              </tr>
            `
          }).join('')}
        </tbody>
      </table>
      
      <div class="footer">
        <p><strong>Resumo Financeiro:</strong></p>
        <p>Valor Recebido: <span class="value-positive">${formatCurrency(paidValue)}</span> | 
           Valor Pendente: <span class="value-negative">${formatCurrency(pendingValue)}</span></p>
        <p style="margin-top: 12px;">© ${new Date().getFullYear()} JVX Desenvolvimento - Todos os direitos reservados</p>
      </div>
      
      <script>
        window.onload = function() {
          ${autoPrint ? 'window.print();' : ''}
        }
      </script>
    </body>
    </html>
  `

  printWindow.document.write(html)
  printWindow.document.close()
}
