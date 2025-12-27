"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { 
  CheckCircle2, 
  Heart, 
  Zap, 
  Shield, 
  Clock, 
  Award,
  Users,
  BookOpen,
  Target,
  AlertTriangle,
  ArrowRight,
  Play,
  Star,
  ChevronDown,
  Lock,
  Sparkles,
  TrendingUp
} from "lucide-react"
import { cn } from "@/lib/utils"

// Cores da identidade visual
const colors = {
  primary: "#9d1915",
  secondary: "#7db975",
  light: "#f5f4ec",
  cream: "#fbefce",
}

// Componente de seção
function Section({ 
  children, 
  className,
  dark = false,
  id
}: { 
  children: React.ReactNode
  className?: string
  dark?: boolean
  id?: string
}) {
  return (
    <section 
      id={id}
      className={cn(
        "py-16 md:py-24 px-4",
        dark ? "bg-[#0a0505]" : "bg-[#f5f4ec]",
        className
      )}
    >
      <div className="max-w-5xl mx-auto">
        {children}
      </div>
    </section>
  )
}

// Componente de FAQ
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <div className="border-b border-white/10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-5 flex items-center justify-between text-left"
      >
        <span className="text-white font-medium text-lg pr-4">{question}</span>
        <ChevronDown className={cn(
          "w-5 h-5 text-[#9d1915] transition-transform duration-300 flex-shrink-0",
          isOpen && "rotate-180"
        )} />
      </button>
      <div className={cn(
        "overflow-hidden transition-all duration-300",
        isOpen ? "max-h-96 pb-5" : "max-h-0"
      )}>
        <p className="text-white/70">{answer}</p>
      </div>
    </div>
  )
}

// Componente de Depoimento
function Testimonial({ 
  name, 
  role, 
  text, 
  avatar 
}: { 
  name: string
  role: string
  text: string
  avatar?: string 
}) {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#9d1915] to-[#7db975] flex items-center justify-center text-white font-bold text-lg">
          {name.charAt(0)}
        </div>
        <div>
          <h4 className="text-white font-semibold">{name}</h4>
          <p className="text-white/50 text-sm">{role}</p>
        </div>
      </div>
      <p className="text-white/80 italic">"{text}"</p>
      <div className="flex gap-1 mt-4">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
        ))}
      </div>
    </div>
  )
}

