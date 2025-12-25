"use client"

import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"

// Componente de loading enquanto o player carrega
function VideoPlayerSkeleton() {
  return (
    <div className="relative aspect-video bg-slate-900 rounded-lg flex items-center justify-center">
      <div className="text-center text-white">
        <Loader2 className="h-10 w-10 animate-spin mx-auto mb-2" />
        <p className="text-sm text-slate-400">Carregando player...</p>
      </div>
    </div>
  )
}

// Lazy load do VideoPlayer - só carrega quando necessário
export const LazyVideoPlayer = dynamic(
  () => import("./video-player").then((mod) => mod.VideoPlayer),
  {
    loading: () => <VideoPlayerSkeleton />,
    ssr: false, // Não renderiza no servidor
  }
)

// Re-exportar o tipo para uso
export type { VideoPlayerProps } from "./video-player"



