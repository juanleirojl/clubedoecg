"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { 
  Heart, 
  GraduationCap, 
  BookOpen, 
  MessageCircle, 
  Instagram, 
  Youtube, 
  Play, 
  Sparkles,
  ChevronRight,
  Zap,
  Award,
  Users
} from "lucide-react"
import { cn } from "@/lib/utils"

// Cores da identidade visual
const colors = {
  primary: "#9d1915", // Vermelho principal
  secondary: "#7db975", // Verde
  light: "#f5f4ec", // Bege claro
  cream: "#fbefce", // Creme
}

interface LinkCardProps {
  href: string
  title: string
  subtitle?: string
  icon?: React.ReactNode
  variant?: "primary" | "secondary" | "outline" | "featured"
  badge?: string
  external?: boolean
}

function LinkCard({ href, title, subtitle, icon, variant = "primary", badge, external = false }: LinkCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  
  const variants = {
    primary: "bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 hover:border-white/40",
    secondary: "bg-gradient-to-r from-[#7db975] to-[#5a9a52] text-white hover:shadow-lg hover:shadow-green-500/30",
    outline: "bg-transparent border-2 border-[#9d1915] text-white hover:bg-[#9d1915]/20",
    featured: "bg-gradient-to-r from-[#9d1915] to-[#c4231c] text-white hover:shadow-lg hover:shadow-red-500/40 relative overflow-hidden",
  }

  const Component = external ? "a" : Link
  const linkProps = external ? { target: "_blank", rel: "noopener noreferrer" } : {}

  return (
    <Component
      href={href}
      {...linkProps}
      className={cn(
        "group relative block w-full rounded-2xl p-4 transition-all duration-300 transform hover:scale-[1.02]",
        variants[variant]
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Efeito de brilho para cards featured */}
      {variant === "featured" && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
      )}
      
      {/* Badge */}
      {badge && (
        <span className="absolute -top-2 -right-2 bg-[#7db975] text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-pulse">
          {badge}
        </span>
      )}
      
      <div className="flex items-center gap-4">
        {/* Ícone */}
        {icon && (
          <div className={cn(
            "flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300",
            variant === "secondary" || variant === "featured" ? "bg-white/20" : "bg-[#9d1915]/20",
            isHovered && "scale-110"
          )}>
            {icon}
          </div>
        )}
        
        {/* Conteúdo */}
        <div className="flex-grow min-w-0">
          <h3 className={cn(
            "font-semibold text-lg transition-colors duration-300",
            variant === "primary" || variant === "outline" ? "text-white" : "text-white"
          )}>
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-white/70 mt-0.5 truncate">
              {subtitle}
            </p>
          )}
        </div>
        
        {/* Seta */}
        <ChevronRight className={cn(
          "flex-shrink-0 w-5 h-5 text-white/50 transition-all duration-300",
          isHovered && "translate-x-1 text-white"
        )} />
      </div>
    </Component>
  )
}

