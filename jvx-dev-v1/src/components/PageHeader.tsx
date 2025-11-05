import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: string
  description: string
  className?: string
}

export function PageHeader({ title, description, className }: PageHeaderProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
        {title}
      </h1>
      <p className="text-base text-muted-foreground max-w-3xl">
        {description}
      </p>
    </div>
  )
}
