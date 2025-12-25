"use client"

import { use } from "react"
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
  ChevronDown,
  FileText,
  Video
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { BeltBadge } from "@/components/courses/belt-icon"
import { cn } from "@/lib/utils"

// Mock data no estilo Medmastery
const mockCourse = {
  id: "1",
  title: "ECG: Faixa Branca",
  slug: "ecg-faixa-branca",
  description: "Este curso prático ensina todos os fundamentos do ECG que você precisa para ir de iniciante a praticante confiante em poucas horas! Aprenda a diagnosticar problemas cardíacos importantes como infarto do miocárdio, hipertrofia e sobrecarga de volume.",
  thumbnail_url: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800",
  trailer_url: "https://vimeo.com/999233514",
  belt: "white" as const,
  instructor: {
    name: "Dr. Juan Lorenzo",
    title: "Cardiologista, Especialista em ECG",
    bio: "Juan é o fundador do Clube do ECG. Ele é cardiologista com especialização em eletrocardiografia e mestre em educação médica.",
    avatar_url: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200",
  },
  stats: {
    lessons: 24,
    quizzes: 13,
    duration_hours: 3,
    duration_minutes: 45,
  },
  progress: 35,
  chapters: [
    {
      id: "ch1",
      title: "Nível 1: A Curva do ECG",
      description: "Vamos começar com o ABC do ECG. Desmembramos os componentes do traçado para você construir uma compreensão dos conceitos avançados.",
      is_free: true,
      lessons: [
        { id: "l1", title: "Identificando componentes do complexo QRS", duration: "9:41", type: "video", completed: true },
        { id: "l2", title: "Revisando exemplos de ECGs complexos", duration: "3:27", type: "video", completed: true },
      ],
      quiz: { id: "q1", title: "Quiz: Fundamentos do ECG", completed: true, score: 85 },
    },
    {
      id: "ch2",
      title: "Nível 2: Frequência e Ritmo",
      description: "Aprenda a calcular a frequência cardíaca e identificar os ritmos normais e anormais.",
      is_free: false,
      lessons: [
        { id: "l3", title: "Calculando a frequência cardíaca", duration: "7:22", type: "video", completed: true },
        { id: "l4", title: "Ritmo sinusal normal", duration: "5:15", type: "video", completed: false },
        { id: "l5", title: "Arritmias sinusais", duration: "8:33", type: "video", completed: false },
      ],
      quiz: { id: "q2", title: "Quiz: Frequência e Ritmo", completed: false },
    },
    {
      id: "ch3",
      title: "Nível 3: Eixo Elétrico",
      description: "Domine o conceito de eixo elétrico e aprenda a identificar desvios.",
      is_free: false,
      lessons: [
        { id: "l6", title: "O que é o eixo elétrico?", duration: "6:45", type: "video", completed: false },
        { id: "l7", title: "Desvio de eixo para esquerda", duration: "5:30", type: "video", completed: false },
        { id: "l8", title: "Desvio de eixo para direita", duration: "4:55", type: "video", completed: false },
      ],
      quiz: { id: "q3", title: "Quiz: Eixo Elétrico", completed: false },
    },
  ],
  resources: [
    { id: "r1", name: "Cheat Sheet - Método CAMPOS", type: "PDF", size: "2.4 MB" },
    { id: "r2", name: "Workbook do Curso", type: "PDF", size: "5.1 MB" },
    { id: "r3", name: "Casos Clínicos Extras", type: "PDF", size: "3.8 MB" },
  ],
}

