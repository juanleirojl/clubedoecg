// ==========================================
// VALIDAÇÃO DE VARIÁVEIS DE AMBIENTE
// ==========================================

/**
 * Variáveis de ambiente obrigatórias
 * Se alguma estiver faltando, o build vai falhar
 */

function getEnvVar(key: string, required = true): string {
  const value = process.env[key]
  
  if (!value && required) {
    throw new Error(
      `❌ Variável de ambiente obrigatória não encontrada: ${key}\n` +
      `   Verifique seu arquivo .env.local`
    )
  }
  
  return value || ""
}

/**
 * Configurações do Supabase
 */
export const ENV = {
  // Supabase
  SUPABASE_URL: getEnvVar("NEXT_PUBLIC_SUPABASE_URL"),
  SUPABASE_ANON_KEY: getEnvVar("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  
  // App
  NODE_ENV: process.env.NODE_ENV || "development",
  IS_PRODUCTION: process.env.NODE_ENV === "production",
  IS_DEVELOPMENT: process.env.NODE_ENV === "development",
  
  // URLs (opcionais)
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  
  // Analytics (opcionais)
  ANALYTICS_ID: process.env.NEXT_PUBLIC_ANALYTICS_ID || "",
} as const

/**
 * Valida todas as variáveis obrigatórias no startup
 * Chamado no layout.tsx para garantir que o app não inicie sem as envs
 */
export function validateEnv(): void {
  const requiredVars = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ]
  
  const missing = requiredVars.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    console.error("❌ Variáveis de ambiente faltando:", missing.join(", "))
    if (ENV.IS_PRODUCTION) {
      throw new Error(`Missing required environment variables: ${missing.join(", ")}`)
    }
  }
}

// Validar no import (apenas em desenvolvimento para não quebrar build)
if (typeof window === "undefined" && ENV.IS_DEVELOPMENT) {
  validateEnv()
}


