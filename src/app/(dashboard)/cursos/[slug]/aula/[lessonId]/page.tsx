"use client"

import { use, useState } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronLeft, ChevronRight, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { VideoPlayer } from "@/components/player/video-player"
import { LessonList } from "@/components/courses/lesson-list"
import { ModuleWithContent } from "@/types"

// Mock data
const mockLesson = {
  id: "lesson-1",
  module_id: "module-1",
  title: "Identificando componentes do QRS",
  description: "Nesta aula, você vai aprender a identificar cada componente do complexo QRS no eletrocardiograma, entendendo o que cada onda representa eletricamente.",
  video_url: "https://vimeo.com/999233514",
  duration_seconds: 581,
  order_index: 1,
  is_free: true,
}

const mockModules: ModuleWithContent[] = [
  {
    id: "module-1",
    course_id: "1",
    title: "Fundamentos do ECG",
    description: "Entenda os componentes básicos do eletrocardiograma",
    order_index: 1,
    contents: [
      {
        type: "lesson",
        id: "lesson-1",
        module_id: "module-1",
        title: "Identificando componentes do QRS",
        video_url: "https://vimeo.com/999233514",
        duration_seconds: 581,
        order_index: 1,
        is_free: true,
        progress: { 
          id: "1", 
          user_id: "1", 
          lesson_id: "lesson-1", 
          completed: true, 
          watch_time_seconds: 581,
          last_position_seconds: 581,
        },
      },
      {
        type: "lesson",
        id: "lesson-2",
        module_id: "module-1",
        title: "Revisando exemplos complexos",
        video_url: "https://vimeo.com/984243986",
        duration_seconds: 207,
        order_index: 2,
        is_free: true,
      },
      {
        type: "quiz",
        id: "quiz-1",
        module_id: "module-1",
        title: "Quiz: Fundamentos do ECG",
        order_index: 3,
      },
    ],
  },
]

export default function LessonPage({ 
  params 
}: { 
  params: Promise<{ slug: string; lessonId: string }> 
}) {
  const { slug, lessonId } = use(params)
  const [isCompleted, setIsCompleted] = useState(false)

  const lesson = mockLesson
  const modules = mockModules
  const courseProgress = 33 // Mock

  const handleProgress = (progress: { played: number; playedSeconds: number }) => {
    // Salvar progresso no backend
    console.log("Progress:", progress)
  }

  const handleComplete = () => {
    setIsCompleted(true)
    // Marcar como completo no backend
    console.log("Lesson completed!")
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
              <p className="text-xs text-muted-foreground">Método CAMPOS-ECG™ - Nível 1</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Progress */}
            <div className="hidden md:flex items-center gap-2">
              <Progress value={courseProgress} className="w-32 h-2" />
              <span className="text-xs text-muted-foreground">{courseProgress}%</span>
            </div>

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
                  <LessonList 
                    modules={modules} 
                    courseSlug={slug}
                    currentLessonId={lessonId}
                  />
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
              url={lesson.video_url}
              title={lesson.title}
              onProgress={handleProgress}
              onComplete={handleComplete}
            />

            {/* Lesson Info */}
            <div className="mt-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold">{lesson.title}</h1>
                  <p className="text-muted-foreground mt-2">{lesson.description}</p>
                </div>
                {isCompleted && (
                  <div className="flex items-center gap-2 text-green-500">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="text-sm font-medium">Concluída</span>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4 border-t">
                <Button variant="outline" disabled>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Aula Anterior
                </Button>
                <Button className="bg-gradient-to-r from-red-500 to-red-600">
                  Próxima Aula
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden lg:block border-l bg-card/50">
          <div className="sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto p-4">
            <h3 className="font-semibold mb-4">Conteúdo do Curso</h3>
            <LessonList 
              modules={modules} 
              courseSlug={slug}
              currentLessonId={lessonId}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

