import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sendEmail, canSendEmailToUser, EmailType } from "@/lib/email"

// POST /api/emails/send
// Endpoint para enviar emails individuais (uso interno)
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação (admin ou serviço)
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }
    
    // Verificar se é admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()
    
    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Apenas administradores" }, { status: 403 })
    }
    
    // Obter dados do request
    const body = await request.json()
    const { 
      to, 
      userId, 
      type, 
      subject, 
      templateData, 
      force = false 
    } = body as {
      to: string
      userId?: string
      type: EmailType
      subject: string
      templateData: Record<string, unknown>
      force?: boolean
    }
    
    // Validações
    if (!to || !type || !subject) {
      return NextResponse.json(
        { error: "Campos obrigatórios: to, type, subject" }, 
        { status: 400 }
      )
    }
    
    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        { error: "Formato de email inválido" }, 
        { status: 400 }
      )
    }
    
    // Validar tipo de email permitido
    const validTypes = ["reminder", "new_content", "weekly_summary", "welcome", "campaign"]
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: "Tipo de email inválido" }, 
        { status: 400 }
      )
    }
    
    // Verificar se pode enviar (a menos que force=true)
    if (!force && userId) {
      const canSend = await canSendEmailToUser(userId, type)
      if (!canSend) {
        return NextResponse.json(
          { error: "Usuário não aceita este tipo de email ou já recebeu recentemente" }, 
          { status: 429 }
        )
      }
    }
    
    // Enviar email
    const result = await sendEmail({
      to,
      userId,
      type,
      subject,
      templateData: templateData || {},
    })
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error }, 
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      resendId: result.resendId,
    })
    
  } catch (error) {
    console.error("Erro na API de envio de email:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" }, 
      { status: 500 }
    )
  }
}

