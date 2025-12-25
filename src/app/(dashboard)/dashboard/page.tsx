"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight, BookOpen, Clock, Flame, Trophy, Play, Award, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BeltBadge } from "@/components/courses/belt-icon"

// Dados mockados
const currentCourse = {
  id: "1",
  title: "ECG: Faixa Branca",
  slug: "ecg-faixa-branca",
  belt: "white" as const,
  progress: 35,
  completedLessons: 8,
  totalLessons: 24,
  nextLesson: {
    id: "l4",
    title: "Ritmo sinusal normal",
    duration: "5:15",
  },
  thumbnail: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800",
}

const recentActivity = [
  { action: "Completou a aula", item: "Identificando componentes do QRS", time: "Hoje, 14:30", type: "lesson" },
  { action: "Acertou 85% no quiz", item: "Quiz: Fundamentos do ECG", time: "Ontem, 20:15", type: "quiz" },
  { action: "Iniciou o curso", item: "ECG: Faixa Branca", time: "3 dias atrás", type: "course" },
]

const availableCourses = [
  {
    id: "2",
    title: "ECG: Faixa Azul",
    slug: "ecg-faixa-azul",
    belt: "blue" as const,
    description: "Arritmias, bloqueios e alterações do ST",
    lessons: 32,
    duration: "6h",
    locked: true,
  },
  {
    id: "3",
    title: "ECG: Faixa Preta",
    slug: "ecg-faixa-preta",
    belt: "black" as const,
    description: "Casos complexos de especialista",
    lessons: 40,
    duration: "8h",
    locked: true,
  },
]

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Olá, Juan! 👋</h1>
        <p className="text-muted-foreground">
          Continue de onde parou e avance para a próxima faixa.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { title: "Aulas Assistidas", value: "8", icon: BookOpen, color: "text-blue-500", bg: "bg-blue-50" },
          { title: "Tempo de Estudo", value: "2h 45m", icon: Clock, color: "text-green-500", bg: "bg-green-50" },
          { title: "Sequência", value: "7 dias", icon: Flame, color: "text-orange-500", bg: "bg-orange-50" },
          { title: "Quizzes 100%", value: "3", icon: Trophy, color: "text-yellow-500", bg: "bg-yellow-50" },
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
      <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-r from-slate-50 to-white">
        <CardContent className="p-0">
          <div className="grid md:grid-cols-2">
            {/* Info */}
            <div className="p-6 md:p-8 space-y-4">
              <BeltBadge belt={currentCourse.belt} />
              
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

              <Button asChild size="lg" className="w-full bg-primary hover:bg-primary/90">
                <Link href={`/cursos/${currentCourse.slug}/aula/${currentCourse.nextLesson.id}`}>
                  <Play className="w-4 h-4 mr-2" />
                  Continuar Aula
                </Link>
              </Button>
            </div>

            {/* Thumbnail */}
            <div className="relative aspect-video md:aspect-auto">
              <Image
                src={currentCourse.thumbnail}
                alt={currentCourse.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid: Activity + Next Courses */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {recentActivity.map((activity, index) => (
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
            ))}
          </CardContent>
        </Card>

        {/* Next Courses */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Próximas Faixas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {availableCourses.map((course) => (
              <div
                key={course.id}
                className="flex items-center gap-4 p-4 rounded-xl border bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  course.belt === 'blue' ? 'bg-blue-500' : 'bg-gray-900'
                }`}>
                  <span className="text-white font-bold">{course.belt === 'blue' ? '2' : '3'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground">{course.title}</p>
                  <p className="text-xs text-muted-foreground">{course.description}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span>{course.lessons} aulas</span>
                    <span>•</span>
                    <span>{course.duration}</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" disabled={course.locked}>
                  {course.locked ? "Bloqueado" : "Iniciar"}
                </Button>
              </div>
            ))}
            
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
              { name: "Primeira Aula", icon: "🎬", unlocked: true },
              { name: "Primeiro Quiz", icon: "🎯", unlocked: true },
              { name: "7 Dias Seguidos", icon: "🔥", unlocked: true },
              { name: "Faixa Branca", icon: "🥋", unlocked: false },
              { name: "Quiz Perfeito", icon: "⭐", unlocked: false },
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
