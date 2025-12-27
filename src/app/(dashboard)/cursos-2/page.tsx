"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, BookOpen, Clock, Award, Play, Lock, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BeltBadge } from "@/components/courses/belt-icon"
import { cn } from "@/lib/utils"
import { useCourses } from "@/contexts/user-context"

// Mapeia dificuldade para tipo de faixa
function getBeltType(difficulty: string): "white" | "blue" | "black" {
  if (difficulty === "iniciante") return "white"
  if (difficulty === "intermediario") return "blue"
  return "black"
}

// Ordem das faixas para progressão
const beltOrder = ["iniciante", "intermediario", "avancado"]

export default function CoursesPage2() {
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

  const completedCount = courses.filter(c => c.progress >= 80).length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Trilha de Faixas</h1>
          <p className="text-muted-foreground">
            Progrida do básico ao avançado no seu ritmo
          </p>
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar cursos..."
            className="pl-10 bg-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Belt Progress Overview */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-slate-50 to-white">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Sua Jornada</h3>
            <span className="text-xs sm:text-sm text-muted-foreground">
              {completedCount} de {courses.length} faixas
            </span>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            {courses.map((course, index) => {
              const isCompleted = course.progress >= 80
              const isInProgress = course.progress > 0 && course.progress < 80
              const isLocked = isCourseBlocked(course)
              
              const bgColor = course.difficulty === "iniciante" 
                ? "bg-white border-2" 
                : course.difficulty === "intermediario" 
                  ? "bg-blue-500" 
                  : "bg-gray-900"
              
              return (
                <div key={course.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      "w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-1 sm:mb-2",
                      bgColor,
                      isCompleted && "ring-4 ring-green-400",
                      isInProgress && "ring-4 ring-primary",
                      isLocked && "opacity-50"
                    )}>
                      {isLocked ? (
                        <Lock className={cn(
                          "w-4 h-4 sm:w-6 sm:h-6",
                          course.difficulty === "iniciante" ? "text-gray-400" : "text-white"
                        )} />
                      ) : (
                        <span className="text-lg sm:text-2xl">🥋</span>
                      )}
                    </div>
                    <span className={cn(
                      "text-[10px] sm:text-xs font-medium",
                      isLocked && "opacity-50"
                    )}>
                      {course.difficulty === "iniciante" ? "Branca" 
                        : course.difficulty === "intermediario" ? "Azul" : "Preta"}
                    </span>
                    <span className={cn(
                      "text-[10px] sm:text-xs",
                      isCompleted ? "text-green-600" : isInProgress ? "text-primary" : "text-muted-foreground"
                    )}>
                      {isLocked ? "Bloqueado" : isCompleted ? "✓ Completo" : `${course.progress}%`}
                    </span>
                  </div>
                  
                  {index < courses.length - 1 && (
                    <div className="flex-1 h-1 bg-slate-200 rounded-full relative mx-2">
                      <div 
                        className={cn(
                          "absolute inset-y-0 left-0 rounded-full transition-all",
                          isCompleted ? "bg-green-400 w-full" : "bg-primary"
                        )}
                        style={{ width: isCompleted ? "100%" : `${course.progress}%` }}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Courses Grid */}
      <div className="space-y-6">
        {filteredCourses.map((course) => {
          const isLocked = isCourseBlocked(course)
          const belt = getBeltType(course.difficulty)
          const durationHours = getDurationHours(course)
          
          return (
            <Card 
              key={course.id} 
              className={cn(
                "overflow-hidden border-0 shadow-sm transition-all",
                isLocked ? "opacity-75" : "hover:shadow-md"
              )}
            >
              <div className="grid md:grid-cols-3">
                <div className="relative aspect-video md:aspect-auto md:min-h-[200px]">
                  <Image
                    src={course.thumbnail_url || "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800"}
                    alt={course.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  {isLocked && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Lock className="w-10 h-10 text-white" />
                    </div>
                  )}
                  {!isLocked && course.progress === 0 && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
                        <Play className="w-8 h-8 text-primary ml-1" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="md:col-span-2 p-6">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <BeltBadge belt={belt} className="mb-2" />
                      <h3 className="text-xl font-bold text-foreground">{course.title}</h3>
                    </div>
                    {course.difficulty === "iniciante" && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                        GRÁTIS
                      </span>
                    )}
                  </div>

                  <p className="text-muted-foreground mb-4 line-clamp-2">
                    Curso completo de ECG para dominar a interpretação de eletrocardiogramas.
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      <span>{course.totalLessons} aulas</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{durationHours}h</span>
                    </div>
                    {course.progress > 0 && (
                      <div className="flex items-center gap-1">
                        <Award className="w-4 h-4 text-yellow-500" />
                        <span>{course.completedLessons}/{course.totalLessons} concluídas</span>
                      </div>
                    )}
                  </div>

                  {course.progress > 0 ? (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progresso</span>
                        <span className="font-medium text-primary">{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                      <Button asChild className="w-full mt-3 bg-primary">
                        <Link href={`/cursos/${course.slug}`}>
                          <Play className="w-4 h-4 mr-2" />
                          Continuar
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      asChild={!isLocked}
                      className={cn(
                        "w-full",
                        isLocked 
                          ? "bg-slate-200 text-slate-500 cursor-not-allowed" 
                          : "bg-primary hover:bg-primary/90"
                      )}
                      disabled={isLocked}
                    >
                      {isLocked ? (
                        <span>
                          <Lock className="w-4 h-4 mr-2" />
                          Complete a faixa anterior
                        </span>
                      ) : (
                        <Link href={`/cursos/${course.slug}`}>
                          <Play className="w-4 h-4 mr-2" />
                          Começar Curso
                        </Link>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* CTA */}
      {!isPro && (
        <Card className="border-0 shadow-sm bg-gradient-to-r from-primary to-red-600 text-white">
          <CardContent className="p-6 sm:p-8 text-center">
            <h3 className="text-lg sm:text-2xl font-bold mb-2">Quer desbloquear todas as faixas?</h3>
            <p className="text-white/80 mb-4 sm:mb-6 text-sm sm:text-base">
              Assine o Clube do ECG e tenha acesso completo a todos os cursos e materiais.
            </p>
            <Button size="lg" variant="secondary" className="w-full sm:w-auto">
              Ver Planos de Assinatura
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

