"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { 
  ArrowLeft, 
  BookOpen, 
  Clock, 
  Download, 
  Play, 
  Bookmark,
  CheckCircle2,
  Award,
  Lock,
  FileText,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { BeltBadge } from "@/components/courses/belt-icon"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

// Tipos
interface Lesson {
  id: string
  title: string
  description: string
  video_url: string
  duration_seconds: number
  order_index: number
  is_free: boolean
}

interface Quiz {
  id: string
  title: string
  description: string
  order_index: number
}

interface Module {
  id: string
  title: string
  description: string
  order_index: number
  lessons: Lesson[]
  quizzes: Quiz[]
}

interface Course {
  id: string
  title: string
  slug: string
  description: string
  teaser: string
  thumbnail_url: string
  trailer_url: string
  difficulty: string
  is_free: boolean
  is_published: boolean
  modules: Module[]
}

// Mapeia difficulty para belt
function getBeltFromDifficulty(difficulty: string): "white" | "blue" | "black" {
  switch (difficulty) {
    case "iniciante":
      return "white"
    case "intermediario":
      return "blue"
    case "avancado":
      return "black"
    default:
      return "white"
  }
}

// Formatar duração
function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

// Calcular estatísticas do curso
function calculateStats(modules: Module[]) {
  let totalLessons = 0
  let totalQuizzes = 0
  let totalSeconds = 0

  modules.forEach(mod => {
    totalLessons += mod.lessons?.length || 0
    totalQuizzes += mod.quizzes?.length || 0
    mod.lessons?.forEach(lesson => {
      totalSeconds += lesson.duration_seconds || 0
    })
  })

  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)

  return { totalLessons, totalQuizzes, hours, minutes }
}

