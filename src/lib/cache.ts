/**
 * Funções para gerenciamento de cache
 */

/**
 * Revalida o cache chamando a API
 * Deve ser usada no cliente (componentes React)
 */
export async function revalidateCache(tags: string[] = ["courses", "lessons", "quizzes"]) {
  try {
    const response = await fetch("/api/revalidate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tags }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Erro ao revalidar cache")
    }

    return await response.json()
  } catch (error) {
    console.error("Erro ao revalidar cache:", error)
    throw error
  }
}

/**
 * Revalida todo o cache de cursos
 */
export async function revalidateCourses() {
  return revalidateCache(["courses", "all-courses"])
}

/**
 * Revalida o cache de aulas
 */
export async function revalidateLessons() {
  return revalidateCache(["lessons"])
}

/**
 * Revalida o cache de quizzes
 */
export async function revalidateQuizzes() {
  return revalidateCache(["quizzes"])
}

/**
 * Revalida todo o cache
 */
export async function revalidateAll() {
  return revalidateCache(["courses", "all-courses", "lessons", "quizzes"])
}

