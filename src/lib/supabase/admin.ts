import { createClient } from "./client"

// ==========================================
// FUNÇÕES DE ADMIN - VERIFICAÇÃO E CRUD
// ==========================================

/**
 * Verifica se o usuário atual é admin
 */
export async function isUserAdmin(): Promise<boolean> {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (error || !data) return false
  return data.role === "admin"
}

/**
 * Busca o perfil do usuário atual com role
 */
export async function getCurrentUserProfile() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (error) return null
  return data
}

// ==========================================
// CRUD DE CURSOS
// ==========================================

export async function getCourses() {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) throw error
  return data
}

export async function getCourse(id: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from("courses")
    .select(`
      *,
      modules (
        *,
        lessons (*),
        quizzes (
          *,
          questions:quiz_questions (*)
        )
      ),
      resources:course_resources (*)
    `)
    .eq("id", id)
    .single()

  if (error) throw error
  return data
}

export async function createCourse(course: {
  title: string
  slug: string
  description: string
  teaser: string
  thumbnail_url?: string
  trailer_url?: string
  difficulty: "iniciante" | "intermediario" | "avancado"
  is_free?: boolean
  is_published?: boolean
  learning_goals?: string[]
}) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from("courses")
    .insert(course)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateCourse(id: string, updates: Partial<{
  title: string
  slug: string
  description: string
  teaser: string
  thumbnail_url: string
  trailer_url: string
  difficulty: "iniciante" | "intermediario" | "avancado"
  is_free: boolean
  is_published: boolean
  learning_goals: string[]
}>) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from("courses")
    .update(updates)
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteCourse(id: string) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from("courses")
    .delete()
    .eq("id", id)

  if (error) throw error
}

// ==========================================
// CRUD DE MÓDULOS
// ==========================================

export async function getModules(courseId: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from("modules")
    .select(`
      *,
      lessons (*),
      quizzes (*)
    `)
    .eq("course_id", courseId)
    .order("order_index", { ascending: true })

  if (error) throw error
  return data
}

export async function createModule(module: {
  course_id: string
  title: string
  description?: string
  order_index: number
}) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from("modules")
    .insert(module)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateModule(id: string, updates: Partial<{
  title: string
  description: string
  order_index: number
}>) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from("modules")
    .update(updates)
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteModule(id: string) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from("modules")
    .delete()
    .eq("id", id)

  if (error) throw error
}

// ==========================================
// CRUD DE AULAS
// ==========================================

export async function getLessons(moduleId: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("module_id", moduleId)
    .order("order_index", { ascending: true })

  if (error) throw error
  return data
}

export async function createLesson(lesson: {
  module_id: string
  title: string
  description?: string
  video_url: string
  thumbnail_url?: string
  duration_seconds?: number
  order_index: number
  is_free?: boolean
}) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from("lessons")
    .insert(lesson)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateLesson(id: string, updates: Partial<{
  title: string
  description: string
  video_url: string
  thumbnail_url: string
  duration_seconds: number
  order_index: number
  is_free: boolean
}>) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from("lessons")
    .update(updates)
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteLesson(id: string) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from("lessons")
    .delete()
    .eq("id", id)

  if (error) throw error
}

// ==========================================
// CRUD DE QUIZZES
// ==========================================

export async function getQuizzes(moduleId: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from("quizzes")
    .select(`
      *,
      questions:quiz_questions (*)
    `)
    .eq("module_id", moduleId)
    .order("order_index", { ascending: true })

  if (error) throw error
  return data
}

export async function createQuiz(quiz: {
  module_id: string
  title: string
  description?: string
  order_index: number
}) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from("quizzes")
    .insert(quiz)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateQuiz(id: string, updates: Partial<{
  title: string
  description: string
  order_index: number
}>) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from("quizzes")
    .update(updates)
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteQuiz(id: string) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from("quizzes")
    .delete()
    .eq("id", id)

  if (error) throw error
}

// ==========================================
// CRUD DE PERGUNTAS DO QUIZ
// ==========================================

export async function getQuizQuestions(quizId: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from("quiz_questions")
    .select("*")
    .eq("quiz_id", quizId)
    .order("order_index", { ascending: true })

  if (error) throw error
  return data
}

export async function createQuizQuestion(question: {
  quiz_id: string
  question: string
  image_url?: string
  clinical_context?: string
  options: string[]
  correct_answer: number
  explanation: string
  clinical_tip?: string
  explanation_video_url?: string
  order_index: number
}) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from("quiz_questions")
    .insert(question)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateQuizQuestion(id: string, updates: Partial<{
  question: string
  image_url: string
  clinical_context: string
  options: string[]
  correct_answer: number
  explanation: string
  clinical_tip: string
  explanation_video_url: string
  order_index: number
}>) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from("quiz_questions")
    .update(updates)
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteQuizQuestion(id: string) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from("quiz_questions")
    .delete()
    .eq("id", id)

  if (error) throw error
}

// ==========================================
// UPLOAD DE IMAGENS
// ==========================================

export async function uploadImage(file: File, folder: string = "ecg-images") {
  const supabase = createClient()
  
  const fileExt = file.name.split(".").pop()
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

  const { data, error } = await supabase.storage
    .from("images")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    })

  if (error) throw error

  // Retorna URL pública
  const { data: { publicUrl } } = supabase.storage
    .from("images")
    .getPublicUrl(data.path)

  return publicUrl
}

export async function deleteImage(url: string) {
  const supabase = createClient()
  
  // Extrai o path da URL
  const path = url.split("/images/")[1]
  if (!path) return

  const { error } = await supabase.storage
    .from("images")
    .remove([path])

  if (error) throw error
}

