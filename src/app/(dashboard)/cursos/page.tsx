"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, Play, Lock, Loader2, ChevronRight, Sparkles, TrendingUp, Star } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { useCourses } from "@/contexts/user-context"

// Mapeia dificuldade para cores
function getBeltColors(difficulty: string) {
  if (difficulty === "iniciante") return { bg: "from-slate-100 to-white", text: "text-gray-800", badge: "bg-white border-2 border-gray-300", name: "Faixa Branca", ring: "ring-white" }
  if (difficulty === "intermediario") return { bg: "from-blue-600 to-blue-800", text: "text-white", badge: "bg-blue-500", name: "Faixa Azul", ring: "ring-blue-500" }
  return { bg: "from-gray-800 to-black", text: "text-white", badge: "bg-gray-900", name: "Faixa Preta", ring: "ring-gray-900" }
}

// Ordem das faixas para progressão
const beltOrder = ["iniciante", "intermediario", "avancado"]

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const { courses, isLoading, isPro } = useCourses()

  // Verificar se o curso está bloqueado
  function isCourseBlocked(course: typeof courses[0]): boolean {
    if (isPro) return false
    if (course.difficulty === "iniciante") return false
    
    const courseIndex = beltOrder.indexOf(course.difficulty)
    if (courseIndex <= 0) return false
    
    const previousBelt = beltOrder[courseIndex - 1]
    const previousCourse = courses.find(c => c.difficulty === previousBelt)
    
    return !previousCourse || previousCourse.progress < 80
  }

  // Calcular duração em horas
  function getDurationHours(course: typeof courses[0]): number {
    const totalSeconds = course.modules?.reduce((acc, mod) => 
      acc + (mod.lessons?.reduce((lacc, l) => lacc + (l.duration_seconds || 0), 0) || 0)
    , 0) || 0
    return Math.max(1, Math.round(totalSeconds / 3600))
  }

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Cursos em andamento (ordenados por progresso decrescente)
  const coursesInProgress = courses
    .filter(c => c.progress > 0 && c.progress < 100)
    .sort((a, b) => b.progress - a.progress)

  // Curso principal (o mais avançado)
  const featuredCourse = coursesInProgress[0] || courses[0]

  // Estatísticas de progressão
  const completedCount = courses.filter(c => c.progress >= 80).length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8">
      {/* Hero Section - Curso Principal em Destaque */}
      {featuredCourse && (
        <div className="relative h-72 md:h-96 mb-8 rounded-xl overflow-hidden -mx-4 md:-mx-6 lg:-mx-8 group">
          {/* Background Image */}
          <Image
            src={featuredCourse.thumbnail_url || "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=1920"}
            alt={featuredCourse.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-transparent" />

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
            <div className="max-w-xl">
              {featuredCourse.progress > 0 && (
                <div className="inline-flex items-center gap-2 bg-red-500/30 backdrop-blur-sm border border-red-500/30 rounded-full px-3 py-1 mb-3">
                  <Sparkles className="w-3 h-3 text-red-400" />
                  <span className="text-red-300 text-xs font-medium">Continue de onde parou</span>
                </div>
              )}
              
              <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
                {featuredCourse.title}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-slate-400 text-sm mb-3">
                <span>{featuredCourse.totalLessons} aulas</span>
                <span>•</span>
                <span>{getDurationHours(featuredCourse)}h</span>
                {featuredCourse.progress > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-green-400 font-medium">{featuredCourse.progress}% concluído</span>
                  </>
                )}
              </div>

              {featuredCourse.progress > 0 && (
                <div className="w-full max-w-sm mb-4">
                  <Progress value={featuredCourse.progress} className="h-1.5 bg-slate-700" />
                </div>
              )}

              <Button asChild size="lg" className="bg-white text-black hover:bg-white/90 shadow-xl hover:shadow-white/20 transition-all duration-300 hover:scale-105">
                <Link href={`/cursos/${featuredCourse.slug}`}>
                  <Play className="w-5 h-5 mr-2 fill-current" />
                  {featuredCourse.progress > 0 ? "Continuar" : "Começar"}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== PROGRESSÃO DE FAIXAS ==================== */}
      <div className="px-4 md:px-12 py-6 mb-4">
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🥋</span>
              <h3 className="text-lg font-bold text-white">Sua Jornada</h3>
            </div>
            <span className="text-sm text-slate-400">
              {completedCount} de {courses.length} faixas
            </span>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            {courses.map((course, index) => {
              const isCompleted = course.progress >= 80
              const isInProgress = course.progress > 0 && course.progress < 80
              const isLocked = isCourseBlocked(course)
              const colors = getBeltColors(course.difficulty)
              
              return (
                <div key={course.id} className="flex items-center flex-1">
                  <Link 
                    href={isLocked ? "#" : `/cursos/${course.slug}`}
                    className={cn(
                      "flex flex-col items-center group",
                      isLocked && "cursor-not-allowed"
                    )}
                  >
                    {/* Círculo da Faixa */}
                    <div className={cn(
                      "w-14 h-14 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-full flex items-center justify-center mb-2 transition-all duration-300",
                      colors.badge,
                      isCompleted && "ring-4 ring-green-500 ring-offset-2 ring-offset-slate-900",
                      isInProgress && "ring-4 ring-red-500 ring-offset-2 ring-offset-slate-900",
                      isLocked && "opacity-40",
                      !isLocked && "group-hover:scale-110 group-hover:shadow-lg"
                    )}>
                      {isLocked ? (
                        <Lock className={cn(
                          "w-5 h-5 sm:w-6 sm:h-6",
                          course.difficulty === "iniciante" ? "text-gray-400" : "text-white/70"
                        )} />
                      ) : isCompleted ? (
                        <Star className={cn(
                          "w-6 h-6 sm:w-7 sm:h-7 fill-current",
                          course.difficulty === "iniciante" ? "text-yellow-500" : "text-yellow-400"
                        )} />
                      ) : (
                        <span className="text-xl sm:text-2xl md:text-3xl">🥋</span>
                      )}
                    </div>
                    
                    {/* Nome da Faixa */}
                    <span className={cn(
                      "text-[10px] sm:text-xs font-semibold mb-1 transition-colors",
                      isLocked ? "text-slate-600" : "text-white group-hover:text-red-400"
                    )}>
                      {course.difficulty === "iniciante" ? "Branca" 
                        : course.difficulty === "intermediario" ? "Azul" : "Preta"}
                    </span>
                    
                    {/* Status */}
                    <span className={cn(
                      "text-[10px] sm:text-xs",
                      isCompleted ? "text-green-400" : isInProgress ? "text-red-400" : "text-slate-500"
                    )}>
                      {isLocked ? "🔒" : isCompleted ? "✓ Completo" : `${course.progress}%`}
                    </span>
                  </Link>
                  
                  {/* Conector entre faixas */}
                  {index < courses.length - 1 && (
                    <div className="flex-1 h-1 mx-2 sm:mx-4 bg-slate-700 rounded-full relative overflow-hidden">
                      <div 
                        className={cn(
                          "absolute inset-y-0 left-0 rounded-full transition-all duration-500",
                          isCompleted ? "bg-green-500" : isInProgress ? "bg-red-500" : "bg-slate-600"
                        )}
                        style={{ width: isCompleted ? "100%" : `${course.progress}%` }}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Continue Assistindo - Só aparece se tiver cursos em andamento */}
      {coursesInProgress.length > 0 && (
        <div className="px-4 md:px-12 py-8">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-red-500" />
            <h2 className="text-xl font-bold text-white">Continue Assistindo</h2>
            <span className="text-slate-500 text-sm">({coursesInProgress.length} {coursesInProgress.length === 1 ? 'curso' : 'cursos'})</span>
          </div>

          {/* Horizontal Scroll */}
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {coursesInProgress.map((course) => {
              const colors = getBeltColors(course.difficulty)
              const durationHours = getDurationHours(course)
              
              return (
                <Link
                  key={course.id}
                  href={`/cursos/${course.slug}`}
                  className="group relative flex-shrink-0 w-72 aspect-video rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:z-10 hover:shadow-2xl hover:shadow-red-500/30"
                >
                  {/* Background */}
                  <Image
                    src={course.thumbnail_url || "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800"}
                    alt={course.title}
                    fill
                    className="object-cover transition-all duration-500 group-hover:scale-110"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                  {/* Progress Badge */}
                  <div className="absolute top-3 right-3">
                    <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded shadow-lg">
                      {course.progress}%
                    </div>
                  </div>

                  {/* Belt Badge */}
                  <div className="absolute top-3 left-3">
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide",
                      colors.badge,
                      colors.text
                    )}>
                      {colors.name.split(" ")[1]}
                    </span>
                  </div>

                  {/* Play Button on Hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-xl transform scale-75 group-hover:scale-100 transition-transform">
                      <Play className="w-7 h-7 text-black ml-0.5 fill-current" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-sm font-bold text-white mb-1 line-clamp-1 group-hover:text-red-400 transition-colors">
                      {course.title}
                    </h3>
                    <div className="flex items-center gap-2 text-slate-400 text-xs">
                      <span>{course.completedLessons}/{course.totalLessons} aulas</span>
                      <span>•</span>
                      <span>{durationHours}h</span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full h-1 bg-slate-700 rounded-full mt-2 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Trilha de Faixas - Todos os Cursos */}
      <div className="px-4 md:px-12 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📚</span>
            <h2 className="text-xl font-bold text-white">Todos os Cursos</h2>
          </div>
          <div className="relative w-64 hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Buscar cursos..."
              className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:ring-red-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Courses Grid - Cards maiores */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredCourses.map((course, index) => {
            const isLocked = isCourseBlocked(course)
            const colors = getBeltColors(course.difficulty)
            const durationHours = getDurationHours(course)
            const isNew = index === courses.length - 1 // Último curso é "novo"
            
            return (
              <Link
                key={course.id}
                href={isLocked ? "#" : `/cursos/${course.slug}`}
                className={cn(
                  "group relative aspect-video rounded-xl overflow-hidden transition-all duration-300",
                  isLocked ? "cursor-not-allowed" : "hover:shadow-2xl hover:shadow-red-500/30"
                )}
              >
                {/* Background */}
                <Image
                  src={course.thumbnail_url || "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800"}
                  alt={course.title}
                  fill
                  className={cn(
                    "object-cover",
                    isLocked && "grayscale brightness-50"
                  )}
                />
                
                {/* Gradient Overlay */}
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent",
                  isLocked && "bg-black/70"
                )} />

                {/* Belt Badge */}
                <div className="absolute top-4 left-4">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg",
                    colors.badge,
                    colors.text
                  )}>
                    {colors.name}
                  </span>
                </div>

                {/* Badges no canto direito */}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  {/* Badge GRÁTIS */}
                  {course.difficulty === "iniciante" && (
                    <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded shadow-lg">
                      GRÁTIS
                    </span>
                  )}
                  
                  {/* Badge NOVO (para o último curso adicionado) */}
                  {isNew && !isLocked && (
                    <span className="px-2 py-1 bg-amber-500 text-white text-xs font-bold rounded shadow-lg">
                      NOVO
                    </span>
                  )}
                  
                  {/* Badge EM BREVE (para cursos bloqueados sem conteúdo) */}
                  {isLocked && course.totalLessons === 0 && (
                    <span className="px-2 py-1 bg-purple-500 text-white text-xs font-bold rounded shadow-lg">
                      EM BREVE
                    </span>
                  )}
                </div>

                {/* Lock Icon */}
                {isLocked && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-black/80 flex items-center justify-center backdrop-blur-sm border border-white/10">
                      <Lock className="w-8 h-8 text-white/80" />
                    </div>
                  </div>
                )}

                {/* Play Button on Hover */}
                {!isLocked && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-xl transform scale-75 group-hover:scale-100 transition-transform">
                      <Play className="w-8 h-8 text-black ml-1 fill-current" />
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-lg font-bold text-white mb-1 group-hover:text-red-400 transition-colors">
                    {course.title}
                  </h3>
                  
                  <div className="flex items-center gap-3 text-slate-400 text-xs mb-2">
                    <span>{course.totalLessons} aulas</span>
                    <span>•</span>
                    <span>{durationHours}h</span>
                    {course.progress > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-green-400 font-medium">{course.progress}%</span>
                      </>
                    )}
                  </div>

                  {/* Progress Bar */}
                  {course.progress > 0 && !isLocked && (
                    <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  )}

                  {isLocked && (
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Complete a faixa anterior para desbloquear
                    </p>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* CTA PRO */}
      {!isPro && (
        <div className="px-4 md:px-12 py-12">
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-red-600 via-red-500 to-orange-500 p-8 md:p-12 group hover:shadow-2xl hover:shadow-red-500/30 transition-shadow duration-300">
            <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />
            
            {/* Animated Glow */}
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
            
            <div className="relative z-10 max-w-2xl">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-yellow-300" />
                <span className="text-yellow-300 text-sm font-medium">Oferta Especial</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                Desbloqueie todas as faixas
              </h3>
              <p className="text-white/80 mb-6">
                Assine o Clube do ECG e tenha acesso completo a todos os cursos, materiais exclusivos e certificados.
              </p>
              <Button size="lg" className="bg-white text-red-600 hover:bg-white/90 hover:scale-105 transition-transform shadow-xl">
                Ver Planos
                <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
