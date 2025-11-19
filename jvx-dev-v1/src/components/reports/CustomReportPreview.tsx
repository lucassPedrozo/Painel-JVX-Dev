import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Download, X } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Column {
  key: string
  label: string
  format?: (value: unknown) => string
}

interface CustomReportPreviewProps {
  isOpen: boolean
  onClose: () => void
  title: string
  data: Record<string, unknown>[]
  columns: Column[]
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
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{title}</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className="px-4 py-3 text-left text-sm font-semibold"
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-4 py-8 text-center text-muted-foreground"
                    >
                      Nenhum dado disponível
                    </td>
                  </tr>
                ) : (
                  data.map((row, index) => (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      {columns.map((col) => (
                        <td key={col.key} className="px-4 py-3 text-sm">
                          {col.format
                            ? col.format(row[col.key])
                            : String(row[col.key] || '-')}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </ScrollArea>

        <DialogFooter className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Total de {data.length} registro(s)
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
            <Button onClick={onDownloadCSV}>
              <Download className="h-4 w-4 mr-2" />
              Baixar CSV
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
