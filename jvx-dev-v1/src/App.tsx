import { lazy, Suspense } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "@/contexts/AuthContext"
import { WorksProvider } from "@/contexts/WorksContext"
import { HideValuesProvider } from "@/contexts/HideValuesContext"
import { ErrorBoundary, ProtectedRoute, LoadingScreen } from "@/components/common"
import { Header } from "@/components/Header"
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
const Ferramentas = lazy(() => import("./pages/Ferramentas"))
const GeradorLinkSenhas = lazy(() => import("./ferramentas/GeradorLinkSenhas"))
const DownDetector = lazy(() => import("./ferramentas/DownDetector"))
const GerenciarUsuarios = lazy(() => import("./pages/GerenciarUsuarios"))

// Layout wrapper para páginas autenticadas
function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 sm:px-6 py-5" tabIndex={0} aria-label="Conteúdo principal">
        {children}
      </main>
    </div>
  )
}

function AppContent() {
  const { user } = useAuth()
  
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* Rota pública */}
          <Route 
            path="/login" 
            element={user ? <Navigate to="/" replace /> : <Login />} 
          />
          
          {/* Rotas protegidas */}
          <Route path="/" element={
            <ProtectedRoute>
              <AuthenticatedLayout><Home /></AuthenticatedLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/sites" element={
            <ProtectedRoute>
              <AuthenticatedLayout><Sites /></AuthenticatedLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/analises" element={
            <ProtectedRoute>
              <AuthenticatedLayout><Analises /></AuthenticatedLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/calendario" element={
            <ProtectedRoute>
              <AuthenticatedLayout><Calendario /></AuthenticatedLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/equipe" element={
            <ProtectedRoute>
              <AuthenticatedLayout><Equipe /></AuthenticatedLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/relatorios" element={
            <ProtectedRoute>
              <AuthenticatedLayout><Relatorios /></AuthenticatedLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/configuracoes" element={
            <ProtectedRoute>
              <AuthenticatedLayout><Configuracoes /></AuthenticatedLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/ferramentas" element={
            <ProtectedRoute>
              <AuthenticatedLayout><Ferramentas /></AuthenticatedLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/ferramentas/gerador-link-senhas" element={
            <ProtectedRoute>
              <AuthenticatedLayout><GeradorLinkSenhas /></AuthenticatedLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/ferramentas/down-detector" element={
            <ProtectedRoute>
              <AuthenticatedLayout><DownDetector /></AuthenticatedLayout>
            </ProtectedRoute>
          } />
          
          {/* Rota apenas para master */}
          <Route path="/usuarios" element={
            <ProtectedRoute requireMaster>
              <AuthenticatedLayout><GerenciarUsuarios /></AuthenticatedLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </Suspense>
      <Toaster richColors position="top-center" />
    </ErrorBoundary>
  )
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <WorksProvider>
          <HideValuesProvider>
            <AppContent />
          </HideValuesProvider>
        </WorksProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
