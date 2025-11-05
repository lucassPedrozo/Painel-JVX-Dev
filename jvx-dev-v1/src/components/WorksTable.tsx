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
import { RatingStars } from './RatingStars'

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
      <div className="rounded-lg border bg-card overflow-hidden flex flex-col">
        {/* Header fixo */}
        <div className="overflow-x-auto border-b">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left px-4 py-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground w-[50px]">
                  #
                </th>
                <th className="text-left px-4 py-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground w-[110px]">
                  Tipo
                </th>
                <th className="text-left px-4 py-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground w-[140px]">
                  Desenvolvedor
                </th>
                <th className="text-left px-4 py-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground w-[120px]">
                  Template
                </th>
                <th className="text-left px-4 py-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground w-[130px]">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 -ml-3 hover:bg-muted/80 font-semibold text-xs uppercase tracking-wider"
                    onClick={() => onSort("value")}
                  >
                    Valor
                    {getSortIcon("value")}
                  </Button>
                </th>
                <th className="text-left px-4 py-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground w-[130px]">
                  Pagamento
                </th>
                <th className="text-left px-4 py-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground w-[120px]">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 -ml-3 hover:bg-muted/80 font-semibold text-xs uppercase tracking-wider"
                    onClick={() => onSort("date")}
                  >
                    Data Cadastro
                    {getSortIcon("date")}
                  </Button>
                </th>
                <th className="text-left px-4 py-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                  URL do Projeto
                </th>
                <th className="text-center px-3 py-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground w-[60px]">
                  Obs.
                </th>
                <th className="text-right px-4 py-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground w-[100px]">
                  Ações
                </th>
              </tr>
            </thead>
          </table>
        </div>

        {/* Body com scroll */}
        <ScrollArea className="h-[calc(100vh-28rem)]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                        <span>Carregando trabalhos...</span>
                      </div>
                    </td>
                  </tr>
                ) : works.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-4xl">📋</span>
                        <span>Nenhum trabalho encontrado</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedWorks.map((work, index) => {
                    const hasObservations = work.observations && work.observations.trim() !== ""
                    const isPaid = work.payment_status === "Pago"
                    const globalIndex = startIndex + index
                    
                    // Verificar se observations contém URL (template)
                    const isTemplateUrl = work.observations && (
                      work.observations.includes('http') || 
                      work.observations.includes('envato') ||
                      work.observations.includes('themeforest')
                    )
                    
                    return (
                      <tr 
                        key={`${work.id}-${index}`} 
                        className="border-b last:border-0 hover:bg-muted/40 transition-colors duration-150"
                      >
                        <td className="px-4 py-4 w-[50px]">
                          <span className="text-xs font-medium text-muted-foreground">
                            {globalIndex + 1}
                          </span>
                        </td>
                        <td className="px-4 py-4 w-[110px]">
                          <span className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-md bg-primary/10 text-primary whitespace-nowrap">
                            {work.site_type}
                          </span>
                        </td>
                        <td className="px-4 py-4 w-[140px]">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-foreground">
                              {work.developer || "-"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 w-[120px]">
                          {isTemplateUrl ? (
                            <a 
                              href={work.observations} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 whitespace-nowrap hover:bg-blue-500/20 transition-colors"
                              title="Ver template"
                            >
                              Ver Template
                            </a>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </td>
                        <td className="px-4 py-4 w-[130px]">
                          <span className="text-sm font-bold text-foreground">
                            {formatCurrency(parseValue(work.value))}
                          </span>
                        </td>
                        <td className="px-4 py-4 w-[130px]">
                          <Badge 
                            variant={isPaid ? "default" : "destructive"}
                            className="font-medium whitespace-nowrap"
                          >
                            {work.payment_status}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 w-[120px]">
                          <span className="text-sm text-muted-foreground whitespace-nowrap">
                            {formatDate(work.delivery_date)}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <a 
                            href={work.domain.startsWith('http') ? work.domain : `https://${work.domain}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-primary hover:text-primary/80 hover:underline inline-flex items-center gap-1.5 text-sm max-w-[300px] truncate"
                            title={work.domain}
                          >
                            <span className="truncate">{work.domain}</span>
                            <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                          </a>
                        </td>
                        <td className="px-3 py-4 text-center w-[60px]">
                          {hasObservations && !isTemplateUrl ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="inline-flex items-center justify-center cursor-pointer hover:bg-muted/50 rounded p-1 transition-colors">
                                  <FileText className="h-4 w-4 text-blue-500" />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs" side="left">
                                <p className="text-sm whitespace-pre-wrap">{work.observations}</p>
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <span className="text-muted-foreground/50 text-xs">-</span>
                          )}
                        </td>
                        <td className="px-4 py-4 w-[100px]">
                          <div className="flex justify-end gap-2 items-center">
                            {/* Menu de Ações Rápidas */}
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
        </ScrollArea>

        {/* Footer fixo com paginação */}
        <div className="border-t bg-muted/30">
          <div className="p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Resumo */}
              <div className="flex items-center gap-6 text-sm">
                <span className="font-semibold">
                  Total: {works.length} {works.length === 1 ? 'trabalho' : 'trabalhos'}
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
                    className="h-9 rounded-md border bg-background px-3 text-sm"
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
