"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { CheckCircle2, Loader2 } from "lucide-react"
import Script from "next/script"

export interface VideoPlayerProps {
  url: string
  title: string
  onProgress?: (progress: { played: number; playedSeconds: number }) => void
  onComplete?: () => void
  initialPosition?: number
}

// Extrai o ID do vídeo do Panda Video a partir da URL
function getPandaVideoId(url: string): string | null {
  // Formatos suportados:
  // https://player.pandavideo.com.br/embed/?v=VIDEO_ID
  // https://player-vz-*.tv.pandavideo.com.br/embed/?v=VIDEO_ID
  const regExp = /[?&]v=([a-zA-Z0-9-]+)/
  const match = url.match(regExp)
  return match ? match[1] : null
}

// Extrai o ID do vídeo do YouTube a partir da URL
function getYouTubeVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return (match && match[2].length === 11) ? match[2] : null
}

// Detecta o tipo de URL
function getVideoType(url: string): 'panda' | 'youtube' | 'unknown' {
  if (url.includes('pandavideo.com') || url.includes('.tv.pandavideo.com')) return 'panda'
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube'
  return 'unknown'
}

// Declaração global para o PandaPlayer
declare global {
  interface Window {
    pandascripttag: Array<() => void>
    PandaPlayer: new (id: string, options: {
      onReady: () => void
    }) => {
      onEvent: (callback: (e: {
        message: string
        currentTime?: number
        duration?: number
        percent?: number
      }) => void) => void
      getCurrentTime: () => number
      getDuration: () => number
      loadButtonInTime?: (options: { fetchApi: boolean }) => void
      setParentWindowUrl?: () => void
    }
  }
}

export function VideoPlayer({ 
  url, 
  title, 
  onProgress,
  onComplete,
}: VideoPlayerProps) {
  const [hasCompleted, setHasCompleted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const playerInitialized = useRef(false)
  const lastReportedTime = useRef(0)

  const videoType = getVideoType(url)
  const pandaVideoId = videoType === 'panda' ? getPandaVideoId(url) : null
  const youtubeVideoId = videoType === 'youtube' ? getYouTubeVideoId(url) : null

  // Handler para eventos do Panda Video
  const handlePandaEvent = useCallback((e: {
    message: string
    currentTime?: number
    duration?: number
    percent?: number
  }) => {
    switch (e.message) {
      case 'panda_ready':
        setIsLoading(false)
        break
      
      case 'panda_timeupdate':
        if (e.currentTime !== undefined && e.duration !== undefined) {
          setCurrentTime(e.currentTime)
          setDuration(e.duration)
          
          const played = e.duration > 0 ? e.currentTime / e.duration : 0
          
          // Reportar progresso a cada 5 segundos
          if (e.currentTime - lastReportedTime.current >= 5) {
            lastReportedTime.current = e.currentTime
            onProgress?.({ played, playedSeconds: e.currentTime })
          }
          
          // Auto-completar quando assistir 90%
          if (played >= 0.9 && !hasCompleted) {
            setHasCompleted(true)
            onComplete?.()
          }
        }
        break
      
      case 'panda_ended':
        if (!hasCompleted) {
          setHasCompleted(true)
          onComplete?.()
        }
        break
      
      case 'panda_play':
        setIsLoading(false)
        break
    }
  }, [hasCompleted, onComplete, onProgress])

  // Inicializar Panda Player
  useEffect(() => {
    if (videoType !== 'panda' || !pandaVideoId || playerInitialized.current) return

    const initPlayer = () => {
      if (typeof window.PandaPlayer === 'undefined') return
      
      try {
        const player = new window.PandaPlayer('panda-player', {
          onReady: () => {
            setIsLoading(false)
            player.onEvent(handlePandaEvent)
          }
        })
        playerInitialized.current = true
      } catch (error) {
        console.error('Erro ao inicializar Panda Player:', error)
      }
    }

    // Registrar callback para quando o script carregar
    window.pandascripttag = window.pandascripttag || []
    window.pandascripttag.push(initPlayer)

    // Tentar inicializar imediatamente se já carregou
    if (typeof window.PandaPlayer !== 'undefined') {
      initPlayer()
    }

    return () => {
      playerInitialized.current = false
    }
  }, [videoType, pandaVideoId, handlePandaEvent])

  const handleIframeLoad = useCallback(() => {
    // Para YouTube, apenas marcar como carregado
    if (videoType === 'youtube') {
      setIsLoading(false)
    }
  }, [videoType])

  // Formatador de tempo
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Player do Panda Video
  if (videoType === 'panda' && pandaVideoId) {
    return (
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
        {/* Script da API do Panda */}
        <Script 
          src="https://player.pandavideo.com.br/api.v2.js" 
          strategy="lazyOnload"
        />

        {/* Título e progresso */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent p-4 pointer-events-none">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-medium text-lg drop-shadow-lg flex items-center gap-2">
              {title}
              {hasCompleted && (
                <CheckCircle2 className="h-5 w-5 text-green-400" />
              )}
            </h3>
            {duration > 0 && (
              <span className="text-white/80 text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            )}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black z-20">
            <Loader2 className="h-12 w-12 text-red-500 animate-spin" />
          </div>
        )}

        {/* Panda Video Embed */}
        <iframe
          id="panda-player"
          src={url}
          style={{ border: 'none' }}
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
          onLoad={handleIframeLoad}
        />

        {/* Barra de progresso visual */}
        {duration > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div 
              className="h-full bg-red-500 transition-all duration-300"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>
        )}
      </div>
    )
  }

  // Player do YouTube (fallback)
  if (videoType === 'youtube' && youtubeVideoId) {
    return (
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
        {/* Título do vídeo */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent p-4 pointer-events-none">
          <h3 className="text-white font-medium text-lg drop-shadow-lg flex items-center gap-2">
            {title}
            {hasCompleted && (
              <CheckCircle2 className="h-5 w-5 text-green-400" />
            )}
          </h3>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black z-20">
            <Loader2 className="h-12 w-12 text-red-500 animate-spin" />
          </div>
        )}

        {/* YouTube Embed */}
        <iframe
          src={`https://www.youtube.com/embed/${youtubeVideoId}?rel=0&modestbranding=1&playsinline=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="w-full h-full"
          onLoad={handleIframeLoad}
        />
      </div>
    )
  }

  // Fallback para URLs desconhecidas
  return (
    <div className="relative aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center">
      <div className="text-white text-center p-4">
        <p className="text-lg font-medium mb-2">Vídeo não disponível</p>
        <p className="text-sm text-gray-400">URL: {url}</p>
      </div>
    </div>
  )
}
