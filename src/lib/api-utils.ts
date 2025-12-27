import { NextResponse } from "next/server"

// ==========================================
// UTILITÁRIOS PARA APIs
// ==========================================

/**
 * Resposta de erro padronizada
 */
export function apiError(message: string, status: number = 500) {
  return NextResponse.json({ error: message }, { status })
}

/**
 * Resposta de sucesso padronizada
 */
export function apiSuccess<T>(data: T, status: number = 200) {
  return NextResponse.json(data, { status })
}

/**
 * Validador de email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validador de UUID
 */
export function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(id)
}

/**
 * Rate limiter simples baseado em memória (para Serverless)
 * Em produção, usar Redis ou similar
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(
  key: string, 
  maxRequests: number = 10, 
  windowMs: number = 60000
): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(key)
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }
  
  if (record.count >= maxRequests) {
    return false
  }
  
  record.count++
  return true
}

/**
 * Wrapper para handlers de API com tratamento de erro
 */
export function withErrorHandler<T>(
  handler: () => Promise<T>
): Promise<T | NextResponse> {
  return handler().catch((error) => {
    console.error("API Error:", error)
    return apiError("Erro interno do servidor", 500)
  })
}

/**
 * Sanitiza string para evitar XSS
 */
export function sanitizeString(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
}

