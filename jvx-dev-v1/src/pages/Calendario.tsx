import * as React from 'react'
import { ChevronLeft, ChevronRight, Clock, DollarSign, AlertTriangle, CalendarCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/common'
import { useWorks } from '@/contexts/WorksContext'
import { formatCurrency, parseValue, formatDate } from '@/lib/utils'
import type { Work } from '@/types'
import { cn } from '@/lib/utils'

function Calendario() {
  const { works } = useWorks()
  const [currentDate, setCurrentDate] = React.useState(new Date())
  const [filterDeveloper, setFilterDeveloper] = React.useState('all')
  const [filterStatus, setFilterStatus] = React.useState('all')

  const developers = React.useMemo(() => {
    const devs = new Set(works.map(w => w.developer).filter(Boolean) as string[])
    return Array.from(devs).sort()
  }, [works])

  // Calcular status do projeto baseado em conclusão e pagamento
  const getProjectStatus = (work: Work) => {
    const projectDate = new Date(work.delivery_date)
    const todayRaw = new Date()
    const today = new Date(todayRaw.getFullYear(), todayRaw.getMonth(), todayRaw.getDate())

    const isPaid = work.payment_status === 'Pago'
    const isCompleted = work.developer_status === 'Concluído'

    // Prazo de pagamento: dia 5 do mês seguinte à data do projeto
    const paymentDeadline = new Date(projectDate.getFullYear(), projectDate.getMonth() + 1, 5)

    // 1. Finalizado — Concluído + Pago
    if (isCompleted && isPaid) {
      return {
        status: 'completed' as const,
        label: 'Finalizado',
        calendarColor: 'bg-emerald-500/80',
        textColor: 'text-white',
        days: 0,
        priority: 4
      }
    }

    // 2. Atrasado — Concluído, não pago, e hoje já passou o dia 5 do mês seguinte
    if (isCompleted && !isPaid && today >= paymentDeadline) {
      const daysLate = Math.ceil((today.getTime() - paymentDeadline.getTime()) / (1000 * 60 * 60 * 24))
      return {
        status: 'overdue' as const,
        label: 'Atrasado',
        calendarColor: 'bg-red-500/80',
        textColor: 'text-white',
        days: daysLate,
        priority: 1
      }
    }

    // 3. Pgto Pendente — Concluído, não pago, ainda dentro do prazo (antes do dia 5 do mês seguinte)
    if (isCompleted && !isPaid) {
      const daysUntilDeadline = Math.ceil((paymentDeadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      return {
        status: 'payment-pending' as const,
        label: 'Pgto. Pendente',
        calendarColor: 'bg-amber-500/80',
        textColor: 'text-white',
        days: daysUntilDeadline,
        priority: 2
      }
    }

    // 4. No Prazo — Dev ainda não concluiu
    const projectDay = new Date(projectDate.getFullYear(), projectDate.getMonth(), projectDate.getDate())
    const diff = Math.ceil((projectDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    const label = diff < 0 ? 'Em desenvolvimento' : diff === 0 ? 'Hoje' : `${diff}d restantes`
    return {
      status: 'ontime' as const,
      label,
      calendarColor: 'bg-sky-500/80',
      textColor: 'text-white',
      days: diff,
      priority: 3
    }
  }

  const filteredWorks = React.useMemo(() => {
    return works.filter(work => {
      const matchesDev = filterDeveloper === 'all' || work.developer === filterDeveloper
      const projectStatus = getProjectStatus(work)
      const matchesStatus = filterStatus === 'all' || projectStatus.status === filterStatus
      return matchesDev && matchesStatus
    })
  }, [works, filterDeveloper, filterStatus])

  // Gerar dias do mês
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Dias do mês anterior
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ date: null, isCurrentMonth: false })
    }
    
    // Dias do mês atual
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true })
    }
    
    return days
  }

  const getWorksForDate = (date: Date) => {
    return filteredWorks.filter(work => {
      const workDate = new Date(work.delivery_date)
      return workDate.toDateString() === date.toDateString()
    })
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const today = () => {
    setCurrentDate(new Date())
  }

  const days = getDaysInMonth()
  const monthName = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  // Estatísticas de projetos
  const projectStats = React.useMemo(() => {
    const stats = {
      overdue: 0,
      'payment-pending': 0,
      ontime: 0,
      completed: 0
    }
    
    filteredWorks.forEach(work => {
      const status = getProjectStatus(work)
      stats[status.status as keyof typeof stats]++
    })
    
    return stats
  }, [filteredWorks])

  return (
    <div className="space-y-6 pb-6">
      <PageHeader
        title="Calendário e Prazos"
        description="Visualize projetos no calendário e acompanhe prazos de entrega."
      />

      {/* Estatísticas de Projetos */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Card className="p-4 border-transparent bg-card">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-600">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Atrasados</p>
              <p className="text-xl font-bold tracking-tight text-red-600">{projectStats.overdue}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-transparent bg-card">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
              <DollarSign className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Pgto. Pendente</p>
              <p className="text-xl font-bold tracking-tight text-amber-600">{projectStats['payment-pending']}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-transparent bg-card">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">No Prazo</p>
              <p className="text-xl font-bold tracking-tight text-sky-600">{projectStats.ontime}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-transparent bg-card">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
              <CalendarCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Finalizados</p>
              <p className="text-xl font-bold tracking-tight text-emerald-600">{projectStats.completed}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Controles e Filtros */}
      <Card className="p-4 border-transparent bg-card">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={previousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={today}>
              Hoje
            </Button>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <h3 className="text-lg font-bold capitalize ml-2">{monthName}</h3>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Select value={filterDeveloper} onValueChange={setFilterDeveloper}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Desenvolvedor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {developers.map((dev) => (
                  <SelectItem key={dev} value={dev}>{dev}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="overdue">Atrasados</SelectItem>
                <SelectItem value="payment-pending">Pgto. Pendente</SelectItem>
                <SelectItem value="ontime">No Prazo</SelectItem>
                <SelectItem value="completed">Finalizados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Calendário */}
      <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
        {/* Cabeçalho dos dias da semana */}
        <div className="grid grid-cols-7 border-b bg-muted/50">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
            <div key={day} className="p-3 text-center text-sm font-semibold text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        {/* Dias do mês */}
        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            const worksForDay = day.date ? getWorksForDate(day.date) : []
            const isToday = day.date?.toDateString() === new Date().toDateString()

            return (
              <div
                key={index}
                className={cn(
                  "min-h-[120px] border-r border-b p-2",
                  !day.isCurrentMonth && "bg-muted/20",
                  isToday && "bg-primary/5"
                )}
              >
                {day.date && (
                  <>
                    <div className={cn(
                      "text-sm font-medium mb-2",
                      isToday && "inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground"
                    )}>
                      {day.date.getDate()}
                    </div>
                    <div className="space-y-1">
                      {worksForDay.slice(0, 3).map((work) => {
                        const status = getProjectStatus(work)
                        return (
                          <div
                            key={work.id}
                            className={cn(
                              "text-xs p-1.5 rounded cursor-pointer hover:opacity-80 transition-opacity",
                              status.calendarColor,
                              status.textColor
                            )}
                            title={`${work.site_type} — ${work.developer}\n${formatCurrency(parseValue(work.value))}\nStatus: ${status.label}\nDev: ${work.developer_status}\nPagamento: ${work.payment_status}`}
                          >
                            <div className="font-medium truncate">{work.site_type}</div>
                            <div className="text-[10px] opacity-80 truncate">{work.developer}</div>
                            {status.status === 'payment-pending' && (
                              <div className="text-[10px] font-bold mt-0.5">💰 {status.days}d p/ vencer</div>
                            )}
                            {status.status === 'overdue' && (
                              <div className="text-[10px] font-bold mt-0.5">⚠ {status.days}d atraso pgto.</div>
                            )}
                          </div>
                        )
                      })}
                      {worksForDay.length > 3 && (
                        <div className="text-xs text-muted-foreground text-center font-medium">
                          +{worksForDay.length - 3} mais
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Lista de Projetos por Status */}
      <div className="rounded-xl border bg-card shadow-sm p-6">
        <h3 className="text-lg font-bold mb-4">Projetos por Status</h3>
        <div className="space-y-2">
          {filteredWorks
            .map(work => ({ work, status: getProjectStatus(work) }))
            .sort((a, b) => a.status.priority - b.status.priority)
            .slice(0, 20)
            .map(({ work, status }) => {
              // Mapear status → cor da badge
              const badgeClassName = cn(
                "flex-shrink-0 text-[11px]",
                status.status === 'overdue' && "bg-red-500/15 text-red-700 border-red-500/20 hover:bg-red-500/20",
                status.status === 'payment-pending' && "bg-amber-500/15 text-amber-700 border-amber-500/20 hover:bg-amber-500/20",
                status.status === 'ontime' && "bg-sky-500/15 text-sky-700 border-sky-500/20 hover:bg-sky-500/20",
                status.status === 'completed' && "bg-emerald-500/15 text-emerald-700 border-emerald-500/20 hover:bg-emerald-500/20"
              )

              // Cor da barra lateral
              const barColor = cn(
                "w-1 h-12 rounded-full flex-shrink-0",
                status.status === 'overdue' && "bg-red-500",
                status.status === 'payment-pending' && "bg-amber-500",
                status.status === 'ontime' && "bg-sky-500",
                status.status === 'completed' && "bg-emerald-500"
              )

              // Texto de detalhe
              const detailText = status.status === 'completed'
                ? 'Finalizado'
                : status.status === 'payment-pending'
                ? `${status.days}d p/ vencer`
                : status.status === 'overdue'
                ? `${status.days}d de atraso no pgto.`
                : status.label

              return (
                <div key={work.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={barColor} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-sm font-medium truncate">{work.site_type}</span>
                        <Badge variant="outline" className={badgeClassName}>
                          {status.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {work.developer} • {formatDate(work.delivery_date)} • {work.payment_status}
                      </p>
                      {work.domain && (
                        <p className="text-[11px] text-muted-foreground/70 truncate mt-0.5">
                          {work.domain}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="text-sm font-bold whitespace-nowrap">{formatCurrency(parseValue(work.value))}</p>
                    <p className="text-[11px] text-muted-foreground whitespace-nowrap">
                      {detailText}
                    </p>
                  </div>
                </div>
              )
            })}
          {filteredWorks.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Nenhum projeto encontrado com os filtros selecionados.</p>
            </div>
          )}
        </div>
      </div>

      {/* Legenda */}
      <div className="rounded-xl border bg-muted/50 p-4">
        <h4 className="font-semibold mb-3 text-sm">Legenda de Status</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-sm">Atrasado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-sm">Pgto. Pendente</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-sky-500" />
            <span className="text-sm">No Prazo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-sm">Finalizado</span>
          </div>
        </div>
        <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
          <p>
            <strong className="text-red-600">Atrasado:</strong> Concluído pelo dev, não pago, e já passou o dia 5 do mês seguinte à data do projeto
          </p>
          <p>
            <strong className="text-amber-600">Pgto. Pendente:</strong> Concluído pelo dev, não pago, mas ainda dentro do prazo (até dia 5 do mês seguinte)
          </p>
          <p>
            <strong className="text-sky-600">No Prazo:</strong> Projeto ainda não concluído pelo desenvolvedor
          </p>
          <p>
            <strong className="text-emerald-600">Finalizado:</strong> Concluído pelo dev e pagamento confirmado
          </p>
        </div>
      </div>
    </div>
  )
}

export default Calendario
