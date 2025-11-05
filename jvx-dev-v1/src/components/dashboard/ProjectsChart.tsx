import * as React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { type Work } from '@/lib/api'
import { formatCurrency, parseValue } from '@/lib/utils'

interface ProjectsChartProps {
  works: Work[]
}

export function ProjectsChart({ works }: ProjectsChartProps) {
  const data = React.useMemo(() => {
    const monthlyData = new Map<string, { total: number, completed: number, pending: number, revenue: number }>()
    
    works.forEach(work => {
      const date = new Date(work.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const isCompleted = work.paymentStatus === 'Pago'
      const value = parseValue(work.value)
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { total: 0, completed: 0, pending: 0, revenue: 0 })
      }
      
      const current = monthlyData.get(monthKey)!
      current.total += 1
      current.revenue += value
      if (isCompleted) {
        current.completed += 1
      } else {
        current.pending += 1
      }
    })
    
    return Array.from(monthlyData.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([month, values]) => ({
        month: new Date(month + '-01').toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        concluídos: values.completed,
        pendentes: values.pending,
        total: values.total,
        receita: values.revenue
      }))
  }, [works])

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-card border rounded-lg shadow-lg p-3">
          <p className="font-semibold text-sm mb-2">{data.month}</p>
          <p className="text-xs text-green-600">Concluídos: {data.concluídos}</p>
          <p className="text-xs text-orange-600">Pendentes: {data.pendentes}</p>
          <p className="text-xs font-semibold text-foreground">Total: {data.total} projetos</p>
          <p className="text-xs text-muted-foreground mt-1">Receita: {formatCurrency(data.receita)}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="rounded-xl border bg-card shadow-sm p-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold">Projetos Entregues por Mês</h3>
        <p className="text-sm text-muted-foreground">Evolução de entregas nos últimos 12 meses</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="month" className="text-xs" />
          <YAxis className="text-xs" />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="concluídos" fill="#10b981" name="Concluídos" radius={[4, 4, 0, 0]} />
          <Bar dataKey="pendentes" fill="#f59e0b" name="Pendentes" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
