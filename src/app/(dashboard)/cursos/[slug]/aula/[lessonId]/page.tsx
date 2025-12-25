"use client"

import { use, useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, CheckCircle2, ChevronLeft, ChevronRight, List, Loader2, Lock, Crown, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Card, CardContent } from "@/components/ui/card"
import { VideoPlayer } from "@/components/player/video-player"
import { LessonList } from "@/components/courses/lesson-list"
import { useVideoProgress } from "@/hooks/use-progress"
import { createClient } from "@/lib/supabase/client"
import { Lesson, Module } from "@/types"

interface LessonWithModule extends Lesson {
  module?: Module & {
    course?: {
      id: string
      title: string
      slug: string
    }
  }
}

export default function LessonPage({ 
  params 
}: { 
  params: Promise<{ slug: string; lessonId: string }> 
}) {
  const { slug, lessonId } = use(params)
  const [lesson, setLesson] = useState<LessonWithModule | null>(null)
  const [allLessons, setAllLessons] = useState<Lesson[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [courseProgress, setCourseProgress] = useState(0)
  const [userPlan, setUserPlan] = useState<string>("free")
  const [hasAccess, setHasAccess] = useState(true)

  // Hook de progresso do vídeo
  const {
    isCompleted,
    initialPosition,
    isLoading: progressLoading,
    updateProgress,
    markComplete,
    saveOnExit,
  } = useVideoProgress(lessonId)

  // Buscar dados da aula
  useEffect(() => {
    async function fetchLesson() {
      const supabase = createClient()
      
      // Buscar perfil do usuário para verificar plano
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("subscription_plan")
          .eq("id", user.id)
          .single()
        
        if (profileData) {
          setUserPlan(profileData.subscription_plan || "free")
        }
      }
      
      // Buscar a aula atual
      const { data: lessonData, error } = await supabase
        .from("lessons")
        .select(`
          *,
          module:modules(
            *,
            course:courses(id, title, slug)
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

      // Buscar todas as aulas do curso para navegação
      if (lessonData?.module?.course?.id) {
        const { data: modulesData } = await supabase
          .from("modules")
          .select(`
            *,
            lessons(*)
          `)
          .eq("course_id", lessonData.module.course.id)
          .order("order_index", { ascending: true })

        if (modulesData) {
          const lessons: Lesson[] = []
          modulesData.forEach(mod => {
            if (mod.lessons) {
              mod.lessons.sort((a: Lesson, b: Lesson) => a.order_index - b.order_index)
              lessons.push(...mod.lessons)
            }
          })
          setAllLessons(lessons)
        }
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
    
    if (userPlan === "pro") {
      // PRO tem acesso a tudo
      setHasAccess(true)
    } else if (userPlan === "basic") {
      // Básico tem acesso a aulas gratuitas (por enquanto)
      setHasAccess(isFreeLesson)
    } else {
      // Free só tem acesso a aulas marcadas como gratuitas
      setHasAccess(isFreeLesson)
    }
  }, [lesson, userPlan])

  const handleProgress = (progress: { played: number; playedSeconds: number }) => {
    if (lesson?.duration_seconds) {
      updateProgress(progress.playedSeconds, lesson.duration_seconds)
    }
  }

  const handleComplete = () => {
    markComplete()
  }

  const handleMarkComplete = async () => {
    await markComplete()
  }

  // Loading state
  if (isLoading || progressLoading) {
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

            {/* Mobile Lesson List */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="md:hidden">
                  <List className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-0">
                <SheetHeader className="p-4 border-b">
                  <SheetTitle>Conteúdo do Curso</SheetTitle>
                </SheetHeader>
                <div className="p-4 overflow-y-auto max-h-[calc(100vh-80px)]">
                  <p className="text-sm text-muted-foreground">
                    {allLessons.length} aulas neste curso
                  </p>
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
            <VideoPlayer
              url={lesson.video_url || ""}
              title={lesson.title}
              onProgress={handleProgress}
              onComplete={handleComplete}
              initialPosition={initialPosition}
            />

            {/* Lesson Info */}
            <div className="mt-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold">{lesson.title}</h1>
                  <p className="text-muted-foreground mt-2">{lesson.description}</p>
                </div>
                
                {/* Mark Complete Button */}
                {!isCompleted ? (
                  <Button 
                    onClick={handleMarkComplete}
                    variant="outline"
                    className="shrink-0"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Marcar como concluída
                  </Button>
                ) : (
                  <div className="flex items-center gap-2 text-green-500">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="text-sm font-medium">Concluída</span>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4 border-t">
                {prevLesson ? (
                  <Link href={`/cursos/${slug}/aula/${prevLesson.id}`}>
                    <Button variant="outline">
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Aula Anterior
                    </Button>
                  </Link>
                ) : (
                  <Button variant="outline" disabled>
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Aula Anterior
                  </Button>
                )}

                {nextLesson ? (
                  <Link href={`/cursos/${slug}/aula/${nextLesson.id}`}>
                    <Button className="bg-gradient-to-r from-red-500 to-red-600">
                      Próxima Aula
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                ) : (
                  <Link href={`/cursos/${slug}`}>
                    <Button className="bg-gradient-to-r from-red-500 to-red-600">
                      Voltar ao Curso
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden lg:block border-l bg-card/50">
          <div className="sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto p-4">
            <h3 className="font-semibold mb-4">Aulas do Curso</h3>
            <div className="space-y-2">
              {allLessons.map((l, index) => (
                <Link 
                  key={l.id} 
                  href={`/cursos/${slug}/aula/${l.id}`}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    l.id === lessonId 
                      ? "bg-primary/10 border border-primary/20" 
                      : "hover:bg-muted"
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    l.id === lessonId
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {index + 1}
                  </div>
                  <span className={`text-sm line-clamp-2 ${
                    l.id === lessonId ? "font-medium" : ""
                  }`}>
                    {l.title}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
