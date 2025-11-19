import * as React from 'react'
import { ChevronLeft, ChevronRight, Clock, CheckCircle, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
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

  // Calcular status do projeto baseado em finalização e pagamento
  const getProjectStatus = (work: Work) => {
    const projectDate = new Date(work.delivery_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    projectDate.setHours(0, 0, 0, 0)
    
    const isPaid = work.payment_status === 'Pago'
    const isCompleted = work.developer_status === 'Concluído'
    
    // Calcular primeiro dia do mês seguinte à data do projeto
    const nextMonthFirstDay = new Date(projectDate.getFullYear(), projectDate.getMonth() + 1, 1)
    nextMonthFirstDay.setHours(0, 0, 0, 0)
    
    const isPastPaymentDeadline = today >= nextMonthFirstDay
    
    // Prioridade 1: Pagamento Pendente (finalizado, não pago, passou do dia 1 do mês seguinte)
    if (isCompleted && !isPaid && isPastPaymentDeadline) {
      const daysPending = Math.ceil((today.getTime() - nextMonthFirstDay.getTime()) / (1000 * 60 * 60 * 24))
      return { 
        status: 'payment-pending', 
        label: 'Pagamento Pendente', 
        color: 'bg-yellow-500', 
        days: daysPending,
        priority: 1
      }
    }
    
    // Prioridade 2: Concluído e Pago
    if (isPaid && isCompleted) {
      return { 
        status: 'completed', 
        label: 'Concluído e Pago', 
        color: 'bg-green-500', 
        days: 0,
        priority: 3
      }
    }
    
    // Prioridade 3: No Prazo (todos os outros casos)
    return { 
      status: 'ontime', 
      label: 'No Prazo', 
      color: 'bg-blue-500', 
      days: 0,
      priority: 2
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
      'payment-pending': 0,
      completed: 0,
      ontime: 0
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
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-card shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-100 text-yellow-600 dark:bg-yellow-950">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pagamento Pendente</p>
              <p className="text-2xl font-bold">{projectStats['payment-pending']}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">No Prazo</p>
              <p className="text-2xl font-bold">{projectStats.ontime}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 text-green-600 dark:bg-green-950">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Concluídos e Pagos</p>
              <p className="text-2xl font-bold">{projectStats.completed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controles e Filtros */}
      <div className="rounded-xl border bg-card shadow-sm p-4">
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
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="payment-pending">Pagamento Pendente</SelectItem>
                <SelectItem value="ontime">No Prazo</SelectItem>
                <SelectItem value="completed">Concluídos e Pagos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Calendário */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
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
                              status.color,
                              "text-white"
                            )}
                            title={`${work.site_type} - ${work.developer}\n${formatCurrency(parseValue(work.value))}\nStatus: ${status.label}\nPagamento: ${work.payment_status}`}
                          >
                            <div className="font-medium truncate">{work.site_type}</div>
                            <div className="text-[10px] opacity-90 truncate">{work.developer}</div>
                            {status.status === 'payment-pending' && (
                              <div className="text-[10px] font-bold opacity-100">💰 Pagar</div>
                            )}
                          </div>
                        )
                      })}
                      {worksForDay.length > 3 && (
                        <div className="text-xs text-muted-foreground text-center">
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
        <div className="space-y-3">
          {filteredWorks
            .map(work => ({ work, status: getProjectStatus(work) }))
            .sort((a, b) => a.status.priority - b.status.priority)
            .slice(0, 15)
            .map(({ work, status }) => {
              return (
                <div key={work.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={cn("w-1 h-12 rounded-full flex-shrink-0", status.color)} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-medium truncate">{work.site_type}</span>
                        <Badge 
                          variant={status.status === 'completed' ? 'default' : status.status === 'payment-pending' ? 'secondary' : 'destructive'} 
                          className={cn(
                            "flex-shrink-0",
                            status.status === 'payment-pending' && "bg-yellow-500 text-white hover:bg-yellow-600"
                          )}
                        >
                          {status.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {work.developer} • Data: {formatDate(work.delivery_date)} • {work.payment_status}
                      </p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {work.domain}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="font-bold whitespace-nowrap">{formatCurrency(parseValue(work.value))}</p>
                    <p className="text-xs text-muted-foreground whitespace-nowrap">
                      {status.status === 'completed' 
                        ? 'Pago e Concluído' 
                        : status.status === 'payment-pending'
                        ? `${status.days}d pendente`
                        : 'Em andamento'
                      }
                    </p>
                  </div>
                </div>
              )
            })}
        </div>
      </div>

      {/* Legenda */}
      <div className="rounded-xl border bg-muted/50 p-4">
        <h4 className="font-semibold mb-3 text-sm">Legenda de Status</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-sm">Pagamento Pendente</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-sm">No Prazo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-sm">Concluído e Pago</span>
          </div>
        </div>
        <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
          <p>
            <strong>Pagamento Pendente:</strong> Projetos finalizados e não pagos após o dia 1 do mês seguinte à data de cadastro
          </p>
          <p>
            <strong>No Prazo:</strong> Projetos em andamento ou aguardando pagamento dentro do prazo
          </p>
          <p>
            <strong>Concluído e Pago:</strong> Projetos finalizados e com pagamento confirmado
          </p>
        </div>
      </div>
    </div>
  )
}

export default Calendario