export default function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const course = mockCourse

  const completedLessons = course.chapters.reduce((acc, ch) => 
    acc + ch.lessons.filter(l => l.completed).length, 0
  )
  const totalLessons = course.chapters.reduce((acc, ch) => acc + ch.lessons.length, 0)

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      {/* Header do Curso - Estilo Medmastery */}
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
                <BeltBadge belt={course.belt} />
                <Badge variant="outline">Português</Badge>
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
                    src={course.instructor.avatar_url}
                    alt={course.instructor.name}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                  <span className="font-medium text-primary">{course.instructor.name}</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-muted-foreground leading-relaxed">
                {course.description}
              </p>

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-muted-foreground" />
                  <span>{course.stats.lessons} Aulas</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-500" />
                  <span>{course.stats.quizzes} Quizzes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <span>{course.stats.duration_hours}h {course.stats.duration_minutes}m</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <Button size="lg" className="bg-primary hover:bg-primary/90 px-8">
                  <Play className="w-5 h-5 mr-2" />
                  Continuar Aprendendo
                </Button>
                <Button size="lg" variant="outline">
                  <Bookmark className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Video Thumbnail */}
            <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg group cursor-pointer">
              <Image
                src={course.thumbnail_url}
                alt={course.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                  <Play className="w-10 h-10 text-primary ml-1" />
                </div>
              </div>
              <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white">
                <Play className="w-4 h-4" />
                <span className="text-sm font-medium">Assistir intro</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Banner */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold mb-1">Desbloqueie este curso e mais de 50 outros</h3>
              <p className="text-slate-300">Tenha acesso a todos os cursos premiados e se torne um expert em ECG.</p>
            </div>
            <Button size="lg" variant="secondary" className="whitespace-nowrap">
              Assine o Clube
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - Chapters */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Seu Progresso</h3>
                  <span className="text-2xl font-bold text-primary">{course.progress}%</span>
                </div>
                <Progress value={course.progress} className="h-3 mb-2" />
                <p className="text-sm text-muted-foreground">
                  {completedLessons} de {totalLessons} aulas concluídas
                </p>
              </CardContent>
            </Card>

            {/* Chapters */}
            <div>
              <h2 className="text-xl font-bold mb-4">O que você vai aprender</h2>
              
              <div className="space-y-4">
                {course.chapters.map((chapter, index) => (
                  <Card key={chapter.id} className="overflow-hidden">
                    {/* Chapter Header */}
                    <div className="p-4 bg-slate-50 border-b flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{chapter.title}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground">{chapter.description}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {chapter.lessons.length} aulas, 1 quiz
                          </p>
                        </div>
                      </div>
                      {chapter.is_free && (
                        <span className="free-badge">GRÁTIS</span>
                      )}
                    </div>

                    {/* Lessons */}
                    <div className="divide-y">
                      {chapter.lessons.map((lesson) => (
                        <Link
                          key={lesson.id}
                          href={`/cursos/${slug}/aula/${lesson.id}`}
                          className={cn(
                            "flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors chapter-item",
                            lesson.completed && "completed"
                          )}
                        >
                          {lesson.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                          ) : (
                            <Play className="w-5 h-5 text-primary flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              "text-sm font-medium truncate",
                              lesson.completed && "text-muted-foreground"
                            )}>
                              {lesson.title}
                            </p>
                          </div>
                          <span className="text-sm text-muted-foreground flex-shrink-0">
                            {lesson.duration}
                          </span>
                        </Link>
                      ))}

                      {/* Quiz */}
                      {chapter.quiz && (
                        <Link
                          href={`/cursos/${slug}/quiz/${chapter.quiz.id}`}
                          className={cn(
                            "flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors chapter-item bg-amber-50/50",
                            chapter.quiz.completed && "completed"
                          )}
                        >
                          {chapter.quiz.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                          ) : (
                            <Award className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">
                              {chapter.quiz.title}
                            </p>
                          </div>
                          {chapter.quiz.completed && chapter.quiz.score && (
                            <span className="text-sm font-medium text-green-600">
                              {chapter.quiz.score}%
                            </span>
                          )}
                          <Badge variant="secondary" className="text-xs">
                            Quiz
                          </Badge>
                        </Link>
                      )}
                    </div>
                  </Card>
                ))}
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
                    src={course.instructor.avatar_url}
                    alt={course.instructor.name}
                    width={64}
                    height={64}
                    className="rounded-full"
                  />
                  <div>
                    <p className="font-semibold text-primary">{course.instructor.name}</p>
                    <p className="text-sm text-muted-foreground">{course.instructor.title}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  {course.instructor.bio}
                </p>
              </CardContent>
            </Card>

            {/* Resources */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Materiais do Curso</h3>
                <div className="space-y-3">
                  {course.resources.map((resource) => (
                    <button
                      key={resource.id}
                      className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-slate-50 transition-colors text-left"
                    >
                      <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{resource.name}</p>
                        <p className="text-xs text-muted-foreground">{resource.type} • {resource.size}</p>
                      </div>
                      <Download className="w-4 h-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Other Belts */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Próximos Níveis</h3>
                <div className="space-y-3">
                  <Link href="/cursos/ecg-faixa-azul" className="flex items-center gap-3 p-3 rounded-lg border hover:bg-slate-50 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                      <span className="text-white font-bold text-xs">2</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">ECG: Faixa Azul</p>
                      <p className="text-xs text-muted-foreground">Intermediário</p>
                    </div>
                    <Lock className="w-4 h-4 text-muted-foreground ml-auto" />
                  </Link>
                  <Link href="/cursos/ecg-faixa-preta" className="flex items-center gap-3 p-3 rounded-lg border hover:bg-slate-50 transition-colors">
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
