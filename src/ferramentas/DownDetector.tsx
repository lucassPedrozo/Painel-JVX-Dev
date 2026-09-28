import * as React from 'react'
import { PageHeader } from '@/components/common'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import {
  Globe,
  Plus,
  Trash2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  CircleDashed,
  Activity,
  Loader2,
  Search,
  Upload,
  Download,
  ShieldAlert,
  Timer,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Clock,
  TrendingDown,
  Filter,
  X,
  SortAsc,
  SortDesc,
  Trash,
  Server,
  Wifi,
} from 'lucide-react'
import { api } from '@/lib/api'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

// --- Tipos ---

type SiteStatus = 'online' | 'offline' | 'pending' | 'ssl'

interface CheckHistoryEntry {
  status: 'online' | 'offline' | 'ssl'
  statusCode: number | null
  checkedAt: number
}

type CheckHistoryMap = Record<string, CheckHistoryEntry[]>

interface MonitoredSite {
  id: string
  url: string
  status: SiteStatus
  statusCode: number | null
  ipAddress: string | null
  nameServers: string[]
  lastChecked: number | null
  addedAt: number
}

type FilterOption = 'all' | 'online' | 'offline' | 'pending' | 'ssl'

// Filtros compostos / presets
type CompositeFilter =
  | 'all'
  | 'online'
  | 'offline'
  | 'ssl'
  | 'pending'
  | 'offline+ssl'       // Offline E sem SSL
  | 'online+ssl'        // Online mas sem SSL (sinônimo de 'ssl')
  | 'online+healthy'    // Online com SSL válido
  | 'went-down'         // Estavam online e caíram
  | 'came-up'           // Estavam offline e voltaram
  | 'never-checked'     // Nunca verificados
  | 'low-uptime'        // Uptime < 90%

type SortOption = 'default' | 'url-asc' | 'url-desc' | 'status' | 'last-checked' | 'uptime-asc' | 'uptime-desc' | 'ns-asc' | 'ns-desc'

interface FilterPreset {
  id: CompositeFilter
  label: string
  icon: React.ReactNode
  color: string
  description: string
}

// --- Helpers ---

function normalizeUrl(input: string): string {
  let url = input.trim()
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url
  }
  return url
}

function isValidUrl(input: string): boolean {
  try {
    const url = new URL(normalizeUrl(input))
    return !!url.hostname && url.hostname.includes('.')
  } catch {
    return false
  }
}

function statusIcon(status: SiteStatus) {
  switch (status) {
    case 'online':
      return <CheckCircle2 className="h-4 w-4 text-emerald-500" />
    case 'ssl':
      return <ShieldAlert className="h-4 w-4 text-orange-500" />
    case 'offline':
      return <XCircle className="h-4 w-4 text-red-500" />
    case 'pending':
    default:
      return <CircleDashed className="h-4 w-4 text-muted-foreground" />
  }
}

function statusBadge(status: SiteStatus, statusCode: number | null) {
  switch (status) {
    case 'online':
      return (
        <Badge className="bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25 border-0 text-[10px] gap-1">
          <CheckCircle2 className="h-3 w-3" />
          {statusCode ?? 200}
        </Badge>
      )
    case 'ssl':
      return (
        <Badge className="bg-orange-500/15 text-orange-500 hover:bg-orange-500/25 border-0 text-[10px] gap-1">
          <ShieldAlert className="h-3 w-3" />
          Sem SSL
        </Badge>
      )
    case 'offline':
      return (
        <Badge className="bg-red-500/15 text-red-500 hover:bg-red-500/25 border-0 text-[10px] gap-1">
          <XCircle className="h-3 w-3" />
          {statusCode ?? 'Erro'}
        </Badge>
      )
    case 'pending':
    default:
      return (
        <Badge variant="secondary" className="text-[10px] gap-1">
          <CircleDashed className="h-3 w-3" />
          Aguardando
        </Badge>
      )
  }
}

// --- Mini Uptime Chart ---

function UptimeChart({ history }: { history: CheckHistoryEntry[] }) {
  if (!history || history.length === 0) {
    return (
      <div className="flex items-center gap-[2px]" title="Sem histórico de verificações">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="w-[3px] h-[18px] rounded-[1px] bg-muted/60"
          />
        ))}
      </div>
    )
  }

  // Mostrar as últimas 20 verificações (ou menos se não houver)
  const MAX_BARS = 20
  const entries = history.slice(-MAX_BARS)

  // Calcular uptime %
  const onlineCount = history.filter(e => e.status === 'online').length
  const uptimePct = history.length > 0 ? ((onlineCount / history.length) * 100).toFixed(1) : '—'

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-[2px]">
          {entries.map((entry, i) => {
            const color =
              entry.status === 'online'
                ? 'bg-emerald-500'
                : entry.status === 'ssl'
                  ? 'bg-orange-400'
                  : 'bg-red-500'

            const date = new Date(entry.checkedAt)
            const label = `${entry.status === 'online' ? 'Online' : entry.status === 'ssl' ? 'Sem SSL' : 'Offline'} — ${date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}${entry.statusCode ? ` (HTTP ${entry.statusCode})` : ''}`

            return (
              <Tooltip key={i}>
                <TooltipTrigger asChild>
                  <div
                    className={`w-[3px] h-[18px] rounded-[1px] ${color} transition-all hover:scale-y-125 hover:brightness-110 cursor-default`}
                  />
                </TooltipTrigger>
                <TooltipContent side="top" className="text-[11px] max-w-[200px]">
                  {label}
                </TooltipContent>
              </Tooltip>
            )
          })}
        </div>
        <span className={`text-[10px] font-semibold tabular-nums ${
          Number(uptimePct) >= 99 ? 'text-emerald-500' : Number(uptimePct) >= 90 ? 'text-amber-500' : Number(uptimePct) > 0 ? 'text-red-500' : 'text-muted-foreground'
        }`}>
          {uptimePct}%
        </span>
      </div>
    </TooltipProvider>
  )
}

// --- Componente Principal ---

// --- Filter Presets ---

