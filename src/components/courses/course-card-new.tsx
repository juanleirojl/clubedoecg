"use client"

import Link from "next/link"
import Image from "next/image"
import { Clock, BookOpen, Award, Play, Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { BeltBadge } from "./belt-icon"
// import { cn } from "@/lib/utils" // Não usado atualmente

interface CourseCardNewProps {
  course: {
    id: string
    title: string
    slug: string
    description: string
    thumbnail_url: string
    instructor: {
      name: string
      title: string
      avatar_url: string
    }
    belt: "white" | "blue" | "black"
    lessons_count: number
    quizzes_count: number
    duration_minutes: number
    progress?: number
    is_free?: boolean
  }
}

export function CourseCardNew({ course }: CourseCardNewProps) {
  const hasProgress = course.progress !== undefined && course.progress > 0

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden card-hover">
      {/* Thumbnail com Play */}
      <div className="relative aspect-video bg-muted">
        <Image
          src={course.thumbnail_url}
          alt={course.title}
          fill
          className="object-cover"
        />
        
        {/* Overlay com Play */}
        <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
            <Play className="w-8 h-8 text-primary ml-1" />
          </div>
        </div>

        {/* Badge "Watch intro" */}
        <button className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 hover:bg-black/80 text-white px-3 py-1.5 rounded-full text-sm transition-colors">
          <Play className="w-4 h-4" />
          Watch intro
        </button>

        {/* Bookmark */}
        <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-md transition-colors">
          <Bookmark className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Belt Badge */}
        <div className="mb-3">
          <BeltBadge belt={course.belt} />
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-foreground mb-2 line-clamp-2">
          {course.title}
        </h3>

        {/* Instructor */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-muted overflow-hidden">
            <Image
              src={course.instructor.avatar_url}
              alt={course.instructor.name}
              width={40}
              height={40}
              className="object-cover"
            />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{course.instructor.name}</p>
            <p className="text-xs text-muted-foreground">{course.instructor.title}</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
          {course.description}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            <span>{course.lessons_count} Aulas</span>
          </div>
          <div className="flex items-center gap-1">
            <Award className="w-4 h-4 text-yellow-500" />
            <span>{course.quizzes_count} Quizzes</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{Math.floor(course.duration_minutes / 60)}h {course.duration_minutes % 60}m</span>
          </div>
        </div>

        {/* Progress bar (if started) */}
        {hasProgress && (
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Progresso</span>
              <span className="font-medium text-primary">{course.progress}%</span>
            </div>
            <Progress value={course.progress} className="h-2" />
          </div>
        )}

        {/* Action Button */}
        <div className="flex items-center gap-2">
          <Button asChild className="flex-1 bg-primary hover:bg-primary/90">
            <Link href={`/cursos/${course.slug}`}>
              <Play className="w-4 h-4 mr-2" />
              {hasProgress ? "Continuar" : "Começar"}
            </Link>
          </Button>
          <Button variant="outline" size="icon">
            <Bookmark className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}



