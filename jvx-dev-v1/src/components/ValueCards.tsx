import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DollarSign, AlertCircle } from "lucide-react"

interface ValueCardsProps {
  totalPago: string
  totalPendente: string
}

export function ValueCards({ totalPago, totalPendente }: ValueCardsProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card className="transition-shadow duration-200 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div className="space-y-1">
                <CardTitle className="text-base font-medium">Valor Total</CardTitle>
                <CardDescription>Somatório de todos os trabalhos</CardDescription>
              </div>
              <div className="rounded-full bg-green-500/10 p-3">
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight text-green-600 dark:text-green-400">
                {totalPago}
              </div>
            </CardContent>
          </Card>
        </TooltipTrigger>
        <TooltipContent>
          <p>Soma de todos os valores já recebidos</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Card className="transition-shadow duration-200 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div className="space-y-1">
                <CardTitle className="text-base font-medium">Valor a Pagar</CardTitle>
                <CardDescription>Total pendente (não pago)</CardDescription>
              </div>
              <div className="rounded-full bg-orange-500/10 p-3">
                <AlertCircle className="h-5 w-5 text-orange-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight text-orange-600 dark:text-orange-400">
                {totalPendente}
              </div>
            </CardContent>
          </Card>
        </TooltipTrigger>
        <TooltipContent>
          <p>Valores ainda não recebidos dos clientes</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