export default function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [course, setCourse] = useState<Course | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCourse() {
      const supabase = createClient()
      
      // Buscar curso com módulos, aulas e quizzes
      const { data, error } = await supabase
        .from("courses")
        .select(`
          *,
          modules (
            *,
            lessons (*),
            quizzes (*)
          )
        `)
        .eq("slug", slug)
        .single()

      if (error) {
        console.error("Erro ao buscar curso:", error)
        setError("Curso não encontrado")
        setIsLoading(false)
        return
      }

      // Ordenar módulos, aulas e quizzes
      if (data?.modules) {
        data.modules.sort((a: Module, b: Module) => a.order_index - b.order_index)
        data.modules.forEach((mod: Module) => {
          if (mod.lessons) {
            mod.lessons.sort((a: Lesson, b: Lesson) => a.order_index - b.order_index)
          }
          if (mod.quizzes) {
            mod.quizzes.sort((a: Quiz, b: Quiz) => a.order_index - b.order_index)
          }
        })
      }

      setCourse(data)
      setIsLoading(false)
    }

    fetchCourse()
  }, [slug])

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span>Carregando curso...</span>
        </div>
      </div>
    )
  }

  // Erro
  if (error || !course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">{error || "Curso não encontrado"}</h2>
          <Link href="/cursos">
            <Button className="mt-4">Voltar aos cursos</Button>
          </Link>
        </div>
      </div>
    )
  }

  const belt = getBeltFromDifficulty(course.difficulty)
  const stats = calculateStats(course.modules || [])

  // Instructor info (fixo por enquanto)
  const instructor = {
    name: "Dr. Juan Lorenzo",
    title: "Cardiologista, Especialista em ECG",
    bio: "Juan é o fundador do Clube do ECG. Ele é cardiologista com especialização em eletrocardiografia e mestre em educação médica.",
    avatar_url: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200",
  }

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      {/* Header do Curso */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Back */}
          <Link href="/cursos" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para cursos
          </Link>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Info */}
            <div className="space-y-4">
              {/* Belt Badge */}
              <div className="flex items-center gap-3">
                <BeltBadge belt={belt} />
                <Badge variant="outline">Português</Badge>
                {course.is_free && (
                  <Badge className="bg-green-500 text-white">GRÁTIS</Badge>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
                {course.title}
              </h1>

              {/* Instructor */}
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground">por</span>
                <div className="flex items-center gap-2">
                  <Image
                    src={instructor.avatar_url}
                    alt={instructor.name}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                  <span className="font-medium text-primary">{instructor.name}</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-muted-foreground leading-relaxed">
                {course.description || course.teaser}
              </p>

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-muted-foreground" />
                  <span>{stats.totalLessons} Aulas</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-500" />
                  <span>{stats.totalQuizzes} Quizzes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <span>{stats.hours}h {stats.minutes}m</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <Button size="lg" className="bg-primary hover:bg-primary/90 px-8">
                  <Play className="w-5 h-5 mr-2" />
                  Começar a Aprender
                </Button>
                <Button size="lg" variant="outline">
                  <Bookmark className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Video Thumbnail */}
            <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg group cursor-pointer">
              <Image
                src={course.thumbnail_url || "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800"}
                alt={course.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                  <Play className="w-10 h-10 text-primary ml-1" />
                </div>
              </div>
              {course.trailer_url && (
                <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white">
                  <Play className="w-4 h-4" />
                  <span className="text-sm font-medium">Assistir intro</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Banner */}
      {!course.is_free && (
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold mb-1">Desbloqueie este curso e mais de 50 outros</h3>
                <p className="text-slate-300">Tenha acesso a todos os cursos premiados e se torne um expert em ECG.</p>
              </div>
              <Link href="/assinar">
                <Button size="lg" variant="secondary" className="whitespace-nowrap">
                  Assine o Clube
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - Chapters */}
          <div className="lg:col-span-2 space-y-6">
            {/* Chapters */}
            <div>
              <h2 className="text-xl font-bold mb-4">O que você vai aprender</h2>
              
              <div className="space-y-4">
                {course.modules?.map((module, index) => {
                  // Verificar se o módulo tem aulas gratuitas
                  const hasFreeLessons = module.lessons?.some(l => l.is_free)
                  
                  return (
                    <Card key={module.id} className="overflow-hidden">
                      {/* Chapter Header */}
                      <div className="p-4 bg-slate-50 border-b flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{module.title}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">{module.description}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {module.lessons?.length || 0} aulas, {module.quizzes?.length || 0} quiz
                            </p>
                          </div>
                        </div>
                        {hasFreeLessons && (
                          <span className="free-badge">GRÁTIS</span>
                        )}
                      </div>

                      {/* Lessons */}
                      <div className="divide-y">
                        {module.lessons?.map((lesson) => (
                          <Link
                            key={lesson.id}
                            href={`/cursos/${slug}/aula/${lesson.id}`}
                            className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors"
                          >
                            {lesson.is_free ? (
                              <Play className="w-5 h-5 text-primary flex-shrink-0" />
                            ) : (
                              <Lock className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {lesson.title}
                              </p>
                              {lesson.is_free && (
                                <span className="text-xs text-green-600 font-medium">Gratuita</span>
                              )}
                            </div>
                            <span className="text-sm text-muted-foreground flex-shrink-0">
                              {formatDuration(lesson.duration_seconds || 0)}
                            </span>
                          </Link>
                        ))}

                        {/* Quizzes */}
                        {module.quizzes?.map((quiz) => (
                          <Link
                            key={quiz.id}
                            href={`/cursos/${slug}/quiz/${quiz.id}`}
                            className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors bg-amber-50/50"
                          >
                            <Award className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium">
                                {quiz.title}
                              </p>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              Quiz
                            </Badge>
                          </Link>
                        ))}
                      </div>
                    </Card>
                  )
                })}

                {/* Se não houver módulos */}
                {(!course.modules || course.modules.length === 0) && (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="font-semibold mb-2">Conteúdo em breve</h3>
                      <p className="text-muted-foreground">
                        Os módulos deste curso estão sendo preparados.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Instructor Card */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Professor do Curso</h3>
                <div className="flex items-start gap-4">
                  <Image
                    src={instructor.avatar_url}
                    alt={instructor.name}
                    width={64}
                    height={64}
                    className="rounded-full"
                  />
                  <div>
                    <p className="font-semibold text-primary">{instructor.name}</p>
                    <p className="text-sm text-muted-foreground">{instructor.title}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  {instructor.bio}
                </p>
              </CardContent>
            </Card>

            {/* Other Belts */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Outras Faixas</h3>
                <div className="space-y-3">
                  {slug !== "ecg-faixa-branca-fundamentos2" && (
                    <Link href="/cursos/ecg-faixa-branca-fundamentos2" className="flex items-center gap-3 p-3 rounded-lg border hover:bg-slate-50 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-700 font-bold text-xs">1</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">ECG: Faixa Branca</p>
                        <p className="text-xs text-muted-foreground">Iniciante</p>
                      </div>
                    </Link>
                  )}
                  <Link href="/cursos/ecg-faixa-azul-arritmias-e-bloqueios" className="flex items-center gap-3 p-3 rounded-lg border hover:bg-slate-50 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                      <span className="text-white font-bold text-xs">2</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">ECG: Faixa Azul</p>
                      <p className="text-xs text-muted-foreground">Intermediário</p>
                    </div>
                    <Lock className="w-4 h-4 text-muted-foreground ml-auto" />
                  </Link>
                  <Link href="/cursos/ecg-faixa-preta-casos-complexos" className="flex items-center gap-3 p-3 rounded-lg border hover:bg-slate-50 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center">
                      <span className="text-white font-bold text-xs">3</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">ECG: Faixa Preta</p>
                      <p className="text-xs text-muted-foreground">Avançado</p>
                    </div>
                    <Lock className="w-4 h-4 text-muted-foreground ml-auto" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
