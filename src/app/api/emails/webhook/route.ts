import { NextRequest, NextResponse } from "next/server"
import { updateEmailStatus, EmailStatus } from "@/lib/email"
import { headers } from "next/headers"
import crypto from "crypto"

// Tipos de eventos do Resend
type ResendEventType = 
  | "email.sent"
  | "email.delivered"
  | "email.delivery_delayed"
  | "email.complained"
  | "email.bounced"
  | "email.opened"
  | "email.clicked"

interface ResendWebhookPayload {
  type: ResendEventType
  created_at: string
  data: {
    email_id: string
    from: string
    to: string[]
    subject: string
    // Dados adicionais dependem do tipo de evento
    click?: {
      link: string
    }
  }
}

// POST /api/emails/webhook
// Webhook do Resend para atualizar status de emails
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = await headers()
    
    // Verificar assinatura do webhook (se configurado)
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET
    if (webhookSecret) {
      const signature = headersList.get("svix-signature")
      const timestamp = headersList.get("svix-timestamp")
      const webhookId = headersList.get("svix-id")
      
      if (!signature || !timestamp || !webhookId) {
        console.error("Webhook sem assinatura válida")
        return NextResponse.json({ error: "Assinatura inválida" }, { status: 401 })
      }
      
      // Verificar assinatura HMAC
      const toSign = `${webhookId}.${timestamp}.${body}`
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(toSign)
        .digest("base64")
      
      // A assinatura vem no formato "v1,base64signature"
      const receivedSignatures = signature.split(" ")
      const isValid = receivedSignatures.some(sig => {
        const [, sigValue] = sig.split(",")
        return sigValue === expectedSignature
      })
      
      if (!isValid) {
        console.error("Assinatura do webhook inválida")
        return NextResponse.json({ error: "Assinatura inválida" }, { status: 401 })
      }
    }
    
    // Parsear payload
    const payload: ResendWebhookPayload = JSON.parse(body)
    const { type, data } = payload
    
    // Mapear tipo de evento para status
    const statusMap: Record<ResendEventType, EmailStatus> = {
      "email.sent": "sent",
      "email.delivered": "delivered",
      "email.delivery_delayed": "sent", // Manter como sent
      "email.complained": "complained",
      "email.bounced": "bounced",
      "email.opened": "opened",
      "email.clicked": "clicked",
    }
    
    const status = statusMap[type]
    if (!status) {
      console.log(`Evento desconhecido: ${type}`)
      return NextResponse.json({ received: true })
    }
    
    // Atualizar status no banco
    await updateEmailStatus(data.email_id, status)
    
    console.log(`📧 Webhook processado: ${type} para ${data.email_id}`)
    
    return NextResponse.json({ received: true })
    
  } catch (error) {
    console.error("Erro ao processar webhook:", error)
    return NextResponse.json(
      { error: "Erro ao processar webhook" }, 
      { status: 500 }
    )
  }
}

// GET para verificar se o endpoint está funcionando
export async function GET() {
  return NextResponse.json({ 
    status: "ok", 
    message: "Webhook endpoint está ativo" 
  })
}

