"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import {
  updateLessonProgress,
  markLessonComplete,
  getLessonProgress,
  getCourseProgress,
  saveQuizAttempt,
  getBestQuizAttempt,
} from "@/lib/supabase/progress"

// ==========================================
// HOOK: useVideoProgress
// Salva automaticamente o progresso do vídeo
// ==========================================
export function useVideoProgress(lessonId: string) {
  const [isCompleted, setIsCompleted] = useState(false)
  const [initialPosition, setInitialPosition] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  
  const watchTimeRef = useRef(0)
  const lastSaveRef = useRef(0)
  const hasMarkedComplete = useRef(false)

  // Carrega progresso inicial
  useEffect(() => {
    async function loadProgress() {
      try {
        const progress = await getLessonProgress(lessonId)
        if (progress) {
          setInitialPosition(progress.last_position_seconds || 0)
          setIsCompleted(progress.completed || false)
          watchTimeRef.current = progress.watch_time_seconds || 0
          hasMarkedComplete.current = progress.completed || false
        }
      } catch (error) {
        console.error("Erro ao carregar progresso:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadProgress()
  }, [lessonId])

  // Atualiza progresso (chamada a cada 30 segundos)
  const updateProgress = useCallback(async (
    currentTime: number,
    duration: number
  ) => {
    const now = Date.now()
    
    // Só salva a cada 30 segundos
    if (now - lastSaveRef.current < 30000) return
    lastSaveRef.current = now

    // Incrementa tempo assistido
    watchTimeRef.current += 30

    // Calcula se completou (90% do vídeo)
    const percentWatched = currentTime / duration
    const shouldComplete = percentWatched >= 0.9 && !hasMarkedComplete.current

    try {
      await updateLessonProgress({
        lessonId,
        watchTimeSeconds: watchTimeRef.current,
        lastPositionSeconds: Math.floor(currentTime),
        completed: shouldComplete || hasMarkedComplete.current,
      })

      if (shouldComplete) {
        hasMarkedComplete.current = true
        setIsCompleted(true)
      }
    } catch (error) {
      console.error("Erro ao salvar progresso:", error)
    }
  }, [lessonId])

  // Marca como completo manualmente
  const markComplete = useCallback(async () => {
    if (hasMarkedComplete.current) return
    
    try {
      await markLessonComplete(lessonId)
      hasMarkedComplete.current = true
      setIsCompleted(true)
    } catch (error) {
      console.error("Erro ao marcar como completo:", error)
    }
  }, [lessonId])

  // Salva posição ao sair da página
  const saveOnExit = useCallback(async (currentTime: number) => {
    try {
      await updateLessonProgress({
        lessonId,
        watchTimeSeconds: watchTimeRef.current,
        lastPositionSeconds: Math.floor(currentTime),
        completed: hasMarkedComplete.current,
      })
    } catch (error) {
      console.error("Erro ao salvar ao sair:", error)
    }
  }, [lessonId])

  return {
    isCompleted,
    initialPosition,
    isLoading,
    updateProgress,
    markComplete,
    saveOnExit,
  }
}

// ==========================================
// HOOK: useCourseProgress
// Carrega progresso geral do curso
// ==========================================
export function useCourseProgress(courseSlug: string) {
  const [progress, setProgress] = useState<{
    totalLessons: number
    completedLessons: number
    progressPercentage: number
    lastAccessedAt: string | null
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadProgress() {
      try {
        const data = await getCourseProgress(courseSlug)
        if (data) {
          setProgress({
            totalLessons: data.total_lessons,
            completedLessons: data.completed_lessons,
            progressPercentage: data.progress_percentage,
            lastAccessedAt: data.last_accessed_at,
          })
        }
      } catch (error) {
        console.error("Erro ao carregar progresso do curso:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadProgress()
  }, [courseSlug])

  return { progress, isLoading }
}

// ==========================================
// HOOK: useQuizProgress
// Gerencia progresso do quiz
// ==========================================
export function useQuizProgress(quizId: string) {
  const [bestScore, setBestScore] = useState<number | null>(null)
  const [attemptsCount, setAttemptsCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Carrega melhor tentativa
  useEffect(() => {
    async function loadBestAttempt() {
      try {
        const data = await getBestQuizAttempt(quizId)
        if (data) {
          setBestScore(data.score)
        }
      } catch (error) {
        console.error("Erro ao carregar tentativa:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadBestAttempt()
  }, [quizId])

  // Salva tentativa
  const saveAttempt = useCallback(async (
    score: number,
    answers: { question_id: string; selected_answer: number; is_correct: boolean }[]
  ) => {
    setIsSaving(true)
    try {
      await saveQuizAttempt({ quizId, score, answers })
      
      // Atualiza melhor score se necessário
      if (bestScore === null || score > bestScore) {
        setBestScore(score)
      }
      setAttemptsCount(prev => prev + 1)
      
      return true
    } catch (error) {
      console.error("Erro ao salvar tentativa:", error)
      return false
    } finally {
      setIsSaving(false)
    }
  }, [quizId, bestScore])

  return {
    bestScore,
    attemptsCount,
    isLoading,
    isSaving,
    saveAttempt,
  }
}

