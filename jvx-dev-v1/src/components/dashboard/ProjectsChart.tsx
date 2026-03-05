import * as React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { type Work } from '@/lib/api'
import { formatCurrency, parseValue } from '@/lib/utils'
import { useHideValues } from '@/contexts/HideValuesContext'

interface ProjectsChartProps {
  works: Work[]
}

export function ProjectsChart({ works }: ProjectsChartProps) {
  const { sensitive } = useHideValues()
  const data = React.useMemo(() => {
    const monthlyData = new Map<string, { total: number, delivered: number, pending: number, paid: number, revenue: number }>()
    
    works.forEach(work => {
      const date = new Date(work.delivery_date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const isDelivered = work.status === 'Entregue'
      const isPaid = work.payment_status === 'Pago'
      const value = parseValue(work.value)
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { total: 0, delivered: 0, pending: 0, paid: 0, revenue: 0 })
      }
      
      const current = monthlyData.get(monthKey)!
      current.total += 1
      current.revenue += value
      
      if (isDelivered) {
        current.delivered += 1
      } else {
        current.pending += 1
      }
      
      if (isPaid) {
        current.paid += 1
      }
    })
    
    return Array.from(monthlyData.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([month, values]) => ({
        month: new Date(month + '-01').toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        entregues: values.delivered,
        pendentes: values.pending,
        pagos: values.paid,
        total: values.total,
        receita: values.revenue
      }))
  }, [works])

  interface ChartData {
    month: string
    entregues: number
    pendentes: number
    pagos: number
    total: number
    receita: number
  }

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: ChartData }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-card border rounded-lg shadow-lg p-3">
          <p className="font-semibold text-sm mb-2">{data.month}</p>
          <p className="text-xs text-green-600">Entregues: {data.entregues}</p>
          <p className="text-xs text-orange-600">Pendentes: {data.pendentes}</p>
          <p className="text-xs text-blue-600">Pagos: {data.pagos}</p>
          <p className="text-xs font-semibold text-foreground">Total: {data.total} projetos</p>
          <p className="text-xs text-muted-foreground mt-1">Receita: {sensitive(formatCurrency(data.receita))}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="rounded-xl border bg-card shadow-sm p-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold">Projetos por Mês</h3>
        <p className="text-sm text-muted-foreground">Evolução de entregas e pagamentos nos últimos 12 meses</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="month" className="text-xs" />
          <YAxis className="text-xs" />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="entregues" fill="#3eba83" name="Entregues" radius={[4, 4, 0, 0]} />
          <Bar dataKey="pendentes" fill="#dba03e" name="Pendentes" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
