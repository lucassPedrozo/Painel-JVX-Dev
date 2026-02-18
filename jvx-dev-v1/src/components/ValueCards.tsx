import { Card } from "@/components/ui/card"
import { DollarSign, AlertCircle } from "lucide-react"

interface ValueCardsProps {
  totalPago: string
  totalPendente: string
}

export function ValueCards({ totalPago, totalPendente }: ValueCardsProps) {
  return (
    <>
      <Card className="p-5 border-transparent bg-card">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-600/10 text-emerald-600">
            <DollarSign className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Valor Total</p>
            <p className="text-xl font-bold tracking-tight text-emerald-600">
              {totalPago}
            </p>
            <p className="text-[11px] text-muted-foreground">todos os projetos</p>
          </div>
        </div>
      </Card>

      <Card className="p-5 border-transparent bg-card">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-600/10 text-rose-600">
            <AlertCircle className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Valor Pendente</p>
            <p className="text-xl font-bold tracking-tight text-rose-600">
              {totalPendente}
            </p>
            <p className="text-[11px] text-muted-foreground">não pago</p>
          </div>
        </div>
      </Card>
    </>
  )
}
