import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { IconLock, IconUser, IconEye, IconEyeOff } from '@tabler/icons-react'
import { z } from 'zod'
import logoImg from '@/assets/favicon.png'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

  const loginSchema = z.object({
    username: z.string().min(3, 'Usuário deve ter ao menos 3 caracteres').max(32, 'Máximo 32 caracteres').regex(/^[a-zA-Z0-9._-]+$/, 'Usuário inválido'),
    password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres').max(64, 'Máximo 64 caracteres')
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = loginSchema.safeParse({ username, password })
    if (!result.success) {
      const msg = result.error.issues.map((e: { message: string }) => e.message).join(' | ')
      toast.error(msg)
      return
    }
    setLoading(true)
    try {
      await login(username, password)
      toast.success('Login realizado com sucesso!')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" aria-label="Login">
      {/* Painel esquerdo — Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-primary">
        {/* Padrão de fundo decorativo */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,oklch(0.45_0.11_249)_0%,oklch(0.55_0.13_249)_50%,oklch(0.50_0.15_260)_100%)]" />
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/5 -translate-y-1/3 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-white/5 translate-y-1/3 -translate-x-1/3" />
          <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] rounded-full bg-white/[0.03] -translate-x-1/2 -translate-y-1/2" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="JVX" className="h-10 w-10 rounded-lg" />
            <span className="text-xl font-bold tracking-tight">JVX Desenvolvimento</span>
          </div>
          
          <div className="space-y-6 max-w-md">
            <h1 className="text-4xl font-bold leading-tight tracking-tight">
              Gerencie seus projetos com eficiência
            </h1>
            <p className="text-lg text-white/70 leading-relaxed">
              Controle financeiro, acompanhamento de entregas e gestão de equipe — tudo em um só lugar.
            </p>
            <div className="flex flex-col gap-3 pt-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <span className="text-sm text-white/80">Dashboard completo com métricas em tempo real</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <span className="text-sm text-white/80">Relatórios financeiros detalhados</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <span className="text-sm text-white/80">Gestão de equipe e acompanhamento de prazos</span>
              </div>
            </div>
          </div>
          
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} JVX Desenvolvimento. Todos os direitos reservados.
          </p>
        </div>
      </div>

      {/* Painel direito — Formulário */}
      <div className="flex-1 flex items-center justify-center bg-background p-6 sm:p-12">
        <div className="w-full max-w-[400px] space-y-8">
          {/* Logo mobile */}
          <div className="flex items-center gap-3 lg:hidden">
            <img src={logoImg} alt="JVX" className="h-9 w-9 rounded-lg" />
            <span className="text-lg font-bold tracking-tight text-foreground">JVX Desenvolvimento</span>
          </div>
          
          {/* Header */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Entrar na sua conta
            </h2>
            <p className="text-sm text-muted-foreground">
              Insira suas credenciais para acessar o sistema
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-5" aria-label="Formulário de login">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                Usuário
              </Label>
              <div className="relative">
                <IconUser className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-muted-foreground/60 pointer-events-none" aria-hidden="true" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Seu nome de usuário"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 h-11"
                  disabled={loading}
                  autoComplete="username"
                  autoFocus
                  required
                  aria-required="true"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Senha
              </Label>
              <div className="relative">
                <IconLock className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-muted-foreground/60 pointer-events-none" aria-hidden="true" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-11"
                  disabled={loading}
                  autoComplete="current-password"
                  required
                  aria-required="true"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? (
                    <IconEyeOff className="w-[18px] h-[18px]" />
                  ) : (
                    <IconEye className="w-[18px] h-[18px]" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-sm font-semibold"
              disabled={loading || !username || !password}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Entrando...
                </span>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground/60">
            Sistema de Gerenciamento de Desenvolvimento
          </p>
        </div>
      </div>
    </div>
  )
}
