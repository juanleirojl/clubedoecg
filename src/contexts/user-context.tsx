"use client"

import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"

// ========================================
// TIPOS
// ========================================

interface UserProfile {
  id: string
  email: string
  full_name: string
  avatar_url: string | null
  role: string
  subscription_plan: string
  total_watch_time: number
  current_streak: number
}

interface CourseLesson {
  id: string
  title: string
  duration_seconds: number
  order_index: number
}

interface CourseModule {
  id: string
  order_index: number
  lessons: CourseLesson[]
}

interface Course {
  id: string
  title: string
  slug: string
  difficulty: string
  thumbnail_url: string
  modules: CourseModule[]
}

interface CourseWithProgress extends Course {
  totalLessons: number
  completedLessons: number
  progress: number
  nextLesson?: CourseLesson
}

interface UserStats {
  lessonsCompleted: number
  totalWatchTime: number
  quizzesPassed: number
  streak: number
}

interface UserContextType {
  // Dados do usuário
  profile: UserProfile | null
  stats: UserStats
  isPro: boolean
  
  // Dados dos cursos (compartilhados)
  courses: CourseWithProgress[]
  currentCourse: CourseWithProgress | null
  completedLessonIds: Set<string>
  
  // Dados dos quizzes
  completedQuizIds: Set<string>
  quizBestScores: Map<string, number>
  
  // Estados
  isLoading: boolean
  
  // Ações
  refreshData: () => Promise<void>
  markLessonCompleted: (lessonId: string) => void
  resetModuleProgress: (lessonIds: string[]) => void
  markQuizCompleted: (quizId: string, score: number) => void
}

// ========================================
// CONTEXTO
// ========================================

const UserContext = createContext<UserContextType | undefined>(undefined)

// Cache simples para evitar refetch desnecessário
let cachedCourses: Course[] | null = null
let cacheTimestamp = 0
const CACHE_TTL = 5 * 60 * 1000 // 5 minutos

