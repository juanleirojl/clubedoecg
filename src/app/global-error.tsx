"use client"

import { BRAND_COLORS, ROUTES, ERROR_MESSAGES } from "@/lib/constants"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import Link from "next/link"

/**
 * Error boundary global para erros no root layout
 * Renderiza seu próprio HTML pois não tem acesso ao layout
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="pt-BR">
      <body>
        <div 
          className="min-h-screen flex items-center justify-center p-4"
          style={{ 
            background: `linear-gradient(180deg, ${BRAND_COLORS.dark} 0%, #1a0a09 100%)`,
            fontFamily: 'system-ui, sans-serif'
          }}
        >
          <div className="max-w-md w-full text-center">
            <div 
              className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${BRAND_COLORS.primary}20` }}
            >
              <AlertTriangle 
                className="w-10 h-10" 
                style={{ color: BRAND_COLORS.primary }} 
              />
            </div>

            <h1 className="text-2xl font-bold text-white mb-2">
              Erro crítico
            </h1>

            <p className="text-white/60 mb-6">
              {ERROR_MESSAGES.GENERIC}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={reset}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium text-white transition-colors"
                style={{ backgroundColor: BRAND_COLORS.primary }}
              >
                <RefreshCw className="w-4 h-4" />
                Tentar novamente
              </button>

              <Link
                href={ROUTES.HOME}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium text-white/80 transition-colors"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
              >
                <Home className="w-4 h-4" />
                Ir para o início
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}

