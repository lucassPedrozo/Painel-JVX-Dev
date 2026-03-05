import * as React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { type Work } from '@/lib/api'
import { parseValue, formatCurrency } from '@/lib/utils'
import { useHideValues } from '@/contexts/HideValuesContext'

interface WorkTypeDistributionProps {
  works: Work[]
}

const COLORS = ['hsl(var(--primary))', '#3eba83', '#5b93e5', '#dba03e', '#e05858', '#8670d6', '#d46c9e']

export function WorkTypeDistribution({ works }: WorkTypeDistributionProps) {
  const { sensitive } = useHideValues()
  const data = React.useMemo(() => {
    const typeData = new Map<string, { count: number, value: number }>()
    
    works.forEach(work => {
      const type = work.site_type || 'Não especificado'
      const value = parseValue(work.value)
      
      if (!typeData.has(type)) {
        typeData.set(type, { count: 0, value: 0 })
      }
      
      const current = typeData.get(type)!
      current.count += 1
      current.value += value
    })
    
    return Array.from(typeData.entries())
      .map(([name, data]) => ({
        name,
        value: data.count,
        revenue: data.value,
        count: data.count,
        percentage: ((data.count / works.length) * 100).toFixed(1)
      }))
      .sort((a, b) => b.count - a.count)
  }, [works])

  interface WorkTypeData {
    name: string
    count: number
    percentage: number
    revenue: number
  }

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: WorkTypeData }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-card border rounded-lg shadow-lg p-3">
          <p className="font-semibold text-sm mb-1">{data.name}</p>
          <p className="text-xs font-semibold text-foreground">Quantidade: {data.count} projetos</p>
          <p className="text-xs text-muted-foreground">Percentual: {data.percentage}%</p>
          <p className="text-xs text-muted-foreground mt-1">Receita: {sensitive(formatCurrency(data.revenue))}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="rounded-xl border bg-card shadow-sm p-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold">Distribuição por Tipo de Site</h3>
        <p className="text-sm text-muted-foreground">Quantidade de projetos por tipo de site</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percentage }) => `${name} (${percentage}%)`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