export default function VendaPage() {
  const [showCTA, setShowCTA] = useState(false)
  
  useEffect(() => {
    const handleScroll = () => {
      setShowCTA(window.scrollY > 500)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0505]">
      {/* ==================== HERO SECTION ==================== */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          {/* Gradiente de fundo */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#1a0a09] via-[#0a0505] to-[#0a0505]" />
          
          {/* Luz vermelha */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#9d1915]/20 rounded-full blur-[150px]" />
          
          {/* Padrão ECG removido - muito invasivo */}
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-24 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-[#9d1915]/20 border border-[#9d1915]/50 rounded-full px-4 py-2 mb-8">
            <Sparkles className="w-4 h-4 text-[#9d1915]" />
            <span className="text-[#9d1915] text-sm font-medium">Método exclusivo para plantão</span>
          </div>
          
          {/* Headline principal */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Domine o ECG com{" "}
            <span className="text-[#9d1915]">clareza</span> e{" "}
            <span className="text-[#7db975]">confiança</span>
            <br />
            no plantão
          </h1>
          
          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-white/70 mb-8 max-w-3xl mx-auto">
            Aprenda a interpretar ECG de forma estruturada e transforme cada traçado 
            em uma <strong className="text-white">decisão clínica segura</strong>.
          </p>
          
          {/* ===== VÍDEO DE APRESENTAÇÃO ===== */}
          <div className="mb-10 max-w-3xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-red-500/20 border-2 border-[#9d1915]/30">
              {/* Vídeo do Panda Video */}
              <div className="relative" style={{ paddingTop: '56.25%' }}>
                <iframe 
                  id="panda-c0c05ca6-d7d6-47cc-84ba-1cc49af5e650" 
                  src="https://player-vz-1ff387ab-5bf.tv.pandavideo.com.br/embed/?v=c0c05ca6-d7d6-47cc-84ba-1cc49af5e650&preload=false" 
                  style={{ border: 'none', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                  allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture" 
                  allowFullScreen
                />
              </div>
            </div>
            
            {/* Legenda do vídeo */}
            <p className="text-white/50 text-sm mt-3 text-center">
              🎬 Assista e descubra como o Método CAMPOS-ECG™ pode transformar sua prática
            </p>
          </div>
          
          {/* Proposta de valor */}
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <div className="flex items-center gap-2 text-white/80">
              <CheckCircle2 className="w-5 h-5 text-[#7db975]" />
              <span>Sem decoreba</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <CheckCircle2 className="w-5 h-5 text-[#7db975]" />
              <span>Raciocínio clínico</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <CheckCircle2 className="w-5 h-5 text-[#7db975]" />
              <span>Aplicado ao plantão</span>
            </div>
          </div>
          
          {/* CTA Principal */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#compra"
              className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-[#9d1915] to-[#c4231c] text-white font-bold text-lg px-8 py-4 rounded-xl hover:shadow-lg hover:shadow-red-500/30 transition-all duration-300 hover:scale-105"
            >
              <span>QUERO DOMINAR O ECG</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              
              {/* Shine effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </a>
            
            <Link
              href="/demo-video"
              className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            >
              <Play className="w-5 h-5" />
              <span>Assistir aula grátis</span>
            </Link>
          </div>
          
          {/* Foto da Antonina */}
          <div className="mt-16 relative">
            <div className="relative w-48 h-48 mx-auto rounded-full overflow-hidden border-4 border-[#9d1915]/50 shadow-2xl shadow-red-500/20">
              <Image
                src="/ninca-coracao.JPG"
                alt="Antonina Campos"
                fill
                className="object-cover object-top"
                priority
              />
            </div>
            <p className="mt-4 text-white/60 text-sm">
              Dra. Antonina Campos • Residente de Cardiologia
            </p>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-8 h-8 text-white/30" />
        </div>
      </section>

      {/* ==================== PROBLEMA SECTION ==================== */}
      <Section dark className="border-t border-white/5">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Você reconhece alguma dessas situações?
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Se você se identificou, saiba que não está sozinho(a).
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              icon: AlertTriangle,
              title: "Reconhece alterações, mas não sabe o que fazer",
              text: "Você vê um ECG alterado no plantão e fica inseguro sobre a conduta."
            },
            {
              icon: Clock,
              title: "Perde tempo buscando informações",
              text: "Fica procurando no Google ou em livros enquanto o paciente espera."
            },
            {
              icon: Target,
              title: "Decorou padrões, mas não raciocina",
              text: "Na hora H, os padrões decorados não se aplicam ao caso real."
            },
            {
              icon: Shield,
              title: "Medo de errar diagnóstico",
              text: "Cada ECG parece uma armadilha esperando para pegá-lo."
            }
          ].map((item, i) => (
            <div 
              key={i} 
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-[#9d1915]/50 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#9d1915]/20 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-6 h-6 text-[#9d1915]" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-white/60">{item.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ==================== SOLUÇÃO SECTION ==================== */}
      <Section className="bg-gradient-to-b from-[#f5f4ec] to-white">
        <div className="text-center mb-12">
          <span className="inline-block text-[#9d1915] font-semibold text-sm uppercase tracking-wide mb-4">
            A Solução
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Método CAMPOS-ECG™
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Uma abordagem estruturada que transforma o ECG de enigma técnico 
            em ferramenta de decisão clínica.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: BookOpen,
              title: "Raciocínio Estruturado",
              text: "Aprenda a analisar qualquer ECG seguindo uma lógica progressiva, do contexto clínico à conduta."
            },
            {
              icon: Target,
              title: "Aplicação Prática",
              text: "Cases reais do plantão para você treinar decisões, não apenas reconhecer padrões."
            },
            {
              icon: TrendingUp,
              title: "Evolução Consistente",
              text: "Trilha progressiva que constrói sua segurança aula após aula, sem pressa."
            }
          ].map((item, i) => (
            <div key={i} className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[#9d1915]/10 flex items-center justify-center">
                <item.icon className="w-8 h-8 text-[#9d1915]" />
              </div>
              <h3 className="text-gray-900 font-semibold text-xl mb-3">{item.title}</h3>
              <p className="text-gray-600">{item.text}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ==================== SOBRE A MENTORA ==================== */}
      <Section dark>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden">
              <Image
                src="/nina-medica.JPG"
                alt="Antonina Campos"
                fill
                className="object-cover object-top"
              />
              {/* Overlay com gradiente */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0505] via-transparent to-transparent" />
            </div>
            {/* Badge flutuante */}
            <div className="absolute -bottom-4 -right-4 bg-[#7db975] text-white px-6 py-3 rounded-xl shadow-lg">
              <p className="font-bold">+14 anos</p>
              <p className="text-sm opacity-80">de experiência</p>
            </div>
          </div>
          
          <div>
            <span className="inline-block text-[#9d1915] font-semibold text-sm uppercase tracking-wide mb-4">
              Sua mentora
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Antonina Campos
            </h2>
            <div className="space-y-4 text-white/80">
              <p>
                <strong className="text-white">Médica Residente em Cardiologia</strong> e especialista 
                em interpretação clínica do ECG aplicada ao plantão.
              </p>
              <p>
                Aprendeu ECG ainda na infância com sua mãe cardiologista, desenvolvendo uma leitura 
                que sempre parte do <strong className="text-[#7db975]">contexto clínico</strong>, 
                passa pela análise estruturada e chega à decisão prática.
              </p>
              <p>
                Ao longo da graduação e residência, percebeu que médicos até reconhecem alterações, 
                mas <strong className="text-[#9d1915]">não sabem o que fazer</strong> no plantão.
              </p>
              <p>
                Foi dessa lacuna que nasceu o <strong className="text-white">Método CAMPOS-ECG™</strong>:
              </p>
            </div>
            
            <div className="mt-6 space-y-3">
              {[
                "Reduzir insegurança na leitura",
                "Evitar erros comuns de interpretação",
                "Transformar ECG em decisão clínica"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#7db975]" />
                  <span className="text-white">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ==================== O QUE VOCÊ VAI RECEBER ==================== */}
      <Section className="bg-[#f5f4ec]">
        <div className="text-center mb-12">
          <span className="inline-block text-[#9d1915] font-semibold text-sm uppercase tracking-wide mb-4">
            Conteúdo Completo
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            O que você vai receber
          </h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {[
            { title: "Nível 1 - Fundamentos", lessons: "12 aulas", desc: "Base sólida para ler qualquer ECG" },
            { title: "Nível 2 - Ritmos e Arritmias", lessons: "15 aulas", desc: "Identifique e conduza arritmias" },
            { title: "Nível 3 - Isquemia e SCA", lessons: "10 aulas", desc: "Reconheça síndromes coronarianas" },
            { title: "Casos Clínicos Práticos", lessons: "+30 casos", desc: "Treine decisões reais do plantão" },
          ].map((item, i) => (
            <div 
              key={i} 
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-[#9d1915]/20 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-gray-900 font-bold text-lg">{item.title}</h3>
                <span className="text-[#9d1915] font-semibold text-sm bg-[#9d1915]/10 px-3 py-1 rounded-full">
                  {item.lessons}
                </span>
              </div>
              <p className="text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
        
        {/* Bônus */}
        <div className="mt-12">
          <h3 className="text-center text-2xl font-bold text-gray-900 mb-8">
            + Bônus Exclusivos
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "Comunidade VIP", value: "R$297", desc: "Grupo exclusivo para dúvidas" },
              { title: "Flashcards ECG", value: "R$97", desc: "Revisão rápida para plantão" },
              { title: "Casos Semanais", value: "R$197", desc: "Novos casos toda semana" },
            ].map((item, i) => (
              <div key={i} className="bg-[#7db975]/10 rounded-xl p-5 border border-[#7db975]/30 text-center">
                <p className="text-gray-400 text-sm line-through mb-1">Valor: {item.value}</p>
                <h4 className="text-gray-900 font-bold">{item.title}</h4>
                <p className="text-gray-600 text-sm mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ==================== DEPOIMENTOS ==================== */}
      <Section dark>
        <div className="text-center mb-12">
          <span className="inline-block text-[#7db975] font-semibold text-sm uppercase tracking-wide mb-4">
            Resultados Reais
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            O que nossos alunos dizem
          </h2>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <Testimonial
            name="Dr. Lucas Mendes"
            role="Clínico Geral • SP"
            text="Finalmente entendi a lógica por trás do ECG. Não preciso mais decorar, eu raciocino!"
          />
          <Testimonial
            name="Dra. Camila Santos"
            role="Plantonista UPA • RJ"
            text="A didática da Antonina é incrível. Casos reais que me salvam todo plantão."
          />
          <Testimonial
            name="Dr. Pedro Costa"
            role="R1 Clínica Médica • MG"
            text="Melhor investimento que fiz na residência. Me sinto muito mais seguro agora."
          />
        </div>
      </Section>

      {/* ==================== PREÇO E CTA ==================== */}
      <Section id="compra" className="bg-gradient-to-b from-[#f5f4ec] to-[#fbefce]">
        <div className="max-w-2xl mx-auto text-center">
          <span className="inline-block text-[#9d1915] font-semibold text-sm uppercase tracking-wide mb-4">
            Oferta Especial
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Comece sua transformação agora
          </h2>
          <p className="text-gray-600 text-lg mb-8">
            Acesso completo ao Método CAMPOS-ECG™ + todos os bônus
          </p>
          
          {/* Card de preço */}
          <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-[#9d1915]/20 relative overflow-hidden">
            {/* Ribbon */}
            <div className="absolute top-4 right-4 bg-[#7db975] text-white text-xs font-bold px-3 py-1 rounded-full">
              MELHOR OFERTA
            </div>
            
            {/* Ancoragem */}
            <p className="text-gray-400 text-lg mb-2">
              De <span className="line-through">R$ 997,00</span>
            </p>
            
            {/* Preço */}
            <div className="mb-6">
              <span className="text-gray-600 text-lg">por apenas</span>
              <div className="flex items-center justify-center gap-2">
                <span className="text-5xl md:text-6xl font-bold text-[#9d1915]">12x</span>
                <div className="text-left">
                  <span className="text-4xl md:text-5xl font-bold text-[#9d1915]">R$47</span>
                  <span className="text-gray-400 text-sm block">ou R$497 à vista</span>
                </div>
              </div>
            </div>
            
            {/* Lista do que inclui */}
            <div className="text-left mb-8 space-y-3">
              {[
                "Acesso completo por 2 anos",
                "Todos os módulos e níveis",
                "Comunidade VIP de alunos",
                "Flashcards para revisão",
                "Casos clínicos semanais",
                "Certificado de conclusão",
                "Suporte direto com a Antonina"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#7db975] flex-shrink-0" />
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
            
            {/* CTA */}
            <a
              href="https://pay.hotmart.com/SEUPRODUTO"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-gradient-to-r from-[#9d1915] to-[#c4231c] text-white font-bold text-xl py-5 rounded-xl hover:shadow-lg hover:shadow-red-500/30 transition-all hover:scale-[1.02]"
            >
              QUERO GARANTIR MINHA VAGA
            </a>
            
            {/* Garantia */}
            <div className="mt-6 flex items-center justify-center gap-3 text-gray-500 text-sm">
              <Shield className="w-5 h-5 text-[#7db975]" />
              <span>Garantia de 7 dias ou seu dinheiro de volta</span>
            </div>
            
            {/* Pagamento seguro */}
            <div className="mt-4 flex items-center justify-center gap-3 text-gray-400 text-xs">
              <Lock className="w-4 h-4" />
              <span>Pagamento 100% seguro via Hotmart</span>
            </div>
          </div>
        </div>
      </Section>

      {/* ==================== FAQ ==================== */}
      <Section dark>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Perguntas Frequentes
          </h2>
        </div>
        
        <div className="max-w-2xl mx-auto">
          <FAQItem 
            question="Por quanto tempo terei acesso?"
            answer="Você terá acesso por 2 anos (730 dias) a todo o conteúdo, incluindo atualizações."
          />
          <FAQItem 
            question="Preciso ter conhecimento prévio de ECG?"
            answer="Não! O método foi criado para funcionar tanto para iniciantes quanto para quem já tem experiência mas quer estruturar melhor o raciocínio."
          />
          <FAQItem 
            question="Posso assistir no celular?"
            answer="Sim! A plataforma é 100% responsiva e funciona em qualquer dispositivo."
          />
          <FAQItem 
            question="Tem certificado?"
            answer="Sim! Ao completar o curso, você recebe um certificado de conclusão."
          />
          <FAQItem 
            question="E se eu não gostar?"
            answer="Você tem 7 dias de garantia incondicional. Se não gostar, devolvemos 100% do seu investimento."
          />
        </div>
      </Section>

      {/* ==================== CTA FINAL ==================== */}
      <Section className="bg-gradient-to-r from-[#9d1915] to-[#7d1210]">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            ECG não se aprende rápido.
          </h2>
          <p className="text-white/80 text-xl mb-8">
            Se constrói com método, prática e acompanhamento.
          </p>
          
          <a
            href="#compra"
            className="inline-flex items-center gap-3 bg-white text-[#9d1915] font-bold text-lg px-8 py-4 rounded-xl hover:shadow-lg hover:bg-gray-50 transition-all hover:scale-105"
          >
            <span>COMEÇAR AGORA</span>
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </Section>

      {/* ==================== FOOTER ==================== */}
      <footer className="bg-[#0a0505] py-8 px-4 border-t border-white/10">
        <div className="max-w-5xl mx-auto text-center">
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
          <p className="text-white/20 text-xs mt-2">
            Este produto não substitui consulta médica profissional.
          </p>
        </div>
      </footer>

      {/* ==================== CTA FLUTUANTE ==================== */}
      <div className={cn(
        "fixed bottom-0 left-0 right-0 bg-[#0a0505]/95 backdrop-blur-lg border-t border-white/10 p-4 transition-transform duration-300 z-50",
        showCTA ? "translate-y-0" : "translate-y-full"
      )}>
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="hidden sm:block">
            <p className="text-white font-medium">Método CAMPOS-ECG™</p>
            <p className="text-white/50 text-sm">12x R$47 ou R$497 à vista</p>
          </div>
          <a
            href="#compra"
            className="flex-1 sm:flex-none text-center bg-gradient-to-r from-[#9d1915] to-[#c4231c] text-white font-bold px-8 py-3 rounded-xl hover:shadow-lg hover:shadow-red-500/30 transition-all"
          >
            GARANTIR MINHA VAGA
          </a>
        </div>
      </div>
    </div>
  )
}

