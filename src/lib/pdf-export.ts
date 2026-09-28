import { formatCurrency, formatDate, parseValue } from './utils'
import type { Work } from '@/types'

type PDFWork = Work

// ============================================
// ESTILOS OTIMIZADOS PARA IMPRESSÃO A4
// ============================================

const BASE_STYLES = `
  *, *::before, *::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    font-size: 13px;
    color: #1a1a2e;
    background: #fff;
    line-height: 1.55;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    color-adjust: exact !important;
  }

  .page {
    max-width: 960px;
    margin: 0 auto;
    padding: 32px 36px 24px;
  }

  /* ─── HEADER ─── */
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    padding-bottom: 16px;
    margin-bottom: 28px;
    border-bottom: 2.5px solid #2d3250;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .logo-box {
    width: 46px;
    height: 46px;
    background: #2d3250;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-weight: 800;
    font-size: 16px;
    letter-spacing: -0.5px;
  }

  .company-info .name {
    font-size: 17px;
    font-weight: 700;
    color: #2d3250;
    line-height: 1.2;
  }

  .company-info .tagline {
    font-size: 10px;
    color: #8e8ea0;
    text-transform: uppercase;
    letter-spacing: 2px;
    font-weight: 600;
  }

  .header-right {
    text-align: right;
  }

  .doc-title {
    font-size: 16px;
    font-weight: 700;
    color: #2d3250;
    margin-bottom: 2px;
  }

  .doc-date {
    font-size: 10.5px;
    color: #8e8ea0;
  }

  .doc-id {
    font-size: 9px;
    color: #b0b0c0;
    margin-top: 2px;
    font-family: 'Courier New', monospace;
  }

  /* ─── SECTION LABELS ─── */
  .section-label {
    font-size: 10px;
    font-weight: 700;
    color: #8e8ea0;
    text-transform: uppercase;
    letter-spacing: 2px;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .section-label::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #e8e8ef;
  }

  /* ─── METRIC CARDS ─── */
  .metrics {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-bottom: 28px;
  }

  .metrics.cols-3 { grid-template-columns: repeat(3, 1fr); }
  .metrics.cols-2 { grid-template-columns: repeat(2, 1fr); }

  .metric {
    border: 1px solid #e8e8ef;
    border-radius: 8px;
    padding: 14px 16px;
    position: relative;
    background: #fff;
  }

  .metric::before {
    content: '';
    position: absolute;
    left: 0;
    top: 8px;
    bottom: 8px;
    width: 3px;
    border-radius: 0 3px 3px 0;
  }

  .metric.c-blue::before    { background: #4361ee; }
  .metric.c-green::before   { background: #2ec4b6; }
  .metric.c-emerald::before { background: #059669; }
  .metric.c-amber::before   { background: #f59e0b; }
  .metric.c-red::before     { background: #ef4444; }
  .metric.c-violet::before  { background: #7c3aed; }
  .metric.c-cyan::before    { background: #06b6d4; }
  .metric.c-slate::before   { background: #64748b; }

  .metric-label {
    font-size: 9.5px;
    font-weight: 600;
    color: #8e8ea0;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    margin-bottom: 4px;
  }

  .metric-value {
    font-size: 20px;
    font-weight: 800;
    color: #1a1a2e;
    line-height: 1.15;
    letter-spacing: -0.3px;
  }

  .metric-value.small { font-size: 15px; }
  .metric-value.green   { color: #059669; }
  .metric-value.amber   { color: #d97706; }
  .metric-value.red     { color: #ef4444; }

  .metric-footer {
    font-size: 9.5px;
    color: #a0a0b0;
    margin-top: 3px;
    font-weight: 500;
  }

  /* ─── DUAL PANEL (side by side sections) ─── */
  .dual-panel {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 28px;
  }

  .panel {
    border: 1px solid #e8e8ef;
    border-radius: 8px;
    overflow: hidden;
  }

  .panel-header {
    background: #f7f7fa;
    padding: 10px 16px;
    font-size: 11px;
    font-weight: 700;
    color: #4a4a65;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    border-bottom: 1px solid #e8e8ef;
  }

  .panel-body {
    padding: 16px;
  }

  .kv-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 0;
  }

  .kv-row + .kv-row {
    border-top: 1px solid #f2f2f8;
  }

  .kv-label {
    font-size: 12px;
    color: #6b6b80;
    font-weight: 500;
  }

  .kv-value {
    font-size: 13px;
    font-weight: 700;
    color: #1a1a2e;
    font-family: 'Courier New', monospace;
  }

  .kv-value.green { color: #059669; }
  .kv-value.red   { color: #ef4444; }
  .kv-value.amber { color: #d97706; }

  /* ─── TABLES ─── */
  .table-wrap {
    margin-bottom: 24px;
    border: 1px solid #e0e0ec;
    border-radius: 8px;
    overflow: hidden;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 11.5px;
  }

  thead tr {
    background: #2d3250;
  }

  th {
    padding: 10px 12px;
    text-align: left;
    font-weight: 600;
    font-size: 9.5px;
    text-transform: uppercase;
    letter-spacing: 0.7px;
    color: #d0d0e0;
    white-space: nowrap;
  }

  th.r { text-align: right; }
  th.c { text-align: center; }

  td {
    padding: 9px 12px;
    border-bottom: 1px solid #f0f0f5;
    color: #333350;
    vertical-align: middle;
    line-height: 1.4;
  }

  td.r { text-align: right; }
  td.c { text-align: center; }
  td.mono { font-family: 'Courier New', monospace; font-size: 11px; letter-spacing: -0.3px; }
  td.bold { font-weight: 700; }
  td.nowrap { white-space: nowrap; }

  tbody tr:nth-child(even) {
    background: #fafafd;
  }

  tbody tr:last-child td {
    border-bottom: none;
  }

  /* Totals row */
  tfoot tr {
    background: #f0f0f8 !important;
    border-top: 2px solid #d0d0e0;
  }

  tfoot td {
    padding: 10px 12px;
    font-weight: 700;
    font-size: 12px;
    color: #1a1a2e;
    border-bottom: none;
  }

  /* Row number */
  .rn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 20px;
    background: #eeeef5;
    border-radius: 4px;
    font-size: 9px;
    font-weight: 700;
    color: #6b6b80;
  }

  /* ─── BADGES ─── */
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 2px 9px;
    border-radius: 4px;
    font-size: 9.5px;
    font-weight: 700;
    letter-spacing: 0.3px;
    text-transform: uppercase;
    white-space: nowrap;
  }

  .badge-paid {
    background: #ecfdf5;
    color: #065f46;
    border: 1px solid #a7f3d0;
  }

  .badge-pending {
    background: #fffbeb;
    color: #92400e;
    border: 1px solid #fde68a;
  }

  .badge-delivered {
    background: #eff6ff;
    color: #1e40af;
    border: 1px solid #bfdbfe;
  }

  .badge-wip {
    background: #faf5ff;
    color: #6b21a8;
    border: 1px solid #e9d5ff;
  }

  .dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .badge-paid .dot    { background: #059669; }
  .badge-pending .dot { background: #d97706; }
  .badge-delivered .dot { background: #2563eb; }
  .badge-wip .dot     { background: #7c3aed; }

  /* Value colors */
  .v-green  { color: #059669; font-weight: 700; }
  .v-red    { color: #ef4444; font-weight: 700; }
  .v-amber  { color: #d97706; font-weight: 700; }

  /* URL */
  .url {
    color: #4361ee;
    text-decoration: none;
    font-size: 10.5px;
    max-width: 180px;
    display: inline-block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    vertical-align: middle;
  }

  /* ─── PROGRESS BAR ─── */
  .bar-wrap {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .bar {
    flex: 1;
    height: 6px;
    background: #e8e8ef;
    border-radius: 3px;
    overflow: hidden;
    min-width: 50px;
  }

  .bar-fill {
    height: 100%;
    border-radius: 3px;
  }

  .bar-fill.blue   { background: #4361ee; }
  .bar-fill.green  { background: #059669; }
  .bar-fill.amber  { background: #f59e0b; }
  .bar-fill.violet { background: #7c3aed; }

  .bar-pct {
    font-size: 10px;
    font-weight: 700;
    color: #6b6b80;
    min-width: 36px;
    text-align: right;
  }

  /* ─── SUMMARY STRIP ─── */
  .summary-strip {
    display: flex;
    gap: 0;
    margin-bottom: 24px;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #e0e0ec;
  }

  .strip-item {
    flex: 1;
    padding: 14px 16px;
    text-align: center;
    background: #f7f7fa;
  }

  .strip-item + .strip-item {
    border-left: 1px solid #e0e0ec;
  }

  .strip-item .s-label {
    font-size: 9px;
    font-weight: 600;
    color: #8e8ea0;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    margin-bottom: 4px;
  }

  .strip-item .s-value {
    font-size: 16px;
    font-weight: 800;
    color: #1a1a2e;
    letter-spacing: -0.3px;
  }

  .strip-item .s-value.green { color: #059669; }
  .strip-item .s-value.red   { color: #ef4444; }
  .strip-item .s-value.amber { color: #d97706; }

  /* ─── HIGHLIGHT BOX ─── */
  .highlight-box {
    background: #f7f7fa;
    border: 1px solid #e0e0ec;
    border-radius: 8px;
    padding: 18px 20px;
    margin-bottom: 24px;
  }

  .highlight-box .hb-title {
    font-size: 10px;
    font-weight: 700;
    color: #8e8ea0;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    margin-bottom: 14px;
    padding-bottom: 8px;
    border-bottom: 1px solid #e0e0ec;
  }

  .highlight-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 14px;
  }

  .hg-item .hg-label {
    font-size: 10px;
    color: #8e8ea0;
    font-weight: 500;
    margin-bottom: 2px;
  }

  .hg-item .hg-value {
    font-size: 16px;
    font-weight: 800;
    color: #1a1a2e;
  }

  .hg-item .hg-value.green { color: #059669; }
  .hg-item .hg-value.red   { color: #ef4444; }
  .hg-item .hg-value.amber { color: #d97706; }

  /* ─── FOOTER ─── */
  .footer {
    margin-top: 32px;
    padding-top: 14px;
    border-top: 1.5px solid #e0e0ec;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 9.5px;
    color: #a0a0b0;
  }

  .footer-center {
    text-align: center;
    font-size: 8.5px;
    color: #c0c0cc;
    letter-spacing: 0.3px;
  }

  /* ─── PRINT ─── */
  @media print {
    body { padding: 0; background: #fff; }

    .page {
      padding: 16px 14px 12px;
      max-width: none;
    }

    .header, .metrics, .dual-panel, .summary-strip, .highlight-box {
      page-break-inside: avoid;
    }

    .table-wrap {
      page-break-inside: auto;
    }

    thead { display: table-header-group; }

    tfoot { display: table-footer-group; }

    tr {
      page-break-inside: avoid;
      page-break-after: auto;
    }

    .footer {
      page-break-inside: avoid;
    }

    .no-print { display: none !important; }
  }

  @page {
    margin: 10mm 8mm;
    size: A4;
  }
`

