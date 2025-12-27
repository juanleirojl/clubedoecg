"use client"

import { Loader2 } from "lucide-react"
import { BRAND_COLORS } from "@/lib/constants"
import { cn } from "@/lib/utils"

interface LoadingProps {
  size?: "sm" | "md" | "lg"
  text?: string
  fullScreen?: boolean
  className?: string
}

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
}

/**
 * Componente de loading reutilizável
 */
export function Loading({ 
  size = "md", 
  text, 
  fullScreen = false,
  className 
}: LoadingProps) {
  const content = (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <Loader2 
        className={cn("animate-spin", sizeMap[size])}
        style={{ color: BRAND_COLORS.primary }}
      />
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
        {content}
      </div>
    )
  }

  return content
}

/**
 * Skeleton para cards
 */
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-lg bg-muted animate-pulse", className)}>
      <div className="aspect-video bg-muted-foreground/10 rounded-t-lg" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-muted-foreground/10 rounded w-3/4" />
        <div className="h-3 bg-muted-foreground/10 rounded w-1/2" />
      </div>
    </div>
  )
}

/**
 * Skeleton para lista de cursos
 */
export function CourseListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}

/**
 * Skeleton para página de aula
 */
export function LessonSkeleton() {
  return (
    <div className="space-y-6">
      {/* Video player skeleton */}
      <div className="aspect-video bg-muted rounded-lg animate-pulse" />
      
      {/* Title */}
      <div className="space-y-2">
        <div className="h-8 bg-muted rounded w-2/3 animate-pulse" />
        <div className="h-4 bg-muted rounded w-1/3 animate-pulse" />
      </div>
      
      {/* Content */}
      <div className="space-y-3">
        <div className="h-4 bg-muted rounded animate-pulse" />
        <div className="h-4 bg-muted rounded w-5/6 animate-pulse" />
        <div className="h-4 bg-muted rounded w-4/6 animate-pulse" />
      </div>
    </div>
  )
}

/**
 * Skeleton para sidebar de navegação
 */
export function SidebarSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-muted animate-pulse" />
          <div className="flex-1 h-4 bg-muted rounded animate-pulse" />
        </div>
      ))}
    </div>
  )
}

