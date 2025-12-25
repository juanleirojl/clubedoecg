import { createClient } from "./client"

// ==========================================
// FUNÇÕES DE PROGRESSO - AULAS
// ==========================================

/**
 * Atualiza o progresso de uma aula (tempo assistido, posição, etc)
 */
export async function updateLessonProgress({
  lessonId,
  watchTimeSeconds,
  lastPositionSeconds,
  completed = false,
}: {
  lessonId: string
  watchTimeSeconds: number
  lastPositionSeconds: number
  completed?: boolean
}) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Usuário não autenticado")

  const { data, error } = await supabase
    .from("user_lesson_progress")
    .upsert({
      user_id: user.id,
      lesson_id: lessonId,
      watch_time_seconds: watchTimeSeconds,
      last_position_seconds: lastPositionSeconds,
      completed,
      completed_at: completed ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: "user_id,lesson_id",
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Marca uma aula como concluída
 */
export async function markLessonComplete(lessonId: string) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Usuário não autenticado")

  const { data, error } = await supabase
    .from("user_lesson_progress")
    .upsert({
      user_id: user.id,
      lesson_id: lessonId,
      completed: true,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, {
      onConflict: "user_id,lesson_id",
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Reseta o progresso de múltiplas aulas (para reiniciar módulo)
 */
export async function resetLessonsProgress(lessonIds: string[]) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Usuário não autenticado")

  // Deletar o progresso de todas as aulas do módulo
  const { error } = await supabase
    .from("user_lesson_progress")
    .delete()
    .eq("user_id", user.id)
    .in("lesson_id", lessonIds)

  if (error) throw error
  return { success: true, deletedCount: lessonIds.length }
}

/**
 * Busca o progresso de uma aula específica
 */
export async function getLessonProgress(lessonId: string) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from("user_lesson_progress")
    .select("completed, watch_time_seconds, last_position_seconds, updated_at")
    .eq("user_id", user.id)
    .eq("lesson_id", lessonId)
    .maybeSingle() // Usa maybeSingle para retornar null se não existir

  if (error) throw error
  return data
}

/**
 * Busca o progresso de todas as aulas de um curso
 */
export async function getCourseProgress(courseSlug: string) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from("user_course_progress")
    .select("*")
    .eq("user_id", user.id)
    .eq("course_slug", courseSlug)
    .maybeSingle()

  if (error) throw error
  return data
}

/**
 * Busca o progresso de todos os cursos do usuário
 */
export async function getAllCoursesProgress() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from("user_course_progress")
    .select("*")
    .eq("user_id", user.id)

  if (error) throw error
  return data || []
}

// ==========================================
// FUNÇÕES DE PROGRESSO - QUIZ
// ==========================================

/**
 * Salva uma tentativa de quiz
 */
export async function saveQuizAttempt({
  quizId,
  score,
  answers,
}: {
  quizId: string
  score: number
  answers: { question_id: string; selected_answer: number; is_correct: boolean }[]
}) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Usuário não autenticado")

  const { data, error } = await supabase
    .from("quiz_attempts")
    .insert({
      user_id: user.id,
      quiz_id: quizId,
      score,
      answers,
      completed_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Busca todas as tentativas de um quiz
 */
export async function getQuizAttempts(quizId: string) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from("quiz_attempts")
    .select("*")
    .eq("user_id", user.id)
    .eq("quiz_id", quizId)
    .order("completed_at", { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Busca a melhor tentativa de um quiz
 */
export async function getBestQuizAttempt(quizId: string) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from("quiz_attempts")
    .select("*")
    .eq("user_id", user.id)
    .eq("quiz_id", quizId)
    .order("score", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data
}

// ==========================================
// FUNÇÕES DE ATIVIDADE RECENTE
// ==========================================

/**
 * Busca a atividade recente do usuário (últimas aulas e quizzes)
 */
export async function getRecentActivity(limit = 5) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // Busca últimas aulas acessadas
  const { data: lessonProgress, error: lessonError } = await supabase
    .from("user_lesson_progress")
    .select(`
      *,
      lesson:lessons(
        id,
        title,
        thumbnail_url,
        module:modules(
          course:courses(
            id,
            title,
            slug
          )
        )
      )
    `)
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(limit)

  if (lessonError) throw lessonError

  return lessonProgress || []
}

// ==========================================
// FUNÇÕES DE PROGRESSO DO CURSO ATUAL
// ==========================================

/**
 * Busca o progresso do curso atual do usuário (para a sidebar)
 * OTIMIZADO: Usa apenas 2 queries paralelas em vez de 5-6 sequenciais
 */
export async function getCurrentCourseProgress(): Promise<{
  courseName: string
  belt: "white" | "blue" | "black"
  progressPercentage: number
  slug: string
} | null> {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Query paralela: buscar curso recente + todos cursos + progresso do usuário
  const [recentProgressResult, coursesResult, userProgressResult] = await Promise.all([
    // 1. Curso mais recente acessado
    supabase
      .from("user_lesson_progress")
      .select(`
        lesson:lessons(
          module:modules(
            course:courses(id, title, slug, difficulty)
          )
        )
      `)
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .single(),
    
    // 2. Primeiro curso (fallback) + todos com módulos e aulas
    supabase
      .from("courses")
      .select(`
        id, title, slug, difficulty,
        modules(id, lessons(id))
      `)
      .eq("is_published", true)
      .order("created_at", { ascending: true }),
    
    // 3. Todas as aulas completadas pelo usuário
    supabase
      .from("user_lesson_progress")
      .select("lesson_id")
      .eq("user_id", user.id)
      .eq("completed", true)
  ])

  // Determinar qual curso usar
  let targetCourse: { id: string; title: string; slug: string; difficulty: string; modules: any[] } | null = null
  
  const progressData = recentProgressResult.data as any
  if (progressData?.lesson?.module?.course) {
    // Encontrar o curso completo na lista
    const courseId = progressData.lesson.module.course.id
    targetCourse = coursesResult.data?.find((c: any) => c.id === courseId) || null
  }
  
  // Fallback: primeiro curso
  if (!targetCourse && coursesResult.data?.length) {
    targetCourse = coursesResult.data[0]
  }

  if (!targetCourse) return null

  // Calcular progresso usando Set para O(1) lookup
  const completedIds = new Set(
    (userProgressResult.data || []).map((p: { lesson_id: string }) => p.lesson_id)
  )
  
  const allLessonIds = targetCourse.modules?.flatMap(
    (m: { lessons: { id: string }[] }) => m.lessons?.map((l: { id: string }) => l.id) || []
  ) || []
  
  const totalLessons = allLessonIds.length
  const completedLessons = allLessonIds.filter((id: string) => completedIds.has(id)).length
  const progressPercentage = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0

  // Mapeia difficulty para belt
  const beltMap: Record<string, "white" | "blue" | "black"> = {
    "iniciante": "white",
    "intermediario": "blue",
    "avancado": "black",
  }

  return {
    courseName: targetCourse.title,
    belt: beltMap[targetCourse.difficulty || "iniciante"] || "white",
    progressPercentage,
    slug: targetCourse.slug,
  }
}

// ==========================================
// FUNÇÕES DE ESTATÍSTICAS DO DASHBOARD
// ==========================================

/**
 * Atualiza o tempo total de estudo do usuário
 */
export async function updateTotalWatchTime(additionalSeconds: number) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // Busca tempo atual
  const { data: profile } = await supabase
    .from("profiles")
    .select("total_watch_time")
    .eq("id", user.id)
    .single()

  const currentTime = profile?.total_watch_time || 0
  const newTime = currentTime + additionalSeconds

  // Atualiza
  await supabase
    .from("profiles")
    .update({ total_watch_time: newTime })
    .eq("id", user.id)
}

/**
 * Atualiza o streak (sequência de dias) do usuário
 */
export async function updateStreak() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const today = new Date().toISOString().split("T")[0] // YYYY-MM-DD

  // Busca dados atuais
  const { data: profile } = await supabase
    .from("profiles")
    .select("current_streak, last_activity_date")
    .eq("id", user.id)
    .single()

  if (!profile) return

  const lastActivity = profile.last_activity_date
  const currentStreak = profile.current_streak || 0

  // Se já atualizou hoje, não faz nada
  if (lastActivity === today) return

  // Calcula diferença de dias
  let newStreak = 1
  if (lastActivity) {
    const lastDate = new Date(lastActivity)
    const todayDate = new Date(today)
    const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) {
      // Dia consecutivo
      newStreak = currentStreak + 1
    }
    // Se diffDays > 1, quebrou a sequência, reseta para 1
  }

  // Atualiza
  await supabase
    .from("profiles")
    .update({ 
      current_streak: newStreak,
      last_activity_date: today 
    })
    .eq("id", user.id)
}

/**
 * Busca as estatísticas completas do dashboard
 */
export async function getDashboardStats() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Busca perfil com stats
  const { data: profile } = await supabase
    .from("profiles")
    .select("total_watch_time, current_streak")
    .eq("id", user.id)
    .single()

  // Conta aulas completadas
  const { count: lessonsCompleted } = await supabase
    .from("user_lesson_progress")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("completed", true)

  // Conta quizzes com 100%
  const { count: perfectQuizzes } = await supabase
    .from("quiz_attempts")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("score", 100)

  return {
    lessonsCompleted: lessonsCompleted || 0,
    totalWatchTime: profile?.total_watch_time || 0,
    currentStreak: profile?.current_streak || 0,
    perfectQuizzes: perfectQuizzes || 0,
  }
}

