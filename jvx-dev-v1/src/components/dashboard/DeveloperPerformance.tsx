import * as React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { type Work } from '@/lib/api'
import { parseValue, formatCurrency } from '@/lib/utils'

interface DeveloperPerformanceProps {
  works: Work[]
}

export function DeveloperPerformance({ works }: DeveloperPerformanceProps) {
  const projectData = React.useMemo(() => {
    const devData = new Map<string, { completed: number, pending: number, total: number, revenue: number }>()
    
    works.forEach(work => {
      const dev = work.developer || 'Não atribuído'
      const value = parseValue(work.value)
      const isCompleted = work.paymentStatus === 'Pago'
      
      if (!devData.has(dev)) {
        devData.set(dev, { completed: 0, pending: 0, total: 0, revenue: 0 })
      }
      
      const current = devData.get(dev)!
      current.total += 1
      current.revenue += value
      if (isCompleted) {
        current.completed += 1
      } else {
        current.pending += 1
      }
    })
    
    return Array.from(devData.entries())
      .map(([name, data]) => ({
        name,
        concluídos: data.completed,
        pendentes: data.pending,
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
          <p className="text-xs text-green-600">Concluídos: {data.concluídos}</p>
          <p className="text-xs text-orange-600">Pendentes: {data.pendentes}</p>
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
        <p className="text-sm text-muted-foreground">Top 10 desenvolvedores por quantidade de projetos</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={projectData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis type="number" className="text-xs" />
          <YAxis dataKey="name" type="category" className="text-xs" width={100} />
          <Tooltip content={<ProjectTooltip />} />
          <Legend />
          <Bar dataKey="concluídos" fill="#10b981" name="Concluídos" />
          <Bar dataKey="pendentes" fill="#f59e0b" name="Pendentes" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
