"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, BookOpen, Clock, Award, Play, Lock, CheckCircle2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BeltBadge, BeltIcon } from "@/components/courses/belt-icon"
import { cn } from "@/lib/utils"

// Dados mockados
const courses = [
  {
    id: "1",
    title: "ECG: Faixa Branca",
    slug: "ecg-faixa-branca",
    description: "Fundamentos essenciais do ECG para quem está começando. Aprenda os componentes básicos, cálculo de frequência e ritmo sinusal.",
    thumbnail: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800",
    belt: "white" as const,
    instructor: { name: "Dr. Juan Lorenzo", avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200" },
    lessons: 24,
    quizzes: 13,
    duration: "3h 45m",
    progress: 35,
    is_free: true,
    locked: false,
  },
  {
    id: "2",
    title: "ECG: Faixa Azul",
    slug: "ecg-faixa-azul",
    description: "Arritmias supraventriculares, bloqueios de ramo, sobrecarga de câmaras e alterações do segmento ST.",
    thumbnail: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800",
    belt: "blue" as const,
    instructor: { name: "Dr. Juan Lorenzo", avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200" },
    lessons: 32,
    quizzes: 18,
    duration: "5h 30m",
    progress: 0,
    is_free: false,
    locked: true,
  },
  {
    id: "3",
    title: "ECG: Faixa Preta",
    slug: "ecg-faixa-preta",
    description: "Casos complexos: arritmias ventriculares, SCA, marcapassos e diagnósticos de especialista.",
    thumbnail: "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=800",
    belt: "black" as const,
    instructor: { name: "Dr. Juan Lorenzo", avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200" },
    lessons: 40,
    quizzes: 25,
    duration: "7h 15m",
    progress: 0,
    is_free: false,
    locked: true,
  },
]

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Sua Jornada</h3>
            <span className="text-sm text-muted-foreground">1 de 3 faixas</span>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Belt 1 - In Progress */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full border-4 border-primary bg-white flex items-center justify-center mb-2">
                <span className="text-2xl">🥋</span>
              </div>
              <span className="text-xs font-medium">Branca</span>
              <span className="text-xs text-primary">35%</span>
            </div>
            
            {/* Connector */}
            <div className="flex-1 h-1 bg-slate-200 rounded-full relative">
              <div className="absolute inset-y-0 left-0 w-1/3 bg-primary rounded-full" />
            </div>
            
            {/* Belt 2 - Locked */}
            <div className="flex flex-col items-center opacity-50">
              <div className="w-16 h-16 rounded-full border-4 border-slate-200 bg-blue-500 flex items-center justify-center mb-2">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-medium">Azul</span>
              <span className="text-xs text-muted-foreground">Bloqueado</span>
            </div>
            
            {/* Connector */}
            <div className="flex-1 h-1 bg-slate-200 rounded-full" />
            
            {/* Belt 3 - Locked */}
            <div className="flex flex-col items-center opacity-50">
              <div className="w-16 h-16 rounded-full border-4 border-slate-200 bg-gray-900 flex items-center justify-center mb-2">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-medium">Preta</span>
              <span className="text-xs text-muted-foreground">Bloqueado</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Courses Grid */}
      <div className="space-y-6">
        {filteredCourses.map((course) => (
          <Card 
            key={course.id} 
            className={cn(
              "overflow-hidden border-0 shadow-sm transition-all",
              course.locked ? "opacity-75" : "hover:shadow-md"
            )}
          >
            <div className="grid md:grid-cols-3">
              {/* Thumbnail */}
              <div className="relative aspect-video md:aspect-auto">
                <Image
                  src={course.thumbnail}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
                {course.locked && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Lock className="w-10 h-10 text-white" />
                  </div>
                )}
                {!course.locked && course.progress === 0 && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
                      <Play className="w-8 h-8 text-primary ml-1" />
                    </div>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="md:col-span-2 p-6">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <BeltBadge belt={course.belt} className="mb-2" />
                    <h3 className="text-xl font-bold text-foreground">{course.title}</h3>
                  </div>
                  {course.is_free && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                      GRÁTIS
                    </span>
                  )}
                </div>

                <p className="text-muted-foreground mb-4 line-clamp-2">
                  {course.description}
                </p>

                {/* Instructor */}
                <div className="flex items-center gap-2 mb-4">
                  <Image
                    src={course.instructor.avatar}
                    alt={course.instructor.name}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                  <span className="text-sm text-muted-foreground">
                    por <span className="text-primary font-medium">{course.instructor.name}</span>
                  </span>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    <span>{course.lessons} aulas</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Award className="w-4 h-4 text-yellow-500" />
                    <span>{course.quizzes} quizzes</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{course.duration}</span>
                  </div>
                </div>

                {/* Progress or CTA */}
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
                    asChild={!course.locked}
                    className={cn(
                      "w-full",
                      course.locked 
                        ? "bg-slate-200 text-slate-500 cursor-not-allowed" 
                        : "bg-primary hover:bg-primary/90"
                    )}
                    disabled={course.locked}
                  >
                    {course.locked ? (
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
        ))}
      </div>

      {/* CTA */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-primary to-red-600 text-white">
        <CardContent className="p-8 text-center">
          <h3 className="text-2xl font-bold mb-2">Quer desbloquear todas as faixas?</h3>
          <p className="text-white/80 mb-6">
            Assine o Clube do ECG e tenha acesso completo a todos os cursos e materiais.
          </p>
          <Button size="lg" variant="secondary">
            Ver Planos de Assinatura
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
