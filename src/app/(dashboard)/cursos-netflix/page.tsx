"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, BookOpen, Clock, Award, Play, Lock, Loader2, ChevronRight, Sparkles } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { useCourses } from "@/contexts/user-context"

// Mapeia dificuldade para cores
function getBeltColors(difficulty: string) {
  if (difficulty === "iniciante") return { bg: "from-slate-100 to-white", text: "text-gray-800", badge: "bg-white border-2 border-gray-300", name: "Faixa Branca" }
  if (difficulty === "intermediario") return { bg: "from-blue-600 to-blue-800", text: "text-white", badge: "bg-blue-500", name: "Faixa Azul" }
  return { bg: "from-gray-800 to-black", text: "text-white", badge: "bg-gray-900", name: "Faixa Preta" }
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

  // Encontrar curso em andamento
  const courseInProgress = courses.find(c => c.progress > 0 && c.progress < 100)
  const featuredCourse = courseInProgress || courses[0]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen -m-4 md:-m-6 lg:-m-8 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section - Curso em Destaque */}
      {featuredCourse && (
        <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src={featuredCourse.thumbnail_url || "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=1920"}
              alt={featuredCourse.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-transparent to-transparent" />
          </div>

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
            <div className="max-w-2xl">
              {courseInProgress && (
                <div className="inline-flex items-center gap-2 bg-red-500/20 border border-red-500/30 rounded-full px-4 py-1.5 mb-4">
                  <Sparkles className="w-4 h-4 text-red-400" />
                  <span className="text-red-300 text-sm font-medium">Continue de onde parou</span>
                </div>
              )}
              
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">
                {featuredCourse.title}
              </h1>
              
              <p className="text-slate-300 text-lg mb-4 line-clamp-2">
                Curso completo de ECG para dominar a interpretação de eletrocardiogramas.
              </p>

              <div className="flex flex-wrap items-center gap-4 text-slate-400 text-sm mb-6">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  <span>{featuredCourse.totalLessons} aulas</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>{getDurationHours(featuredCourse)}h de conteúdo</span>
                </div>
                {featuredCourse.progress > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-yellow-500" />
                    <span>{featuredCourse.progress}% concluído</span>
                  </div>
                )}
              </div>

              {featuredCourse.progress > 0 && (
                <div className="w-full max-w-md mb-4">
                  <Progress value={featuredCourse.progress} className="h-1.5 bg-slate-700" />
                </div>
              )}

              <div className="flex gap-3">
                <Button asChild size="lg" className="bg-white text-black hover:bg-white/90">
                  <Link href={`/cursos/${featuredCourse.slug}`}>
                    <Play className="w-5 h-5 mr-2 fill-current" />
                    {featuredCourse.progress > 0 ? "Continuar" : "Começar"}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trilha de Faixas */}
      <div className="px-6 md:px-12 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Trilha de Faixas</h2>
          <div className="relative w-64 hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Buscar cursos..."
              className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Courses Grid - Netflix Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const isLocked = isCourseBlocked(course)
            const colors = getBeltColors(course.difficulty)
            const durationHours = getDurationHours(course)
            
            return (
              <Link
                key={course.id}
                href={isLocked ? "#" : `/cursos/${course.slug}`}
                className={cn(
                  "group relative aspect-[16/10] rounded-xl overflow-hidden transition-all duration-300",
                  isLocked ? "cursor-not-allowed" : "hover:scale-105 hover:z-10 hover:shadow-2xl hover:shadow-red-500/20"
                )}
              >
                {/* Background */}
                <Image
                  src={course.thumbnail_url || "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800"}
                  alt={course.title}
                  fill
                  className={cn(
                    "object-cover transition-all duration-300",
                    isLocked ? "grayscale" : "group-hover:scale-110"
                  )}
                />
                
                {/* Gradient Overlay */}
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent",
                  isLocked && "bg-black/60"
                )} />

                {/* Badge */}
                <div className="absolute top-4 left-4">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide",
                    colors.badge,
                    colors.text
                  )}>
                    {colors.name}
                  </span>
                </div>

                {/* Lock Icon */}
                {isLocked && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-black/80 flex items-center justify-center">
                      <Lock className="w-8 h-8 text-white" />
                    </div>
                  </div>
                )}

                {/* Play Button on Hover */}
                {!isLocked && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-xl">
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
                        <span className="text-green-400">{course.progress}%</span>
                      </>
                    )}
                  </div>

                  {/* Progress Bar */}
                  {course.progress > 0 && !isLocked && (
                    <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-red-500 transition-all"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  )}

                  {isLocked && (
                    <p className="text-xs text-slate-500">Complete a faixa anterior para desbloquear</p>
                  )}
                </div>

                {/* Free Badge */}
                {course.difficulty === "iniciante" && (
                  <div className="absolute top-4 right-4">
                    <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded">
                      GRÁTIS
                    </span>
                  </div>
                )}
              </Link>
            )
          })}
        </div>
      </div>

      {/* CTA PRO */}
      {!isPro && (
        <div className="px-6 md:px-12 py-12">
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-red-600 via-red-500 to-orange-500 p-8 md:p-12">
            <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />
            <div className="relative z-10 max-w-2xl">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                Desbloqueie todas as faixas
              </h3>
              <p className="text-white/80 mb-6">
                Assine o Clube do ECG e tenha acesso completo a todos os cursos, materiais exclusivos e certificados.
              </p>
              <Button size="lg" className="bg-white text-red-600 hover:bg-white/90">
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
