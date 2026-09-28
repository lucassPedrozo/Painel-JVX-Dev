import * as React from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      const isDev = process.env.NODE_ENV === 'development';
      return (
        <div className="flex items-center justify-center min-h-screen bg-background" role="alert" aria-live="assertive">
          <div className="max-w-md w-full mx-4">
            <div className="rounded-xl border bg-card shadow-lg p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-red-100 text-red-600">
                  <AlertCircle className="h-8 w-8" aria-hidden="true" />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2" tabIndex={0}>Algo deu errado</h2>
              <p className="text-muted-foreground mb-6">
                Ocorreu um erro inesperado. Por favor, tente recarregar a página.
              </p>
              {isDev && this.state.error && (
                <details className="mb-6 text-left">
                  <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                    Detalhes do erro
                  </summary>
                  <pre className="mt-2 p-3 rounded-lg bg-muted text-xs overflow-auto">
                    {this.state.error.message}
                  </pre>
                </details>
              )}
              <Button
                onClick={() => window.location.reload()}
                className="w-full"
                aria-label="Recarregar página"
              >
                <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
                Recarregar Página
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children;
  }
}
