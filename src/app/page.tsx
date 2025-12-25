import Link from "next/link"
import Image from "next/image"
import { ArrowRight, CheckCircle, Heart, Play, Zap, Shield, BookOpen, Award, Users, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { JudokaIcon } from "@/components/courses/judoka-icon"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">Clube do ECG</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link href="#cursos" className="text-muted-foreground hover:text-foreground">Cursos</Link>
            <Link href="#metodo" className="text-muted-foreground hover:text-foreground">Método</Link>
            <Link href="#depoimentos" className="text-muted-foreground hover:text-foreground">Depoimentos</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost">Entrar</Button>
            </Link>
            <Link href="/login">
              <Button className="bg-primary hover:bg-primary/90">
                Começar Grátis
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 border border-red-100 text-primary text-sm font-medium">
                <Zap className="h-4 w-4" />
                Método CAMPOS-ECG™
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Domine o ECG como um{" "}
                <span className="text-primary">Faixa Preta</span>
              </h1>
              
              <p className="text-xl text-muted-foreground">
                Sistema de faixas progressivo para você sair do zero à autonomia total 
                na interpretação de ECG no plantão. Do traçado à conduta clínica.
              </p>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Link href="/login">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 h-14 px-8 text-lg">
                    Começar Gratuitamente
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg">
                  <Play className="mr-2 h-5 w-5" />
                  Ver Demonstração
                </Button>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-6 pt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span><strong className="text-foreground">+500</strong> alunos</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <span><strong className="text-foreground">+100</strong> casos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  <span><strong className="text-foreground">4.9</strong> avaliação</span>
                </div>
              </div>
            </div>

            {/* Hero Image / Video */}
            <div className="relative">
              <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800"
                  alt="ECG Analysis"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <button className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                    <Play className="w-10 h-10 text-primary ml-1" />
                  </button>
                </div>
              </div>
              
              {/* Floating Card */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-4 border">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Aula concluída!</p>
                    <p className="text-sm text-muted-foreground">Ritmo Sinusal Normal</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Belt System Section */}
      <section id="cursos" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Sistema de Faixas
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Assim como nas artes marciais, você progride de faixa conforme domina cada nível de conhecimento.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Faixa Branca */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 hover:shadow-xl hover:border-gray-300 transition-all card-hover">
              <div className="flex justify-center mb-6">
                <JudokaIcon belt="white" size="lg" />
              </div>
              <h3 className="text-2xl font-bold text-center mb-2">ECG: Faixa Branca</h3>
              <p className="text-muted-foreground text-center mb-6">
                Fundamentos essenciais para quem está começando do zero
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Componentes do ECG</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Cálculo de frequência</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Ritmo sinusal normal</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Eixo elétrico básico</span>
                </li>
              </ul>
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                <span>24 aulas</span>
                <span>13 quizzes</span>
                <span>~4h</span>
              </div>
              <Button className="w-full" variant="outline">
                Começar Grátis
              </Button>
            </div>

            {/* Faixa Azul */}
            <div className="bg-white rounded-2xl border-2 border-blue-200 p-8 hover:shadow-xl hover:border-blue-300 transition-all card-hover relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-blue-500 text-white">Mais Popular</Badge>
              </div>
              <div className="flex justify-center mb-6">
                <JudokaIcon belt="blue" size="lg" />
              </div>
              <h3 className="text-2xl font-bold text-center mb-2">ECG: Faixa Azul</h3>
              <p className="text-muted-foreground text-center mb-6">
                Arritmias, bloqueios e alterações do segmento ST
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Arritmias supraventriculares</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Bloqueios de ramo</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Sobrecarga de câmaras</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Isquemia vs Lesão</span>
                </li>
              </ul>
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                <span>32 aulas</span>
                <span>18 quizzes</span>
                <span>~6h</span>
              </div>
              <Button className="w-full bg-blue-500 hover:bg-blue-600">
                Assinar para Acessar
              </Button>
            </div>

            {/* Faixa Preta */}
            <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl p-8 text-white hover:shadow-xl transition-all card-hover">
              <div className="flex justify-center mb-6">
                <JudokaIcon belt="black" size="lg" />
              </div>
              <h3 className="text-2xl font-bold text-center mb-2">ECG: Faixa Preta</h3>
              <p className="text-gray-300 text-center mb-6">
                Casos complexos e diagnósticos de especialista
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Arritmias ventriculares</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Síndrome coronariana aguda</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Marcapassos</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Casos raros e atípicos</span>
                </li>
              </ul>
              <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                <span>40 aulas</span>
                <span>25 quizzes</span>
                <span>~8h</span>
              </div>
              <Button className="w-full bg-white text-gray-900 hover:bg-gray-100">
                Assinar para Acessar
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Method Section */}
      <section id="metodo" className="py-20 px-4 bg-slate-50">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Método CAMPOS-ECG™
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Não ensinamos a decorar padrões. Ensinamos a pensar cada ECG como único, 
                dentro do contexto clínico. Sempre respondendo duas perguntas:
              </p>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-bold text-primary">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">O que esse ECG mostra?</h3>
                    <p className="text-muted-foreground">Análise sistemática do traçado usando o método CAMPOS</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-bold text-primary">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">O que eu faço com esse paciente agora?</h3>
                    <p className="text-muted-foreground">Conduta clínica imediata baseada no diagnóstico</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="bg-white rounded-xl p-6 shadow-sm border">
                  <Clock className="w-8 h-8 text-primary mb-3" />
                  <h4 className="font-semibold mb-1">Aulas Curtas</h4>
                  <p className="text-sm text-muted-foreground">5-10 min focadas no essencial</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border">
                  <Award className="w-8 h-8 text-yellow-500 mb-3" />
                  <h4 className="font-semibold mb-1">Quizzes Práticos</h4>
                  <p className="text-sm text-muted-foreground">Casos reais do plantão</p>
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="bg-white rounded-xl p-6 shadow-sm border">
                  <BookOpen className="w-8 h-8 text-blue-500 mb-3" />
                  <h4 className="font-semibold mb-1">Materiais PDF</h4>
                  <p className="text-sm text-muted-foreground">Cheat sheets para revisar</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border">
                  <Shield className="w-8 h-8 text-green-500 mb-3" />
                  <h4 className="font-semibold mb-1">Certificado</h4>
                  <p className="text-sm text-muted-foreground">Ao completar cada faixa</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-primary rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/ecg-pattern.svg')] opacity-10" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ganhe autonomia em 3 meses
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
                Interprete ECG com método e decida conduta com segurança. 
                Comece hoje com acesso gratuito à Faixa Branca.
              </p>
              <Link href="/login">
                <Button size="lg" variant="secondary" className="h-14 px-8 text-lg">
                  Criar Conta Gratuita
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-4 bg-slate-50">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Heart className="h-6 w-6 text-primary" />
              <span className="font-semibold">Clube do ECG</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 Clube do ECG. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${className}`}>
      {children}
    </span>
  )
}
