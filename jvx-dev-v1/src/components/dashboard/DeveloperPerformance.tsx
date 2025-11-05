import * as React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { type Work } from '@/lib/api'
import { parseValue, formatCurrency } from '@/lib/utils'

interface DeveloperPerformanceProps {
  works: Work[]
}

export function DeveloperPerformance({ works }: DeveloperPerformanceProps) {
  const projectData = React.useMemo(() => {
    const devData = new Map<string, { delivered: number, pending: number, paid: number, total: number, revenue: number }>()
    
    works.forEach(work => {
      const dev = work.developer || 'Não atribuído'
      const value = parseValue(work.value)
      const isDelivered = work.status === 'Entregue'
      const isPaid = work.payment_status === 'Pago'
      
      if (!devData.has(dev)) {
        devData.set(dev, { delivered: 0, pending: 0, paid: 0, total: 0, revenue: 0 })
      }
      
      const current = devData.get(dev)!
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
    
    return Array.from(devData.entries())
      .map(([name, data]) => ({
        name,
        entregues: data.delivered,
        pendentes: data.pending,
        pagos: data.paid,
        total: data.total,
        receita: data.revenue
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)
  }, [works])

  const ProjectTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-card border rounded-lg shadow-lg p-3">
          <p className="font-semibold text-sm mb-2">{data.name}</p>
          <p className="text-xs font-semibold text-foreground">Total: {data.total} projetos</p>
          <p className="text-xs text-green-600">Entregues: {data.entregues}</p>
          <p className="text-xs text-orange-600">Pendentes: {data.pendentes}</p>
          <p className="text-xs text-blue-600">Pagos: {data.pagos}</p>
          <p className="text-xs text-muted-foreground mt-1">Receita: {formatCurrency(data.receita)}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="rounded-xl border bg-card shadow-sm p-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold">Produtividade por Desenvolvedor</h3>
        <p className="text-sm text-muted-foreground">Projetos entregues vs pendentes por desenvolvedor</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={projectData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis type="number" className="text-xs" />
          <YAxis dataKey="name" type="category" className="text-xs" width={100} />
          <Tooltip content={<ProjectTooltip />} />
          <Legend />
          <Bar dataKey="entregues" fill="#10b981" name="Entregues" />
          <Bar dataKey="pendentes" fill="#f59e0b" name="Pendentes" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
