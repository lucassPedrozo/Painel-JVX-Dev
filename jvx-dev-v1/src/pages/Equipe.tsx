import * as React from "react"
import { PageHeader } from "@/components/common"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useWorks } from "@/contexts/WorksContext"
import { parseValue, formatCurrency } from "@/lib/utils"
import { Eye, EyeOff, User, Briefcase, Clock, Info } from "lucide-react"
import { DeveloperInfoDialog } from "@/components/dialogs"
import { cn } from "@/lib/utils"

interface DeveloperStats {
  name: string
  totalProjects: number
  activeProjects: number
  totalValue: number
  pendingValue: number
}

function Equipe() {
  const { works } = useWorks()
  const [selectedDeveloper, setSelectedDeveloper] = React.useState<string | null>(null)

  const developers = React.useMemo(() => {
    const devMap = new Map<string, DeveloperStats>()

    works.forEach((work) => {
      const devName = work.developer || "Sem desenvolvedor"

      if (!devMap.has(devName)) {
        devMap.set(devName, {
          name: devName,
          totalProjects: 0,
          activeProjects: 0,
          totalValue: 0,
          pendingValue: 0,
        })
      }

      const dev = devMap.get(devName)!
      dev.totalProjects++

      const value = parseValue(work.value)
      dev.totalValue += value

      if (work.payment_status && work.payment_status.toLowerCase() !== "pago") {
        dev.activeProjects++
        dev.pendingValue += value
      }
    })

    return Array.from(devMap.values()).sort((a, b) => b.totalValue - a.totalValue)
  }, [works])

  // Inicializar com todos os valores ocultos
  const [hiddenValues, setHiddenValues] = React.useState<Set<string>>(() => {
    return new Set(developers.map((d) => d.name))
  })

  // Atualizar quando a lista de desenvolvedores mudar
  React.useEffect(() => {
    setHiddenValues(new Set(developers.map((d) => d.name)))
  }, [developers])

  const toggleValueVisibility = (devName: string) => {
    setHiddenValues((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(devName)) {
        newSet.delete(devName)
      } else {
        newSet.add(devName)
      }
      return newSet
    })
  }

  const toggleAllValues = () => {
    if (hiddenValues.size === 0) {
      setHiddenValues(new Set(developers.map((d) => d.name)))
    } else {
      setHiddenValues(new Set())
    }
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Equipe"
          description="Gerencie informações sobre os desenvolvedores e suas estatísticas."
        />
        <Button
          variant="outline"
          size="sm"
          onClick={toggleAllValues}
          className="w-full sm:w-auto"
        >
          {hiddenValues.size === 0 ? (
            <>
              <EyeOff className="h-4 w-4 mr-2" />
              Ocultar Todos os Valores
            </>
          ) : (
            <>
              <Eye className="h-4 w-4 mr-2" />
              Mostrar Todos os Valores
            </>
          )}
        </Button>
      </div>

      {/* Stats Gerais */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Card className="p-5 border-transparent bg-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <User className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xs font-medium text-muted-foreground mb-0.5">Desenvolvedores</p>
          <p className="text-xl font-bold tracking-tight">{developers.length}</p>
          <p className="text-[11px] text-muted-foreground mt-1">Ativos no sistema</p>
        </Card>

        <Card className="p-5 border-transparent bg-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <Briefcase className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xs font-medium text-muted-foreground mb-0.5">Total de Projetos</p>
          <p className="text-xl font-bold tracking-tight">{developers.reduce((acc, dev) => acc + dev.totalProjects, 0)}</p>
          <p className="text-[11px] text-muted-foreground mt-1">Distribuídos entre a equipe</p>
        </Card>

        <Card className="p-5 border-transparent bg-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xs font-medium text-muted-foreground mb-0.5">Projetos Ativos</p>
          <p className="text-xl font-bold tracking-tight">{developers.reduce((acc, dev) => acc + dev.activeProjects, 0)}</p>
          <p className="text-[11px] text-muted-foreground mt-1">Aguardando pagamento</p>
        </Card>

        <Card className="p-5 border-transparent bg-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Briefcase className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xs font-medium text-muted-foreground mb-0.5">Valor Total</p>
          <p className="text-xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">{formatCurrency(developers.reduce((acc, dev) => acc + dev.totalValue, 0))}</p>
          <p className="text-[11px] text-muted-foreground mt-1">Arrecadado pela equipe</p>
        </Card>
      </div>

      {/* Lista de Desenvolvedores */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {developers.map((dev) => {
          const isHidden = hiddenValues.has(dev.name)

          return (
            <Card
              key={dev.name}
              className="border-transparent bg-card overflow-hidden"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-semibold">{dev.name}</CardTitle>
                      <CardDescription className="text-[11px] mt-0.5">
                        {dev.totalProjects} {dev.totalProjects === 1 ? "projeto" : "projetos"}
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setSelectedDeveloper(dev.name)}
                    title="Informações adicionais"
                  >
                    <Info className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2.5 pt-0">
                {/* Projetos Ativos */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Projetos ativos</span>
                  <Badge variant={dev.activeProjects > 0 ? "default" : "secondary"} className="text-[10px] px-1.5 py-0">
                    {dev.activeProjects}
                  </Badge>
                </div>

                {/* Valor Total */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Valor total</span>
                  <div className="flex items-center gap-1.5">
                    {isHidden ? (
                      <span className="text-xs font-medium">••••••</span>
                    ) : (
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(dev.totalValue)}
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={() => toggleValueVisibility(dev.name)}
                    >
                      {isHidden ? (
                        <Eye className="h-3 w-3" />
                      ) : (
                        <EyeOff className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Valor Pendente */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Valor a receber</span>
                  <div className="flex items-center gap-1.5">
                    {isHidden ? (
                      <span className="text-xs font-medium">••••••</span>
                    ) : (
                      <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                        {formatCurrency(dev.pendingValue)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Barra de Progresso */}
                <div className="pt-1.5">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Pagos</span>
                    <span className={cn(
                      "font-semibold",
                      dev.totalProjects > 0 && ((dev.totalProjects - dev.activeProjects) / dev.totalProjects) * 100 >= 80
                        ? "text-green-600 dark:text-green-400"
                        : dev.totalProjects > 0 && ((dev.totalProjects - dev.activeProjects) / dev.totalProjects) * 100 >= 50
                        ? "text-yellow-600 dark:text-yellow-400"
                        : "text-red-600 dark:text-red-400"
                    )}>
                      {dev.totalProjects > 0
                        ? Math.round(((dev.totalProjects - dev.activeProjects) / dev.totalProjects) * 100)
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full transition-all duration-300",
                        dev.totalProjects > 0 && ((dev.totalProjects - dev.activeProjects) / dev.totalProjects) * 100 >= 80
                          ? "bg-green-500"
                          : dev.totalProjects > 0 && ((dev.totalProjects - dev.activeProjects) / dev.totalProjects) * 100 >= 50
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      )}
                      style={{
                        width: `${dev.totalProjects > 0
                          ? ((dev.totalProjects - dev.activeProjects) / dev.totalProjects) * 100
                          : 0
                          }%`,
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Empty State */}
      {developers.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Nenhum desenvolvedor encontrado</p>
            <p className="text-sm text-muted-foreground mt-1">
              Adicione trabalhos com desenvolvedores para vê-los aqui
            </p>
          </CardContent>
        </Card>
      )}

      {/* Dialog de Informações */}
      {selectedDeveloper && (
        <DeveloperInfoDialog
          developerName={selectedDeveloper}
          isOpen={true}
          onClose={() => setSelectedDeveloper(null)}
        />
      )}
    </div>
  )
}

export default Equipe