export function UserProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [rawCourses, setRawCourses] = useState<Course[]>([])
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set())
  const [completedQuizIds, setCompletedQuizIds] = useState<Set<string>>(new Set())
  const [quizBestScores, setQuizBestScores] = useState<Map<string, number>>(new Map())
  const [stats, setStats] = useState<UserStats>({
    lessonsCompleted: 0,
    totalWatchTime: 0,
    quizzesPassed: 0,
    streak: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  // Função principal de carregamento - UMA VEZ por sessão
  const loadUserData = useCallback(async () => {
    const supabase = createClient()
    
    // Autenticação - ÚNICA chamada
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setIsLoading(false)
      return
    }
    
    setUserId(user.id)

    // Verificar cache de cursos
    const now = Date.now()
    const useCache = cachedCourses && (now - cacheTimestamp) < CACHE_TTL

    // Preparar queries - TODAS em paralelo
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const profileQuery = supabase
      .from("profiles")
      .select("id, email, full_name, avatar_url, role, subscription_plan, total_watch_time, current_streak")
      .eq("id", user.id)
      .single()
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const quizzesCountQuery = supabase
      .from("quiz_attempts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("score", 100)
    
    // Buscar melhor score de cada quiz (para mostrar quizzes concluídos)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const quizScoresQuery = supabase
      .from("quiz_attempts")
      .select("quiz_id, score")
      .eq("user_id", user.id)
      .order("score", { ascending: false })
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const progressQuery = supabase
      .from("user_lesson_progress")
      .select("lesson_id")
      .eq("user_id", user.id)
      .eq("completed", true)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const coursesQuery = !useCache ? supabase
      .from("courses")
      .select(`
        id, title, slug, difficulty, thumbnail_url,
        modules(
          id, order_index,
          lessons(id, title, duration_seconds, order_index)
        )
      `)
      .eq("is_published", true)
      .order("created_at", { ascending: true }) : null

    const [profileResult, quizzesCountResult, progressResult, coursesResultRaw, quizScoresResult] = await Promise.all([
      profileQuery,
      quizzesCountQuery,
      progressQuery,
      coursesQuery || Promise.resolve({ data: cachedCourses }),
      quizScoresQuery,
    ])
    
    const coursesResult = coursesResultRaw

    // Processar perfil
    if (profileResult.data) {
      setProfile(profileResult.data)
    }

    // Processar stats
    setStats({
      lessonsCompleted: progressResult.data?.length || 0,
      totalWatchTime: profileResult.data?.total_watch_time || 0,
      quizzesPassed: quizzesCountResult.count || 0,
      streak: profileResult.data?.current_streak || 0,
    })

    // Processar aulas completadas
    const completedIds = new Set<string>(
      (progressResult.data || []).map((p: { lesson_id: string }) => p.lesson_id)
    )
    setCompletedLessonIds(completedIds)

    // Processar quizzes completados (com melhor score de cada)
    const quizIds = new Set<string>()
    const bestScores = new Map<string, number>()
    if (quizScoresResult.data) {
      for (const attempt of quizScoresResult.data) {
        quizIds.add(attempt.quiz_id)
        // Guardar apenas o melhor score (já ordenado desc)
        if (!bestScores.has(attempt.quiz_id)) {
          bestScores.set(attempt.quiz_id, attempt.score)
        }
      }
    }
    setCompletedQuizIds(quizIds)
    setQuizBestScores(bestScores)

    // Processar cursos
    if (coursesResult?.data) {
      // Atualizar cache
      if (!useCache) {
        cachedCourses = coursesResult.data
        cacheTimestamp = now
      }
      setRawCourses(coursesResult.data)
    }

    setIsLoading(false)
  }, [])

  // Carregar dados na montagem
  useEffect(() => {
    loadUserData()
  }, [loadUserData])

  // Marcar aula como completa (otimista)
  const markLessonCompleted = useCallback((lessonId: string) => {
    setCompletedLessonIds(prev => {
      const newSet = new Set(prev)
      newSet.add(lessonId)
      return newSet
    })
    setStats(prev => ({
      ...prev,
      lessonsCompleted: prev.lessonsCompleted + 1,
    }))
  }, [])

  // Resetar progresso de um módulo (otimista)
  const resetModuleProgress = useCallback((lessonIds: string[]) => {
    const idsToRemove = new Set(lessonIds)
    setCompletedLessonIds(prev => {
      const newSet = new Set(prev)
      idsToRemove.forEach(id => newSet.delete(id))
      return newSet
    })
    // Atualizar stats
    const removedCount = lessonIds.filter(id => completedLessonIds.has(id)).length
    setStats(prev => ({
      ...prev,
      lessonsCompleted: Math.max(0, prev.lessonsCompleted - removedCount),
    }))
  }, [completedLessonIds])

  // Marcar quiz como completo (otimista)
  const markQuizCompleted = useCallback((quizId: string, score: number) => {
    // Adicionar aos concluídos
    setCompletedQuizIds(prev => {
      const newSet = new Set(prev)
      newSet.add(quizId)
      return newSet
    })
    // Atualizar melhor score se necessário
    setQuizBestScores(prev => {
      const newMap = new Map(prev)
      const currentBest = newMap.get(quizId) || 0
      if (score > currentBest) {
        newMap.set(quizId, score)
      }
      return newMap
    })
    // Atualizar stats se for 100%
    if (score === 100) {
      setStats(prev => ({
        ...prev,
        quizzesPassed: prev.quizzesPassed + 1,
      }))
    }
  }, [])

  // Calcular cursos com progresso (memoizado)
  const coursesWithProgress = useMemo<CourseWithProgress[]>(() => {
    return rawCourses.map(course => {
      // Ordenar módulos e aulas
      const sortedModules = [...(course.modules || [])]
        .sort((a, b) => a.order_index - b.order_index)
      
      const allLessons = sortedModules.flatMap(mod => 
        [...(mod.lessons || [])].sort((a, b) => a.order_index - b.order_index)
      )
      
      const totalLessons = allLessons.length
      const completedLessons = allLessons.filter(l => completedLessonIds.has(l.id)).length
      const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
      
      // Encontrar próxima aula
      const nextLesson = allLessons.find(l => !completedLessonIds.has(l.id))

      return {
        ...course,
        totalLessons,
        completedLessons,
        progress,
        nextLesson,
      }
    })
  }, [rawCourses, completedLessonIds])

  // Curso atual (primeiro com progresso ou primeiro disponível)
  const currentCourse = useMemo<CourseWithProgress | null>(() => {
    // Priorizar curso em andamento
    const inProgress = coursesWithProgress.find(c => c.progress > 0 && c.progress < 100)
    if (inProgress) return inProgress
    
    // Se não, retornar o primeiro
    return coursesWithProgress[0] || null
  }, [coursesWithProgress])

  // isPro memoizado
  const isPro = useMemo(() => {
    return profile?.subscription_plan === "pro"
  }, [profile?.subscription_plan])

  // Valor do contexto memoizado
  const value = useMemo<UserContextType>(() => ({
    profile,
    stats,
    isPro,
    courses: coursesWithProgress,
    currentCourse,
    completedLessonIds,
    completedQuizIds,
    quizBestScores,
    isLoading,
    refreshData: loadUserData,
    markLessonCompleted,
    resetModuleProgress,
    markQuizCompleted,
  }), [
    profile,
    stats,
    isPro,
    coursesWithProgress,
    currentCourse,
    completedLessonIds,
    completedQuizIds,
    quizBestScores,
    isLoading,
    loadUserData,
    markLessonCompleted,
    resetModuleProgress,
    markQuizCompleted,
  ])

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}

// ========================================
// HOOKS DERIVADOS (para componentes específicos)
// ========================================

export function useCurrentCourse() {
  const { currentCourse, isLoading } = useUser()
  return { currentCourse, isLoading }
}

export function useCourses() {
  const { courses, isLoading, isPro } = useUser()
  return { courses, isLoading, isPro }
}

export function useUserStats() {
  const { stats, isLoading } = useUser()
  return { stats, isLoading }
}
