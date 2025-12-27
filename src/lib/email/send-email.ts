import { render } from "@react-email/components"
import { createClient } from "@/lib/supabase/server"
import { resend, EMAIL_FROM, EmailType, EmailStatus } from "./resend"
import { 
  ReminderTemplate, 
  NewContentTemplate, 
  WeeklySummaryTemplate, 
  WelcomeTemplate 
} from "./templates"
import React from "react"

interface SendEmailOptions {
  to: string
  userId?: string
  type: EmailType
  subject: string
  templateData: Record<string, unknown>
  campaignId?: string
}

interface SendEmailResult {
  success: boolean
  resendId?: string
  error?: string
}

/**
 * Envia um email usando o Resend
 */
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  const { to, userId, type, subject, templateData, campaignId } = options
  
  // Verificar se Resend está configurado
  if (!resend) {
    console.log("📧 [DEV] Email que seria enviado:", { to, subject, type })
    return { success: false, error: "Resend não configurado" }
  }
  
  try {
    // Renderizar o template correto
    const emailHtml = await renderTemplate(type, templateData)
    
    if (!emailHtml) {
      throw new Error(`Template não encontrado para tipo: ${type}`)
    }
    
    // Enviar via Resend
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: [to],
      subject,
      html: emailHtml,
    })
    
    if (error) {
      throw new Error(error.message)
    }
    
    // Logar o envio no banco
    await logEmail({
      user_id: userId,
      email_to: to,
      email_type: type,
      subject,
      template_data: templateData,
      resend_id: data?.id,
      status: "sent",
      campaign_id: campaignId,
    })
    
    return { success: true, resendId: data?.id }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"
    
    // Logar o erro
    await logEmail({
      user_id: userId,
      email_to: to,
      email_type: type,
      subject,
      template_data: templateData,
      status: "failed",
      error_message: errorMessage,
      campaign_id: campaignId,
    })
    
    console.error("❌ Erro ao enviar email:", errorMessage)
    return { success: false, error: errorMessage }
  }
}

/**
 * Renderiza o template correto baseado no tipo
 */
async function renderTemplate(type: EmailType, data: Record<string, unknown>): Promise<string | null> {
  let element: React.ReactElement | null = null
  
  switch (type) {
    case "reminder":
      element = React.createElement(ReminderTemplate, {
        userName: data.userName as string,
        daysInactive: data.daysInactive as number,
        lastCourseName: data.lastCourseName as string,
        lastCourseProgress: data.lastCourseProgress as number,
        lastCourseSlug: data.lastCourseSlug as string,
      })
      break
      
    case "new_content":
      element = React.createElement(NewContentTemplate, {
        userName: data.userName as string,
        contentType: data.contentType as "lesson" | "course" | "module",
        contentTitle: data.contentTitle as string,
        contentDescription: data.contentDescription as string,
        contentThumbnail: data.contentThumbnail as string,
        contentUrl: data.contentUrl as string,
        courseName: data.courseName as string,
      })
      break
      
    case "weekly_summary":
      element = React.createElement(WeeklySummaryTemplate, {
        userName: data.userName as string,
        weekNumber: data.weekNumber as number,
        lessonsCompleted: data.lessonsCompleted as number,
        minutesWatched: data.minutesWatched as number,
        currentStreak: data.currentStreak as number,
        bestStreak: data.bestStreak as number,
        coursesInProgress: data.coursesInProgress as Array<{
          name: string
          progress: number
          slug: string
        }>,
        achievements: data.achievements as Array<{
          name: string
          icon: string
        }>,
      })
      break
      
    case "welcome":
      element = React.createElement(WelcomeTemplate, {
        userName: data.userName as string,
      })
      break
      
    default:
      return null
  }
  
  if (!element) return null
  
  return render(element)
}

/**
 * Registra o email no banco de dados
 */
async function logEmail(data: {
  user_id?: string
  email_to: string
  email_type: EmailType
  subject: string
  template_data?: Record<string, unknown>
  resend_id?: string
  status: EmailStatus
  campaign_id?: string
  error_message?: string
}) {
  try {
    const supabase = await createClient()
    
    await supabase.from("email_log").insert({
      user_id: data.user_id,
      email_to: data.email_to,
      email_type: data.email_type,
      subject: data.subject,
      template_data: data.template_data || {},
      resend_id: data.resend_id,
      status: data.status,
      campaign_id: data.campaign_id,
      error_message: data.error_message,
      sent_at: data.status === "sent" ? new Date().toISOString() : null,
    })
  } catch (error) {
    console.error("Erro ao logar email:", error)
  }
}

/**
 * Verifica se pode enviar email para o usuário
 */
export async function canSendEmailToUser(userId: string, emailType: EmailType): Promise<boolean> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .rpc("can_send_email_to_user", {
        p_user_id: userId,
        p_email_type: emailType,
      })
    
    if (error) {
      console.error("Erro ao verificar permissão de email:", error)
      return false
    }
    
    return data === true
  } catch {
    return false
  }
}

/**
 * Atualiza o status de um email (para webhooks do Resend)
 * Usa cliente admin para bypassar RLS
 */
export async function updateEmailStatus(resendId: string, status: EmailStatus) {
  try {
    // Usar cliente admin para webhooks (não tem usuário autenticado)
    const { createAdminClient } = await import("@/lib/supabase/server")
    const supabase = createAdminClient()
    
    const updateData: Record<string, unknown> = { status }
    
    if (status === "delivered") {
      updateData.delivered_at = new Date().toISOString()
    } else if (status === "opened") {
      updateData.opened_at = new Date().toISOString()
    } else if (status === "clicked") {
      updateData.clicked_at = new Date().toISOString()
    }
    
    const { error } = await supabase
      .from("email_log")
      .update(updateData)
      .eq("resend_id", resendId)
    
    if (error) {
      console.error("Erro ao atualizar status do email:", error)
    } else {
      console.log(`✅ Email ${resendId} atualizado para status: ${status}`)
    }
      
  } catch (error) {
    console.error("Erro ao atualizar status do email:", error)
  }
}