// ==========================================
// BATCH UPDATE - OTIMIZADO PARA PRODUÇÃO
// ==========================================

// Cache local para evitar múltiplas chamadas de streak no mesmo dia
let lastStreakUpdate: string | null = null

/**
 * Atualiza progresso, tempo e streak em UMA única transação
 * OTIMIZADO: Reduz de 3 chamadas para 1-2
 */
export async function batchUpdateProgress({
  lessonId,
  watchTimeSeconds,
  lastPositionSeconds,
  completed,
  additionalWatchTime,
}: {
  lessonId: string
  watchTimeSeconds: number
  lastPositionSeconds: number
  completed: boolean
  additionalWatchTime: number
}) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const today = new Date().toISOString().split("T")[0]
  const shouldUpdateStreak = lastStreakUpdate !== today

  // 1. Atualizar progresso da aula
  const progressPromise = supabase
    .from("user_lesson_progress")
    .upsert({
      user_id: user.id,
      lesson_id: lessonId,
      watch_time_seconds: watchTimeSeconds,
      last_position_seconds: lastPositionSeconds,
      completed,
      completed_at: completed ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: "user_id,lesson_id",
    })

  // 2. Atualizar perfil (tempo + streak se necessário)
  const userId = user.id
  async function updateProfile() {
    if (shouldUpdateStreak) {
      // Precisa buscar dados do perfil para calcular streak
      const { data: profile } = await supabase
        .from("profiles")
        .select("current_streak, last_activity_date, total_watch_time")
        .eq("id", userId)
        .single()

      if (profile) {
        const lastActivity = profile.last_activity_date
        let newStreak = 1

        if (lastActivity && lastActivity !== today) {
          const lastDate = new Date(lastActivity)
          const todayDate = new Date(today)
          const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
          
          if (diffDays === 1) {
            newStreak = (profile.current_streak || 0) + 1
          }
        } else if (lastActivity === today) {
          newStreak = profile.current_streak || 1
        }

        await supabase
          .from("profiles")
          .update({
            current_streak: newStreak,
            last_activity_date: today,
            total_watch_time: (profile.total_watch_time || 0) + additionalWatchTime,
          })
          .eq("id", userId)

        lastStreakUpdate = today
      }
    } else {
      // Só atualiza o tempo de estudo via RPC ou fallback
      try {
        await supabase.rpc("increment_watch_time", {
          user_id_param: userId,
          seconds_param: additionalWatchTime,
        })
      } catch {
        // Fallback se a função RPC não existir - busca tempo atual e atualiza
        const { data } = await supabase
          .from("profiles")
          .select("total_watch_time")
          .eq("id", userId)
          .single()
        
        await supabase
          .from("profiles")
          .update({
            total_watch_time: (data?.total_watch_time || 0) + additionalWatchTime,
          })
          .eq("id", userId)
      }
    }
  }

  await Promise.all([progressPromise, updateProfile()])
}

