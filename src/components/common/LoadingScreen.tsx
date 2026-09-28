export function LoadingScreen() {
  return (
    <div className="flex items-center justify-center h-screen" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-muted border-t-primary" aria-hidden="true" />
        </div>
        <p className="text-sm text-muted-foreground animate-pulse">Carregando...</p>
      </div>
    </div>
  )
}