// ============================================
// HELPERS
// ============================================

function safeVal(v: number | string): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  return parseValue(v)
}

function pct(part: number, total: number): string {
  if (total <= 0) return '0,0'
  return ((part / total) * 100).toFixed(1).replace('.', ',')
}

function truncUrl(url: string, max = 30): string {
  if (!url) return '—'
  const clean = url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')
  return clean.length > max ? clean.substring(0, max) + '…' : clean
}

function docId(): string {
  const now = new Date()
  return `DOC-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`
}

function openWin(): Window | null {
  const w = window.open('', '_blank')
  if (!w) {
    alert('Por favor, permita pop-ups para exportar o PDF')
    return null
  }
  return w
}

function render(win: Window, title: string, content: string, autoPrint: boolean) {
  const date = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${title} — JVX Desenvolvimento</title>
  <style>${BASE_STYLES}</style>
</head>
<body>
<div class="page">

  <!-- HEADER -->
  <div class="header">
    <div class="header-left">
      <div class="logo-box">JVX</div>
      <div class="company-info">
        <div class="name">JVX Desenvolvimento</div>
        <div class="tagline">Gestão de Projetos</div>
      </div>
    </div>
    <div class="header-right">
      <div class="doc-title">${title}</div>
      <div class="doc-date">${date}</div>
      <div class="doc-id">${docId()}</div>
    </div>
  </div>

  ${content}

  <!-- FOOTER -->
  <div class="footer">
    <span>&copy; ${new Date().getFullYear()} JVX Desenvolvimento</span>
    <span class="footer-center">Documento gerado automaticamente — ${date}</span>
    <span>${docId()}</span>
  </div>

</div>
<script>
  window.onload = function() {
    ${autoPrint ? 'setTimeout(function(){ window.print(); }, 350);' : ''}
  }
</script>
</body>
</html>`

  win.document.write(html)
  win.document.close()
}

// ============================================
// 1. RELATÓRIO DE TRABALHOS (SITES)
// ============================================

export function generatePDF(works: PDFWork[], title: string = 'Relatório de Trabalhos', autoPrint: boolean = true) {
  const win = openWin()
  if (!win) return

  const total = works.length
  const paid = works.filter(w => w.payment_status?.toLowerCase() === 'pago')
  const paidCount = paid.length
  const pendCount = total - paidCount
  const totalVal = works.reduce((s, w) => s + safeVal(w.value), 0)
  const paidVal = paid.reduce((s, w) => s + safeVal(w.value), 0)
  const pendVal = totalVal - paidVal
  const avgVal = total > 0 ? totalVal / total : 0

  const body = `
    <div class="section-label">Visão Geral</div>
    <div class="metrics">
      <div class="metric c-blue">
        <div class="metric-label">Total de Projetos</div>
        <div class="metric-value">${total}</div>
        <div class="metric-footer">${pct(paidCount, total)}% pagos</div>
      </div>
      <div class="metric c-emerald">
        <div class="metric-label">Valor Total</div>
        <div class="metric-value small">${formatCurrency(totalVal)}</div>
        <div class="metric-footer">Média ${formatCurrency(avgVal)}/projeto</div>
      </div>
      <div class="metric c-green">
        <div class="metric-label">Recebido</div>
        <div class="metric-value small green">${formatCurrency(paidVal)}</div>
        <div class="metric-footer">${paidCount} projetos pagos</div>
      </div>
      <div class="metric c-amber">
        <div class="metric-label">Pendente</div>
        <div class="metric-value small amber">${formatCurrency(pendVal)}</div>
        <div class="metric-footer">${pendCount} projetos</div>
      </div>
    </div>

    <div class="section-label">Detalhamento</div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th style="width:28px">#</th>
            <th>Data</th>
            <th>Tipo</th>
            <th>Domínio</th>
            <th>Desenvolvedor</th>
            <th class="r">Valor</th>
            <th class="c">Status</th>
          </tr>
        </thead>
        <tbody>
          ${works.map((w, i) => {
            const v = safeVal(w.value)
            const ip = w.payment_status?.toLowerCase() === 'pago'
            return `<tr>
              <td><span class="rn">${i + 1}</span></td>
              <td class="nowrap">${formatDate(w.delivery_date)}</td>
              <td>${w.site_type}</td>
              <td><a href="${w.domain}" class="url" target="_blank" title="${w.domain}">${truncUrl(w.domain)}</a></td>
              <td>${w.developer || '—'}</td>
              <td class="r mono ${ip ? 'v-green' : 'v-red'}">${formatCurrency(v)}</td>
              <td class="c"><span class="badge ${ip ? 'badge-paid' : 'badge-pending'}"><span class="dot"></span>${w.payment_status}</span></td>
            </tr>`
          }).join('')}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="5" class="r" style="font-size:11px;">TOTAL</td>
            <td class="r mono">${formatCurrency(totalVal)}</td>
            <td class="c" style="font-size:10px;">${paidCount} pagos / ${pendCount} pend.</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <div class="summary-strip">
      <div class="strip-item">
        <div class="s-label">Receita Total</div>
        <div class="s-value">${formatCurrency(totalVal)}</div>
      </div>
      <div class="strip-item">
        <div class="s-label">Recebido</div>
        <div class="s-value green">${formatCurrency(paidVal)}</div>
      </div>
      <div class="strip-item">
        <div class="s-label">Pendente</div>
        <div class="s-value red">${formatCurrency(pendVal)}</div>
      </div>
      <div class="strip-item">
        <div class="s-label">Taxa de Pgto</div>
        <div class="s-value">${pct(paidCount, total)}%</div>
      </div>
    </div>
  `

  render(win, title, body, autoPrint)
}

// ============================================
// 2. RELATÓRIO FINANCEIRO
// ============================================

interface FinancialMetrics {
  totalProjects: number
  completedProjects: number
  pendingProjects: number
  paidProjects: number
  unpaidProjects: number
  totalRevenue: number
  paidRevenue: number
  pendingRevenue: number
  completionRate: number
  paymentRate: number
}

export function generateFinancialPDF(metrics: FinancialMetrics, autoPrint: boolean = true) {
  const win = openWin()
  if (!win) return

  const m = metrics

  const body = `
    <div class="section-label">Indicadores Principais</div>
    <div class="metrics">
      <div class="metric c-blue">
        <div class="metric-label">Projetos</div>
        <div class="metric-value">${m.totalProjects}</div>
        <div class="metric-footer">${m.completedProjects} concluídos · ${m.pendingProjects} pendentes</div>
      </div>
      <div class="metric c-emerald">
        <div class="metric-label">Receita Total</div>
        <div class="metric-value small">${formatCurrency(m.totalRevenue)}</div>
      </div>
      <div class="metric c-green">
        <div class="metric-label">Pagamentos Realizados</div>
        <div class="metric-value small green">${formatCurrency(m.paidRevenue)}</div>
        <div class="metric-footer">${m.paidProjects} projetos pagos</div>
      </div>
      <div class="metric c-amber">
        <div class="metric-label">Receita Pendente</div>
        <div class="metric-value small amber">${formatCurrency(m.pendingRevenue)}</div>
        <div class="metric-footer">${m.unpaidProjects} não pagos</div>
      </div>
    </div>

    <div class="section-label">Indicadores de Performance</div>
    <div class="dual-panel">
      <div class="panel">
        <div class="panel-header">Entrega</div>
        <div class="panel-body">
          <div class="kv-row">
            <span class="kv-label">Concluídos</span>
            <span class="kv-value green">${m.completedProjects}</span>
          </div>
          <div class="kv-row">
            <span class="kv-label">Pendentes</span>
            <span class="kv-value amber">${m.pendingProjects}</span>
          </div>
          <div class="kv-row">
            <span class="kv-label">Taxa de Conclusão</span>
            <span class="kv-value">${m.completionRate.toFixed(1)}%</span>
          </div>
          <div style="padding-top:8px;">
            <div class="bar-wrap">
              <div class="bar"><div class="bar-fill blue" style="width:${m.completionRate}%"></div></div>
              <span class="bar-pct">${m.completionRate.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>

      <div class="panel">
        <div class="panel-header">Pagamento</div>
        <div class="panel-body">
          <div class="kv-row">
            <span class="kv-label">Pagos</span>
            <span class="kv-value green">${m.paidProjects}</span>
          </div>
          <div class="kv-row">
            <span class="kv-label">Não Pagos</span>
            <span class="kv-value red">${m.unpaidProjects}</span>
          </div>
          <div class="kv-row">
            <span class="kv-label">Taxa de Pagamento</span>
            <span class="kv-value">${m.paymentRate.toFixed(1)}%</span>
          </div>
          <div style="padding-top:8px;">
            <div class="bar-wrap">
              <div class="bar"><div class="bar-fill green" style="width:${m.paymentRate}%"></div></div>
              <span class="bar-pct">${m.paymentRate.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="section-label">Resumo Financeiro</div>
    <div class="highlight-box">
      <div class="hb-title">Valores Consolidados</div>
      <div class="highlight-grid">
        <div class="hg-item">
          <div class="hg-label">Receita Total</div>
          <div class="hg-value">${formatCurrency(m.totalRevenue)}</div>
        </div>
        <div class="hg-item">
          <div class="hg-label">Pgto Realizado</div>
          <div class="hg-value green">${formatCurrency(m.paidRevenue)}</div>
        </div>
        <div class="hg-item">
          <div class="hg-label">Valor Pendente</div>
          <div class="hg-value red">${formatCurrency(m.pendingRevenue)}</div>
        </div>
        <div class="hg-item">
          <div class="hg-label">Ticket Médio</div>
          <div class="hg-value">${formatCurrency(m.totalProjects > 0 ? m.totalRevenue / m.totalProjects : 0)}</div>
        </div>
      </div>
    </div>
  `

  render(win, 'Relatório Financeiro', body, autoPrint)
}

// ============================================
// 3. RELATÓRIO POR DESENVOLVEDOR
// ============================================

interface DeveloperStat {
  developer: string
  total: number
  completed: number
  paid: number
  totalRevenue: number
  paidRevenue: number
  pendingRevenue: number
  completionRate: number
  paymentRate: number
}

export function generateDeveloperPDF(stats: DeveloperStat[], autoPrint: boolean = true) {
  const win = openWin()
  if (!win) return

  const totalRev = stats.reduce((s, d) => s + d.totalRevenue, 0)
  const totalPaid = stats.reduce((s, d) => s + d.paidRevenue, 0)
  const totalPend = totalRev - totalPaid
  const totalProj = stats.reduce((s, d) => s + d.total, 0)

  // Individual developer cards (top 3)
  const top3 = stats.slice(0, 3)

  const body = `
    <div class="section-label">Visão Geral</div>
    <div class="metrics">
      <div class="metric c-blue">
        <div class="metric-label">Desenvolvedores</div>
        <div class="metric-value">${stats.length}</div>
      </div>
      <div class="metric c-violet">
        <div class="metric-label">Total de Projetos</div>
        <div class="metric-value">${totalProj}</div>
        <div class="metric-footer">Média ${totalProj > 0 && stats.length > 0 ? (totalProj / stats.length).toFixed(1).replace('.', ',') : '0'}/dev</div>
      </div>
      <div class="metric c-green">
        <div class="metric-label">Receita Total</div>
        <div class="metric-value small">${formatCurrency(totalRev)}</div>
      </div>
      <div class="metric c-emerald">
        <div class="metric-label">Total Recebido</div>
        <div class="metric-value small green">${formatCurrency(totalPaid)}</div>
        <div class="metric-footer">${formatCurrency(totalPend)} pendente</div>
      </div>
    </div>

    ${top3.length > 0 ? `
    <div class="section-label">Top Desenvolvedores</div>
    <div class="metrics cols-${Math.min(top3.length, 3)}">
      ${top3.map((d, i) => {
        const colors = ['c-blue', 'c-violet', 'c-cyan']
        const medals = ['\u{1F947}', '\u{1F948}', '\u{1F949}']
        return `<div class="metric ${colors[i]}">
          <div class="metric-label">${medals[i]} ${d.developer}</div>
          <div class="metric-value small">${formatCurrency(d.totalRevenue)}</div>
          <div class="metric-footer">${d.total} projetos · ${pct(d.paid, d.total)}% pagos</div>
        </div>`
      }).join('')}
    </div>
    ` : ''}

    <div class="section-label">Detalhamento por Desenvolvedor</div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th style="width:24px">#</th>
            <th>Desenvolvedor</th>
            <th class="r">Projetos</th>
            <th class="r">Pagos</th>
            <th class="r">Receita</th>
            <th class="r">Recebido</th>
            <th class="r">Pendente</th>
            <th class="c" style="width:120px">Taxa Pgto</th>
          </tr>
        </thead>
        <tbody>
          ${stats.map((d, i) => `<tr>
            <td><span class="rn">${i + 1}</span></td>
            <td class="bold">${d.developer}</td>
            <td class="r mono">${d.total}</td>
            <td class="r mono v-green">${d.paid}</td>
            <td class="r mono bold">${formatCurrency(d.totalRevenue)}</td>
            <td class="r mono v-green">${formatCurrency(d.paidRevenue)}</td>
            <td class="r mono v-red">${formatCurrency(d.pendingRevenue)}</td>
            <td class="c">
              <div class="bar-wrap">
                <div class="bar"><div class="bar-fill green" style="width:${d.paymentRate}%"></div></div>
                <span class="bar-pct">${d.paymentRate.toFixed(1)}%</span>
              </div>
            </td>
          </tr>`).join('')}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2" class="r">TOTAL</td>
            <td class="r mono">${totalProj}</td>
            <td class="r mono v-green">${stats.reduce((s, d) => s + d.paid, 0)}</td>
            <td class="r mono">${formatCurrency(totalRev)}</td>
            <td class="r mono v-green">${formatCurrency(totalPaid)}</td>
            <td class="r mono v-red">${formatCurrency(totalPend)}</td>
            <td class="c"><span class="bar-pct">${pct(totalPaid, totalRev)}%</span></td>
          </tr>
        </tfoot>
      </table>
    </div>
  `

  render(win, 'Relatório por Desenvolvedor', body, autoPrint)
}

// ============================================
// 4. RELATÓRIO POR TIPO DE PROJETO
// ============================================

interface TypeStat {
  type: string
  count: number
  revenue: number
  paid: number
  paidRevenue: number
  percentage: number
}

export function generateTypePDF(stats: TypeStat[], autoPrint: boolean = true) {
  const win = openWin()
  if (!win) return

  const totalRev = stats.reduce((s, t) => s + t.revenue, 0)
  const totalPaidRev = stats.reduce((s, t) => s + t.paidRevenue, 0)
  const totalCount = stats.reduce((s, t) => s + t.count, 0)

  const colors = ['#4361ee', '#7c3aed', '#06b6d4', '#059669', '#f59e0b', '#ef4444', '#ec4899', '#6366f1']

  const body = `
    <div class="section-label">Visão Geral</div>
    <div class="metrics cols-3">
      <div class="metric c-blue">
        <div class="metric-label">Tipos Cadastrados</div>
        <div class="metric-value">${stats.length}</div>
      </div>
      <div class="metric c-violet">
        <div class="metric-label">Total de Projetos</div>
        <div class="metric-value">${totalCount}</div>
      </div>
      <div class="metric c-green">
        <div class="metric-label">Receita Total</div>
        <div class="metric-value small">${formatCurrency(totalRev)}</div>
      </div>
    </div>

    <div class="section-label">Distribuição</div>

    <!-- Visual bar chart -->
    <div class="highlight-box" style="margin-bottom:24px;">
      ${stats.map((t, i) => {
        const barWidth = totalRev > 0 ? (t.revenue / totalRev * 100) : 0
        return `<div style="display:flex;align-items:center;gap:10px;padding:6px 0;${i > 0 ? 'border-top:1px solid #e8e8ef;' : ''}">
          <span style="width:10px;height:10px;border-radius:3px;background:${colors[i % colors.length]};flex-shrink:0;"></span>
          <span style="font-size:12px;font-weight:600;color:#333350;min-width:120px;">${t.type}</span>
          <div style="flex:1;height:8px;background:#e8e8ef;border-radius:4px;overflow:hidden;">
            <div style="height:100%;width:${barWidth}%;background:${colors[i % colors.length]};border-radius:4px;"></div>
          </div>
          <span style="font-size:11px;font-weight:700;color:#4a4a65;min-width:50px;text-align:right;">${t.percentage.toFixed(1)}%</span>
          <span style="font-size:11px;font-weight:700;color:#1a1a2e;min-width:90px;text-align:right;font-family:'Courier New',monospace;">${formatCurrency(t.revenue)}</span>
        </div>`
      }).join('')}
    </div>

    <div class="section-label">Detalhamento por Tipo</div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th style="width:12px"></th>
            <th>Tipo</th>
            <th class="r">Qtde</th>
            <th class="r">% do Total</th>
            <th class="r">Receita Total</th>
            <th class="r">Receita Paga</th>
            <th class="r">% Paga</th>
          </tr>
        </thead>
        <tbody>
          ${stats.map((t, i) => `<tr>
            <td><span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${colors[i % colors.length]}"></span></td>
            <td class="bold">${t.type}</td>
            <td class="r mono">${t.count}</td>
            <td class="r mono">${t.percentage.toFixed(1)}%</td>
            <td class="r mono bold">${formatCurrency(t.revenue)}</td>
            <td class="r mono v-green">${formatCurrency(t.paidRevenue)}</td>
            <td class="r mono">${t.revenue > 0 ? pct(t.paidRevenue, t.revenue) : '0,0'}%</td>
          </tr>`).join('')}
        </tbody>
        <tfoot>
          <tr>
            <td></td>
            <td>TOTAL</td>
            <td class="r mono">${totalCount}</td>
            <td class="r mono">100%</td>
            <td class="r mono">${formatCurrency(totalRev)}</td>
            <td class="r mono v-green">${formatCurrency(totalPaidRev)}</td>
            <td class="r mono">${pct(totalPaidRev, totalRev)}%</td>
          </tr>
        </tfoot>
      </table>
    </div>
  `

  render(win, 'Relatório por Tipo de Projeto', body, autoPrint)
}

// ============================================
// 5. RELATÓRIO MENSAL
// ============================================

interface MonthlyStat {
  month: string
  monthKey: string
  total: number
  completed: number
  paid: number
  revenue: number
  paidRevenue: number
}

export function generateMonthlyPDF(stats: MonthlyStat[], autoPrint: boolean = true) {
  const win = openWin()
  if (!win) return

  const totalRev = stats.reduce((s, m) => s + m.revenue, 0)
  const totalPaid = stats.reduce((s, m) => s + m.paidRevenue, 0)
  const totalPend = totalRev - totalPaid
  const totalProj = stats.reduce((s, m) => s + m.total, 0)
  const maxRev = Math.max(...stats.map(m => m.revenue), 1)
  const avgMonthly = stats.length > 0 ? totalRev / stats.length : 0

  const body = `
    <div class="section-label">Visão Geral do Período</div>
    <div class="metrics">
      <div class="metric c-slate">
        <div class="metric-label">Período</div>
        <div class="metric-value small">${stats.length} ${stats.length === 1 ? 'mês' : 'meses'}</div>
        <div class="metric-footer">${stats.length > 0 ? stats[0].month : '—'} — ${stats.length > 0 ? stats[stats.length - 1].month : '—'}</div>
      </div>
      <div class="metric c-blue">
        <div class="metric-label">Projetos</div>
        <div class="metric-value">${totalProj}</div>
        <div class="metric-footer">Média ${stats.length > 0 ? (totalProj / stats.length).toFixed(1).replace('.', ',') : '0'}/mês</div>
      </div>
      <div class="metric c-green">
        <div class="metric-label">Receita Total</div>
        <div class="metric-value small">${formatCurrency(totalRev)}</div>
        <div class="metric-footer">Média ${formatCurrency(avgMonthly)}/mês</div>
      </div>
      <div class="metric c-emerald">
        <div class="metric-label">Total Recebido</div>
        <div class="metric-value small green">${formatCurrency(totalPaid)}</div>
      </div>
    </div>

    <div class="section-label">Evolução Mensal</div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Mês</th>
            <th class="r">Projetos</th>
            <th class="r">Concl.</th>
            <th class="r">Pagos</th>
            <th class="r">Receita</th>
            <th style="width:130px">Receita (visual)</th>
            <th class="r">Recebido</th>
            <th class="r">Pendente</th>
          </tr>
        </thead>
        <tbody>
          ${stats.map(m => {
            const pend = m.revenue - m.paidRevenue
            return `<tr>
            <td class="bold nowrap">${m.month}</td>
            <td class="r mono">${m.total}</td>
            <td class="r mono">${m.completed}</td>
            <td class="r mono v-green">${m.paid}</td>
            <td class="r mono bold">${formatCurrency(m.revenue)}</td>
            <td>
              <div class="bar-wrap">
                <div class="bar" style="height:8px;">
                  <div class="bar-fill blue" style="width:${(m.revenue / maxRev * 100).toFixed(1)}%"></div>
                </div>
              </div>
            </td>
            <td class="r mono v-green">${formatCurrency(m.paidRevenue)}</td>
            <td class="r mono v-red">${formatCurrency(pend)}</td>
          </tr>`}).join('')}
        </tbody>
        <tfoot>
          <tr>
            <td>TOTAL</td>
            <td class="r mono">${totalProj}</td>
            <td class="r mono">${stats.reduce((s, m) => s + m.completed, 0)}</td>
            <td class="r mono v-green">${stats.reduce((s, m) => s + m.paid, 0)}</td>
            <td class="r mono">${formatCurrency(totalRev)}</td>
            <td></td>
            <td class="r mono v-green">${formatCurrency(totalPaid)}</td>
            <td class="r mono v-red">${formatCurrency(totalPend)}</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <div class="section-label">Resumo do Período</div>
    <div class="summary-strip">
      <div class="strip-item">
        <div class="s-label">Receita Acumulada</div>
        <div class="s-value">${formatCurrency(totalRev)}</div>
      </div>
      <div class="strip-item">
        <div class="s-label">Total Recebido</div>
        <div class="s-value green">${formatCurrency(totalPaid)}</div>
      </div>
      <div class="strip-item">
        <div class="s-label">Total Pendente</div>
        <div class="s-value red">${formatCurrency(totalPend)}</div>
      </div>
      <div class="strip-item">
        <div class="s-label">Média Mensal</div>
        <div class="s-value">${formatCurrency(avgMonthly)}</div>
      </div>
    </div>
  `

  render(win, 'Relatório Mensal', body, autoPrint)
}

// ============================================
// 6. RELATÓRIO COMPLETO
// ============================================

export function generateCompletePDF(works: PDFWork[], autoPrint: boolean = true) {
  const win = openWin()
  if (!win) return

  const totalVal = works.reduce((s, w) => s + safeVal(w.value), 0)
  const paidWorks = works.filter(w => w.payment_status?.toLowerCase() === 'pago')
  const paidVal = paidWorks.reduce((s, w) => s + safeVal(w.value), 0)
  const pendVal = totalVal - paidVal
  const delivered = works.filter(w => w.status === 'Entregue').length
  const paidCount = paidWorks.length
  const pendCount = works.length - paidCount

  // Group by developer for summary
  const devMap = new Map<string, { count: number; revenue: number }>()
  works.forEach(w => {
    const dev = w.developer || 'Não atribuído'
    const cur = devMap.get(dev) || { count: 0, revenue: 0 }
    cur.count += 1
    cur.revenue += safeVal(w.value)
    devMap.set(dev, cur)
  })
  const devSummary = Array.from(devMap.entries()).sort((a, b) => b[1].revenue - a[1].revenue)

  // Group by type for summary
  const typeMap = new Map<string, { count: number; revenue: number }>()
  works.forEach(w => {
    const cur = typeMap.get(w.site_type) || { count: 0, revenue: 0 }
    cur.count += 1
    cur.revenue += safeVal(w.value)
    typeMap.set(w.site_type, cur)
  })
  const typeSummary = Array.from(typeMap.entries()).sort((a, b) => b[1].revenue - a[1].revenue)

  const body = `
    <div class="section-label">Resumo Geral</div>
    <div class="metrics">
      <div class="metric c-blue">
        <div class="metric-label">Total de Projetos</div>
        <div class="metric-value">${works.length}</div>
        <div class="metric-footer">${delivered} entregues</div>
      </div>
      <div class="metric c-emerald">
        <div class="metric-label">Receita Total</div>
        <div class="metric-value small">${formatCurrency(totalVal)}</div>
        <div class="metric-footer">Ticket médio ${formatCurrency(works.length > 0 ? totalVal / works.length : 0)}</div>
      </div>
      <div class="metric c-green">
        <div class="metric-label">Recebido</div>
        <div class="metric-value small green">${formatCurrency(paidVal)}</div>
        <div class="metric-footer">${paidCount} pagos (${pct(paidCount, works.length)}%)</div>
      </div>
      <div class="metric c-red">
        <div class="metric-label">Pendente</div>
        <div class="metric-value small red">${formatCurrency(pendVal)}</div>
        <div class="metric-footer">${pendCount} projetos</div>
      </div>
    </div>

    ${devSummary.length > 1 || typeSummary.length > 1 ? `
    <div class="section-label">Distribuição Rápida</div>
    <div class="dual-panel">
      <div class="panel">
        <div class="panel-header">Por Desenvolvedor</div>
        <div class="panel-body">
          ${devSummary.map(([dev, data]) => `<div class="kv-row">
            <span class="kv-label">${dev} <span style="color:#b0b0c0;font-size:10px;">(${data.count})</span></span>
            <span class="kv-value">${formatCurrency(data.revenue)}</span>
          </div>`).join('')}
        </div>
      </div>
      <div class="panel">
        <div class="panel-header">Por Tipo</div>
        <div class="panel-body">
          ${typeSummary.map(([type, data]) => `<div class="kv-row">
            <span class="kv-label">${type} <span style="color:#b0b0c0;font-size:10px;">(${data.count})</span></span>
            <span class="kv-value">${formatCurrency(data.revenue)}</span>
          </div>`).join('')}
        </div>
      </div>
    </div>
    ` : ''}

    <div class="section-label">Lista Completa de Projetos</div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th style="width:24px">#</th>
            <th>Tipo</th>
            <th>Desenvolvedor</th>
            <th class="r">Valor</th>
            <th class="c">Entrega</th>
            <th class="c">Pagamento</th>
            <th>Data</th>
            <th>Domínio</th>
          </tr>
        </thead>
        <tbody>
          ${works.map((w, i) => {
            const v = safeVal(w.value)
            const ip = w.payment_status?.toLowerCase() === 'pago'
            const id = w.status === 'Entregue'
            return `<tr>
              <td><span class="rn">${i + 1}</span></td>
              <td>${w.site_type}</td>
              <td>${w.developer || '—'}</td>
              <td class="r mono bold ${ip ? 'v-green' : 'v-red'}">${formatCurrency(v)}</td>
              <td class="c"><span class="badge ${id ? 'badge-delivered' : 'badge-wip'}"><span class="dot"></span>${w.status}</span></td>
              <td class="c"><span class="badge ${ip ? 'badge-paid' : 'badge-pending'}"><span class="dot"></span>${w.payment_status}</span></td>
              <td class="nowrap">${formatDate(w.delivery_date)}</td>
              <td><a href="${w.domain}" class="url" target="_blank" title="${w.domain}">${truncUrl(w.domain)}</a></td>
            </tr>`
          }).join('')}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" class="r" style="font-size:11px;">TOTAL</td>
            <td class="r mono">${formatCurrency(totalVal)}</td>
            <td class="c" style="font-size:10px;">${delivered} entreg.</td>
            <td class="c" style="font-size:10px;">${paidCount} pagos</td>
            <td colspan="2"></td>
          </tr>
        </tfoot>
      </table>
    </div>

    <div class="summary-strip">
      <div class="strip-item">
        <div class="s-label">Receita Total</div>
        <div class="s-value">${formatCurrency(totalVal)}</div>
      </div>
      <div class="strip-item">
        <div class="s-label">Recebido</div>
        <div class="s-value green">${formatCurrency(paidVal)}</div>
      </div>
      <div class="strip-item">
        <div class="s-label">Pendente</div>
        <div class="s-value red">${formatCurrency(pendVal)}</div>
      </div>
    </div>
  `

  render(win, 'Relatório Completo de Projetos', body, autoPrint)
}
