import { Resend } from "resend"

// Cliente Resend - inicializado com a API key
const resendApiKey = process.env.RESEND_API_KEY

if (!resendApiKey) {
  console.warn("⚠️ RESEND_API_KEY não configurada. Emails não serão enviados.")
}

export const resend = resendApiKey ? new Resend(resendApiKey) : null

// Configuração do remetente
export const EMAIL_FROM = process.env.EMAIL_FROM || "Clube do ECG <noreply@clubedoecg.com.br>"

// Tipos de email disponíveis
export type EmailType = 
  | "reminder"
  | "new_content"
  | "weekly_summary"
  | "welcome"
  | "password_reset"
  | "campaign"
  | "achievement"
  | "course_complete"

// Status de email
export type EmailStatus = 
  | "pending"
  | "sent"
  | "delivered"
  | "opened"
  | "clicked"
  | "bounced"
  | "complained"
  | "failed"

// Interface para log de email
export interface EmailLogEntry {
  user_id?: string
  email_to: string
  email_type: EmailType
  subject: string
  template_id?: string
  template_data?: Record<string, unknown>
  resend_id?: string
  status: EmailStatus
  campaign_id?: string
  error_message?: string
}