export default function LinksPage() {
  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(to bottom, #0a0505, #150a09, #0a0505)' }}>
      
      {/* Gradientes decorativos */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#9d1915]/20 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#7db975]/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="relative z-10 max-w-md mx-auto px-4 py-12">
        {/* Header com Avatar */}
        <div className="text-center mb-10">
          {/* Avatar com borda animada */}
          <div className="relative inline-block mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-[#9d1915] via-[#7db975] to-[#9d1915] rounded-full animate-spin-slow blur-sm" 
                 style={{ padding: "3px", animationDuration: "3s" }} />
            <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-[#1a0a09] shadow-2xl">
              <Image
                src="/nina-medica.JPG"
                alt="Antonina Campos"
                fill
                className="object-cover object-top"
                priority
              />
            </div>
            {/* Badge de verificado */}
            <div className="absolute -bottom-1 -right-1 bg-[#7db975] rounded-full p-1.5 border-2 border-[#1a0a09]">
              <Heart className="w-4 h-4 text-white fill-white" />
            </div>
          </div>
          
          {/* Nome e título */}
          <h1 className="text-2xl font-bold text-white mb-1">
            Antonina Campos
          </h1>
          <p className="text-[#9d1915] font-medium mb-2">
            @clubedoecg
          </p>
          <p className="text-white/60 text-sm max-w-xs mx-auto">
            Médica Residente em Cardiologia • Especialista em ECG aplicado ao plantão
          </p>
        </div>
        
        {/* Links */}
        <div className="space-y-3">
          {/* CTA Principal */}
          <LinkCard
            href="/venda"
            title="🔥 Método CAMPOS-ECG™"
            subtitle="Domine o ECG com clareza e confiança"
            icon={<Zap className="w-6 h-6 text-white" />}
            variant="featured"
            badge="NOVO"
          />
          
          {/* Área do Aluno */}
          <LinkCard
            href="/login"
            title="Área do Aluno"
            subtitle="Acesse seus cursos e acompanhe seu progresso"
            icon={<GraduationCap className="w-6 h-6 text-[#9d1915]" />}
            variant="primary"
          />
          
          {/* Cursos Gratuitos */}
          <LinkCard
            href="/cursos"
            title="Cursos Disponíveis"
            subtitle="Conheça nossa trilha de aprendizado"
            icon={<BookOpen className="w-6 h-6 text-[#9d1915]" />}
            variant="primary"
          />
          
          {/* Aula Gratuita */}
          <LinkCard
            href="/demo-video"
            title="▶️ Assista uma Aula Grátis"
            subtitle="Experimente o método antes de comprar"
            icon={<Play className="w-6 h-6 text-white" />}
            variant="secondary"
          />
          
          {/* Divider */}
          <div className="flex items-center gap-4 py-4">
            <div className="flex-grow h-px bg-white/10" />
            <span className="text-white/30 text-xs font-medium">REDES SOCIAIS</span>
            <div className="flex-grow h-px bg-white/10" />
          </div>
          
          {/* Instagram */}
          <LinkCard
            href="https://instagram.com/clubedoecg"
            title="Instagram"
            subtitle="Dicas diárias de ECG"
            icon={<Instagram className="w-6 h-6 text-[#9d1915]" />}
            variant="outline"
            external
          />
          
          {/* YouTube */}
          <LinkCard
            href="https://youtube.com/@clubedoecg"
            title="YouTube"
            subtitle="Aulas e casos clínicos"
            icon={<Youtube className="w-6 h-6 text-[#9d1915]" />}
            variant="outline"
            external
          />
          
          {/* WhatsApp */}
          <LinkCard
            href="https://wa.me/5500000000000"
            title="WhatsApp"
            subtitle="Tire suas dúvidas"
            icon={<MessageCircle className="w-6 h-6 text-[#9d1915]" />}
            variant="outline"
            external
          />
        </div>
        
        {/* Estatísticas */}
        <div className="mt-10 grid grid-cols-3 gap-4 text-center">
          <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10">
            <div className="text-2xl font-bold text-[#9d1915]">500+</div>
            <div className="text-xs text-white/50">Alunos</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10">
            <div className="text-2xl font-bold text-[#7db975]">50+</div>
            <div className="text-xs text-white/50">Aulas</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10">
            <div className="text-2xl font-bold text-white">4.9</div>
            <div className="text-xs text-white/50">Avaliação</div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-10 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Image
              src="/logo-antonina-transparente.png"
              alt="Clube do ECG"
              width={32}
              height={32}
              className="opacity-80"
            />
            <span className="text-white/60 text-sm font-medium">Clube do ECG</span>
          </div>
          <p className="text-white/30 text-xs">
            © 2024 Clube do ECG • Todos os direitos reservados
          </p>
        </div>
      </div>
      
      {/* CSS para animação */}
      <style jsx global>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  )
}

