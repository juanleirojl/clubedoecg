import { createServerClient } from '@supabase/ssr'
import { unstable_cache } from "next/cache"

// ==========================================
// CLIENTE ANÔNIMO PARA CACHE (não usa cookies)
// ==========================================

function createAnonClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Cliente sem cookies para uso em cache
        getAll() {
          return []
        },
        setAll() {
          // No-op
        },
      },
    }
  )
}

// ==========================================
// QUERIES OTIMIZADAS COM CACHE PARA SSR
// ==========================================

// Tipos
interface CourseData {
  id: string
  title: string
  slug: string
  description: string
  teaser: string
  thumbnail_url: string
  trailer_url: string
  difficulty: string
  is_free: boolean
  is_published: boolean
  modules: {
    id: string
    title: string
    description: string
    order_index: number
    lessons: {
      id: string
      title: string
      description: string
      video_url: string
      duration_seconds: number
      order_index: number
      is_free: boolean
    }[]
    quizzes: {
      id: string
      title: string
      description: string
      order_index: number
    }[]
  }[]
}

/**
 * Busca curso por slug - COM CACHE DE 5 MINUTOS
 * Usa cliente anônimo para evitar problemas com cookies
 */
export const getCourseBySlug = unstable_cache(
  async (slug: string): Promise<CourseData | null> => {
    const supabase = createAnonClient()
    
    const { data, error } = await supabase
      .from("courses")
      .select(`
        id, title, slug, description, teaser, thumbnail_url, trailer_url,
        difficulty, is_free, is_published,
        modules (
          id, title, description, order_index,
          lessons (id, title, description, video_url, duration_seconds, order_index, is_free),
          quizzes (id, title, description, order_index)
        )
      `)
      .eq("slug", slug)
      .eq("is_published", true)
      .single()

    if (error) {
      console.error("Erro ao buscar curso:", error)
      return null
    }

    // Ordenar módulos, aulas e quizzes
    if (data?.modules) {
      data.modules.sort((a, b) => a.order_index - b.order_index)
      data.modules.forEach((mod) => {
        if (mod.lessons) {
          mod.lessons.sort((a, b) => a.order_index - b.order_index)
        }
        if (mod.quizzes) {
          mod.quizzes.sort((a, b) => a.order_index - b.order_index)
        }
      })
    }

    return data as CourseData
  },
  ["course-by-slug"],
  {
    revalidate: 300, // 5 minutos
    tags: ["courses"],
  }
)

/**
 * Lista todos os cursos publicados - COM CACHE DE 10 MINUTOS
 */
export const getAllCourses = unstable_cache(
  async () => {
    const supabase = createAnonClient()
    
    const { data, error } = await supabase
      .from("courses")
      .select(`
        id, title, slug, description, teaser, thumbnail_url,
        difficulty, is_free, is_published,
        modules (
          id, order_index,
          lessons (id, duration_seconds)
        )
      `)
      .eq("is_published", true)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Erro ao buscar cursos:", error)
      return []
    }

    return data || []
  },
  ["all-courses"],
  {
    revalidate: 600, // 10 minutos
    tags: ["courses"],
  }
)

/**
 * Busca dados de uma aula específica - COM CACHE DE 5 MINUTOS
 */
export const getLessonById = unstable_cache(
  async (lessonId: string) => {
    const supabase = createAnonClient()
    
    const { data, error } = await supabase
      .from("lessons")
      .select(`
        id, title, description, video_url, duration_seconds, order_index, is_free,
        module:modules (
          id, title, order_index,
          course:courses (
            id, title, slug,
            modules (
              id, order_index,
              lessons (id, title, duration_seconds, order_index, is_free)
            )
          )
        )
      `)
      .eq("id", lessonId)
      .single()

    if (error) {
      console.error("Erro ao buscar aula:", error)
      return null
    }

    return data
  },
  ["lesson-by-id"],
  {
    revalidate: 300, // 5 minutos
    tags: ["lessons"],
  }
)

/**
 * Busca quiz por ID - COM CACHE DE 5 MINUTOS
 */
export const getQuizById = unstable_cache(
  async (quizId: string) => {
    const supabase = createAnonClient()
    
    const { data, error } = await supabase
      .from("quizzes")
      .select(`
        id, title, description,
        questions:quiz_questions (
          id, question_text, options, correct_answer, order_index
        ),
        module:modules (
          course:courses (id, title, slug)
        )
      `)
      .eq("id", quizId)
      .single()

    if (error) {
      console.error("Erro ao buscar quiz:", error)
      return null
    }

    // Ordenar questões
    if (data?.questions) {
      data.questions.sort((a, b) => a.order_index - b.order_index)
    }

    return data
  },
  ["quiz-by-id"],
  {
    revalidate: 300, // 5 minutos
    tags: ["quizzes"],
  }
)
