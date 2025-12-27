import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sendEmail } from "@/lib/email"

// Verifica se o request vem do Vercel Cron
function isVercelCron(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET
  
  // Em desenvolvimento, permitir sem autenticação
  if (process.env.NODE_ENV === "development") {
    return true
  }
  
  // Verificar o header de autorização
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    return true
  }
  
  return false
}

// GET /api/emails/cron
// Executado pelo Vercel Cron para enviar lembretes automáticos
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    if (!isVercelCron(request)) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }
    
    console.log("🕐 Iniciando cron job de emails...")
    
    const supabase = await createClient()
    
    // 1. Resetar contador diário se necessário
    await supabase.rpc("reset_daily_email_counter")
    
    // 2. Verificar configuração global
    const { data: config } = await supabase
      .from("email_config")
      .select("*")
      .single()
    
    if (!config?.emails_enabled) {
      console.log("📧 Emails desabilitados globalmente")
      return NextResponse.json({ message: "Emails desabilitados" })
    }
    
    // Verificar horário permitido (UTC)
    const now = new Date()
    const currentHour = now.getUTCHours()
    const currentDay = now.getUTCDay()
    
    if (
      currentHour < config.send_start_hour || 
      currentHour >= config.send_end_hour ||
      !config.send_days.includes(currentDay)
    ) {
      console.log(`⏰ Fora do horário de envio (${currentHour}h UTC, dia ${currentDay})`)
      return NextResponse.json({ message: "Fora do horário de envio" })
    }
    
    // Verificar limite diário
    if (config.emails_sent_today >= config.daily_limit) {
      console.log(`🚫 Limite diário atingido: ${config.emails_sent_today}/${config.daily_limit}`)
      return NextResponse.json({ message: "Limite diário atingido" })
    }
    
    // 3. Buscar usuários elegíveis para lembrete
    const { data: usersForReminder, error: reminderError } = await supabase
      .rpc("get_users_for_reminder")
    
    if (reminderError) {
      console.error("Erro ao buscar usuários para lembrete:", reminderError)
      throw reminderError
    }
    
    console.log(`📋 ${usersForReminder?.length || 0} usuários elegíveis para lembrete`)
    
    // 4. Enviar lembretes
    let emailsSent = 0
    const maxToSend = Math.min(
      50, // Máximo por execução do cron
      config.daily_limit - config.emails_sent_today
    )
    
    for (const user of usersForReminder?.slice(0, maxToSend) || []) {
      try {
        // Buscar último curso em andamento
        const { data: lastProgress } = await supabase
          .from("lesson_progress")
          .select(`
            progress,
            lessons!inner(
              modules!inner(
                courses!inner(
                  title,
                  slug
                )
              )
            )
          `)
          .eq("user_id", user.user_id)
          .order("updated_at", { ascending: false })
          .limit(1)
          .single()
        
        // Calcular progresso do curso
        let lastCourseName = ""
        let lastCourseSlug = ""
        let lastCourseProgress = 0
        
        if (lastProgress) {
          const course = (lastProgress as unknown as { 
            lessons: { 
              modules: { 
                courses: { title: string; slug: string } 
              } 
            } 
          }).lessons.modules.courses
          lastCourseName = course.title
          lastCourseSlug = course.slug
          
          // Buscar progresso total do curso
          const { data: courseProgress } = await supabase
            .from("courses")
            .select(`
              id,
              modules:modules(
                lessons:lessons(
                  progress:lesson_progress(progress)
                )
              )
            `)
            .eq("slug", lastCourseSlug)
            .single()
          
          if (courseProgress) {
            const allLessons = (courseProgress as unknown as {
              modules: Array<{
                lessons: Array<{
                  progress: Array<{ progress: number }>
                }>
              }>
            }).modules.flatMap(m => m.lessons)
            const completedLessons = allLessons.filter(
              l => l.progress?.some((p: { progress: number }) => p.progress >= 90)
            ).length
            lastCourseProgress = Math.round((completedLessons / allLessons.length) * 100) || 0
          }
        }
        
        // Enviar email
        const result = await sendEmail({
          to: user.email,
          userId: user.user_id,
          type: "reminder",
          subject: `${user.full_name || "Estudante"}, sentimos sua falta! 🫀`,
          templateData: {
            userName: user.full_name || "Estudante",
            daysInactive: user.days_inactive,
            lastCourseName,
            lastCourseProgress,
            lastCourseSlug,
          },
        })
        
        if (result.success) {
          emailsSent++
          
          // Atualizar last_reminder_sent
          await supabase
            .from("user_settings")
            .update({ last_reminder_sent: new Date().toISOString() })
            .eq("user_id", user.user_id)
        }
        
      } catch (userError) {
        console.error(`Erro ao processar usuário ${user.user_id}:`, userError)
      }
    }
    
    // 5. Atualizar contador diário
    await supabase
      .from("email_config")
      .update({ 
        emails_sent_today: config.emails_sent_today + emailsSent,
        updated_at: new Date().toISOString()
      })
      .eq("id", config.id)
    
    console.log(`✅ Cron job concluído: ${emailsSent} emails enviados`)
    
    return NextResponse.json({
      success: true,
      emailsSent,
      message: `${emailsSent} lembretes enviados`,
    })
    
  } catch (error) {
    console.error("Erro no cron job de emails:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" }, 
      { status: 500 }
    )
  }
}

