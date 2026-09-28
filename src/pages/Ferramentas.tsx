import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/common'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  KeyRound,
  Wrench,
  Clock,
  ArrowRight,
  Activity
} from 'lucide-react'

interface Tool {
  id: string
  name: string
  description: string
  icon: React.ElementType
  status: 'available' | 'coming-soon'
  href?: string
}

const tools: Tool[] = [
  {
    id: 'gerador-link-senhas',
    name: 'Gerador de Link para Senhas',
    description: 'Gere links seguros para compartilhamento de senhas com expiração automática.',
    icon: KeyRound,
    status: 'available',
    href: '/ferramentas/gerador-link-senhas',
  },
  {
    id: 'down-detector',
    name: 'Down Detector',
    description: 'Monitore a disponibilidade dos seus sites e detecte instabilidades em tempo real.',
    icon: Activity,
    status: 'available',
    href: '/ferramentas/down-detector',
  },
]

function Ferramentas() {
  const navigate = useNavigate()

  const handleToolClick = (tool: Tool) => {
    if (tool.status === 'available' && tool.href) {
      navigate(tool.href)
    }
  }

  return (
    <div className="space-y-6 pb-6">
      <PageHeader
        title="Ferramentas"
        description="Utilitários do dia a dia para desenvolvedores"
      />

      {/* Grid de Ferramentas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => {
          const Icon = tool.icon
          const isComingSoon = tool.status === 'coming-soon'

          return (
            <Card
              key={tool.id}
              onClick={() => handleToolClick(tool)}
              className={`border-transparent bg-card overflow-hidden transition-all duration-200 group ${
                isComingSoon
                  ? 'opacity-75'
                  : 'hover:shadow-md hover:border-primary/20 cursor-pointer'
              }`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  {isComingSoon ? (
                    <Badge variant="secondary" className="text-[10px] px-2 py-0.5 gap-1">
                      <Clock className="h-3 w-3" />
                      Em breve
                    </Badge>
                  ) : (
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
                <CardTitle className="text-sm font-semibold mt-3">{tool.name}</CardTitle>
                <CardDescription className="text-[12px] leading-relaxed">
                  {tool.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                {isComingSoon && (
                  <div className="rounded-lg border border-dashed p-2.5 mt-1">
                    <p className="text-[11px] text-muted-foreground text-center">
                      Esta ferramenta está sendo desenvolvida
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}

        {/* Card placeholder para próximas ferramentas */}
        <Card className="border-dashed border-2 bg-transparent overflow-hidden flex items-center justify-center min-h-[180px]">
          <CardContent className="flex flex-col items-center gap-2 py-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-dashed">
              <Wrench className="h-5 w-5 text-muted-foreground/50" />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Mais ferramentas em breve
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Ferramentas
