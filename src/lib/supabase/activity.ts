"use client"

import { createClient } from "./client"

/**
 * OTIMIZADO: Registra atividade do usuário em UMA ÚNICA operação.
 * Atualiza streak e tempo de estudo de forma eficiente.
 * @param watchTimeSeconds - Tempo assistido em segundos (opcional)
 */
export async function recordActivity(watchTimeSeconds?: number) {
  const supabase = createClient()
  
  // 1. Auth - única chamada necessária
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // 2. Buscar dados atuais do usuário (única query)
  const { data: profile } = await supabase
    .from("profiles")
    .select("current_streak, last_activity_date, total_watch_time")
    .eq("id", user.id)
    .single()

  if (!profile) return

  const today = new Date().toISOString().split("T")[0] // YYYY-MM-DD
  const lastActivity = profile.last_activity_date

  // Calcular novo streak
  let newStreak = 1
  if (lastActivity) {
    const lastDate = new Date(lastActivity)
    const todayDate = new Date(today)
    const diffTime = todayDate.getTime() - lastDate.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      // Mesma data - mantém streak
      newStreak = profile.current_streak || 1
    } else if (diffDays === 1) {
      // Dia consecutivo - incrementa
      newStreak = (profile.current_streak || 0) + 1
    }
    // Se diffDays > 1, newStreak já é 1 (reset)
  }

  // Calcular novo tempo de estudo
  const newWatchTime = (profile.total_watch_time || 0) + (watchTimeSeconds || 0)

  // 3. Atualizar tudo em UMA ÚNICA operação
  await supabase
    .from("profiles")
    .update({
      current_streak: newStreak,
      last_activity_date: today,
      total_watch_time: newWatchTime,
    })
    .eq("id", user.id)

  return { streak: newStreak, watchTime: newWatchTime }
}

/**
 * Atualiza apenas o streak (para uso em quizzes que não têm duração)
 * OTIMIZADO: 1 auth + 1 select + 1 update = 3 chamadas (mínimo possível)
 */
export async function updateStreak() {
  return recordActivity(0)
}

/**
 * @deprecated Use recordActivity() diretamente
 */
export async function addWatchTime(seconds: number) {
  return recordActivity(seconds)
}
