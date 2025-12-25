"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, BookOpen, Clock, Flame, Trophy, Play, CheckCircle2, Loader2, Crown, Sparkles, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { BeltBadge } from "@/components/courses/belt-icon"
import { createClient } from "@/lib/supabase/client"

interface UserProfile {
  id: string
  full_name: string
  subscription_plan: string
}

interface AllCourse {
  id: string
  title: string
  slug: string
  difficulty: string
  description: string
  thumbnail_url: string
  totalLessons: number
  completedLessons: number
  progress: number
}

interface CourseProgress {
  id: string
  title: string
  slug: string
  difficulty: string
  thumbnail_url: string
  totalLessons: number
  completedLessons: number
  progress: number
  nextLesson?: {
    id: string
    title: string
    duration: string
  }
}

interface UserStats {
  lessonsCompleted: number
  totalWatchTime: number
  quizzesPassed: number
  streak: number
}

interface RecentActivity {
  action: string
  item: string
  time: string
  type: string
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [currentCourse, setCurrentCourse] = useState<CourseProgress | null>(null)
  const [allCourses, setAllCourses] = useState<AllCourse[]>([])
  const [stats, setStats] = useState<UserStats>({
    lessonsCompleted: 0,
    totalWatchTime: 0,
    quizzesPassed: 0,
    streak: 0,
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const supabase = createClient()
        
        // Buscar usuário atual
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setIsLoading(false)
          return
        }

        // Buscar perfil
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        if (profileData) {
          setProfile(profileData)
        }

        // Buscar estatísticas do dashboard (usa nova função com dados reais)
        const { data: statsProfile } = await supabase
          .from("profiles")
          .select("total_watch_time, current_streak")
          .eq("id", user.id)
          .single()

        const { count: lessonsCount } = await supabase
          .from("user_lesson_progress")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("completed", true)

        const { count: quizzesCount } = await supabase
          .from("quiz_attempts")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .gte("score", 100)

        setStats({
          lessonsCompleted: lessonsCount || 0,
          totalWatchTime: statsProfile?.total_watch_time || 0,
          quizzesPassed: quizzesCount || 0,
          streak: statsProfile?.current_streak || 0,
        })

        // Buscar curso atual
        const { data: courses } = await supabase
          .from("courses")
          .select("id, title, slug, difficulty, thumbnail_url")
          .eq("is_published", true)
          .order("created_at", { ascending: true })
          .limit(1)

        if (courses && courses.length > 0) {
          const course = courses[0]

          // Contar total de aulas do curso
          const { count: totalLessons } = await supabase
            .from("lessons")
            .select("*, module:modules!inner(course_id)", { count: "exact", head: true })
            .eq("module.course_id", course.id)

          // Buscar primeira aula
          const { data: firstLesson } = await supabase
            .from("lessons")
            .select("id, title, duration_seconds, module:modules!inner(course_id)")
            .eq("module.course_id", course.id)
            .order("order_index", { ascending: true })
            .limit(1)

          setCurrentCourse({
            id: course.id,
            title: course.title,
            slug: course.slug,
            difficulty: course.difficulty,
            thumbnail_url: course.thumbnail_url || "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800",
            totalLessons: totalLessons || 0,
            completedLessons: 0,
            progress: 0,
            nextLesson: firstLesson?.[0] ? {
              id: firstLesson[0].id,
              title: firstLesson[0].title,
              duration: formatDuration(firstLesson[0].duration_seconds || 0),
            } : undefined,
          })
        }

        // Buscar TODOS os cursos com progresso
        const { data: allCoursesData } = await supabase
          .from("courses")
          .select("id, title, slug, difficulty, description, thumbnail_url")
          .eq("is_published", true)
          .order("created_at", { ascending: true })

        if (allCoursesData) {
          const coursesWithProgress = await Promise.all(
            allCoursesData.map(async (course) => {
              // Total de aulas do curso
              const { count: total } = await supabase
                .from("lessons")
                .select("*, module:modules!inner(course_id)", { count: "exact", head: true })
                .eq("module.course_id", course.id)

              // Aulas concluídas pelo usuário
              const { data: completedLessons } = await supabase
                .from("user_lesson_progress")
                .select("lesson_id, lessons!inner(module_id, modules!inner(course_id))")
                .eq("user_id", user.id)
                .eq("completed", true)

              const completedInCourse = completedLessons?.filter(
                (p: { lessons: { modules: { course_id: string } } }) => 
                  p.lessons?.modules?.course_id === course.id
              ).length || 0

              const totalLessons = total || 0
              const progress = totalLessons > 0 ? Math.round((completedInCourse / totalLessons) * 100) : 0

              return {
                id: course.id,
                title: course.title,
                slug: course.slug,
                difficulty: course.difficulty,
                description: course.description || "",
                thumbnail_url: course.thumbnail_url || "",
                totalLessons,
                completedLessons: completedInCourse,
                progress,
              }
            })
          )
          setAllCourses(coursesWithProgress)
        }

        setRecentActivity([])
      } catch (error) {
        console.error("Erro ao carregar dashboard:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  // Formatar duração em minutos:segundos
  function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Formatar tempo de estudo
  function formatWatchTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  // Formatar tempo relativo
  function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 60) return `${diffMins}min atrás`
    if (diffHours < 24) return `${diffHours}h atrás`
    if (diffDays === 1) return "Ontem"
    if (diffDays < 7) return `${diffDays} dias atrás`
    return date.toLocaleDateString("pt-BR")
  }