const FILTER_PRESETS: FilterPreset[] = [
  { id: 'all', label: 'Todos', icon: <Globe className="h-3 w-3" />, color: 'bg-primary/10 text-primary hover:bg-primary/20', description: 'Todos os sites monitorados' },
  { id: 'online', label: 'Online', icon: <CheckCircle2 className="h-3 w-3" />, color: 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20', description: 'Sites online e funcionando' },
  { id: 'offline', label: 'Offline', icon: <XCircle className="h-3 w-3" />, color: 'bg-red-500/10 text-red-500 hover:bg-red-500/20', description: 'Sites fora do ar' },
  { id: 'ssl', label: 'Sem SSL', icon: <ShieldAlert className="h-3 w-3" />, color: 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20', description: 'Sites online sem certificado SSL' },
  { id: 'pending', label: 'Pendentes', icon: <CircleDashed className="h-3 w-3" />, color: 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20', description: 'Sites ainda não verificados' },
  { id: 'went-down', label: 'Caíram', icon: <TrendingDown className="h-3 w-3" />, color: 'bg-red-600/10 text-red-600 hover:bg-red-600/20', description: 'Sites que estavam online e caíram na última verificação' },
  { id: 'came-up', label: 'Voltaram', icon: <Activity className="h-3 w-3" />, color: 'bg-sky-500/10 text-sky-500 hover:bg-sky-500/20', description: 'Sites que estavam offline e voltaram' },
  { id: 'offline+ssl', label: 'Offline + Sem SSL', icon: <AlertTriangle className="h-3 w-3" />, color: 'bg-rose-600/10 text-rose-600 hover:bg-rose-600/20', description: 'Sites com ambos os problemas: offline e sem SSL' },
  { id: 'online+healthy', label: 'Saudáveis', icon: <CheckCircle2 className="h-3 w-3" />, color: 'bg-emerald-600/10 text-emerald-600 hover:bg-emerald-600/20', description: 'Sites online com SSL válido' },
  { id: 'low-uptime', label: 'Uptime Baixo', icon: <AlertTriangle className="h-3 w-3" />, color: 'bg-amber-600/10 text-amber-600 hover:bg-amber-600/20', description: 'Sites com uptime abaixo de 90%' },
  { id: 'never-checked', label: 'Nunca Verificados', icon: <CircleDashed className="h-3 w-3" />, color: 'bg-zinc-500/10 text-zinc-500 hover:bg-zinc-500/20', description: 'Sites adicionados mas nunca verificados' },
]

// --- Helper: detectar mudança de status pelo histórico ---

function detectStatusChange(history: CheckHistoryEntry[]): 'went-down' | 'came-up' | 'stable' | 'unknown' {
  if (!history || history.length < 2) return 'unknown'
  const sorted = [...history].sort((a, b) => b.checkedAt - a.checkedAt)
  const current = sorted[0]
  const previous = sorted[1]

  const wasOnline = previous.status === 'online'
  const isOffline = current.status === 'offline'
  const wasOffline = previous.status === 'offline'
  const isOnline = current.status === 'online'

  if (wasOnline && isOffline) return 'went-down'
  if (wasOffline && isOnline) return 'came-up'
  return 'stable'
}

function getUptimePercentage(history: CheckHistoryEntry[]): number | null {
  if (!history || history.length === 0) return null
  const online = history.filter(e => e.status === 'online').length
  return (online / history.length) * 100
}

function DownDetector() {
  const [sites, setSites] = React.useState<MonitoredSite[]>([])
  const [inputUrl, setInputUrl] = React.useState('')
  const [filter, setFilter] = React.useState<FilterOption>('all')
  const [compositeFilter, setCompositeFilter] = React.useState<CompositeFilter>('all')
  const [searchTerm, setSearchTerm] = React.useState('')
  const [sortOption, setSortOption] = React.useState<SortOption>('default')
  const [checking, setChecking] = React.useState(false)
  const [checkingIds, setCheckingIds] = React.useState<Set<string>>(new Set())
  const [loading, setLoading] = React.useState(true)
  const [importing, setImporting] = React.useState(false)
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [confirmMode, setConfirmMode] = React.useState<'all' | 'selected' | 'delete-selected'>('all')
  const [checkProgress, setCheckProgress] = React.useState(0)
  const [checkElapsed, setCheckElapsed] = React.useState(0)
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = React.useState(1)
  const [lastGlobalCheck, setLastGlobalCheck] = React.useState<number | null>(null)
  const [checkHistory, setCheckHistory] = React.useState<CheckHistoryMap>({})
  const [showFilterPanel, setShowFilterPanel] = React.useState(false)
  const [nsFilter, setNsFilter] = React.useState<string>('all')
  const [ipFilter, setIpFilter] = React.useState<string>('all')
  const ITEMS_PER_PAGE = 50
  const checkTimerRef = React.useRef<ReturnType<typeof setInterval> | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Carregar sites do banco ao montar
  React.useEffect(() => {
    loadSites()
    loadHistory()
  }, [])

  const loadSites = async () => {
    try {
      setLoading(true)
      const data = await api.getMonitoredSites()
      setSites(data)
    } catch (error) {
      console.error('Erro ao carregar sites:', error)
      toast.error('Erro ao carregar sites monitorados')
    } finally {
      setLoading(false)
    }
  }

  const loadHistory = async () => {
    try {
      const data = await api.getSiteCheckHistory(30)
      setCheckHistory(data)
    } catch (error) {
      console.error('Erro ao carregar histórico:', error)
    }
  }

  // --- Métricas ---
  const totalSites = sites.length
  const onlineCount = sites.filter(s => s.status === 'online').length
  const sslCount = sites.filter(s => s.status === 'ssl').length
  const offlineCount = sites.filter(s => s.status === 'offline').length
  const pendingCount = sites.filter(s => s.status === 'pending').length
  const allOnline = totalSites > 0 && onlineCount === totalSites
  const allHealthy = totalSites > 0 && offlineCount === 0 && pendingCount === 0

  // Detecção de mudanças de status (sites que caíram / voltaram)
  const statusChanges = React.useMemo(() => {
    const wentDown: string[] = []
    const cameUp: string[] = []
    const lowUptime: string[] = []

    for (const site of sites) {
      const history = checkHistory[site.id]
      if (!history || history.length < 2) continue

      const change = detectStatusChange(history)
      if (change === 'went-down') wentDown.push(site.id)
      if (change === 'came-up') cameUp.push(site.id)

      const uptime = getUptimePercentage(history)
      if (uptime !== null && uptime < 90) lowUptime.push(site.id)
    }

    return { wentDown, cameUp, lowUptime }
  }, [sites, checkHistory])

  const wentDownCount = statusChanges.wentDown.length
  const cameUpCount = statusChanges.cameUp.length
  const lowUptimeCount = statusChanges.lowUptime.length
  const neverCheckedCount = sites.filter(s => !s.lastChecked).length

  // --- Ações ---

  const addSite = async () => {
    const raw = inputUrl.trim()
    if (!raw) {
      toast.error('Informe uma URL')
      return
    }

    if (!isValidUrl(raw)) {
      toast.error('URL inválida. Informe um endereço válido (ex: google.com)')
      return
    }

    const url = normalizeUrl(raw)

    try {
      const newSite = await api.addMonitoredSite(url)
      setSites(prev => [newSite, ...prev])
      setInputUrl('')
      toast.success('Site adicionado!')
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erro ao adicionar site'
      toast.error(msg)
    }
  }

  const removeSite = async (id: string) => {
    try {
      await api.removeMonitoredSite(id)
      setSites(prev => prev.filter(s => s.id !== id))
      toast.success('Site removido')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao remover site')
    }
  }

  // Estimativa: keep-alive + semáforo + 5 por host + 100ms delay
  const getEstimate = (count: number) => {
    // ~5 por lote, ~100ms delay, ~300ms avg por site com keep-alive
    const batches = Math.ceil(count / 5)
    const secs = Math.max(3, Math.ceil(batches * 0.4 + count * 0.06))
    if (secs < 10) return `~${secs} segundos`
    if (secs < 60) return `~${secs} segundos`
    if (secs < 120) return `~1 minuto`
    return `~${Math.ceil(secs / 60)} minutos`
  }

  // --- Seleção ---

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredSites.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredSites.map(s => s.id)))
    }
  }

  const toggleSelectPage = () => {
    const pageIds = paginatedSites.map(s => s.id)
    const allSelected = pageIds.every(id => selectedIds.has(id))
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (allSelected) {
        pageIds.forEach(id => next.delete(id))
      } else {
        pageIds.forEach(id => next.add(id))
      }
      return next
    })
  }

  const handleCheckClick = (mode: 'all' | 'selected' | 'delete-selected' = 'all') => {
    if (mode === 'delete-selected') {
      if (selectedIds.size === 0) {
        toast.warning('Selecione sites para remover')
        return
      }
      setConfirmMode('delete-selected')
      setConfirmOpen(true)
      return
    }
    const count = mode === 'selected' ? selectedIds.size : sites.length
    if (count === 0) {
      toast.warning(mode === 'selected' ? 'Selecione sites para verificar' : 'Adicione sites antes de verificar')
      return
    }
    setConfirmMode(mode)
    setConfirmOpen(true)
  }

  // Remover sites selecionados em massa
  const removeSelectedSites = async () => {
    setConfirmOpen(false)
    const ids = Array.from(selectedIds)
    try {
      await api.removeMonitoredSitesBulk(ids)
      setSites(prev => prev.filter(s => !selectedIds.has(s.id)))
      toast.success(`${ids.length} site${ids.length > 1 ? 's' : ''} removido${ids.length > 1 ? 's' : ''}`)
      setSelectedIds(new Set())
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao remover sites')
    }
  }

  // Verificar um único site
  const checkSingleSite = async (siteId: string) => {
    setCheckingIds(prev => new Set(prev).add(siteId))
    setSites(prev =>
      prev.map(s => s.id === siteId ? { ...s, status: 'pending' as SiteStatus, statusCode: null } : s)
    )
    try {
      const result = await api.checkAllSites([siteId])
      setSites(prev =>
        prev.map(site => {
          const updated = result.results.find((r: { id: string }) => r.id === site.id)
          if (updated) {
            return { ...site, status: updated.status, statusCode: updated.statusCode, ipAddress: updated.ipAddress, nameServers: updated.nameServers || site.nameServers, lastChecked: updated.lastChecked }
          }
          return site
        })
      )
      const r = result.results[0]
      if (r) {
        if (r.status === 'online') toast.success(`${r.url} está online`)
        else if (r.status === 'ssl') toast.warning(`${r.url} online, mas sem SSL`)
        else toast.error(`${r.url} está offline`)
      }
      // Atualizar histórico
      loadHistory()
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erro ao verificar site'
      toast.error(msg)
      await loadSites()
    } finally {
      setCheckingIds(prev => {
        const next = new Set(prev)
        next.delete(siteId)
        return next
      })
    }
  }

  const startProgressTimer = (count: number) => {
    setCheckProgress(0)
    setCheckElapsed(0)
    const startTime = Date.now()
    const batches = Math.ceil(count / 5)
    const estimatedMs = Math.max(3, Math.ceil(batches * 0.4 + count * 0.06)) * 1000

    checkTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime
      setCheckElapsed(Math.floor(elapsed / 1000))
      // Curva de progresso com desaceleração suave ao final
      const ratio = elapsed / estimatedMs
      const progress = ratio < 1 ? ratio * 90 : 90 + (1 - Math.exp(-(ratio - 1) * 3)) * 8
      setCheckProgress(Math.min(progress, 98))
    }, 200)
  }

  const stopProgressTimer = () => {
    if (checkTimerRef.current) {
      clearInterval(checkTimerRef.current)
      checkTimerRef.current = null
    }
    setCheckProgress(100)
  }

  const formatElapsed = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}m ${s}s`
  }

  const checkAllSites = async () => {
    setConfirmOpen(false)

    const idsToCheck = confirmMode === 'selected' ? Array.from(selectedIds) : undefined
    const count = idsToCheck ? idsToCheck.length : sites.length

    setChecking(true)
    startProgressTimer(count)

    // Marcar sites relevantes como pending
    setSites(prev =>
      prev.map(s => {
        if (!idsToCheck || idsToCheck.includes(s.id)) {
          return { ...s, status: 'pending' as SiteStatus, statusCode: null }
        }
        return s
      })
    )

    try {
      const result = await api.checkAllSites(idsToCheck)

      // Atualizar sites com os resultados
      setSites(prev =>
        prev.map(site => {
          const updated = result.results.find((r: { id: string }) => r.id === site.id)
          if (updated) {
            return {
              ...site,
              status: updated.status,
              statusCode: updated.statusCode,
              ipAddress: updated.ipAddress,
              nameServers: updated.nameServers || site.nameServers,
              lastChecked: updated.lastChecked,
            }
          }
          return site
        })
      )

      // Salvar timestamp da última verificação global
      if (!idsToCheck) {
        setLastGlobalCheck(Date.now())
      }

      const onlineResults = result.results.filter((r: { status: string }) => r.status === 'online').length
      const sslResults = result.results.filter((r: { status: string }) => r.status === 'ssl').length
      const offlineResults = result.results.filter((r: { status: string }) => r.status === 'offline').length

      const parts: string[] = []
      if (onlineResults > 0) parts.push(`${onlineResults} online`)
      if (sslResults > 0) parts.push(`${sslResults} sem SSL`)
      if (offlineResults > 0) parts.push(`${offlineResults} offline`)

      if (offlineResults === 0 && sslResults === 0) {
        toast.success(`Verificação concluída! Todos os ${onlineResults} sites estão online.`)
      } else if (offlineResults === 0) {
        toast.warning(`Verificação concluída: ${parts.join(', ')}.`)
      } else {
        toast.error(`Verificação concluída: ${parts.join(', ')}.`)
      }

      // Limpar seleção após verificação bem-sucedida
      if (idsToCheck) setSelectedIds(new Set())

      // Atualizar histórico
      loadHistory()
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erro ao verificar sites'
      toast.error(msg)
      await loadSites()
    } finally {
      stopProgressTimer()
      setChecking(false)
    }
  }

  // Cleanup timer on unmount
  React.useEffect(() => {
    return () => {
      if (checkTimerRef.current) clearInterval(checkTimerRef.current)
    }
  }, [])

  // --- Importação CSV ---

  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Resetar input para permitir reimportar o mesmo arquivo
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }

    if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      toast.error('Selecione um arquivo .csv ou .txt')
      return
    }

    setImporting(true)

    try {
      const text = await file.text()
      const lines = text
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(Boolean)

      if (lines.length === 0) {
        toast.error('Arquivo vazio')
        return
      }

      // Detectar se tem cabeçalho (primeira linha contém "url" ou "site" ou "link")
      const firstLine = lines[0].toLowerCase()
      const hasHeader = firstLine.includes('url') || firstLine.includes('site') || firstLine.includes('link') || firstLine.includes('dominio') || firstLine.includes('domain')
      const dataLines = hasHeader ? lines.slice(1) : lines

      // Extrair URLs: pega o primeiro campo de cada linha CSV, ou a linha inteira se não for CSV
      const urls: string[] = []
      for (const line of dataLines) {
        // Suporte a CSV com separadores , ou ;
        const parts = line.split(/[,;]/)
        const rawUrl = parts[0].trim().replace(/^"|"$/g, '')
        if (!rawUrl) continue

        if (isValidUrl(rawUrl)) {
          urls.push(normalizeUrl(rawUrl))
        }
      }

      if (urls.length === 0) {
        toast.error('Nenhuma URL válida encontrada no arquivo')
        return
      }

      const result = await api.importMonitoredSites(urls)
      setSites(result.sites)

      const msgs: string[] = []
      if (result.imported > 0) msgs.push(`${result.imported} importado(s)`)
      if (result.skipped > 0) msgs.push(`${result.skipped} já existente(s)`)
      if (result.invalid > 0) msgs.push(`${result.invalid} ignorada(s) por endereço não permitido`)
      toast.success(`Importação concluída: ${msgs.join(', ')}`)
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erro ao importar CSV'
      toast.error(msg)
    } finally {
      setImporting(false)
    }
  }

  // --- Exportar CSV dos sites selecionados ---
  const exportSelectedCSV = () => {
    const selected = sites.filter(s => selectedIds.has(s.id))
    if (selected.length === 0) {
      toast.warning('Selecione sites para exportar')
      return
    }

    const header = 'URL,Status,Código HTTP,IP,Name Servers,Última Verificação'
    const rows = selected.map(s => {
      const lastCheck = s.lastChecked
        ? new Date(s.lastChecked).toLocaleString('pt-BR')
        : ''
      const statusLabel = s.status === 'online' ? 'Online'
        : s.status === 'ssl' ? 'Sem SSL'
        : s.status === 'offline' ? 'Offline'
        : 'Pendente'
      return [
        `"${s.url}"`,
        statusLabel,
        s.statusCode ?? '',
        s.ipAddress ?? '',
        `"${(s.nameServers || []).join('; ')}"`,
        `"${lastCheck}"`,
      ].join(',')
    })

    const bom = '\uFEFF'
    const csv = bom + [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sites-selecionados-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`${selected.length} site${selected.length > 1 ? 's' : ''} exportado${selected.length > 1 ? 's' : ''}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addSite()
    }
  }

  // --- Filtragem Avançada ---

  const getFilteredSites = (): MonitoredSite[] => {
    let filtered = sites

    // Filtro composto (presets)
    switch (compositeFilter) {
      case 'all':
        break
      case 'online':
        filtered = filtered.filter(s => s.status === 'online')
        break
      case 'offline':
        filtered = filtered.filter(s => s.status === 'offline')
        break
      case 'ssl':
        filtered = filtered.filter(s => s.status === 'ssl')
        break
      case 'pending':
        filtered = filtered.filter(s => s.status === 'pending')
        break
      case 'offline+ssl': {
        // Sites que estão OFFLINE e que em algum histórico tiveram problema de SSL, OU ambos os problemas
        const offlineIds = new Set(sites.filter(s => s.status === 'offline').map(s => s.id))
        const sslIds = new Set(sites.filter(s => s.status === 'ssl').map(s => s.id))
        filtered = filtered.filter(s => offlineIds.has(s.id) || sslIds.has(s.id))
        break
      }
      case 'online+ssl':
        filtered = filtered.filter(s => s.status === 'ssl')
        break
      case 'online+healthy':
        filtered = filtered.filter(s => s.status === 'online')
        break
      case 'went-down':
        filtered = filtered.filter(s => statusChanges.wentDown.includes(s.id))
        break
      case 'came-up':
        filtered = filtered.filter(s => statusChanges.cameUp.includes(s.id))
        break
      case 'never-checked':
        filtered = filtered.filter(s => !s.lastChecked)
        break
      case 'low-uptime':
        filtered = filtered.filter(s => statusChanges.lowUptime.includes(s.id))
        break
    }

    // Filtro por status simples (compatibilidade)
    if (filter !== 'all' && compositeFilter === 'all') {
      filtered = filtered.filter(s => s.status === filter)
    }

    // Filtro por Name Server
    if (nsFilter !== 'all') {
      filtered = filtered.filter(s =>
        (s.nameServers || []).some(ns => ns.includes(nsFilter))
      )
    }

    // Filtro por IP
    if (ipFilter !== 'all') {
      filtered = filtered.filter(s => s.ipAddress === ipFilter)
    }

    // Filtro por busca textual
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(s =>
        s.url.toLowerCase().includes(term) ||
        (s.ipAddress && s.ipAddress.includes(term)) ||
        (s.nameServers || []).some(ns => ns.toLowerCase().includes(term))
      )
    }

    // Ordenação
    if (sortOption !== 'default') {
      filtered = [...filtered].sort((a, b) => {
        switch (sortOption) {
          case 'url-asc':
            return a.url.localeCompare(b.url)
          case 'url-desc':
            return b.url.localeCompare(a.url)
          case 'status': {
            const order: Record<SiteStatus, number> = { offline: 0, ssl: 1, pending: 2, online: 3 }
            return order[a.status] - order[b.status]
          }
          case 'last-checked': {
            const tA = a.lastChecked ?? 0
            const tB = b.lastChecked ?? 0
            return tB - tA // mais recente primeiro
          }
          case 'uptime-asc': {
            const uptimeA = getUptimePercentage(checkHistory[a.id] || []) ?? 100
            const uptimeB = getUptimePercentage(checkHistory[b.id] || []) ?? 100
            return uptimeA - uptimeB
          }
          case 'uptime-desc': {
            const uptimeA = getUptimePercentage(checkHistory[a.id] || []) ?? 0
            const uptimeB = getUptimePercentage(checkHistory[b.id] || []) ?? 0
            return uptimeB - uptimeA
          }
          case 'ns-asc': {
            const nsA = (a.nameServers || [])[0] || ''
            const nsB = (b.nameServers || [])[0] || ''
            return nsA.localeCompare(nsB)
          }
          case 'ns-desc': {
            const nsA = (a.nameServers || [])[0] || ''
            const nsB = (b.nameServers || [])[0] || ''
            return nsB.localeCompare(nsA)
          }
          default:
            return 0
        }
      })
    }

    return filtered
  }

  const filteredSites = getFilteredSites()

  // Contadores para os presets de filtros
  const filterCounts = React.useMemo<Record<CompositeFilter, number>>(() => {
    const offlineAndSsl = sites.filter(s => s.status === 'offline' || s.status === 'ssl').length
    return {
      all: totalSites,
      online: onlineCount,
      offline: offlineCount,
      ssl: sslCount,
      pending: pendingCount,
      'offline+ssl': offlineAndSsl,
      'online+ssl': sslCount,
      'online+healthy': onlineCount,
      'went-down': wentDownCount,
      'came-up': cameUpCount,
      'never-checked': neverCheckedCount,
      'low-uptime': lowUptimeCount,
    }
  }, [totalSites, onlineCount, offlineCount, sslCount, pendingCount, wentDownCount, cameUpCount, neverCheckedCount, lowUptimeCount, sites])

  // NS providers e IPs únicos para os dropdowns de filtros
  const nsProviders = React.useMemo(() => {
    const providerMap = new Map<string, number>()
    for (const site of sites) {
      for (const ns of (site.nameServers || [])) {
        // Extrair provider do NS (ex: ns1.cloudflare.com -> cloudflare.com)
        const parts = ns.split('.')
        const provider = parts.length >= 2 ? parts.slice(-2).join('.') : ns
        providerMap.set(provider, (providerMap.get(provider) || 0) + 1)
      }
    }
    return Array.from(providerMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([provider, count]) => ({ provider, count }))
  }, [sites])

  const uniqueIps = React.useMemo(() => {
    const ipMap = new Map<string, number>()
    for (const site of sites) {
      if (site.ipAddress) {
        ipMap.set(site.ipAddress, (ipMap.get(site.ipAddress) || 0) + 1)
      }
    }
    return Array.from(ipMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([ip, count]) => ({ ip, count }))
  }, [sites])

  // --- Paginação ---
  const totalPages = Math.max(1, Math.ceil(filteredSites.length / ITEMS_PER_PAGE))
  const safePage = Math.min(currentPage, totalPages)
  const paginatedSites = filteredSites.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  )

  // Reset página ao mudar filtros
  React.useEffect(() => {
    setCurrentPage(1)
  }, [filter, compositeFilter, searchTerm, sortOption, nsFilter, ipFilter])

  // Carregar última verificação global dos sites existentes
  React.useEffect(() => {
    if (sites.length > 0) {
      const checked = sites.filter(s => s.lastChecked).map(s => s.lastChecked!)
      if (checked.length > 0) {
        // Usar o mais recente como indicador da última verificação
        const maxTs = Math.max(...checked)
        // Só contar como "verificação global" se muitos sites foram verificados no mesmo timestamp (±5s)
        const nearMax = checked.filter(ts => Math.abs(ts - maxTs) < 5000)
        if (nearMax.length >= Math.min(sites.length, 5)) {
          setLastGlobalCheck(maxTs)
        }
      }
    }
  }, [loading]) // eslint-disable-line react-hooks/exhaustive-deps

  // --- Render ---

  return (
    <div className="space-y-6 pb-6">
      <PageHeader
        title="Down Detector"
        description="Monitore a disponibilidade dos seus sites e detecte instabilidades"
      />

      {/* Cards de Métricas */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        <Card className="border-transparent bg-card overflow-hidden cursor-pointer hover:ring-2 ring-primary/30 transition-all"
          onClick={() => { setCompositeFilter('all'); setFilter('all') }}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Globe className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">Total</p>
              <p className="text-lg font-bold">{totalSites}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-transparent bg-card overflow-hidden cursor-pointer hover:ring-2 ring-emerald-500/30 transition-all"
          onClick={() => { setCompositeFilter('online'); setFilter('all') }}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">Online</p>
              <p className="text-lg font-bold text-emerald-500">{onlineCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-transparent bg-card overflow-hidden cursor-pointer hover:ring-2 ring-red-500/30 transition-all"
          onClick={() => { setCompositeFilter('offline'); setFilter('all') }}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-500/10">
              <XCircle className="h-4 w-4 text-red-500" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">Offline</p>
              <p className="text-lg font-bold text-red-500">{offlineCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-transparent bg-card overflow-hidden cursor-pointer hover:ring-2 ring-orange-500/30 transition-all"
          onClick={() => { setCompositeFilter('ssl'); setFilter('all') }}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-500/10">
              <ShieldAlert className="h-4 w-4 text-orange-500" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">Sem SSL</p>
              <p className="text-lg font-bold text-orange-500">{sslCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-transparent bg-card overflow-hidden cursor-pointer hover:ring-2 ring-amber-500/30 transition-all"
          onClick={() => { setCompositeFilter('pending'); setFilter('all') }}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">Pendentes</p>
              <p className="text-lg font-bold text-amber-500">{pendingCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className={`border-transparent overflow-hidden cursor-pointer hover:ring-2 transition-all ${
          wentDownCount > 0 ? 'bg-red-500/5 ring-red-600/30' : 'bg-card ring-primary/30'
        }`}
          onClick={() => { setCompositeFilter('went-down'); setFilter('all') }}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
              wentDownCount > 0 ? 'bg-red-600/10' : 'bg-muted'
            }`}>
              <TrendingDown className={`h-4 w-4 ${wentDownCount > 0 ? 'text-red-600' : 'text-muted-foreground'}`} />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">Caíram</p>
              <p className={`text-lg font-bold ${wentDownCount > 0 ? 'text-red-600' : 'text-muted-foreground'}`}>{wentDownCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Banner de Status Geral */}
      {totalSites > 0 && (
        <div className="space-y-2">
          <Card className={`border-transparent overflow-hidden ${
            allOnline
              ? 'bg-emerald-500/5 border-emerald-500/20'
              : offlineCount > 0
                ? 'bg-red-500/5 border-red-500/20'
                : sslCount > 0
                  ? 'bg-orange-500/5 border-orange-500/20'
                  : 'bg-card'
          }`}>
            <CardContent className="p-4 flex items-center gap-3">
              {allOnline ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <p className="text-sm font-medium text-emerald-500">
                    Todos os {totalSites} sites estão online e operando normalmente
                  </p>
                </>
              ) : allHealthy && sslCount > 0 ? (
                <>
                  <ShieldAlert className="h-5 w-5 text-orange-500" />
                  <p className="text-sm font-medium text-orange-500">
                    {sslCount} site{sslCount > 1 ? 's' : ''} online mas sem certificado SSL válido
                  </p>
                </>
              ) : offlineCount > 0 ? (
                <>
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <p className="text-sm font-medium text-red-500">
                    {offlineCount} site{offlineCount > 1 ? 's' : ''} com instabilidade detectada
                    {sslCount > 0 ? ` · ${sslCount} sem SSL` : ''}
                  </p>
                </>
              ) : (
                <>
                  <Activity className="h-5 w-5 text-muted-foreground" />
                  <p className="text-sm font-medium text-muted-foreground">
                    Execute a verificação para checar o status dos sites
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Alerta de sites que caíram */}
          {wentDownCount > 0 && (
            <Card className="border-red-600/20 bg-red-600/5 overflow-hidden">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-sm font-medium text-red-600">
                      {wentDownCount} site{wentDownCount > 1 ? 's' : ''} caíram desde a última verificação
                    </p>
                    <p className="text-[11px] text-red-600/70">
                      Sites que estavam online e agora estão offline
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-600/30 text-red-600 hover:bg-red-600/10 gap-1.5"
                  onClick={() => { setCompositeFilter('went-down'); setFilter('all') }}
                >
                  <Filter className="h-3.5 w-3.5" />
                  Ver sites
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Alerta de sites que voltaram */}
          {cameUpCount > 0 && (
            <Card className="border-sky-500/20 bg-sky-500/5 overflow-hidden">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Activity className="h-5 w-5 text-sky-500" />
                  <div>
                    <p className="text-sm font-medium text-sky-500">
                      {cameUpCount} site{cameUpCount > 1 ? 's' : ''} voltaram a funcionar
                    </p>
                    <p className="text-[11px] text-sky-500/70">
                      Sites que estavam offline e agora estão online
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-sky-500/30 text-sky-500 hover:bg-sky-500/10 gap-1.5"
                  onClick={() => { setCompositeFilter('came-up'); setFilter('all') }}
                >
                  <Filter className="h-3.5 w-3.5" />
                  Ver sites
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Loader de verificação */}
      {checking && (
        <Card className="border-primary/20 bg-primary/5 overflow-hidden">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 text-primary animate-spin" />
              <div className="flex-1">
                <p className="text-sm font-medium text-primary">
                  Verificando {confirmMode === 'selected' ? selectedIds.size : sites.length} site{(confirmMode === 'selected' ? selectedIds.size : sites.length) > 1 ? 's' : ''}...
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {Math.round(checkProgress)}% concluído · {formatElapsed(checkElapsed)} decorrido{checkProgress < 95 ? ` · estimado ${getEstimate(confirmMode === 'selected' ? selectedIds.size : sites.length)}` : ''}
                </p>
              </div>
            </div>
            <Progress value={checkProgress} className="h-2" />
          </CardContent>
        </Card>
      )}

      {/* Adicionar URL + Verificar + Importar CSV */}
      <Card className="border-transparent bg-card overflow-hidden gap-4 py-4">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Plus className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold">Adicionar Site</CardTitle>
              <CardDescription className="text-[11px]">
                Informe a URL do site que deseja monitorar ou importe via CSV
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={inputUrl}
              onChange={e => setInputUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ex: google.com ou https://meusite.com.br"
              className="flex-1"
              disabled={checking}
            />
            <Button onClick={addSite} size="sm" className="shrink-0 gap-1.5" disabled={checking}>
              <Plus className="h-4 w-4" />
              Adicionar
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => handleCheckClick('all')}
              variant="outline"
              size="sm"
              className="gap-1.5"
              disabled={checking || sites.length === 0}
            >
              {checking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {checking ? 'Verificando...' : 'Verificar todos'}
            </Button>
            {selectedIds.size > 0 && (
              <>
                <Button
                  onClick={() => handleCheckClick('selected')}
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  disabled={checking}
                >
                  <RefreshCw className="h-4 w-4" />
                  Verificar selecionados ({selectedIds.size})
                </Button>
                <Button
                  onClick={exportSelectedCSV}
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  disabled={checking}
                >
                  <Download className="h-4 w-4" />
                  Exportar CSV ({selectedIds.size})
                </Button>
                <Button
                  onClick={() => handleCheckClick('delete-selected')}
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-destructive hover:text-destructive"
                  disabled={checking}
                >
                  <Trash className="h-4 w-4" />
                  Remover ({selectedIds.size})
                </Button>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt"
              className="hidden"
              onChange={handleCSVImport}
            />
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              disabled={importing || checking}
              onClick={() => fileInputRef.current?.click()}
            >
              {importing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {importing ? 'Importando...' : 'Importar CSV'}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground">
            O CSV deve conter uma URL por linha (ou na primeira coluna). Cabeçalhos são detectados automaticamente.
          </p>
        </CardContent>
      </Card>

      {/* Lista de Sites */}
      <Card className="border-transparent bg-card overflow-hidden gap-4 py-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Activity className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">Sites Monitorados</CardTitle>
                <CardDescription className="text-[11px]">
                  {filteredSites.length} de {totalSites} site{totalSites !== 1 ? 's' : ''}
                  {selectedIds.size > 0 && ` · ${selectedIds.size} selecionado${selectedIds.size !== 1 ? 's' : ''}`}
                </CardDescription>
              </div>
            </div>
            {lastGlobalCheck && (
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground bg-muted/60 px-2.5 py-1.5 rounded-lg">
                <Clock className="h-3 w-3" />
                Última verificação: {new Date(lastGlobalCheck).toLocaleString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Barra de Busca + Filtros + Ordenação */}
          <div className="flex flex-col gap-3">
            {/* Linha principal: Busca + Botão filtros + Ordenação */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Buscar por URL, IP ou NS..."
                  className="pl-8 h-9 text-sm"
                />
              </div>
              <Button
                variant={showFilterPanel ? 'default' : 'outline'}
                size="sm"
                className="gap-1.5 h-9 shrink-0"
                onClick={() => setShowFilterPanel(v => !v)}
              >
                <Filter className="h-4 w-4" />
                Filtros
                {(compositeFilter !== 'all' || nsFilter !== 'all' || ipFilter !== 'all') && (
                  <Badge className="ml-1 h-4 px-1.5 text-[9px] bg-primary/20 text-primary border-0">
                    {[compositeFilter !== 'all', nsFilter !== 'all', ipFilter !== 'all'].filter(Boolean).length}
                  </Badge>
                )}
              </Button>
              <Select value={sortOption} onValueChange={(v) => setSortOption(v as SortOption)}>
                <SelectTrigger className="w-full sm:w-[180px] h-9 text-sm">
                  <div className="flex items-center gap-1.5">
                    {sortOption.includes('asc') ? <SortAsc className="h-3.5 w-3.5" /> : sortOption.includes('desc') ? <SortDesc className="h-3.5 w-3.5" /> : null}
                    <SelectValue placeholder="Ordenar por..." />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Padrão</SelectItem>
                  <SelectItem value="url-asc">URL (A → Z)</SelectItem>
                  <SelectItem value="url-desc">URL (Z → A)</SelectItem>
                  <SelectItem value="status">Status (problemas primeiro)</SelectItem>
                  <SelectItem value="last-checked">Última verificação</SelectItem>
                  <SelectItem value="uptime-asc">Uptime (menor →  maior)</SelectItem>
                  <SelectItem value="uptime-desc">Uptime (maior → menor)</SelectItem>
                  <SelectItem value="ns-asc">NS (A → Z)</SelectItem>
                  <SelectItem value="ns-desc">NS (Z → A)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Painel de filtros preset (chips) */}
            {showFilterPanel && (
              <div className="space-y-3 p-3 bg-muted/30 rounded-lg border border-border/50">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Filtros Rápidos</p>
                  {compositeFilter !== 'all' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-[11px] gap-1 text-muted-foreground hover:text-foreground"
                      onClick={() => { setCompositeFilter('all'); setFilter('all'); setNsFilter('all'); setIpFilter('all') }}
                    >
                      <X className="h-3 w-3" />
                      Limpar filtro
                    </Button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {FILTER_PRESETS.map(preset => {
                    const count = filterCounts[preset.id]
                    const isActive = compositeFilter === preset.id
                    return (
                      <TooltipProvider key={preset.id} delayDuration={300}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => {
                                setCompositeFilter(preset.id)
                                setFilter('all')
                              }}
                              className={`
                                inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all
                                ${isActive
                                  ? `${preset.color} ring-2 ring-current/30 shadow-sm`
                                  : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                                }
                                ${count === 0 && !isActive ? 'opacity-50' : ''}
                              `}
                              disabled={checking}
                            >
                              {preset.icon}
                              {preset.label}
                              <span className={`text-[10px] font-bold tabular-nums ${isActive ? '' : 'text-muted-foreground/70'}`}>
                                {count}
                              </span>
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="text-[11px]">
                            {preset.description}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )
                  })}
                </div>

                {/* Filtro ativo descritivo */}
                {compositeFilter !== 'all' && (
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground bg-background/50 rounded-md px-3 py-2">
                    <Filter className="h-3 w-3" />
                    Filtro ativo: <span className="font-semibold text-foreground">{FILTER_PRESETS.find(p => p.id === compositeFilter)?.label}</span>
                    — mostrando {filteredSites.length} de {totalSites} sites
                  </div>
                )}

                {/* Filtros por NS e IP */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {nsProviders.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      <Server className="h-3 w-3 text-muted-foreground" />
                      <Select value={nsFilter} onValueChange={setNsFilter}>
                        <SelectTrigger className="h-7 text-[11px] w-[200px]">
                          <SelectValue placeholder="Name Server..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos os NS</SelectItem>
                          {nsProviders.map(({ provider, count }) => (
                            <SelectItem key={provider} value={provider}>
                              {provider} ({count})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {uniqueIps.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      <Wifi className="h-3 w-3 text-muted-foreground" />
                      <Select value={ipFilter} onValueChange={setIpFilter}>
                        <SelectTrigger className="h-7 text-[11px] w-[200px]">
                          <SelectValue placeholder="Endereço IP..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos os IPs</SelectItem>
                          {uniqueIps.map(({ ip, count }) => (
                            <SelectItem key={ip} value={ip}>
                              {ip} ({count})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {(nsFilter !== 'all' || ipFilter !== 'all') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-[11px] gap-1 text-muted-foreground hover:text-foreground"
                      onClick={() => { setNsFilter('all'); setIpFilter('all') }}
                    >
                      <X className="h-3 w-3" />
                      Limpar NS/IP
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Chip do filtro ativo (quando painel fechado) */}
            {!showFilterPanel && (compositeFilter !== 'all' || nsFilter !== 'all' || ipFilter !== 'all') && (
              <div className="flex items-center gap-2 flex-wrap">
                {compositeFilter !== 'all' && (
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium ${
                    FILTER_PRESETS.find(p => p.id === compositeFilter)?.color || ''
                  }`}>
                    <Filter className="h-3 w-3" />
                    {FILTER_PRESETS.find(p => p.id === compositeFilter)?.label}
                    <span className="font-bold tabular-nums">({filteredSites.length})</span>
                    <button
                      onClick={() => { setCompositeFilter('all'); setFilter('all') }}
                      className="ml-1 hover:opacity-70"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {nsFilter !== 'all' && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-violet-500/10 text-violet-500">
                    <Server className="h-3 w-3" />
                    NS: {nsFilter}
                    <button
                      onClick={() => setNsFilter('all')}
                      className="ml-1 hover:opacity-70"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {ipFilter !== 'all' && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-cyan-500/10 text-cyan-500">
                    <Wifi className="h-3 w-3" />
                    IP: {ipFilter}
                    <button
                      onClick={() => setIpFilter('all')}
                      className="ml-1 hover:opacity-70"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <Separator />

          {/* Loading state */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Loader2 className="h-8 w-8 text-primary animate-spin mb-3" />
              <p className="text-sm text-muted-foreground">Carregando sites...</p>
            </div>
          ) : filteredSites.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Globe className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">
                {totalSites === 0
                  ? 'Nenhum site monitorado ainda'
                  : 'Nenhum site encontrado com os filtros atuais'}
              </p>
              <p className="text-[11px] text-muted-foreground/70 mt-1">
                {totalSites === 0
                  ? 'Adicione uma URL acima para começar'
                  : 'Ajuste os filtros para exibir resultados'}
              </p>
            </div>
          ) : (
            <>
              {/* Header da lista com checkbox de seleção */}
              <div className="flex items-center gap-3 px-3 py-1.5">
                <Checkbox
                  checked={
                    paginatedSites.length > 0 && paginatedSites.every(s => selectedIds.has(s.id))
                      ? true
                      : paginatedSites.some(s => selectedIds.has(s.id))
                        ? 'indeterminate'
                        : false
                  }
                  onCheckedChange={toggleSelectPage}
                  disabled={checking}
                  className="shrink-0"
                />
                <p className="text-[11px] text-muted-foreground flex-1">
                  Selecionar página
                  {filteredSites.length > ITEMS_PER_PAGE && (
                    <button
                      onClick={toggleSelectAll}
                      className="ml-2 text-primary hover:underline"
                      disabled={checking}
                    >
                      {selectedIds.size === filteredSites.length ? 'Limpar todos' : `Selecionar todos (${filteredSites.length})`}
                    </button>
                  )}
                </p>
              </div>

              <div className="space-y-1">
                {paginatedSites.map((site) => {
                  const isCheckingSingle = checkingIds.has(site.id)
                  const isSelected = selectedIds.has(site.id)
                  const siteChange = detectStatusChange(checkHistory[site.id] || [])
                  const siteUptime = getUptimePercentage(checkHistory[site.id] || [])

                  return (
                    <div
                      key={site.id}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/50 group ${
                        checking && !checkingIds.has(site.id) ? 'opacity-70' : ''
                      } ${isSelected ? 'bg-primary/5' : ''} ${
                        siteChange === 'went-down' ? 'ring-1 ring-red-500/30 bg-red-500/5' : ''
                      }`}
                    >
                      {/* Checkbox de seleção */}
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleSelect(site.id)}
                        disabled={checking}
                        className="shrink-0"
                      />

                      {/* Ícone de status */}
                      {(checking && !isCheckingSingle) || isCheckingSingle ? (
                        <Loader2 className="h-4 w-4 text-muted-foreground animate-spin shrink-0" />
                      ) : (
                        <span className="shrink-0">{statusIcon(site.status)}</span>
                      )}

                      {/* URL + IP + Change Indicator */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <a
                            href={site.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium truncate hover:underline text-primary"
                          >
                            {site.url}
                          </a>
                          {site.ipAddress && (
                            <span className="text-[10px] font-mono text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded shrink-0 hidden sm:inline">
                              {site.ipAddress}
                            </span>
                          )}
                          {siteChange === 'went-down' && (
                            <Badge className="bg-red-600/15 text-red-600 hover:bg-red-600/25 border-0 text-[9px] gap-0.5 shrink-0 hidden sm:inline-flex">
                              <TrendingDown className="h-2.5 w-2.5" />
                              Caiu
                            </Badge>
                          )}
                          {siteChange === 'came-up' && (
                            <Badge className="bg-sky-500/15 text-sky-500 hover:bg-sky-500/25 border-0 text-[9px] gap-0.5 shrink-0 hidden sm:inline-flex">
                              <Activity className="h-2.5 w-2.5" />
                              Voltou
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {site.lastChecked && (
                            <p className="text-[10px] text-muted-foreground">
                              Verificado em {new Date(site.lastChecked).toLocaleString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          )}
                          {siteUptime !== null && (
                            <span className={`text-[9px] font-semibold tabular-nums ${
                              siteUptime >= 99 ? 'text-emerald-500' : siteUptime >= 90 ? 'text-amber-500' : 'text-red-500'
                            }`}>
                              ↑{siteUptime.toFixed(0)}%
                            </span>
                          )}
                          {site.nameServers && site.nameServers.length > 0 && (
                            <TooltipProvider delayDuration={200}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="text-[10px] font-mono text-violet-500 bg-violet-500/10 px-1.5 py-0.5 rounded shrink-0 hidden sm:inline-flex items-center gap-1 cursor-default">
                                    <Server className="h-2.5 w-2.5" />
                                    {(() => {
                                      const parts = site.nameServers[0].split('.')
                                      return parts.length >= 2 ? parts.slice(-2).join('.') : site.nameServers[0]
                                    })()}
                                    {site.nameServers.length > 1 && (
                                      <span className="text-violet-400">+{site.nameServers.length - 1}</span>
                                    )}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="text-[11px] max-w-[300px]">
                                  <p className="font-semibold mb-1">Name Servers:</p>
                                  {site.nameServers.map((ns, i) => (
                                    <p key={i} className="font-mono">{ns}</p>
                                  ))}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                        {/* Mini uptime chart */}
                        <div className="mt-1 hidden sm:block">
                          <UptimeChart history={checkHistory[site.id] || []} />
                        </div>
                      </div>

                      {/* Badge de status */}
                      {isCheckingSingle ? (
                        <Badge variant="secondary" className="text-[10px] gap-1">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Verificando
                        </Badge>
                      ) : checking ? (
                        <Badge variant="secondary" className="text-[10px] gap-1">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Verificando
                        </Badge>
                      ) : (
                        statusBadge(site.status, site.statusCode)
                      )}

                      {/* Verificar individual */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary"
                        onClick={() => checkSingleSite(site.id)}
                        disabled={checking || isCheckingSingle}
                        title="Verificar este site"
                      >
                        {isCheckingSingle ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <RefreshCw className="h-3.5 w-3.5" />
                        )}
                      </Button>

                      {/* Remover */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                        onClick={() => removeSite(site.id)}
                        disabled={checking || isCheckingSingle}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )
                })}
              </div>

              {/* Paginação */}
              {totalPages > 1 && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between px-1">
                    <p className="text-[11px] text-muted-foreground">
                      Mostrando {((safePage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(safePage * ITEMS_PER_PAGE, filteredSites.length)} de {filteredSites.length}
                    </p>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setCurrentPage(1)}
                        disabled={safePage === 1}
                      >
                        <ChevronsLeft className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={safePage === 1}
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </Button>
                      <span className="text-xs font-medium px-2 min-w-[60px] text-center">
                        {safePage} / {totalPages}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={safePage === totalPages}
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={safePage === totalPages}
                      >
                        <ChevronsRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal de confirmação */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {confirmMode === 'delete-selected' ? (
                <>
                  <Trash className="h-5 w-5 text-destructive" />
                  Confirmar remoção
                </>
              ) : (
                <>
                  <RefreshCw className="h-5 w-5" />
                  Confirmar verificação
                </>
              )}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              {confirmMode === 'delete-selected' ? (
                <>
                  <span className="block">
                    Serão removidos <strong>{selectedIds.size.toLocaleString('pt-BR')}</strong> site{selectedIds.size !== 1 ? 's' : ''} selecionado{selectedIds.size !== 1 ? 's' : ''}. Esta ação não pode ser desfeita.
                  </span>
                  <span className="flex items-center gap-2 text-sm bg-red-500/10 text-red-600 rounded-lg px-3 py-2">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    O histórico de verificações destes sites também será removido.
                  </span>
                </>
              ) : (
                <>
                  <span className="block">
                    {confirmMode === 'selected' ? (
                      <>Serão verificados <strong>{selectedIds.size.toLocaleString('pt-BR')}</strong> site{selectedIds.size !== 1 ? 's' : ''} selecionado{selectedIds.size !== 1 ? 's' : ''}.</>
                    ) : (
                      <>Serão verificados <strong>{sites.length.toLocaleString('pt-BR')}</strong> site{sites.length !== 1 ? 's' : ''}.</>
                    )}
                  </span>
                  <span className="flex items-center gap-2 text-sm bg-muted/60 rounded-lg px-3 py-2">
                    <Timer className="h-4 w-4 text-muted-foreground shrink-0" />
                    Tempo estimado: <strong>{getEstimate(confirmMode === 'selected' ? selectedIds.size : sites.length)}</strong>
                  </span>
                  {(confirmMode === 'selected' ? selectedIds.size : sites.length) > 100 && (
                    <span className="flex items-center gap-2 text-sm bg-amber-500/10 text-amber-600 rounded-lg px-3 py-2">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      Volume alto — a verificação pode demorar. Não feche esta página.
                    </span>
                  )}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            {confirmMode === 'delete-selected' ? (
              <AlertDialogAction onClick={removeSelectedSites} className="gap-1.5 bg-destructive text-destructive-foreground hover:bg-destructive/90">
                <Trash className="h-4 w-4" />
                Remover {selectedIds.size} site{selectedIds.size !== 1 ? 's' : ''}
              </AlertDialogAction>
            ) : (
              <AlertDialogAction onClick={checkAllSites} className="gap-1.5">
                <RefreshCw className="h-4 w-4" />
                Verificar
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default DownDetector
