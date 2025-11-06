import { Link, useLocation } from "react-router-dom"
import { ModeToggle } from "@/components/ui/mode-toggle"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/AuthContext"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Globe, BarChart3, Calendar, Users, FileText, Settings, LogOut, UserCog, User } from "lucide-react"
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
    href: "/configuracoes",
    label: "Configurações",
    icon: Settings
  }
]

export function Header() {
  const location = useLocation()
  const { user, logout, isMaster } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        {/* Logo e Nome */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3 transition-opacity duration-200 hover:opacity-70">
            <img 
              src={logoImg} 
              alt="JVX Logo" 
              className="h-8 w-8 object-contain"
            />
            <span className="hidden font-semibold text-lg sm:inline-block">
              JVX Desenvolvimento
            </span>
          </Link>

          {/* Navegação */}
          <nav className="flex items-center gap-1">
            {routes.map((route) => {
              const Icon = route.icon
              const isActive = location.pathname === route.href
              
              return (
                <Link
                  key={route.href}
                  to={route.href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 cursor-pointer",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{route.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Ações */}
        <div className="flex items-center gap-2">
          <ModeToggle />
          
          {/* Menu do Usuário */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{user?.username}</span>
                {isMaster && (
                  <Badge variant="default" className="ml-1">Master</Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.username}</p>
                  <p className="text-xs text-muted-foreground">
                    {isMaster ? 'Administrador' : `Desenvolvedor: ${user?.developerName}`}
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
              
              <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-600">
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
