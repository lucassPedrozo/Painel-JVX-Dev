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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="transition-shadow duration-200 hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base font-medium">Desenvolvedores</CardTitle>
            <div className="rounded-full bg-primary/10 p-2">
              <User className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{developers.length}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Ativos no sistema
            </p>
          </CardContent>
        </Card>

        <Card className="transition-shadow duration-200 hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base font-medium">Total de Projetos</CardTitle>
            <div className="rounded-full bg-blue-500/10 p-2">
              <Briefcase className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {developers.reduce((acc, dev) => acc + dev.totalProjects, 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Distribuídos entre a equipe
            </p>
          </CardContent>
        </Card>

        <Card className="transition-shadow duration-200 hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base font-medium">Projetos Ativos</CardTitle>
            <div className="rounded-full bg-orange-500/10 p-2">
              <Clock className="h-4 w-4 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {developers.reduce((acc, dev) => acc + dev.activeProjects, 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Aguardando pagamento
            </p>
          </CardContent>
        </Card>

        <Card className="transition-shadow duration-200 hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base font-medium">Valor Total</CardTitle>
            <div className="rounded-full bg-green-500/10 p-2">
              <Briefcase className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(developers.reduce((acc, dev) => acc + dev.totalValue, 0))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Arrecadado pela equipe
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Desenvolvedores */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {developers.map((dev) => {
          const isHidden = hiddenValues.has(dev.name)

          return (
            <Card
              key={dev.name}
              className="transition-shadow duration-200 hover:shadow-md"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-primary/10 p-3">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{dev.name}</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {dev.totalProjects} {dev.totalProjects === 1 ? "projeto" : "projetos"}
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setSelectedDeveloper(dev.name)}
                    title="Informações adicionais"
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Projetos Ativos */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Projetos ativos:</span>
                  <Badge variant={dev.activeProjects > 0 ? "default" : "secondary"}>
                    {dev.activeProjects}
                  </Badge>
                </div>

                {/* Valor Total */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Valor total:</span>
                  <div className="flex items-center gap-2">
                    {isHidden ? (
                      <span className="text-sm font-medium">••••••</span>
                    ) : (
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        {formatCurrency(dev.totalValue)}
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
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
                  <span className="text-sm text-muted-foreground">Valor a receber:</span>
                  <div className="flex items-center gap-2">
                    {isHidden ? (
                      <span className="text-sm font-medium">••••••</span>
                    ) : (
                      <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                        {formatCurrency(dev.pendingValue)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Barra de Progresso */}
                <div className="pt-2">
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
