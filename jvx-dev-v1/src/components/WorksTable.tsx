import * as React from 'react'
import { ArrowUpDown, FileText, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { type Work } from '@/lib/api'
import { parseValue, formatCurrency, formatDate } from '@/lib/utils'
import { QuickActions } from './QuickActions'
import { DeveloperStatusButton } from './DeveloperStatusButton'
import { StatusBadge } from './StatusBadge'

interface WorksTableProps {
  works: Work[]
  loading: boolean
  sortField: "value" | "date" | null
  sortOrder: "asc" | "desc"
  onSort: (field: "value" | "date") => void
  onEdit: (work: Work) => void
  onDelete: () => void
}

export function WorksTable({ works, loading, sortField, sortOrder, onSort, onEdit, onDelete }: WorksTableProps) {
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(25)

  const totalPages = Math.ceil(works.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const paginatedWorks = works.slice(startIndex, startIndex + pageSize)

  React.useEffect(() => {
    setCurrentPage(1)
  }, [works.length])

  const getSortIcon = (field: "value" | "date") => {
    if (sortField !== field) return <ArrowUpDown className="ml-2 h-3.5 w-3.5 opacity-50" />
    return sortOrder === "asc" ? 
      <ArrowUpDown className="ml-2 h-3.5 w-3.5 rotate-180" /> : 
      <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
  }

  return (
    <TooltipProvider>
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="relative">
          <div className="overflow-auto max-h-[calc(100vh-28rem)]">
            <table className="w-full text-sm border-collapse">
              <thead className="sticky top-0 z-10 bg-muted/95 backdrop-blur-sm border-b shadow-sm">
                <tr>
                  <th className="text-left px-3 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground min-w-[40px] w-[40px]">
                    #
                  </th>
                  <th className="text-left px-3 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground min-w-[130px] w-[130px]">
                    Tipo
                  </th>
                  <th className="text-left px-3 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground min-w-[120px] w-[120px]">
                    Desenvolvedor
                  </th>
                  <th className="text-left px-3 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground min-w-[100px] w-[100px]">
                    Template
                  </th>
                  <th className="text-left px-3 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground min-w-[110px] w-[110px]">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 -ml-2 hover:bg-muted/80 font-semibold text-xs uppercase tracking-wider px-2"
                      onClick={() => onSort("value")}
                    >
                      Valor
                      {getSortIcon("value")}
                    </Button>
                  </th>
                  <th className="text-left px-3 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground min-w-[140px] w-[140px]">
                    Status
                  </th>
                  <th className="text-left px-3 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground min-w-[120px] w-[120px]">
                    Pagamento
                  </th>
                  <th className="text-left px-3 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground min-w-[100px] w-[100px]">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 -ml-2 hover:bg-muted/80 font-semibold text-xs uppercase tracking-wider px-2"
                      onClick={() => onSort("date")}
                    >
                      Data
                      {getSortIcon("date")}
                    </Button>
                  </th>
                  <th className="text-left px-3 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground min-w-[200px]">
                    URL
                  </th>
                  <th className="text-center px-2 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground min-w-[50px] w-[50px]">
                    Obs
                  </th>
                  <th className="text-right px-3 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground min-w-[80px] w-[80px] sticky right-0 bg-muted/95 backdrop-blur-sm">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={11} className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                        <span>Carregando projetos...</span>
                      </div>
                    </td>
                  </tr>
                ) : works.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-4xl">📋</span>
                        <span>Nenhum projeto encontrado</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedWorks.map((work, index) => {
                    const hasObservations = work.observations && work.observations.trim() !== ""
                    const isPaid = work.payment_status === "Pago"
                    const globalIndex = startIndex + index
                    
                    return (
                      <tr 
                        key={`${work.id}-${index}`} 
                        className="border-b last:border-0 hover:bg-muted/30 transition-colors duration-150"
                      >
                        <td className="px-3 py-3 min-w-[40px] w-[40px]">
                          <span className="text-xs font-medium text-muted-foreground">
                            {globalIndex + 1}
                          </span>
                        </td>
                        <td className="px-3 py-3 min-w-[130px] w-[130px]">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="inline-flex items-center text-xs font-medium px-2 py-1 rounded-md bg-primary/10 text-primary cursor-default truncate max-w-full">
                                {work.site_type}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{work.site_type}</p>
                            </TooltipContent>
                          </Tooltip>
                        </td>
                        <td className="px-3 py-3 min-w-[120px] w-[120px]">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-sm font-medium text-foreground truncate block cursor-default">
                                {work.developer || "-"}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{work.developer || "Sem desenvolvedor"}</p>
                            </TooltipContent>
                          </Tooltip>
                        </td>
                        <td className="px-3 py-3 min-w-[100px] w-[100px]">
                          {work.template ? (
                            <a 
                              href={work.template} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-xs font-medium px-2 py-1 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-colors cursor-pointer"
                              title={work.template}
                            >
                              Ver Template
                            </a>
                          ) : (
                            <span className="text-muted-foreground text-xs">-</span>
                          )}
                        </td>
                        <td className="px-3 py-3 min-w-[110px] w-[110px]">
                          <span className="text-sm font-bold text-foreground whitespace-nowrap">
                            {formatCurrency(parseValue(work.value))}
                          </span>
                        </td>
                        <td className="px-3 py-3 min-w-[140px] w-[140px]">
                          <div className="flex flex-col gap-1">
                            <StatusBadge work={work} />
                            <DeveloperStatusButton work={work} onUpdate={onDelete} />
                          </div>
                        </td>
                        <td className="px-3 py-3 min-w-[120px] w-[120px]">
                          <Badge 
                            variant={isPaid ? "default" : "destructive"}
                            className="font-medium text-xs"
                          >
                            {work.payment_status}
                          </Badge>
                        </td>
                        <td className="px-3 py-3 min-w-[100px] w-[100px]">
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDate(work.delivery_date)}
                          </span>
                        </td>
                        <td className="px-3 py-3 min-w-[200px]">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <a 
                                href={work.domain.startsWith('http') ? work.domain : `https://${work.domain}`} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-primary hover:text-primary/80 hover:underline inline-flex items-center gap-1 text-xs cursor-pointer transition-colors max-w-full"
                              >
                                <span className="truncate">{work.domain}</span>
                                <ExternalLink className="h-3 w-3 flex-shrink-0" />
                              </a>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">{work.domain}</p>
                            </TooltipContent>
                          </Tooltip>
                        </td>
                        <td className="px-2 py-3 text-center min-w-[50px] w-[50px]">
                          {hasObservations ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="inline-flex items-center justify-center cursor-pointer hover:bg-muted/50 rounded p-1 transition-colors">
                                  <FileText className="h-3.5 w-3.5 text-blue-500" />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs" side="left">
                                <p className="text-xs whitespace-pre-wrap">{work.observations}</p>
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <span className="text-muted-foreground/50 text-xs">-</span>
                          )}
                        </td>
                        <td className="px-3 py-3 min-w-[80px] w-[80px] sticky right-0 bg-background">
                          <div className="flex justify-end items-center">
                            <QuickActions
                              work={work}
                              onEdit={onEdit}
                              onDelete={() => {}}
                              onUpdate={onDelete}
                            />
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer fixo com paginação */}
        <div className="border-t bg-muted/30">
          <div className="p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Resumo */}
              <div className="flex items-center gap-6 text-sm">
                <span className="font-semibold">
                  Total: {works.length} {works.length === 1 ? 'projeto' : 'projetos'}
                </span>
                <span className="text-muted-foreground">
                  Receita: <span className="font-bold text-foreground">{formatCurrency(works.reduce((acc, work) => acc + parseValue(work.value), 0))}</span>
                </span>
                <span className="text-green-600 dark:text-green-400">
                  Pagos: {works.filter(w => w.payment_status === "Pago").length}
                </span>
                <span className="text-red-600 dark:text-red-400">
                  Pendentes: {works.filter(w => w.payment_status !== "Pago").length}
                </span>
              </div>

              {/* Controles de Paginação */}
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Página {currentPage} de {totalPages}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                    >
                      Primeira
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Próxima
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                    >
                      Última
                    </Button>
                  </div>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value))
                      setCurrentPage(1)
                    }}
                    className="h-9 rounded-md border bg-background px-3 text-sm cursor-pointer hover:bg-accent transition-colors"
                  >
                    <option value={10}>10 por página</option>
                    <option value={25}>25 por página</option>
                    <option value={50}>50 por página</option>
                    <option value={100}>100 por página</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
