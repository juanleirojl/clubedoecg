import Link from "next/link"
import { Home } from "lucide-react"
import { ROUTES, BRAND_COLORS } from "@/lib/constants"

/**
 * Página 404 customizada
 * Nota: Componentes Server não podem ter onClick handlers
 */
export default function NotFound() {
  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: `linear-gradient(180deg, ${BRAND_COLORS.dark} 0%, #1a0a09 100%)` }}
    >
      <div className="max-w-md w-full text-center">
        {/* 404 grande */}
        <h1 
          className="text-[120px] font-black leading-none mb-4"
          style={{ color: BRAND_COLORS.primary }}
        >
          404
        </h1>

        {/* Mensagem */}
        <h2 className="text-2xl font-bold text-white mb-2">
          Página não encontrada
        </h2>
        
        <p className="text-white/60 mb-8">
          A página que você está procurando não existe ou foi movida.
        </p>

        {/* Ações */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={ROUTES.HOME}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium text-white transition-colors"
            style={{ backgroundColor: BRAND_COLORS.primary }}
          >
            <Home className="w-4 h-4" />
            Ir para o início
          </Link>

          <Link
            href={ROUTES.DASHBOARD}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium text-white/80 bg-white/10 hover:bg-white/20 transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
