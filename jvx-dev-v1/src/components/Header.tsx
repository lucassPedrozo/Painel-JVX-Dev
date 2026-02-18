import { Link, useLocation } from "react-router-dom"
import { ModeToggle } from "@/components/ui/mode-toggle"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/AuthContext"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Globe, BarChart3, Calendar, Users, FileText, Settings, LogOut, UserCog, User, Wrench } from "lucide-react"
import logoImg from "@/assets/favicon.png"

const routes = [
  {
    href: "/",
    label: "Dashboard",
    icon: LayoutDashboard
  },
  {
    href: "/sites",
    label: "Projetos",
    icon: Globe
  },
  {
    href: "/analises",
    label: "Análises",
    icon: BarChart3
  },
  {
    href: "/calendario",
    label: "Calendário",
    icon: Calendar
  },
  {
    href: "/equipe",
    label: "Equipe",
    icon: Users
  },
  {
    href: "/relatorios",
    label: "Relatórios",
    icon: FileText
  },
  {
    href: "/ferramentas",
    label: "Ferramentas",
    icon: Wrench
  },
  {
    href: "/configuracoes",
    label: "Configurações",
    icon: Settings
  }
]

export function Header() {
  const location = useLocation()
  const { user, logout, isMaster } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60" role="navigation" aria-label="Menu principal">
      <div className="container mx-auto flex h-14 items-center justify-between px-6">
        {/* Logo e Nome */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2.5 transition-opacity duration-200 hover:opacity-80" aria-label="Ir para Dashboard">
            <img 
              src={logoImg} 
              alt="JVX Logo" 
              className="h-7 w-7 object-contain"
            />
            <span className="hidden font-semibold text-[15px] tracking-tight sm:inline-block">
              JVX
            </span>
          </Link>

          {/* Separador */}
          <div className="hidden sm:block h-5 w-px bg-border" />

          {/* Navegação */}
          <nav className="flex items-center gap-0.5">
            {routes.map((route) => {
              const Icon = route.icon
              const isActive = location.pathname === route.href
              
              return (
                <Link
                  key={route.href}
                  to={route.href}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors cursor-pointer",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden lg:inline">{route.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Ações */}
        <div className="flex items-center gap-1.5">
          <ModeToggle />
          
          {/* Menu do Usuário */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 h-8 px-2.5 text-[13px]">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <User className="h-3.5 w-3.5" />
                </div>
                <span className="hidden sm:inline font-medium">{user?.username}</span>
                {isMaster && (
                  <Badge variant="default" className="ml-0.5 text-[10px] px-1.5 py-0">Admin</Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.username}</p>
                  <p className="text-xs text-muted-foreground">
                    {isMaster ? 'Administrador' : `Dev: ${user?.developerName || user?.developer_name || 'N/A'}`}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {isMaster && (
                <>
                  <DropdownMenuItem asChild>
                    <Link to="/usuarios" className="cursor-pointer">
                      <UserCog className="mr-2 h-4 w-4" />
                      Gerenciar Usuários
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              
              <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
