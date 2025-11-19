import * as React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Download, FileText, X } from 'lucide-react'
import { formatCurrency, formatDate, parseValue } from '@/lib/utils'
import { generatePDF } from '@/lib/pdf-export'
import { toast } from 'sonner'
import type { Work } from '@/types'

interface ReportPreviewProps {
  isOpen: boolean
  onClose: () => void
  works: Work[]
  title: string
  onDownloadCSV: () => void
}

export function ReportPreview({ isOpen, onClose, works, title, onDownloadCSV }: ReportPreviewProps) {
  const stats = React.useMemo(() => {
    const totalWorks = works.length
    const paidWorks = works.filter(w => w.payment_status?.toLowerCase() === 'pago').length
    const pendingWorks = totalWorks - paidWorks
    const totalValue = works.reduce((sum, w) => sum + parseValue(w.value), 0)
    const paidValue = works
      .filter(w => w.payment_status?.toLowerCase() === 'pago')
      .reduce((sum, w) => sum + parseValue(w.value), 0)
    const pendingValue = totalValue - paidValue

    return { totalWorks, paidWorks, pendingWorks, totalValue, paidValue, pendingValue }
  }, [works])

  const handleDownloadPDF = () => {
    generatePDF(works, title, true)
    toast.success('PDF gerado com sucesso!')
    onClose()
  }

  const handlePreviewPDF = () => {
    generatePDF(works, title, false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[90vw] h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>
            Visualize os dados antes de exportar - {stats.totalWorks} {stats.totalWorks === 1 ? 'trabalho' : 'trabalhos'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-4 pb-6 space-y-4">
            {/* Estatísticas */}
            <div className="flex gap-3 flex-wrap">
              <div className="rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 p-4 text-white min-w-[140px]">
                <div className="text-xs opacity-90 mb-1">Total de Trabalhos</div>
                <div className="text-2xl font-bold">{stats.totalWorks}</div>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 p-4 text-white min-w-[140px]">
                <div className="text-xs opacity-90 mb-1">Valor Total</div>
                <div className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
              </div>
            </div>

            {/* Lista de Trabalhos */}
            <div className="space-y-3">
              {works.map((work, index) => {
                const isPaid = work.payment_status?.toLowerCase() === 'pago'
                return (
                  <div key={index} className="rounded-xl border bg-card p-4 hover:shadow-md transition-shadow">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Data / Tipo */}
                      <div className="min-w-0">
                        <div className="text-xs text-muted-foreground mb-1">Data / Tipo</div>
                        <div className="text-sm font-semibold">{formatDate(work.delivery_date)}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{work.site_type}</div>
                      </div>

                      {/* Desenvolvedor */}
                      <div className="min-w-0">
                        <div className="text-xs text-muted-foreground mb-1">Desenvolvedor</div>
                        <div className="text-sm font-semibold break-words">{work.developer || '-'}</div>
                      </div>

                      {/* Valor / Status */}
                      <div className="min-w-0">
                        <div className="text-xs text-muted-foreground mb-1">Valor / Status</div>
                        <div className={`text-sm font-semibold ${isPaid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {formatCurrency(parseValue(work.value))}
                        </div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium mt-1 ${isPaid
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}>
                          {work.payment_status}
                        </span>
                      </div>

                      {/* URL */}
                      <div className="min-w-0 sm:col-span-3">
                        <div className="text-xs text-muted-foreground mb-1">Domínio</div>
                        <div className="text-sm truncate text-muted-foreground" title={work.domain}>{work.domain}</div>
                      </div>

                      {/* Template (se existir) */}
                      {work.template && (
                        <div className="min-w-0 sm:col-span-3">
                          <div className="text-xs text-muted-foreground mb-1">Template</div>
                          <div className="text-sm font-semibold break-words">{work.template}</div>
                        </div>
                      )}

                      {/* Observações (se existir) */}
                      {work.observations && (
                        <div className="min-w-0 sm:col-span-3">
                          <div className="text-xs text-muted-foreground mb-1">Observações</div>
                          <div className="text-sm break-words">{work.observations}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Resumo Financeiro */}
            <div className="p-4 rounded-xl bg-muted/30 border">
              <h4 className="font-bold mb-3">Resumo</h4>
              <div className="flex flex-wrap gap-6 text-sm">
                <div>
                  <span className="text-muted-foreground">Total de Trabalhos:</span>
                  <span className="ml-2 font-bold text-base">{stats.totalWorks}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Trabalhos Pagos:</span>
                  <span className="ml-2 font-bold text-base">{stats.paidWorks}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Trabalhos Pendentes:</span>
                  <span className="ml-2 font-bold text-base">{stats.pendingWorks}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Valor Recebido:</span>
                  <span className="ml-2 font-bold text-base text-green-600 dark:text-green-400">
                    {formatCurrency(stats.paidValue)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Valor Pendente:</span>
                  <span className="ml-2 font-bold text-base text-red-600 dark:text-red-400">
                    {formatCurrency(stats.pendingValue)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="px-6 py-4 border-t bg-background shrink-0">
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={handlePreviewPDF}
              className="flex-none"
            >
              <FileText className="h-4 w-4 mr-2" />
              Visualizar PDF
            </Button>
            <Button
              variant="outline"
              onClick={onDownloadCSV}
              className="flex-none"
            >
              <Download className="h-4 w-4 mr-2" />
              Baixar CSV
            </Button>
            <Button
              variant="outline"
              onClick={handleDownloadPDF}
              className="flex-none"
            >
              <Download className="h-4 w-4 mr-2" />
              Baixar PDF
            </Button>
            <Button
              variant="ghost"
              onClick={onClose}
              className="flex-none"
            >
              <X className="h-4 w-4 mr-2" />
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
