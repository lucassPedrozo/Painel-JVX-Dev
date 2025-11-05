import * as React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { type Work } from '@/lib/api'

interface PaymentTimelineProps {
  works: Work[]
}

export function PaymentTimeline({ works }: PaymentTimelineProps) {
  const data = React.useMemo(() => {
    const monthlyData = new Map<string, { paid: number, pending: number, total: number }>()
    
    works.forEach(work => {
      const date = new Date(work.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const isPaid = work.paymentStatus === 'Pago'
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { paid: 0, pending: 0, total: 0 })
      }
      
      const current = monthlyData.get(monthKey)!
      current.total += 1
      if (isPaid) {
        current.paid += 1
      } else {
        current.pending += 1
      }
    })
    
    return Array.from(monthlyData.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([month, values]) => ({
        month: new Date(month + '-01').toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        pagos: values.paid,
        pendentes: values.pending,
        total: values.total
      }))
  }, [works])

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border rounded-lg shadow-lg p-3">
          <p className="font-semibold text-sm mb-2">{payload[0].payload.month}</p>
          <p className="text-xs text-green-600">Concluídos: {payload[0].payload.pagos} projetos</p>
          <p className="text-xs text-orange-600">Pendentes: {payload[0].payload.pendentes} projetos</p>
          <p className="text-xs font-semibold text-foreground mt-1">Total: {payload[0].payload.total} projetos</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="rounded-xl border bg-card shadow-sm p-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold">Status dos Projetos</h3>
        <p className="text-sm text-muted-foreground">Evolução de projetos concluídos vs pendentes</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="month" className="text-xs" />
          <YAxis className="text-xs" />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line type="monotone" dataKey="pagos" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} name="Concluídos" />
          <Line type="monotone" dataKey="pendentes" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} name="Pendentes" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
