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
 * Busca o progresso de uma aula específica
 */
export async function getLessonProgress(lessonId: string) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from("user_lesson_progress")
    .select("*")
    .eq("user_id", user.id)
    .eq("lesson_id", lessonId)
    .single()

  if (error && error.code !== "PGRST116") throw error // PGRST116 = no rows
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
    .single()

  if (error && error.code !== "PGRST116") throw error
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
    .single()

  if (error && error.code !== "PGRST116") throw error
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
 * Retorna o primeiro curso em andamento ou o primeiro curso disponível
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

  // Primeiro, tenta buscar o curso que o usuário está fazendo (mais recente)
  const { data: recentProgress } = await supabase
    .from("user_lesson_progress")
    .select(`
      lesson:lessons(
        module:modules(
          course:courses(
            id,
            title,
            slug,
            difficulty
          )
        )
      )
    `)
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(1)
    .single()

  let courseId: string | null = null
  let courseSlug: string | null = null
  let courseName: string | null = null
  let difficulty: string | null = null

  // Se encontrou algum progresso, pega o curso
  if (recentProgress?.lesson?.module?.course) {
    const course = recentProgress.lesson.module.course
    courseId = course.id
    courseSlug = course.slug
    courseName = course.title
    difficulty = course.difficulty
  } else {
    // Senão, pega o primeiro curso publicado
    const { data: firstCourse } = await supabase
      .from("courses")
      .select("id, title, slug, difficulty")
      .eq("is_published", true)
      .order("created_at", { ascending: true })
      .limit(1)
      .single()

    if (firstCourse) {
      courseId = firstCourse.id
      courseSlug = firstCourse.slug
      courseName = firstCourse.title
      difficulty = firstCourse.difficulty
    }
  }

  if (!courseId || !courseSlug || !courseName) return null

  // Agora calcula o progresso real
  // 1. Busca os módulos do curso
  const { data: modules } = await supabase
    .from("modules")
    .select("id")
    .eq("course_id", courseId)

  const moduleIds = modules?.map(m => m.id) || []

  // 2. Conta total de aulas do curso
  let totalLessons = 0
  if (moduleIds.length > 0) {
    const { count } = await supabase
      .from("lessons")
      .select("id", { count: "exact", head: true })
      .in("module_id", moduleIds)
    totalLessons = count || 0
  }

  // 3. Conta aulas completadas pelo usuário neste curso
  let completedInCourse = 0
  if (moduleIds.length > 0) {
    const { data: lessonsInCourse } = await supabase
      .from("lessons")
      .select("id")
      .in("module_id", moduleIds)

    const lessonIds = lessonsInCourse?.map(l => l.id) || []

    if (lessonIds.length > 0) {
      const { count } = await supabase
        .from("user_lesson_progress")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("completed", true)
        .in("lesson_id", lessonIds)
      completedInCourse = count || 0
    }
  }

  const progressPercentage = totalLessons ? Math.round((completedInCourse / totalLessons) * 100) : 0

  // Mapeia difficulty para belt
  const beltMap: Record<string, "white" | "blue" | "black"> = {
    "faixa-branca": "white",
    "faixa-azul": "blue",
    "faixa-preta": "black",
  }

  return {
    courseName,
    belt: beltMap[difficulty || "faixa-branca"] || "white",
    progressPercentage,
    slug: courseSlug,
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

