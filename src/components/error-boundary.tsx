"use client"

import { Component, ReactNode } from "react"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import Link from "next/link"
import { ROUTES, ERROR_MESSAGES, BRAND_COLORS } from "@/lib/constants"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * Error Boundary global para capturar erros de renderização
 * Envolve a aplicação para evitar tela branca em caso de erro
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log para serviço de monitoramento (Sentry, etc)
    console.error("ErrorBoundary caught an error:", error, errorInfo)
    
    // TODO: Enviar para serviço de monitoramento
    // if (typeof window !== "undefined" && window.Sentry) {
    //   window.Sentry.captureException(error)
    // }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      // Fallback customizado se fornecido
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Fallback padrão
      return (
        <div 
          className="min-h-screen flex items-center justify-center p-4"
          style={{ background: `linear-gradient(180deg, ${BRAND_COLORS.dark} 0%, #1a0a09 100%)` }}
        >
          <div className="max-w-md w-full text-center">
            {/* Ícone de erro */}
            <div 
              className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${BRAND_COLORS.primary}20` }}
            >
              <AlertTriangle 
                className="w-10 h-10" 
                style={{ color: BRAND_COLORS.primary }} 
              />
            </div>

            {/* Título */}
            <h1 className="text-2xl font-bold text-white mb-2">
              Ops! Algo deu errado
            </h1>

            {/* Mensagem */}
            <p className="text-white/60 mb-6">
              {ERROR_MESSAGES.GENERIC}
            </p>

            {/* Detalhes do erro (apenas em dev) */}
            {process.env.NODE_ENV === "development" && this.state.error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 text-left">
                <p className="text-red-400 text-sm font-mono break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            {/* Ações */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium text-white transition-colors"
                style={{ backgroundColor: BRAND_COLORS.primary }}
              >
                <RefreshCw className="w-4 h-4" />
                Tentar novamente
              </button>

              <Link
                href={ROUTES.HOME}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium text-white/80 bg-white/10 hover:bg-white/20 transition-colors"
              >
                <Home className="w-4 h-4" />
                Ir para o início
              </Link>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Componente de erro para páginas (Server Components)
 * Usado em error.tsx files
 */
export function PageError({ 
  error, 
  reset 
}: { 
  error: Error & { digest?: string }
  reset: () => void 
}) {
  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: `linear-gradient(180deg, ${BRAND_COLORS.dark} 0%, #1a0a09 100%)` }}
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
          Erro na página
        </h1>

        <p className="text-white/60 mb-6">
          {error.message || ERROR_MESSAGES.GENERIC}
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
            href={ROUTES.DASHBOARD}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium text-white/80 bg-white/10 hover:bg-white/20 transition-colors"
          >
            <Home className="w-4 h-4" />
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  )
}

