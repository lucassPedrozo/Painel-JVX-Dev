import * as React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Download, FileText, X } from 'lucide-react'
import { formatCurrency, parseValue } from '@/lib/utils'
import { generatePDF } from '@/lib/pdf-export'
import { toast } from 'sonner'

interface CustomReportPreviewProps {
  isOpen: boolean
  onClose: () => void
  title: string
  data: any[]
  columns: { key: string; label: string; format?: (value: any) => string }[]
  onDownloadCSV: () => void
}

export function CustomReportPreview({ 
  isOpen, 
  onClose, 
  title, 
  data, 
  columns,
  onDownloadCSV 
}: CustomReportPreviewProps) {
  const stats = React.useMemo(() => {
    const totalItems = data.length
    
    // Tentar calcular estatísticas baseadas nos dados
    let totalValue = 0
    let paidCount = 0
    let pendingCount = 0
    
    data.forEach(item => {
      if (item.value !== undefined) {
        totalValue += typeof item.value === 'number' ? item.value : parseValue(item.value)
      }
      if (item.paymentStatus) {
        if (item.paymentStatus.toLowerCase() === 'pago') {
          paidCount++
        } else {
          pendingCount++
        }
      }
    })

    return { totalItems, totalValue, paidCount, pendingCount }
  }, [data])

  const handleDownloadPDF = () => {
    // Converter dados customizados para formato Work
    const worksData = data.map(item => ({
      typeWork: item.typeWork || item.developer || 'N/A',
      paymentStatus: item.paymentStatus || 'N/A',
      value: item.value || 0,
      url: item.url || '-',
      date: item.date || new Date().toISOString(),
      developer: item.developer || '-',
      template: item.template || '-',
      observations: item.observations || '-'
    }))
    
    generatePDF(worksData, title, true)
    toast.success('PDF gerado com sucesso!')
    onClose()
  }

  const handlePreviewPDF = () => {
    const worksData = data.map(item => ({
      typeWork: item.typeWork || item.developer || 'N/A',
      paymentStatus: item.paymentStatus || 'N/A',
      value: item.value || 0,
      url: item.url || '-',
      date: item.date || new Date().toISOString(),
      developer: item.developer || '-',
      template: item.template || '-',
      observations: item.observations || '-'
    }))
    
    generatePDF(worksData, title, false)
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
            Visualize os dados antes de exportar - {stats.totalItems} {stats.totalItems === 1 ? 'registro' : 'registros'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-4 pb-6 space-y-4">
            {/* Estatísticas */}
            {stats.totalValue > 0 && (
              <div className="flex gap-3 flex-wrap">
                <div className="rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 p-4 text-white min-w-[140px]">
                  <div className="text-xs opacity-90 mb-1">Total de Registros</div>
                  <div className="text-2xl font-bold">{stats.totalItems}</div>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 p-4 text-white min-w-[140px]">
                  <div className="text-xs opacity-90 mb-1">Valor Total</div>
                  <div className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
                </div>
              </div>
            )}

            {/* Lista de Dados */}
            <div className="space-y-3">
              {data.map((item, index) => (
                <div key={index} className="rounded-xl border bg-card p-4 hover:shadow-md transition-shadow">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {columns.map((col, colIndex) => {
                      const value = item[col.key]
                      const displayValue = col.format ? col.format(value) : value
                      
                      return (
                        <div key={colIndex} className="min-w-0">
                          <div className="text-xs text-muted-foreground mb-1">{col.label}</div>
                          <div className="text-sm font-semibold break-words" title={String(displayValue || '-')}>
                            {displayValue || '-'}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Resumo */}
            {stats.totalValue > 0 && (
              <div className="p-4 rounded-xl bg-muted/30 border">
                <h4 className="font-bold mb-3">Resumo</h4>
                <div className="flex flex-wrap gap-6 text-sm">
                  <div>
                    <span className="text-muted-foreground">Total de Registros:</span>
                    <span className="ml-2 font-bold text-base">{stats.totalItems}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Valor Total:</span>
                    <span className="ml-2 font-bold text-base text-green-600 dark:text-green-400">
                      {formatCurrency(stats.totalValue)}
                    </span>
                  </div>
                </div>
              </div>
            )}
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
