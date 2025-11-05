import * as React from "react"
import { ChevronDownIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "sonner"
import { IconDownload, IconFilterX, IconFileTypePdf } from "@tabler/icons-react"
import { generatePDF } from '@/lib/pdf-export'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SITE_TYPES, PAYMENT_STATUS } from '@/lib/constants'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { StatsCards } from '@/components/StatsCards'
import { ValueCards } from '@/components/ValueCards'
import { WorksTable } from '@/components/WorksTable'
import { WorkDialog } from '@/components/WorkDialog'
import { EditWorkDialog } from '@/components/EditWorkDialog'
import { PageHeader } from '@/components/PageHeader'
import { useWorks } from '@/contexts/WorksContext'
import { type Work } from '@/lib/api'
import { parseValue, formatCurrency, formatDate } from '@/lib/utils'

export function Sites() {
  const { works, loading, reload } = useWorks()
  const [editingWork, setEditingWork] = React.useState<Work | null>(null)
  const [open, setOpen] = React.useState(false)
  const [startDate, setStartDate] = React.useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = React.useState<Date | undefined>(undefined)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [sortField, setSortField] = React.useState<"value" | "date" | null>(null)
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("asc")
  const [filterType, setFilterType] = React.useState<string>("all")
  const [filterPayment, setFilterPayment] = React.useState<string>("all")
  const [filterDeveloper, setFilterDeveloper] = React.useState<string>("all")
  const [filterTemplate, setFilterTemplate] = React.useState<string>("all")
  const [filterObservations, setFilterObservations] = React.useState<string>("all")

  const stats = React.useMemo(() => ({
    totalSites: works.length,
    pagamentosPendentes: works.filter(w => w.payment_status && w.payment_status.toLowerCase() !== 'pago').length
  }), [works])

  const totalPago = React.useMemo(() => {
    const total = works.reduce((acc, w) => acc + parseValue(w.value), 0)
    return formatCurrency(total)
  }, [works])

  const totalPendente = React.useMemo(() => {
    const total = works
      .filter(w => !(w.payment_status && String(w.payment_status).toLowerCase() === 'pago'))
      .reduce((acc, w) => acc + parseValue(w.value), 0)
    return formatCurrency(total)
  }, [works])

  // Listas únicas para filtros
  const developers = React.useMemo(() => {
    const devs = new Set(works.map(w => w.developer).filter(Boolean) as string[])
    return Array.from(devs).sort()
  }, [works])

  const siteTypes = React.useMemo(() => {
    const types = new Set(works.map(w => w.site_type).filter(Boolean) as string[])
    return Array.from(types).sort()
  }, [works])

  const filteredWorks = React.useMemo(() => {
    let filtered = works.filter((work) => {
      const term = searchTerm.toLowerCase()
      const valueFormatted = String(work.value).replace(/[R$\s,.]/g, "")
      const matchesSearch =
        (work.site_type || "").toLowerCase().includes(term) ||
        (work.payment_status || "").toLowerCase().includes(term) ||
        valueFormatted.includes(term.replace(/[R$\s,.]/g, "")) ||
        (work.domain || "").toLowerCase().includes(term) ||
        (work.developer || "").toLowerCase().includes(term) ||
        (work.status || "").toLowerCase().includes(term) ||
        (work.observations || "").toLowerCase().includes(term)

      const workDate = new Date(work.delivery_date).getTime()
      const matchesStart = startDate ? workDate >= startDate.getTime() : true
      const matchesEnd = endDate ? workDate <= endDate.getTime() : true

      const matchesType = filterType === "all" || work.site_type === filterType
      const matchesPayment = filterPayment === "all" || work.payment_status === filterPayment
      const matchesDeveloper = filterDeveloper === "all" || work.developer === filterDeveloper
      const matchesTemplate = filterTemplate === "all" || work.site_type === filterTemplate
      const matchesObservations =
        filterObservations === "all" ||
        (filterObservations === "with" && work.observations && work.observations.trim() !== "") ||
        (filterObservations === "without" && (!work.observations || work.observations.trim() === ""))

      return matchesSearch && matchesStart && matchesEnd && matchesType && matchesPayment &&
        matchesDeveloper && matchesTemplate && matchesObservations
    })

    if (sortField) {
      filtered = [...filtered].sort((a, b) => {
        if (sortField === "value") {
          const valA = parseValue(a.value)
          const valB = parseValue(b.value)
          return sortOrder === "asc" ? valA - valB : valB - valA
        } else if (sortField === "date") {
          return sortOrder === "asc" ? Number(a.delivery_date) - Number(b.delivery_date) : Number(b.delivery_date) - Number(a.delivery_date)
        }
        return 0
      })
    }

    return filtered
  }, [works, searchTerm, startDate, endDate, sortField, sortOrder, filterType, filterPayment, filterDeveloper, filterTemplate, filterObservations])

  const handleSort = (field: "value" | "date") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  const handleDownload = () => {
    const headers = ["Tipo", "Desenvolvedor", "Status", "Valor", "Domínio", "Prazo", "Data", "Observações"]

    const rows = filteredWorks.map(work => [
      work.site_type,
      work.developer || "-",
      work.payment_status,
      formatCurrency(parseValue(work.value)),
      work.domain,
      work.deadline_type || "-",
      formatDate(work.delivery_date),
      work.observations || "-"
    ])

    const BOM = "\uFEFF"
    const csv = BOM + [
      headers.join(";"),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(";"))
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    const fileName = `jvx-trabalhos-${new Date().toISOString().split('T')[0]}.csv`
    a.download = fileName
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success(`Arquivo ${fileName} baixado com sucesso!`)
  }

  const handleClearDates = () => {
    setStartDate(undefined)
    setEndDate(undefined)
  }

  const handleClearFilters = () => {
    setSearchTerm("")
    setStartDate(undefined)
    setEndDate(undefined)
    setFilterType("all")
    setFilterPayment("all")
    setFilterDeveloper("all")
    setFilterTemplate("all")
    setFilterObservations("all")
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Header da Página */}
      <div className="flex-shrink-0">
        <PageHeader
          title="Sites Desenvolvidos"
          description="Gerencie todos os seus projetos e sites desenvolvidos. Visualize, edite e acompanhe o status de cada trabalho."
        />
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCards
          totalSites={stats.totalSites}
          pagamentosPendentes={stats.pagamentosPendentes}
        />
        <ValueCards
          totalPago={totalPago}
          totalPendente={totalPendente}
        />
      </div>

      {/* Seção de Trabalhos */}
      <div className="rounded-xl border bg-card shadow-sm">
        {/* Header do Card */}
        <div className="border-b bg-muted/20">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Lista de Trabalhos</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Gerencie e filtre seus projetos cadastrados
                </p>
              </div>
              <WorkDialog onSubmitSuccess={reload} />
            </div>
          </div>
        </div>

        {/* Filtros e Busca */}
        <div className="border-b bg-muted/10">
          <div className="p-4 space-y-3">
            {/* Linha 1: Busca, Filtro de Data e Ações */}
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col sm:flex-row gap-2 flex-1">
                <Input
                  className="flex-1 sm:max-w-md"
                  type="text"
                  placeholder="🔍 Buscar por tipo, desenvolvedor, URL, observações..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />

                <div className="flex items-center gap-2">
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="h-10 justify-between font-normal whitespace-nowrap">
                        {startDate ? startDate.toLocaleDateString('pt-BR') : "Data Início"}
                        <ChevronDownIcon className="h-3 w-3 ml-2 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        captionLayout="dropdown"
                        onSelect={(d) => {
                          setStartDate(d)
                          setOpen(false)
                        }}
                      />
                    </PopoverContent>
                  </Popover>

                  <span className="text-xs text-muted-foreground">até</span>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="h-10 justify-between font-normal whitespace-nowrap">
                        {endDate ? endDate.toLocaleDateString('pt-BR') : "Data Final"}
                        <ChevronDownIcon className="h-3 w-3 ml-2 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        captionLayout="dropdown"
                        onSelect={(d) => setEndDate(d)}
                      />
                    </PopoverContent>
                  </Popover>

                  {(startDate || endDate) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-10 whitespace-nowrap"
                      onClick={handleClearDates}
                    >
                      Limpar
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="px-3 py-1.5 rounded-md bg-primary/10 text-primary text-sm font-medium whitespace-nowrap">
                  {filteredWorks.length} de {works.length} trabalho(s)
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearFilters}
                  title="Limpar todos os filtros"
                >
                  <IconFilterX className="h-4 w-4 mr-1.5" />
                  Limpar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  title="Exportar para CSV"
                >
                  <IconDownload className="h-4 w-4 mr-1.5" />
                  CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    generatePDF(filteredWorks, 'Relatório de Sites - JVX')
                    toast.success('PDF gerado com sucesso!')
                  }}
                  title="Exportar para PDF"
                >
                  <IconFileTypePdf className="h-4 w-4 mr-1.5" />
                  PDF
                </Button>
              </div>
            </div>

            {/* Linha 2: Filtros Principais */}
            <div className="flex flex-wrap gap-3">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Tipo: Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tipo: Todos</SelectItem>
                  {SITE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>Tipo: {type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterDeveloper} onValueChange={setFilterDeveloper}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Dev: Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Dev: Todos</SelectItem>
                  {developers.map((dev) => (
                    <SelectItem key={dev} value={dev}>Dev: {dev}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterPayment} onValueChange={setFilterPayment}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Pagamento: Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Pagamento: Todos</SelectItem>
                  {PAYMENT_STATUS.map((status) => (
                    <SelectItem key={status} value={status}>Pagamento: {status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterTemplate} onValueChange={setFilterTemplate}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Tipo Site: Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tipo Site: Todos</SelectItem>
                  {siteTypes.map((type) => (
                    <SelectItem key={type} value={type}>Tipo: {type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterObservations} onValueChange={setFilterObservations}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Observações: Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Observações: Todas</SelectItem>
                  <SelectItem value="with">Observações: Com</SelectItem>
                  <SelectItem value="without">Observações: Sem</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Tabela */}
        <div className="p-4">
          <WorksTable
            works={filteredWorks}
            loading={loading}
            sortField={sortField}
            sortOrder={sortOrder}
            onSort={handleSort}
            onEdit={setEditingWork}
            onDelete={reload}
          />
        </div>
      </div>

      {editingWork && (
        <EditWorkDialog
          work={editingWork}
          isOpen={true}
          onClose={() => setEditingWork(null)}
          onSubmitSuccess={() => {
            setEditingWork(null)
            reload()
          }}
        />
      )}
    </div>
  )
}

export default Sites
