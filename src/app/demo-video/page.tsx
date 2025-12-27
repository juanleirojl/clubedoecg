"use client"

import { useEffect, useState } from "react"
import Script from "next/script"
import { Play, Heart, Sparkles, Zap, Trophy, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

// Tipos do PandaPlayer são declarados em video-player.tsx

export default function DemoVideoPage() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [showCTA, setShowCTA] = useState(false)

  useEffect(() => {
    // Mostrar CTA após 3 segundos
    const timer = setTimeout(() => setShowCTA(true), 3000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-red-950">
      {/* Script do Panda Video */}
      <Script 
        src="https://player.pandavideo.com.br/api.v2.js"
        strategy="afterInteractive"
        onLoad={() => {
          // Aguardar um pouco para o iframe estar pronto
          setTimeout(() => {
            window.pandascripttag = window.pandascripttag || []
            window.pandascripttag.push(function() {
              try {
                const p = new window.PandaPlayer('panda-c0c05ca6-d7d6-47cc-84ba-1cc49af5e650', {
                  onReady() {
                    p.loadButtonInTime({ fetchApi: true })
                    p.setParentWindowUrl()
                    p.onEvent((e) => {
                      if (e.message === 'panda_play') setIsPlaying(true)
                      if (e.message === 'panda_pause') setIsPlaying(false)
                    })
                  }
                })
              } catch (error) {
                console.log('Panda Player init:', error)
              }
            })
          }, 500)
        }}
      />

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-red-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 py-12 relative z-10">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-red-500/20 border border-red-500/30 rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-red-400" />
              <span className="text-red-300 text-sm font-medium">Aula Exclusiva</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Esse ECG engana{" "}
              <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                MUITA gente
              </span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Você acertaria? Análise completa com o Clube do ECG
            </p>
          </div>

          {/* Video Container */}
          <div className="max-w-5xl mx-auto">
            <div className="relative group">
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
              
              {/* Video wrapper */}
              <div className="relative bg-slate-900 rounded-2xl overflow-hidden border border-slate-800/50 shadow-2xl">
                {/* Top bar */}
                <div className="bg-slate-800/80 backdrop-blur-sm px-4 py-3 flex items-center justify-between border-b border-slate-700/50">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <span className="text-slate-400 text-sm font-mono">clube-do-ecg.com.br</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isPlaying && (
                      <span className="flex items-center gap-1.5 text-green-400 text-sm">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        Ao vivo
                      </span>
                    )}
                  </div>
                </div>

                {/* Video iframe */}
                <div style={{ position: 'relative', paddingTop: '56.25%' }}>
                  <iframe 
                    id="panda-c0c05ca6-d7d6-47cc-84ba-1cc49af5e650" 
                    src="https://player-vz-1ff387ab-5bf.tv.pandavideo.com.br/embed/?v=c0c05ca6-d7d6-47cc-84ba-1cc49af5e650" 
                    style={{ border: 'none', position: 'absolute', top: 0, left: 0 }}
                    allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture" 
                    allowFullScreen
                    width="100%" 
                    height="100%"
                  />
                </div>

                {/* Bottom info bar */}
                <div className="bg-slate-800/80 backdrop-blur-sm px-4 py-3 flex items-center justify-between border-t border-slate-700/50">
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-red-400">
                      <Heart className="w-4 h-4 mr-1" />
                      2.4k
                    </Button>
                  </div>
                  <div className="text-slate-500 text-sm">
                    17:29 • Método CAMPOS-ECG™
                  </div>
                </div>
              </div>
            </div>

            {/* Botão do Panda Video (carregado dinamicamente) */}
            <div id="2072f36a-1acc-46c1-a967-2b8c0243699b" className="mt-6 flex justify-center" />

            {/* CTA Cards */}
            <div className={`mt-12 grid md:grid-cols-3 gap-6 transition-all duration-1000 ${showCTA ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              {/* Card 1 */}
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 hover:border-red-500/50 transition-colors group">
                <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Play className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">+100 Aulas</h3>
                <p className="text-slate-400 text-sm">Do básico ao avançado, aprenda ECG de verdade</p>
              </div>

              {/* Card 2 */}
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 hover:border-orange-500/50 transition-colors group">
                <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6 text-orange-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Quizzes Práticos</h3>
                <p className="text-slate-400 text-sm">Teste seus conhecimentos com casos reais</p>
              </div>

              {/* Card 3 */}
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 hover:border-yellow-500/50 transition-colors group">
                <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Certificado</h3>
                <p className="text-slate-400 text-sm">Conquiste seu certificado de especialista</p>
              </div>
            </div>

            {/* Main CTA */}
            <div className={`mt-12 text-center transition-all duration-1000 delay-500 ${showCTA ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <Link href="/cadastro">
                <Button size="lg" className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all hover:scale-105">
                  Faça parte do Clube
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <p className="text-slate-500 text-sm mt-4">
                Acesso imediato • Cancele quando quiser
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

