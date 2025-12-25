"use client"

import Link from "next/link"
import { CheckCircle2, Circle, Lock, PlayCircle, HelpCircle } from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { ModuleWithContent, LessonWithProgress, QuizWithProgress } from "@/types"
import { cn } from "@/lib/utils"

interface LessonListProps {
  modules: ModuleWithContent[]
  courseSlug: string
  currentLessonId?: string
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes}:${secs.toString().padStart(2, "0")}`
}

function LessonItem({ 
  lesson, 
  courseSlug,
  isActive,
  isLocked
}: { 
  lesson: LessonWithProgress
  courseSlug: string
  isActive: boolean
  isLocked: boolean
}) {
  const isCompleted = lesson.progress?.completed

  return (
    <Link
      href={isLocked ? "#" : `/cursos/${courseSlug}/aula/${lesson.id}`}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg transition-all",
        isActive && "bg-red-500/10 border border-red-500/30",
        !isActive && !isLocked && "hover:bg-muted/50",
        isLocked && "opacity-50 cursor-not-allowed"
      )}
    >
      {/* Ícone de Status */}
      <div className="flex-shrink-0">
        {isLocked ? (
          <Lock className="h-5 w-5 text-muted-foreground" />
        ) : isCompleted ? (
          <CheckCircle2 className="h-5 w-5 text-green-500" />
        ) : isActive ? (
          <PlayCircle className="h-5 w-5 text-red-500" />
        ) : (
          <Circle className="h-5 w-5 text-muted-foreground" />
        )}
      </div>

      {/* Título e Duração */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm font-medium truncate",
          isCompleted && "text-muted-foreground"
        )}>
          {lesson.title}
        </p>
      </div>

      {/* Duração */}
      <span className="text-xs text-muted-foreground flex-shrink-0">
        {formatDuration(lesson.duration_seconds)}
      </span>
    </Link>
  )
}

function QuizItem({ 
  quiz, 
  courseSlug,
  isLocked
}: { 
  quiz: QuizWithProgress
  courseSlug: string
  isLocked: boolean
}) {
  const hasAttempts = quiz.attempts_count && quiz.attempts_count > 0
  const bestScore = quiz.best_score

  return (
    <Link
      href={isLocked ? "#" : `/cursos/${courseSlug}/quiz/${quiz.id}`}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg transition-all",
        !isLocked && "hover:bg-muted/50",
        isLocked && "opacity-50 cursor-not-allowed"
      )}
    >
      {/* Ícone */}
      <div className="flex-shrink-0">
        {isLocked ? (
          <Lock className="h-5 w-5 text-muted-foreground" />
        ) : hasAttempts ? (
          <CheckCircle2 className="h-5 w-5 text-green-500" />
        ) : (
          <HelpCircle className="h-5 w-5 text-yellow-500" />
        )}
      </div>

      {/* Título */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{quiz.title}</p>
      </div>

      {/* Badge de Quiz + Score */}
      <div className="flex items-center gap-2">
        {hasAttempts && bestScore !== undefined && (
          <span className="text-xs font-medium text-green-500">
            {Math.round(bestScore)}%
          </span>
        )}
        <Badge variant="secondary" className="text-xs">
          Quiz
        </Badge>
      </div>
    </Link>
  )
}

export function LessonList({ modules, courseSlug, currentLessonId }: LessonListProps) {
  return (
    <Accordion type="multiple" defaultValue={modules.map(m => m.id)} className="space-y-2">
      {modules.map((module, moduleIndex) => (
        <AccordionItem
          key={module.id}
          value={module.id}
          className="border rounded-lg overflow-hidden bg-card"
        >
          <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/30">
            <div className="flex items-center gap-3 text-left">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-red-600 text-white text-sm font-bold">
                {moduleIndex + 1}
              </div>
              <div>
                <p className="font-semibold">{module.title}</p>
                <p className="text-xs text-muted-foreground">
                  {module.contents.filter(c => c.type === 'lesson').length} aulas
                  {module.contents.filter(c => c.type === 'quiz').length > 0 && 
                    `, ${module.contents.filter(c => c.type === 'quiz').length} quiz`
                  }
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-2 pb-2">
            <div className="space-y-1">
              {module.contents.map((content) => {
                if (content.type === 'lesson') {
                  return (
                    <LessonItem
                      key={content.id}
                      lesson={content}
                      courseSlug={courseSlug}
                      isActive={content.id === currentLessonId}
                      isLocked={!content.is_free && false} // TODO: verificar assinatura
                    />
                  )
                } else {
                  return (
                    <QuizItem
                      key={content.id}
                      quiz={content}
                      courseSlug={courseSlug}
                      isLocked={false} // TODO: verificar assinatura
                    />
                  )
                }
              })}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

