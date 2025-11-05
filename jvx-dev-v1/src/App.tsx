import { lazy, Suspense } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { ThemeProvider } from "@/components/ui/theme-provider"
import { AuthProvider, useAuth } from "@/contexts/AuthContext"
import { WorksProvider, useWorks } from "@/contexts/WorksContext"
import { NotificationsProvider } from "@/contexts/NotificationsContext"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { Header } from "@/components/Header"
import { LoadingScreen } from "@/components/LoadingScreen"
import { Toaster } from "sonner"

// Lazy loading de páginas
const Login = lazy(() => import("./pages/Login"))
const Home = lazy(() => import("./pages/Home"))
const Sites = lazy(() => import("./pages/Sites"))
const Analises = lazy(() => import("./pages/Analises"))
const Calendario = lazy(() => import("./pages/Calendario"))
const Equipe = lazy(() => import("./pages/Equipe"))
const Relatorios = lazy(() => import("./pages/Relatorios"))
const Configuracoes = lazy(() => import("./pages/Configuracoes"))
const GerenciarUsuarios = lazy(() => import("./pages/GerenciarUsuarios"))

function AppContent() {
  const { works } = useWorks()
  const { user } = useAuth()
  
  return (
    <ErrorBoundary>
      <NotificationsProvider works={works}>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/login" element={
              user ? <Navigate to="/" replace /> : <Login />
            } />
            
            <Route path="/" element={
              <ProtectedRoute>
                <div className="min-h-screen bg-background flex flex-col">
                  <Header />
                  <main className="container mx-auto px-6 py-6 flex-1">
                    <Home />
                  </main>
                </div>
              </ProtectedRoute>
            } />
            
            <Route path="/sites" element={
              <ProtectedRoute>
                <div className="min-h-screen bg-background flex flex-col">
                  <Header />
                  <main className="container mx-auto px-6 py-6 flex-1">
                    <Sites />
                  </main>
                </div>
              </ProtectedRoute>
            } />
            
            <Route path="/analises" element={
              <ProtectedRoute>
                <div className="min-h-screen bg-background flex flex-col">
                  <Header />
                  <main className="container mx-auto px-6 py-6 flex-1">
                    <Analises />
                  </main>
                </div>
              </ProtectedRoute>
            } />
            
            <Route path="/calendario" element={
              <ProtectedRoute>
                <div className="min-h-screen bg-background flex flex-col">
                  <Header />
                  <main className="container mx-auto px-6 py-6 flex-1">
                    <Calendario />
                  </main>
                </div>
              </ProtectedRoute>
            } />
            
            <Route path="/equipe" element={
              <ProtectedRoute>
                <div className="min-h-screen bg-background flex flex-col">
                  <Header />
                  <main className="container mx-auto px-6 py-6 flex-1">
                    <Equipe />
                  </main>
                </div>
              </ProtectedRoute>
            } />
            
            <Route path="/relatorios" element={
              <ProtectedRoute>
                <div className="min-h-screen bg-background flex flex-col">
                  <Header />
                  <main className="container mx-auto px-6 py-6 flex-1">
                    <Relatorios />
                  </main>
                </div>
              </ProtectedRoute>
            } />
            
            <Route path="/configuracoes" element={
              <ProtectedRoute>
                <div className="min-h-screen bg-background flex flex-col">
                  <Header />
                  <main className="container mx-auto px-6 py-6 flex-1">
                    <Configuracoes />
                  </main>
                </div>
              </ProtectedRoute>
            } />
            
            <Route path="/usuarios" element={
              <ProtectedRoute requireMaster>
                <div className="min-h-screen bg-background flex flex-col">
                  <Header />
                  <main className="container mx-auto px-6 py-6 flex-1">
                    <GerenciarUsuarios />
                  </main>
                </div>
              </ProtectedRoute>
            } />
          </Routes>
        </Suspense>
        <Toaster richColors position="top-center" />
      </NotificationsProvider>
    </ErrorBoundary>
  )
}

export function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrowserRouter>
        <AuthProvider>
          <WorksProvider>
            <AppContent />
          </WorksProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
