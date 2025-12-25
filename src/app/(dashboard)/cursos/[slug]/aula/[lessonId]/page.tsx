"use client"

import { use, useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, CheckCircle2, ChevronLeft, ChevronRight, ChevronDown, List, Loader2, Lock, Crown, Sparkles, Play, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Card, CardContent } from "@/components/ui/card"
import { LazyVideoPlayer } from "@/components/player/lazy-video-player"
import { useVideoProgress } from "@/hooks/use-progress"
import { createClient } from "@/lib/supabase/client"
import { recordActivity } from "@/lib/supabase/activity"
import { useUser } from "@/contexts/user-context"
import { Lesson, Module } from "@/types"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface Quiz {
  id: string
  title: string
}

interface ModuleWithDetails {
  id: string
  title: string
  order_index: number
  lessons: (Lesson & { is_free?: boolean })[]
  quizzes?: Quiz[]
}

interface LessonWithModule extends Lesson {
  module?: Module & {
    course?: {
      id: string
      title: string
      slug: string
      modules?: ModuleWithDetails[]
    }
  }
}

// Formatar duração
function formatDuration(seconds: number): string {
  if (!seconds) return "0:00"
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

export default function LessonPage({ 
  params 
}: { 
  params: Promise<{ slug: string; lessonId: string }> 
}) {
  const { slug, lessonId } = use(params)
  const [lesson, setLesson] = useState<LessonWithModule | null>(null)
  const [allLessons, setAllLessons] = useState<Lesson[]>([])
  const [allModules, setAllModules] = useState<ModuleWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(true)
  
  // Usar contexto para perfil - EVITA query duplicada!
  const { profile, isPro, isLoading: userLoading, completedLessonIds, completedQuizIds, quizBestScores, markLessonCompleted } = useUser()
  const userPlan = profile?.subscription_plan || "free"

  // Hook de progresso do vídeo
  const {
    isCompleted,
    initialPosition,
    isLoading: progressLoading,
    updateProgress,
    markComplete,
    saveOnExit,
  } = useVideoProgress(lessonId)

  // Buscar APENAS dados da aula - perfil vem do contexto
  useEffect(() => {
    async function fetchLesson() {
      const supabase = createClient()
      
      // Query única para aula com todas as aulas do curso + quizzes
      const { data: lessonData, error } = await supabase
        .from("lessons")
        .select(`
          *,
          module:modules(
            id,
            title,
            order_index,
            course:courses(
              id,
              title,
              slug,
              modules(
                id,
                title,
                order_index,
                lessons(id, title, duration_seconds, order_index, is_free),
                quizzes(id, title)
              )
            )
          )
        `)
        .eq("id", lessonId)
        .single()

      if (error) {
        console.error("Erro ao buscar aula:", error)
        setIsLoading(false)
        return
      }

      setLesson(lessonData)

      // Extrair todos os módulos do curso para a sidebar
      if (lessonData?.module?.course?.modules) {
        const sortedModules = [...lessonData.module.course.modules]
          .sort((a: { order_index: number }, b: { order_index: number }) => a.order_index - b.order_index)
          .map((mod: ModuleWithDetails) => ({
            ...mod,
            lessons: [...(mod.lessons || [])].sort((a, b) => a.order_index - b.order_index)
          }))
        
        setAllModules(sortedModules)
        
        // Também manter a lista flat de aulas para navegação prev/next
        const lessons: Lesson[] = []
        sortedModules.forEach((mod: ModuleWithDetails) => {
          if (mod.lessons) {
            lessons.push(...mod.lessons)
          }
        })
        setAllLessons(lessons)
      }

      setIsLoading(false)
    }

    fetchLesson()
  }, [lessonId])

  // Navegação
  const currentIndex = allLessons.findIndex(l => l.id === lessonId)
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null

  // Handlers
  // Verificar acesso quando lesson ou userPlan mudarem
  useEffect(() => {
    if (!lesson) return
    
    const isFreeLesson = lesson.is_free === true
    
    if (isPro) {
      // PRO tem acesso a tudo
      setHasAccess(true)
    } else if (userPlan === "basic") {
      // Básico tem acesso a aulas gratuitas (por enquanto)
      setHasAccess(isFreeLesson)
    } else {
      // Free só tem acesso a aulas marcadas como gratuitas
      setHasAccess(isFreeLesson)
    }
  }, [lesson, userPlan, isPro])

  const handleProgress = (progress: { played: number; playedSeconds: number }) => {
    if (lesson?.duration_seconds) {
      updateProgress(progress.playedSeconds, lesson.duration_seconds)
    }
  }

  const handleComplete = async () => {
    // Sempre atualizar contexto para refletir imediatamente na UI
    // (mesmo que já tenha sido marcada antes no banco)
    if (!completedLessonIds.has(lessonId)) {
      markLessonCompleted(lessonId)
    }
    markComplete()
    // Registrar atividade (streak + tempo de estudo)
    await recordActivity(lesson?.duration_seconds)
  }

  const handleMarkComplete = async () => {
    // Sempre atualizar contexto para refletir imediatamente na UI
    // (mesmo que já tenha sido marcada antes no banco)
    if (!completedLessonIds.has(lessonId)) {
      markLessonCompleted(lessonId)
    }
    await markComplete()
    // Registrar atividade (streak + tempo de estudo)
    await recordActivity(lesson?.duration_seconds)
  }

  // Loading state
  if (isLoading || progressLoading || userLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span>Carregando aula...</span>
        </div>
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Aula não encontrada</h2>
          <Link href={`/cursos/${slug}`}>
            <Button className="mt-4">Voltar ao curso</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Tela de bloqueio se não tiver acesso
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-lg w-full text-center">
          <CardContent className="pt-8 pb-8 space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-slate-100 flex items-center justify-center">
              <Lock className="w-10 h-10 text-slate-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Conteúdo Exclusivo
              </h2>
              <p className="text-muted-foreground">
                Esta aula faz parte do conteúdo exclusivo para assinantes.
              </p>
            </div>
            
            <div className="space-y-3">
              <Link href="/assinar" className="block">
                <Button className="w-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white">
                  <Crown className="w-4 h-4 mr-2" />
                  Assinar Plano PRO
                </Button>
              </Link>
              
              <Link href="/assinar" className="block">
                <Button variant="outline" className="w-full">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Ver Planos
                </Button>
              </Link>
            </div>

            <div className="pt-4 border-t">
              <Link href={`/cursos/${slug}`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar ao curso
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <div className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-4">
            <Link href={`/cursos/${slug}`}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <p className="text-sm font-medium line-clamp-1">{lesson.title}</p>
              <p className="text-xs text-muted-foreground">
                {lesson.module?.course?.title || "Clube do ECG"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Completed Badge */}
            {isCompleted && (
              <div className="hidden md:flex items-center gap-2 text-green-500 bg-green-500/10 px-3 py-1 rounded-full">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm font-medium">Concluída</span>
              </div>
            )}

            {/* Mobile Lesson List - Nova visualização com módulos */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="lg:hidden">
                  <List className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[85vw] max-w-sm p-0 !bg-white">
                <SheetHeader className="p-4 border-b">
                  <SheetTitle>Conteúdo do Curso</SheetTitle>
                  <p className="text-xs text-muted-foreground">
                    {allModules.length} módulos • {allLessons.length} aulas
                  </p>
                </SheetHeader>
                <div className="overflow-y-auto max-h-[calc(100vh-100px)]">
                  <div className="divide-y">
                    {allModules.map((mod, modIndex) => {
                      const isCurrentModule = mod.lessons?.some(l => l.id === lessonId)
                      const completedInModule = mod.lessons?.filter(l => completedLessonIds.has(l.id)).length || 0
                      const totalInModule = mod.lessons?.length || 0
                      
                      return (
                        <Collapsible key={mod.id} defaultOpen={isCurrentModule}>
                          <CollapsibleTrigger className="w-full">
                            <div className="flex items-center justify-between p-3 hover:bg-muted/50">
                              <div className="flex items-center gap-3">
                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                                  isCurrentModule 
                                    ? "bg-primary text-primary-foreground" 
                                    : completedInModule === totalInModule && totalInModule > 0
                                      ? "bg-green-500 text-white"
                                      : "bg-slate-200 text-slate-600"
                                }`}>
                                  {modIndex + 1}
                                </div>
                                <div className="text-left">
                                  <p className={`text-sm font-medium line-clamp-1 ${
                                    isCurrentModule ? "text-primary" : ""
                                  }`}>
                                    {mod.title}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {completedInModule}/{totalInModule} aulas
                                  </p>
                                </div>
                              </div>
                              <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            </div>
                          </CollapsibleTrigger>
                          
                          <CollapsibleContent>
                            <div className="bg-muted/30">
                              {mod.lessons?.map((l) => {
                                const isCompleted = completedLessonIds.has(l.id)
                                const isCurrent = l.id === lessonId
                                
                                return (
                                  <Link 
                                    key={l.id} 
                                    href={`/cursos/${slug}/aula/${l.id}`}
                                    className={`flex items-center gap-3 px-4 py-2.5 border-l-2 ${
                                      isCurrent 
                                        ? "bg-primary/10 border-l-primary" 
                                        : isCompleted
                                          ? "bg-green-50/50 border-l-green-500"
                                          : "border-l-transparent hover:bg-muted"
                                    }`}
                                  >
                                    {isCompleted ? (
                                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                                    ) : isCurrent ? (
                                      <Play className="w-4 h-4 text-primary flex-shrink-0 fill-primary" />
                                    ) : (
                                      <Play className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                    )}
                                    
                                    <p className={`text-sm line-clamp-1 flex-1 ${
                                      isCurrent ? "font-medium text-primary" : 
                                      isCompleted ? "text-green-700" : ""
                                    }`}>
                                      {l.title}
                                    </p>
                                    
                                    <span className="text-xs text-muted-foreground">
                                      {formatDuration(l.duration_seconds || 0)}
                                    </span>
                                  </Link>
                                )
                              })}
                              
                              {mod.quizzes?.map((quiz) => {
                                const isQuizDone = completedQuizIds.has(quiz.id)
                                const bestScore = quizBestScores.get(quiz.id)
                                return (
                                  <Link 
                                    key={quiz.id} 
                                    href={`/cursos/${slug}/quiz/${quiz.id}`}
                                    className={`flex items-center gap-3 px-4 py-2.5 border-l-2 hover:bg-muted ${
                                      isQuizDone ? "border-l-green-500 bg-green-50/50" : "border-l-transparent"
                                    }`}
                                  >
                                    {isQuizDone ? (
                                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                                    ) : (
                                      <HelpCircle className="w-4 h-4 text-purple-500 flex-shrink-0" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm line-clamp-1">{quiz.title}</p>
                                      {isQuizDone && bestScore && (
                                        <span className="text-xs text-green-600">Melhor: {bestScore}%</span>
                                      )}
                                    </div>
                                    <span className={`text-xs font-medium ${isQuizDone ? "text-green-600" : "text-purple-500"}`}>
                                      Quiz
                                    </span>
                                  </Link>
                                )
                              })}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      )
                    })}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-0">
        {/* Video Player */}
        <div className="lg:col-span-3">
          <div className="p-4 md:p-6">
            <LazyVideoPlayer
              url={lesson.video_url || ""}
              title={lesson.title}
              onProgress={handleProgress}
              onComplete={handleComplete}
              initialPosition={initialPosition}
            />

            {/* Lesson Info */}
            <div className="mt-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-xl sm:text-2xl font-bold">{lesson.title}</h1>
                  <p className="text-muted-foreground mt-2 text-sm sm:text-base">{lesson.description}</p>
                </div>
                
                {/* Mark Complete Button */}
                {!isCompleted ? (
                  <Button 
                    onClick={handleMarkComplete}
                    variant="outline"
                    className="shrink-0 w-full sm:w-auto"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Marcar como concluída
                  </Button>
                ) : (
                  <div className="flex items-center gap-2 text-green-500 justify-center sm:justify-start">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="text-sm font-medium">Concluída</span>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t">
                {prevLesson ? (
                  <Link href={`/cursos/${slug}/aula/${prevLesson.id}`} className="flex-1 sm:flex-initial">
                    <Button variant="outline" className="w-full sm:w-auto">
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Aula Anterior
                    </Button>
                  </Link>
                ) : (
                  <Button variant="outline" disabled className="flex-1 sm:flex-initial">
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Aula Anterior
                  </Button>
                )}

                {nextLesson ? (
                  <Link href={`/cursos/${slug}/aula/${nextLesson.id}`} className="flex-1 sm:flex-initial">
                    <Button className="w-full sm:w-auto bg-gradient-to-r from-red-500 to-red-600">
                      Próxima Aula
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                ) : (
                  <Link href={`/cursos/${slug}`} className="flex-1 sm:flex-initial">
                    <Button className="w-full sm:w-auto bg-gradient-to-r from-red-500 to-red-600">
                      Voltar ao Curso
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Sidebar - Nova visualização com módulos */}
        <div className="hidden lg:block border-l bg-card/50">
          <div className="sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto">
            <div className="p-4 border-b bg-background/80 backdrop-blur-sm">
              <h3 className="font-semibold">Conteúdo do Curso</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {allModules.length} módulos • {allLessons.length} aulas
              </p>
            </div>
            
            <div className="divide-y">
              {allModules.map((mod, modIndex) => {
                // Verifica se o módulo contém a aula atual
                const isCurrentModule = mod.lessons?.some(l => l.id === lessonId)
                // Calcula progresso do módulo
                const completedInModule = mod.lessons?.filter(l => completedLessonIds.has(l.id)).length || 0
                const totalInModule = mod.lessons?.length || 0
                
                return (
                  <Collapsible key={mod.id} defaultOpen={isCurrentModule}>
                    <CollapsibleTrigger className="w-full">
                      <div className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                            isCurrentModule 
                              ? "bg-primary text-primary-foreground" 
                              : completedInModule === totalInModule && totalInModule > 0
                                ? "bg-green-500 text-white"
                                : "bg-slate-200 text-slate-600"
                          }`}>
                            {modIndex + 1}
                          </div>
                          <div className="text-left">
                            <p className={`text-sm font-medium line-clamp-1 ${
                              isCurrentModule ? "text-primary" : ""
                            }`}>
                              {mod.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {completedInModule}/{totalInModule} aulas
                              {mod.quizzes && mod.quizzes.length > 0 && ` • ${mod.quizzes.length} quiz`}
                            </p>
                          </div>
                        </div>
                        <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                      </div>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <div className="bg-muted/30">
                        {/* Aulas do módulo */}
                        {mod.lessons?.map((l) => {
                          const isCompleted = completedLessonIds.has(l.id)
                          const isCurrent = l.id === lessonId
                          
                          return (
                            <Link 
                              key={l.id} 
                              href={`/cursos/${slug}/aula/${l.id}`}
                              className={`flex items-center gap-3 px-4 py-2.5 transition-colors border-l-2 ${
                                isCurrent 
                                  ? "bg-primary/10 border-l-primary" 
                                  : isCompleted
                                    ? "bg-green-50/50 border-l-green-500 hover:bg-green-50"
                                    : "border-l-transparent hover:bg-muted"
                              }`}
                            >
                              {isCompleted ? (
                                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                              ) : isCurrent ? (
                                <Play className="w-4 h-4 text-primary flex-shrink-0 fill-primary" />
                              ) : l.is_free ? (
                                <Play className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                              ) : (
                                <Lock className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                              )}
                              
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm line-clamp-1 ${
                                  isCurrent ? "font-medium text-primary" : 
                                  isCompleted ? "text-green-700" : ""
                                }`}>
                                  {l.title}
                                </p>
                              </div>
                              
                              <span className="text-xs text-muted-foreground flex-shrink-0">
                                {formatDuration(l.duration_seconds || 0)}
                              </span>
                            </Link>
                          )
                        })}
                        
                        {/* Quizzes do módulo */}
                        {mod.quizzes?.map((quiz) => {
                          const isQuizDone = completedQuizIds.has(quiz.id)
                          const bestScore = quizBestScores.get(quiz.id)
                          return (
                            <Link 
                              key={quiz.id} 
                              href={`/cursos/${slug}/quiz/${quiz.id}`}
                              className={`flex items-center gap-3 px-4 py-2.5 transition-colors border-l-2 hover:bg-muted ${
                                isQuizDone ? "border-l-green-500 bg-green-50/50" : "border-l-transparent"
                              }`}
                            >
                              {isQuizDone ? (
                                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                              ) : (
                                <HelpCircle className="w-4 h-4 text-purple-500 flex-shrink-0" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm line-clamp-1">{quiz.title}</p>
                                {isQuizDone && bestScore && (
                                  <span className="text-xs text-green-600">Melhor: {bestScore}%</span>
                                )}
                              </div>
                              <span className={`text-xs font-medium flex-shrink-0 ${isQuizDone ? "text-green-600" : "text-purple-500"}`}>
                                Quiz
                              </span>
                            </Link>
                          )
                        })}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
