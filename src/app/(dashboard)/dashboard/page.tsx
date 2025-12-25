"use client"

import { useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, BookOpen, Clock, Flame, Trophy, Play, CheckCircle2, Loader2, Crown, Sparkles, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { BeltBadge } from "@/components/courses/belt-icon"
import { useUser } from "@/contexts/user-context"

// ========================================
// HELPERS
// ========================================

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

function formatWatchTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  if (hours > 0) {
    return `${hours}h ${mins}m`
  }
  return `${mins}m`
}

function getBelt(difficulty: string): "white" | "blue" | "black" {
  if (difficulty === "intermediario") return "blue"
  if (difficulty === "avancado") return "black"
  return "white"
}

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

export default function DashboardPage() {
  // USAR APENAS O CONTEXTO - ZERO QUERIES PRÓPRIAS!
  const { profile, stats, courses, currentCourse, isLoading, isPro } = useUser()

  // Configuração dos planos (memoizado)
  const planConfig = useMemo(() => ({
    free: {
      label: "Gratuito",
      className: "bg-slate-100 text-slate-600 border-slate-200",
      icon: null,
    },
    basic: {
      label: "Básico",
      className: "bg-blue-100 text-blue-700 border-blue-200",
      icon: Sparkles,
    },
    pro: {
      label: "PRO",
      className: "bg-gradient-to-r from-amber-400 to-amber-500 text-white border-0 shadow-lg shadow-amber-200",
      icon: Crown,
    },
  }), [])

  // Stats cards (memoizado)
  const statsCards = useMemo(() => [
    {
      title: "Aulas",
      titleFull: "Aulas Concluídas",
      value: stats.lessonsCompleted,
      icon: BookOpen,
      color: "text-primary",
      bg: "bg-red-50"
    },
    {
      title: "Tempo",
      titleFull: "Tempo de Estudo",
      value: formatWatchTime(stats.totalWatchTime),
      icon: Clock,
      color: "text-blue-500",
      bg: "bg-blue-50"
    },
    {
      title: "Quizzes",
      titleFull: "Quizzes Aprovados",
      value: stats.quizzesPassed,
      icon: Trophy,
      color: "text-yellow-500",
      bg: "bg-yellow-50"
    },
    {
      title: "Sequência",
      titleFull: "Sequência",
      value: `${stats.streak} ${stats.streak === 1 ? 'dia' : 'dias'}`,
      icon: Flame,
      color: "text-orange-500",
      bg: "bg-orange-50"
    },
  ], [stats])

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const fullName = profile?.full_name || "Estudante"
  const subscriptionPlan = profile?.subscription_plan || "free"
  const currentPlan = planConfig[subscriptionPlan as keyof typeof planConfig] || planConfig.free
  const PlanIcon = currentPlan.icon

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Header personalizado */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
              Olá, {fullName.split(" ")[0]}! 👋
            </h1>
            <Badge className={cn("flex items-center gap-1 text-xs", currentPlan.className)}>
              {PlanIcon && <PlanIcon className="h-3 w-3" />}
              {currentPlan.label}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base">
            {stats.lessonsCompleted > 0
              ? "Continue de onde parou e avance para a próxima faixa."
              : "Comece sua jornada no Método CAMPOS-ECG™ hoje mesmo!"}
          </p>
        </div>

        {!isPro && (
          <Button size="sm" className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white shadow-lg w-full md:w-auto">
            <Crown className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Fazer Upgrade para PRO</span>
            <span className="sm:hidden">Upgrade PRO</span>
          </Button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {statsCards.map((stat) => (
          <Card key={stat.title} className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={cn("p-2 sm:p-3 rounded-xl", stat.bg)}>
                  <stat.icon className={cn("h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6", stat.color)} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">
                    <span className="md:hidden">{stat.title}</span>
                    <span className="hidden md:inline">{stat.titleFull}</span>
                  </p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-foreground truncate">
                    {stat.value}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Current Course Card */}
      {currentCourse && (
        <Card className="overflow-hidden border-0 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
            <div className="relative h-40 sm:h-48 md:h-full md:min-h-[200px]">
              <Image
                src={currentCourse.thumbnail_url || "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800"}
                alt={currentCourse.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:bg-gradient-to-r" />
              <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 md:hidden">
                <BeltBadge belt={getBelt(currentCourse.difficulty)} />
              </div>
            </div>
            
            <div className="md:col-span-2 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                <div>
                  <div className="hidden md:block mb-2">
                    <BeltBadge belt={getBelt(currentCourse.difficulty)} />
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                    {currentCourse.completedLessons > 0 ? "Continuar Aprendendo" : "Comece Agora"}
                  </p>
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground leading-tight">
                    {currentCourse.title}
                  </h2>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                  <BookOpen className="h-4 w-4" />
                  <span>{currentCourse.completedLessons}/{currentCourse.totalLessons} aulas</span>
                </div>
              </div>

              <div className="space-y-2 mb-4 sm:mb-6">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-muted-foreground">Seu progresso</span>
                  <span className="font-semibold text-primary">{currentCourse.progress}%</span>
                </div>
                <Progress value={currentCourse.progress} className="h-2 sm:h-3" />
              </div>

              {currentCourse.nextLesson && (
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3 text-xs sm:text-sm text-muted-foreground">
                    <Play className="h-4 w-4 text-primary shrink-0" />
                    <span className="truncate">
                      <span className="hidden sm:inline">Próxima: </span>
                      {currentCourse.nextLesson.title}
                    </span>
                    <span className="text-muted-foreground/60 shrink-0">
                      {formatDuration(currentCourse.nextLesson.duration_seconds || 0)}
                    </span>
                  </div>
                  <Button asChild className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
                    <Link href={`/cursos/${currentCourse.slug}/aula/${currentCourse.nextLesson.id}`}>
                      <Play className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">
                        {currentCourse.completedLessons > 0 ? "Continuar" : "Começar"}
                      </span>
                      <span className="sm:hidden">
                        {currentCourse.completedLessons > 0 ? "Continuar Aula" : "Começar Aula"}
                      </span>
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* All Courses Section */}
      {courses.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2 sm:pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base sm:text-lg">Seus Cursos ECG</CardTitle>
              <Link href="/cursos" className="text-xs sm:text-sm text-primary hover:underline flex items-center gap-1">
                Ver todos
                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            {courses.map((course) => {
              const isLocked = !isPro && course.difficulty !== "iniciante" && course.progress === 0
              const beltColor = course.difficulty === "intermediario"
                ? "bg-blue-500"
                : course.difficulty === "avancado"
                  ? "bg-gray-900"
                  : "bg-gray-200"

              return (
                <Link
                  key={course.id}
                  href={isPro || !isLocked ? `/cursos/${course.slug}` : "#"}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl border transition-colors",
                    isPro || !isLocked
                      ? "bg-slate-50/50 hover:bg-slate-50 cursor-pointer"
                      : "bg-slate-100/50 opacity-60 cursor-not-allowed"
                  )}
                >
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-bold", beltColor)}>
                    <span>🥋</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{course.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {course.completedLessons}/{course.totalLessons} aulas • {course.progress}%
                    </p>
                  </div>
                  {!isPro && isLocked && (
                    <Lock className="w-5 h-5 text-muted-foreground" />
                  )}
                  {course.progress > 0 && course.progress < 100 && (
                    <div className="w-16 hidden sm:block">
                      <Progress value={course.progress} className="h-2" />
                    </div>
                  )}
                  {course.progress >= 100 && (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  )}
                </Link>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* CTA para usuários não-PRO */}
      {!isPro && (
        <Card className="border-0 shadow-lg bg-gradient-to-r from-primary to-red-600 text-white overflow-hidden relative">
          <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />
          <CardContent className="p-6 sm:p-8 relative z-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="h-5 w-5 sm:h-6 sm:w-6" />
                  <h3 className="text-lg sm:text-xl font-bold">Desbloqueie Todo o Conteúdo</h3>
                </div>
                <p className="text-white/80 text-sm sm:text-base max-w-md">
                  Assine o plano PRO e tenha acesso a todas as faixas, quizzes ilimitados e certificados.
                </p>
              </div>
              <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-slate-50 w-full md:w-auto">
                <Crown className="h-4 w-4 mr-2" />
                Assinar PRO
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
