"use client"

import Link from "next/link"
import Image from "next/image"
import { Clock, BookOpen, PlayCircle } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { CourseWithProgress } from "@/types"

interface CourseCardProps {
  course: CourseWithProgress
}

const difficultyColors = {
  iniciante: "bg-green-500/10 text-green-500 border-green-500/20",
  intermediario: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  avancado: "bg-red-500/10 text-red-500 border-red-500/20",
}

const difficultyLabels = {
  iniciante: "Iniciante",
  intermediario: "Intermediário",
  avancado: "Avançado",
}

export function CourseCard({ course }: CourseCardProps) {
  const progressPercentage = course.progress?.progress_percentage || 0
  const hasStarted = progressPercentage > 0

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg hover:shadow-red-500/10 hover:border-red-500/30">
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={course.thumbnail_url || "/placeholder-course.jpg"}
          alt={course.title}
          fill
          className="object-cover transition-transform group-hover:scale-105"
        />
        
        {/* Overlay com Play */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <PlayCircle className="h-16 w-16 text-white" />
        </div>

        {/* Badge de Dificuldade */}
        <Badge 
          variant="outline" 
          className={`absolute top-3 left-3 ${difficultyColors[course.difficulty]}`}
        >
          {difficultyLabels[course.difficulty]}
        </Badge>

        {/* Badge Free */}
        {course.is_free && (
          <Badge className="absolute top-3 right-3 bg-green-500">
            Grátis
          </Badge>
        )}
      </div>

      <CardContent className="p-4">
        {/* Título */}
        <h3 className="font-semibold text-lg line-clamp-2 mb-2 group-hover:text-red-500 transition-colors">
          {course.title}
        </h3>

        {/* Descrição */}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {course.teaser}
        </p>

        {/* Estatísticas */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            <span>{course.lessons_count} aulas</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{course.duration_minutes} min</span>
          </div>
        </div>

        {/* Barra de Progresso */}
        {hasStarted && (
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Progresso</span>
              <span className="font-medium">{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full" variant={hasStarted ? "default" : "outline"}>
          <Link href={`/cursos/${course.slug}`}>
            {hasStarted ? "Continuar" : "Começar"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}



