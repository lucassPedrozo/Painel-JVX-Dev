import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Globe, CreditCard } from "lucide-react"

interface StatsCardsProps {
  totalSites: number
  pagamentosPendentes: number
}

export function StatsCards({ totalSites, pagamentosPendentes }: StatsCardsProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card className="transition-shadow duration-200 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div className="space-y-1">
                <CardTitle className="text-base font-medium">Sites Gerenciados</CardTitle>
                <CardDescription>Total de projetos cadastrados</CardDescription>
              </div>
              <div className="rounded-full bg-primary/10 p-3">
                <Globe className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight">{totalSites}</div>
              <p className="text-xs text-muted-foreground mt-2">
                {totalSites === 1 ? 'projeto ativo' : 'projetos ativos'}
              </p>
            </CardContent>
          </Card>
        </TooltipTrigger>
        <TooltipContent>
          <p>Total de projetos cadastrados no sistema</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Card className="transition-shadow duration-200 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div className="space-y-1">
                <CardTitle className="text-base font-medium">Pagamentos Pendentes</CardTitle>
                <CardDescription>Trabalhos aguardando pagamento</CardDescription>
              </div>
              <div className="rounded-full bg-orange-500/10 p-3">
                <CreditCard className="h-5 w-5 text-orange-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight">{pagamentosPendentes}</div>
              <p className="text-xs text-muted-foreground mt-2">
                {pagamentosPendentes === 1 ? 'pagamento pendente' : 'pagamentos pendentes'}
              </p>
            </CardContent>
          </Card>
        </TooltipTrigger>
        <TooltipContent>
          <p>Projetos aguardando confirmação de pagamento</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
