import { Card } from "@/components/ui/card"
import { Globe, CreditCard } from "lucide-react"

interface StatsCardsProps {
  totalSites: number
  pagamentosPendentes: number
}

export function StatsCards({ totalSites, pagamentosPendentes }: StatsCardsProps) {
  return (
    <>
      <Card className="p-5 border-transparent bg-card">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-600/10 text-sky-600">
            <Globe className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Projetos</p>
            <p className="text-xl font-bold tracking-tight">{totalSites}</p>
            <p className="text-[11px] text-muted-foreground">
              {totalSites === 1 ? 'projeto ativo' : 'projetos ativos'}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-5 border-transparent bg-card">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-600/10 text-amber-600">
            <CreditCard className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Pendentes</p>
            <p className="text-xl font-bold tracking-tight">{pagamentosPendentes}</p>
            <p className="text-[11px] text-muted-foreground">
              {pagamentosPendentes === 1 ? 'pagamento pendente' : 'pagamentos pendentes'}
            </p>
          </div>
        </div>
      </Card>
    </>
  )
}
