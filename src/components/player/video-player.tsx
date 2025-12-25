"use client"

import { useEffect, useRef, useState } from "react"
import { Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface VideoPlayerProps {
  url: string
  title: string
  onProgress?: (progress: { played: number; playedSeconds: number }) => void
  onComplete?: () => void
  initialPosition?: number
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ReactPlayerComponent = React.ComponentType<any>

export function VideoPlayer({ 
  url, 
  title, 
  onProgress, 
  onComplete,
}: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [ReactPlayer, setReactPlayer] = useState<ReactPlayerComponent | null>(null)
  
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [showControls, setShowControls] = useState(true)

  // Load ReactPlayer dynamically
  useEffect(() => {
    import("react-player").then((mod) => {
      setReactPlayer(() => mod.default as ReactPlayerComponent)
    })
  }, [])

  // Esconde controles após 3s
  useEffect(() => {
    let timeout: NodeJS.Timeout
    if (playing) {
      timeout = setTimeout(() => setShowControls(false), 3000)
    }
    return () => clearTimeout(timeout)
  }, [playing, showControls])

  const handleProgress = (state: { played: number; playedSeconds: number }) => {
    setProgress(state.played * 100)
    setCurrentTime(state.playedSeconds)
    onProgress?.(state)

    // Marca como completo se assistiu 90%
    if (state.played >= 0.9) {
      onComplete?.()
    }
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    setProgress(percent * 100)
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div
      ref={containerRef}
      className="relative aspect-video bg-black rounded-lg overflow-hidden group"
      onMouseMove={() => setShowControls(true)}
      onMouseLeave={() => playing && setShowControls(false)}
    >
      {ReactPlayer && (
        <ReactPlayer
          url={url}
          width="100%"
          height="100%"
          playing={playing}
          muted={muted}
          onProgress={handleProgress}
          onDuration={setDuration}
          config={{
            vimeo: {
              playerOptions: {
                controls: false,
              },
            },
          }}
        />
      )}

      {/* Loading State */}
      {!ReactPlayer && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-12 w-12 rounded-full border-4 border-red-500 border-t-transparent animate-spin" />
        </div>
      )}

      {/* Overlay de Controles */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 transition-opacity",
          showControls ? "opacity-100" : "opacity-0"
        )}
      >
        {/* Título */}
        <div className="absolute top-4 left-4 right-4">
          <h3 className="text-white font-medium text-lg drop-shadow-lg">{title}</h3>
        </div>

        {/* Controles Centrais */}
        <div className="absolute inset-0 flex items-center justify-center gap-8">
          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 text-white hover:bg-white/20 rounded-full"
            onClick={() => setCurrentTime((t) => Math.max(0, t - 10))}
          >
            <SkipBack className="h-6 w-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-20 w-20 text-white hover:bg-white/20 rounded-full"
            onClick={() => setPlaying(!playing)}
          >
            {playing ? (
              <Pause className="h-10 w-10" />
            ) : (
              <Play className="h-10 w-10 ml-1" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 text-white hover:bg-white/20 rounded-full"
            onClick={() => setCurrentTime((t) => t + 10)}
          >
            <SkipForward className="h-6 w-6" />
          </Button>
        </div>

        {/* Barra de Progresso e Controles Inferiores */}
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
          {/* Barra de Progresso */}
          <div
            className="h-1 bg-white/30 rounded-full cursor-pointer group/progress hover:h-2 transition-all"
            onClick={handleSeek}
          >
            <div
              className="h-full bg-red-500 rounded-full relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* Controles Inferiores */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-white/20"
                onClick={() => setPlaying(!playing)}
              >
                {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-white/20"
                onClick={() => setMuted(!muted)}
              >
                {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>

              <span className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={toggleFullscreen}
            >
              <Maximize className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Play Button Inicial */}
      {!playing && progress === 0 && ReactPlayer && (
        <div
          className="absolute inset-0 flex items-center justify-center cursor-pointer"
          onClick={() => setPlaying(true)}
        >
          <div className="h-20 w-20 rounded-full bg-red-500 flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
            <Play className="h-10 w-10 text-white ml-1" />
          </div>
        </div>
      )}
    </div>
  )
}
