"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Check, Crown, Heart, Sparkles, Star, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const plans = [
  {
    id: "free",
    name: "Gratuito",
    price: "R$ 0",
    period: "para sempre",
    description: "Experimente o método CAMPOS-ECG™",
    icon: Heart,
    color: "bg-slate-100 text-slate-700",
    buttonVariant: "outline" as const,
    features: [
      "Primeiras aulas do curso Faixa Branca",
      "Acesso ao quiz de demonstração",
      "Certificado de participação",
    ],
    limitations: [
      "Apenas conteúdo introdutório",
      "Sem acesso a cursos avançados",
    ],
  },
  {
    id: "basic",
    name: "Básico",
    price: "R$ 97",
    period: "/mês",
    description: "Perfeito para começar sua jornada",
    icon: Sparkles,
    color: "bg-blue-100 text-blue-700",
    buttonVariant: "outline" as const,
    popular: false,
    features: [
      "Acesso ao curso Faixa Branca completo",
      "Primeiras aulas de cada nível",
      "Quizzes com feedback",
      "Certificado de conclusão",
      "Suporte por email",
    ],
    limitations: [
      "Sem acesso total a Faixa Azul e Preta",
    ],
  },
  {
    id: "pro",
    name: "PRO",
    price: "R$ 197",
    period: "/mês",
    description: "Acesso completo a todo o conteúdo",
    icon: Crown,
    color: "bg-gradient-to-r from-amber-400 to-orange-500 text-white",
    buttonVariant: "default" as const,
    popular: true,
    features: [
      "Todos os cursos liberados (Branca, Azul, Preta)",
      "Quizzes ilimitados com vídeo-explicação",
      "Casos clínicos exclusivos",
      "Certificado de especialista",
      "Suporte prioritário",
      "Novos conteúdos semanalmente",
      "Comunidade exclusiva",
      "Acesso vitalício às atualizações",
    ],
  },
]

export default function AssinarPage() {
  const [selectedPlan, setSelectedPlan] = useState<string>("pro")
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly")

  const handleSubscribe = (planId: string) => {
    // TODO: Integrar com gateway de pagamento (Stripe, Mercado Pago, etc.)
    alert(`Em breve! Integração com pagamento para o plano ${planId.toUpperCase()}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold">Clube do ECG</span>
          </Link>
          <div className="w-20" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge className="mb-4 bg-primary/10 text-primary border-0">
            <Zap className="w-3 h-3 mr-1" />
            Domine o ECG em 90 dias
          </Badge>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Escolha seu plano e comece hoje
          </h1>
          <p className="text-lg text-muted-foreground">
            Junte-se a milhares de médicos que já dominaram a interpretação de ECG 
            com o método CAMPOS-ECG™
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-full p-1 shadow-sm border">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-medium transition-colors",
                billingPeriod === "monthly" 
                  ? "bg-primary text-white" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Mensal
            </button>
            <button
              onClick={() => setBillingPeriod("yearly")}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-medium transition-colors",
                billingPeriod === "yearly" 
                  ? "bg-primary text-white" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Anual <span className="text-green-600 ml-1">-20%</span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon
            const isSelected = selectedPlan === plan.id
            const price = billingPeriod === "yearly" && plan.id !== "free"
              ? `R$ ${Math.round(parseInt(plan.price.replace("R$ ", "")) * 12 * 0.8)}`
              : plan.price
            const period = billingPeriod === "yearly" && plan.id !== "free" 
              ? "/ano" 
              : plan.period

            return (
              <Card 
                key={plan.id}
                className={cn(
                  "relative cursor-pointer transition-all duration-300 hover:shadow-lg",
                  isSelected && "ring-2 ring-primary shadow-lg",
                  plan.popular && "border-primary"
                )}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-white border-0 shadow-md">
                      <Star className="w-3 h-3 mr-1 fill-white" />
                      Mais Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pt-8">
                  <div className={cn(
                    "w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center",
                    plan.color
                  )}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Price */}
                  <div className="text-center">
                    <span className="text-4xl font-bold text-foreground">{price}</span>
                    <span className="text-muted-foreground">{period}</span>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                    {plan.limitations?.map((limitation, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="w-4 h-4 shrink-0 text-center">—</span>
                        <span>{limitation}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Button 
                    variant={plan.buttonVariant}
                    className={cn(
                      "w-full",
                      plan.popular && "bg-primary hover:bg-primary/90"
                    )}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSubscribe(plan.id)
                    }}
                  >
                    {plan.id === "free" ? "Começar Grátis" : "Assinar Agora"}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Trust badges */}
        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground mb-6">
            Pagamento seguro • Cancele quando quiser • Garantia de 7 dias
          </p>
          <div className="flex justify-center items-center gap-8 opacity-50">
            <span className="text-sm font-medium">Formas de pagamento:</span>
            <span className="text-sm">💳 Cartão de Crédito</span>
            <span className="text-sm">📱 PIX</span>
            <span className="text-sm">📄 Boleto</span>
          </div>
        </div>

        {/* FAQ Preview */}
        <div className="mt-16 max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Dúvidas frequentes</h2>
          <div className="space-y-4 text-left">
            <details className="bg-white rounded-lg p-4 border">
              <summary className="font-medium cursor-pointer">
                Posso cancelar a qualquer momento?
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">
                Sim! Você pode cancelar sua assinatura a qualquer momento, sem taxas ou multas.
              </p>
            </details>
            <details className="bg-white rounded-lg p-4 border">
              <summary className="font-medium cursor-pointer">
                Como funciona a garantia de 7 dias?
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">
                Se não ficar satisfeito nos primeiros 7 dias, devolvemos 100% do seu dinheiro.
              </p>
            </details>
            <details className="bg-white rounded-lg p-4 border">
              <summary className="font-medium cursor-pointer">
                Recebo certificado?
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">
                Sim! Ao completar cada curso, você recebe um certificado digital de conclusão.
              </p>
            </details>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 Clube do ECG. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}

