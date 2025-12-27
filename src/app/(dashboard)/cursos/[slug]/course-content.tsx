"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { 
  ArrowLeft, 
  BookOpen, 
  Clock, 
  Play, 
  Bookmark,
  Award,
  Lock,
  CheckCircle2,
  RotateCcw,
  AlertTriangle,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { BeltBadge } from "@/components/courses/belt-icon"
import { useUser } from "@/contexts/user-context"
import { resetLessonsProgress } from "@/lib/supabase/progress"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

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

interface Stats {
  totalLessons: number
  totalQuizzes: number
  hours: number
  minutes: number
}

interface Instructor {
  name: string
  title: string
  bio: string
  avatar_url: string
}

interface CourseContentProps {
  course: Course
  stats: Stats
  instructor: Instructor
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

// Set vazio para usar como fallback
const EMPTY_SET = new Set<string>()

// Map vazio para usar como fallback
const EMPTY_MAP = new Map<string, number>()

// Componente de Módulo
function ModuleCard({ 
  module, 
  index, 
  slug,
  completedLessonIds = EMPTY_SET,
  completedQuizIds = EMPTY_SET,
  quizBestScores = EMPTY_MAP,
  onResetProgress
}: { 
  module: Module
  index: number
  slug: string
  completedLessonIds?: Set<string>
  completedQuizIds?: Set<string>
  quizBestScores?: Map<string, number>
  onResetProgress?: (lessonIds: string[], moduleTitle: string) => void
}) {
  const hasFreeLessons = module.lessons?.some(l => l.is_free)
  const completed = completedLessonIds || EMPTY_SET
  const completedCount = module.lessons?.filter(l => completed.has(l.id)).length || 0
  const totalLessons = module.lessons?.length || 0
  const allCompleted = totalLessons > 0 && completedCount === totalLessons
  const hasProgress = completedCount > 0
  
  const handleReset = () => {
    if (onResetProgress && module.lessons) {
      const lessonIds = module.lessons.map(l => l.id)
      onResetProgress(lessonIds, module.title)
    }
  }
  
  return (
    <Card className="overflow-hidden">
      {/* Chapter Header */}
      <div className="p-3 sm:p-4 bg-slate-50 border-b flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 sm:gap-4 flex-1 min-w-0">
          <div className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-bold text-xs sm:text-sm ${
            allCompleted 
              ? "bg-green-500 text-white" 
              : "bg-primary text-white"
          }`}>
            {allCompleted ? (
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              index + 1
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-sm sm:text-base leading-tight">{module.title}</h3>
              {completedCount > 0 && (
                <span className="text-[10px] sm:text-xs text-green-600 font-medium">
                  {completedCount}/{totalLessons}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{module.description}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 sm:mt-2">
              {module.lessons?.length || 0} aulas, {module.quizzes?.length || 0} quiz
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {hasProgress && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-muted-foreground hover:text-orange-600 hover:bg-orange-50"
              onClick={handleReset}
              title="Reiniciar progresso deste módulo"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          )}
          {hasFreeLessons && (
            <span className="free-badge text-[10px] sm:text-xs">GRÁTIS</span>
          )}
        </div>
      </div>

      {/* Lessons */}
      <div className="divide-y">
        {module.lessons?.map((lesson) => {
          const isCompleted = completed.has(lesson.id)
          
          return (
            <Link
              key={lesson.id}
              href={`/cursos/${slug}/aula/${lesson.id}`}
              className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-slate-50 transition-colors ${
                isCompleted ? "bg-green-50/50" : ""
              }`}
              prefetch={false}
            >
              {isCompleted ? (
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
              ) : lesson.is_free ? (
                <Play className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
              ) : (
                <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className={`text-xs sm:text-sm font-medium truncate ${
                  isCompleted ? "text-green-700" : ""
                }`}>
                  {lesson.title}
                </p>
                {isCompleted ? (
                  <span className="text-[10px] sm:text-xs text-green-600 font-medium">Concluída</span>
                ) : lesson.is_free ? (
                  <span className="text-[10px] sm:text-xs text-green-600 font-medium">Gratuita</span>
                ) : null}
              </div>
              <span className="text-xs sm:text-sm text-muted-foreground flex-shrink-0">
                {formatDuration(lesson.duration_seconds || 0)}
              </span>
            </Link>
          )
        })}

        {/* Quizzes */}
        {module.quizzes?.map((quiz) => {
          const isQuizCompleted = completedQuizIds.has(quiz.id)
          const bestScore = quizBestScores.get(quiz.id)
          
          return (
            <Link
              key={quiz.id}
              href={`/cursos/${slug}/quiz/${quiz.id}`}
              className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-slate-50 transition-colors ${
                isQuizCompleted ? "bg-green-50/50" : "bg-amber-50/50"
              }`}
              prefetch={false}
            >
              {isQuizCompleted ? (
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
              ) : (
                <Award className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium truncate">
                  {quiz.title}
                </p>
                {isQuizCompleted && (
                  <span className="text-[10px] sm:text-xs text-green-600 font-medium">
                    Melhor: {bestScore}%
                  </span>
                )}
              </div>
              <Badge 
                variant={isQuizCompleted ? "default" : "secondary"} 
                className={`text-[10px] sm:text-xs ${isQuizCompleted ? "bg-green-100 text-green-700 hover:bg-green-100" : ""}`}
              >
                Quiz
              </Badge>
            </Link>
          )
        })}
      </div>
    </Card>
  )
}

// Componente principal
export function CourseContent({ course, stats, instructor }: CourseContentProps) {
  const belt = getBeltFromDifficulty(course.difficulty)
  
  // Usar o contexto do usuário diretamente (igual à página de aula)
  const { completedLessonIds, completedQuizIds, quizBestScores, resetModuleProgress } = useUser()
  
  // Estado para o modal de confirmação de reset
  const [resetModalOpen, setResetModalOpen] = useState(false)
  const [resetModuleInfo, setResetModuleInfo] = useState<{ lessonIds: string[], title: string } | null>(null)
  const [isResetting, setIsResetting] = useState(false)

  // Encontrar primeira aula não concluída ou a primeira
  const firstLesson = course.modules?.[0]?.lessons?.[0]
  const nextLesson = useMemo(() => {
    if (completedLessonIds.size === 0) return firstLesson
    return course.modules?.flatMap(m => m.lessons || [])
      .find(l => !completedLessonIds.has(l.id)) || firstLesson
  }, [course.modules, completedLessonIds, firstLesson])
  
  // Handler para abrir o modal de reset
  const handleOpenResetModal = (lessonIds: string[], moduleTitle: string) => {
    setResetModuleInfo({ lessonIds, title: moduleTitle })
    setResetModalOpen(true)
  }
  
  // Handler para confirmar o reset
  const handleConfirmReset = async () => {
    if (!resetModuleInfo) return
    
    setIsResetting(true)
    try {
      // Resetar no banco de dados
      await resetLessonsProgress(resetModuleInfo.lessonIds)
      // Atualizar o contexto (otimista)
      resetModuleProgress(resetModuleInfo.lessonIds)
      setResetModalOpen(false)
      setResetModuleInfo(null)
    } catch (error) {
      console.error("Erro ao resetar progresso:", error)
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      {/* Header do Curso */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
          {/* Back */}
          <Link 
            href="/cursos" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
            prefetch={true}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para cursos
          </Link>

          <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Info */}
            <div className="space-y-3 sm:space-y-4 order-2 lg:order-1">
              {/* Belt Badge */}
              <div className="flex flex-wrap items-center gap-2">
                <BeltBadge belt={belt} />
                <Badge variant="outline" className="text-xs">Português</Badge>
                {course.is_free && (
                  <Badge className="bg-green-500 text-white text-xs">GRÁTIS</Badge>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight">
                {course.title}
              </h1>

              {/* Instructor */}
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-sm text-muted-foreground">por</span>
                <div className="flex items-center gap-2">
                  <Image
                    src={instructor.avatar_url}
                    alt={instructor.name}
                    width={28}
                    height={28}
                    className="rounded-full"
                  />
                  <span className="font-medium text-primary text-sm sm:text-base">{instructor.name}</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {course.description || course.teaser}
              </p>

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-muted-foreground" />
                  <span>{stats.totalLessons} Aulas</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-yellow-500" />
                  <span>{stats.totalQuizzes} Quizzes</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{stats.hours}h {stats.minutes}m</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                {nextLesson ? (
                  <Button asChild size="lg" className="bg-primary hover:bg-primary/90 px-6 sm:px-8 flex-1 sm:flex-initial">
                    <Link href={`/cursos/${course.slug}/aula/${nextLesson.id}`} prefetch={true}>
                      <Play className="w-5 h-5 mr-2" />
                      {completedLessonIds.size > 0 ? "Continuar" : "Começar a Aprender"}
                    </Link>
                  </Button>
                ) : (
                  <Button size="lg" className="bg-primary hover:bg-primary/90 px-6 sm:px-8 flex-1 sm:flex-initial" disabled>
                    <Play className="w-5 h-5 mr-2" />
                    Em breve
                  </Button>
                )}
                <Button size="lg" variant="outline" className="sm:w-auto">
                  <Bookmark className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Video Thumbnail */}
            <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg group cursor-pointer order-1 lg:order-2">
              <Image
                src={course.thumbnail_url || "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800"}
                alt={course.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                  <Play className="w-8 h-8 sm:w-10 sm:h-10 text-primary ml-1" />
                </div>
              </div>
              {course.trailer_url && (
                <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 flex items-center gap-2 text-white">
                  <Play className="w-4 h-4" />
                  <span className="text-xs sm:text-sm font-medium">Assistir intro</span>
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
              <Link href="/assinar" prefetch={false}>
                <Button size="lg" variant="secondary" className="whitespace-nowrap">
                  Assine o Clube
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content - Chapters */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Chapters */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">O que você vai aprender</h2>
              
              <div className="space-y-4">
                {course.modules?.map((module, index) => (
                  <ModuleCard 
                    key={module.id} 
                    module={module} 
                    index={index} 
                    slug={course.slug}
                    completedLessonIds={completedLessonIds}
                    completedQuizIds={completedQuizIds}
                    quizBestScores={quizBestScores}
                    onResetProgress={handleOpenResetModal}
                  />
                ))}

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
                  {course.slug !== "ecg-faixa-branca-fundamentos2" && (
                    <Link 
                      href="/cursos/ecg-faixa-branca-fundamentos2" 
                      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-slate-50 transition-colors"
                      prefetch={false}
                    >
                      <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-700 font-bold text-xs">1</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">ECG: Faixa Branca</p>
                        <p className="text-xs text-muted-foreground">Iniciante</p>
                      </div>
                    </Link>
                  )}
                  <Link 
                    href="/cursos/ecg-faixa-azul-arritmias-e-bloqueios" 
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-slate-50 transition-colors"
                    prefetch={false}
                  >
                    <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                      <span className="text-white font-bold text-xs">2</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">ECG: Faixa Azul</p>
                      <p className="text-xs text-muted-foreground">Intermediário</p>
                    </div>
                    <Lock className="w-4 h-4 text-muted-foreground ml-auto" />
                  </Link>
                  <Link 
                    href="/cursos/ecg-faixa-preta-casos-complexos" 
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-slate-50 transition-colors"
                    prefetch={false}
                  >
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
      
      {/* Modal de Confirmação de Reset */}
      <AlertDialog open={resetModalOpen} onOpenChange={setResetModalOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-orange-100">
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
            <AlertDialogTitle className="text-center text-xl">
              Reiniciar Progresso?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-base">
              <span className="block mb-3">
                Você está prestes a reiniciar todo o progresso do módulo:
              </span>
              <span className="block font-semibold text-foreground bg-slate-100 rounded-lg py-2 px-4">
                {resetModuleInfo?.title}
              </span>
              <span className="block mt-3 text-sm">
                Todas as aulas marcadas como concluídas serão reiniciadas.
                <br />
                <span className="text-orange-600 font-medium">Esta ação não pode ser desfeita.</span>
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <AlertDialogCancel 
              disabled={isResetting}
              className="sm:flex-1"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmReset}
              disabled={isResetting}
              className="bg-orange-600 hover:bg-orange-700 text-white sm:flex-1"
            >
              {isResetting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Reiniciando...
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Sim, Reiniciar
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