  // Mapear dificuldade para belt
  function getBelt(difficulty: string): "white" | "blue" | "black" {
    if (difficulty === "faixa-azul") return "blue"
    if (difficulty === "faixa-preta") return "black"
    return "white"
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const fullName = profile?.full_name || "Estudante"
  const subscriptionPlan = profile?.subscription_plan || "free"

  // Configuração dos planos
  const planConfig = {
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
      className: "bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0 shadow-md",
      icon: Crown,
    },
  }

  const planInfo = planConfig[subscriptionPlan as keyof typeof planConfig] || planConfig.free
  const PlanIcon = planInfo.icon

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      {/* Greeting */}
      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="text-2xl font-bold text-foreground">Olá, {fullName}! 👋</h1>
        <Badge className={`${planInfo.className} px-3 py-1 text-sm font-semibold`}>
          {PlanIcon && <PlanIcon className="w-4 h-4 mr-1" />}
          {planInfo.label}
        </Badge>
      </div>
      <p className="text-muted-foreground -mt-6">
        Continue de onde parou e avance para a próxima faixa.
      </p>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { 
            title: "Aulas Assistidas", 
            value: stats.lessonsCompleted.toString(), 
            icon: BookOpen, 
            color: "text-blue-500", 
            bg: "bg-blue-50" 
          },
          { 
            title: "Tempo de Estudo", 
            value: formatWatchTime(stats.totalWatchTime), 
            icon: Clock, 
            color: "text-green-500", 
            bg: "bg-green-50" 
          },
          { 
            title: "Sequência", 
            value: `${stats.streak} dias`, 
            icon: Flame, 
            color: "text-orange-500", 
            bg: "bg-orange-50" 
          },
          { 
            title: "Quizzes 100%", 
            value: stats.quizzesPassed.toString(), 
            icon: Trophy, 
            color: "text-yellow-500", 
            bg: "bg-yellow-50" 
          },
        ].map((stat) => (
          <Card key={stat.title} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.title}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Continue Learning - Hero Card */}
      {currentCourse && (
        <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-r from-slate-50 to-white">
          <CardContent className="p-0">
            <div className="grid md:grid-cols-2">
              {/* Info */}
              <div className="p-6 md:p-8 space-y-4">
                <BeltBadge belt={getBelt(currentCourse.difficulty)} />
                
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Continuar Aprendendo</p>
                  <h2 className="text-2xl font-bold text-foreground">{currentCourse.title}</h2>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progresso</span>
                    <span className="font-semibold text-primary">{currentCourse.progress}%</span>
                  </div>
                  <Progress value={currentCourse.progress} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {currentCourse.completedLessons} de {currentCourse.totalLessons} aulas concluídas
                  </p>
                </div>

                {/* Next Lesson */}
                {currentCourse.nextLesson && (
                  <div className="bg-white rounded-xl p-4 border shadow-sm">
                    <p className="text-xs text-muted-foreground mb-1">Próxima aula</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Play className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{currentCourse.nextLesson.title}</p>
                          <p className="text-xs text-muted-foreground">{currentCourse.nextLesson.duration}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <Button asChild size="lg" className="w-full bg-primary hover:bg-primary/90">
                  <Link href={currentCourse.nextLesson 
                    ? `/cursos/${currentCourse.slug}/aula/${currentCourse.nextLesson.id}`
                    : `/cursos/${currentCourse.slug}`
                  }>
                    <Play className="w-4 h-4 mr-2" />
                    {currentCourse.nextLesson ? "Continuar Aula" : "Ver Curso"}
                  </Link>
                </Button>
              </div>

              {/* Thumbnail */}
              <div className="relative aspect-video md:aspect-auto">
                <Image
                  src={currentCourse.thumbnail_url}
                  alt={currentCourse.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grid: Activity + Next Courses */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'quiz' ? 'bg-yellow-500' : 
                    activity.type === 'lesson' ? 'bg-green-500' : 'bg-primary'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="text-muted-foreground">{activity.action}</span>{" "}
                      <span className="font-medium text-foreground">{activity.item}</span>
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">Nenhuma atividade ainda.</p>
                <p className="text-xs mt-1">Comece assistindo uma aula!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* All Courses with Progress */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">
              {subscriptionPlan === "pro" ? "Seus Cursos" : "Próximas Faixas"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {allCourses.filter(c => c.id !== currentCourse?.id).map((course, index) => {
              const isLocked = subscriptionPlan === "free" || 
                (subscriptionPlan === "basic" && course.difficulty === "faixa-preta")
              const isPro = subscriptionPlan === "pro"
              
              const beltColor = course.difficulty === "faixa-azul" 
                ? "bg-blue-500" 
                : course.difficulty === "faixa-preta" 
                  ? "bg-gray-900" 
                  : "bg-gray-200"
              
              const beltNumber = course.difficulty === "faixa-branca" ? 1 
                : course.difficulty === "faixa-azul" ? 2 : 3
              
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
                  onClick={(e) => {
                    if (isLocked && !isPro) e.preventDefault()
                  }}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${beltColor}`}>
                    <span className="text-white font-bold">{beltNumber}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground">{course.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{course.description}</p>
                    {isPro && course.progress > 0 && (
                      <div className="flex items-center gap-2 mt-2">
                        <Progress value={course.progress} className="h-1.5 flex-1" />
                        <span className="text-xs font-medium text-primary">{course.progress}%</span>
                      </div>
                    )}
                    {!isPro && (
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>{course.totalLessons} aulas</span>
                      </div>
                    )}
                  </div>
                  {isLocked && !isPro ? (
                    <Button variant="outline" size="sm" disabled>
                      Bloqueado
                    </Button>
                  ) : isPro ? (
                    <Button variant="outline" size="sm">
                      {course.progress > 0 ? "Continuar" : "Iniciar"}
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm">
                      Acessar
                    </Button>
                  )}
                </Link>
              )
            })}
            
            {allCourses.filter(c => c.id !== currentCourse?.id).length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                <p className="text-sm">Nenhum outro curso disponível.</p>
              </div>
            )}
            
            <Button variant="ghost" asChild className="w-full mt-2">
              <Link href="/cursos">
                Ver todos os cursos
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Achievements Preview */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Suas Conquistas</CardTitle>
            <Link href="/conquistas" className="text-sm text-primary hover:underline">
              Ver todas
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 overflow-x-auto pb-2">
            {[
              { name: "Primeira Aula", icon: "🎬", unlocked: stats.lessonsCompleted >= 1 },
              { name: "Primeiro Quiz", icon: "🎯", unlocked: stats.quizzesPassed >= 1 },
              { name: "7 Dias Seguidos", icon: "🔥", unlocked: stats.streak >= 7 },
              { name: "Faixa Branca", icon: "🥋", unlocked: false },
              { name: "Quiz Perfeito", icon: "⭐", unlocked: stats.quizzesPassed >= 1 },
            ].map((achievement, index) => (
              <div
                key={index}
                className={`flex flex-col items-center min-w-[80px] p-3 rounded-xl ${
                  achievement.unlocked ? 'bg-slate-50' : 'bg-slate-100 opacity-50'
                }`}
              >
                <span className="text-3xl mb-1">{achievement.icon}</span>
                <span className="text-xs text-center font-medium">{achievement.name}</span>
                {achievement.unlocked && (
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-1" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
