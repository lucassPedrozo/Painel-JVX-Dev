import * as React from 'react'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { type Work } from '@/lib/api'

interface StatusBadgeProps {
  work: Work
}

export function StatusBadge({ work }: StatusBadgeProps) {
  const isCompleted = work.developer_status === 'Concluído'
  
  if (isCompleted && work.completed_at) {
    return (
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <div className="w-fit">
            <Badge 
              variant="default"
              className="font-medium text-xs cursor-help bg-green-600 hover:bg-green-700"
            >
              Concluído
            </Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent side="left" className="bg-foreground text-background">
          <p className="text-xs font-medium">Concluído em:</p>
          <p className="text-xs">
            {new Date(work.completed_at).toLocaleString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </TooltipContent>
      </Tooltip>
    )
  }
  
  if (isCompleted) {
    return (
      <Badge 
        variant="default"
        className="font-medium text-xs bg-green-600 hover:bg-green-700"
      >
        Concluído
      </Badge>
    )
  }
  
  return (
    <Badge 
      variant="secondary"
      className="font-medium text-xs border-orange-300 text-orange-600 bg-orange-50 dark:bg-orange-950"
    >
      Em Andamento
    </Badge>
  )
}
