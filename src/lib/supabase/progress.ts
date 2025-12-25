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

