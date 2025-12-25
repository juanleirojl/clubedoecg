"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { 
  BookOpen, 
  Users, 
  PlayCircle, 
  HelpCircle,
  TrendingUp,
  Plus
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

interface Stats {
  totalCourses: number
  totalLessons: number
  totalQuizzes: number
  totalUsers: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalCourses: 0,
    totalLessons: 0,
    totalQuizzes: 0,
    totalUsers: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      const supabase = createClient()

      try {
        // Conta cursos
        const { count: coursesCount } = await supabase
          .from("courses")
          .select("*", { count: "exact", head: true })

        // Conta aulas
        const { count: lessonsCount } = await supabase
          .from("lessons")
          .select("*", { count: "exact", head: true })

        // Conta quizzes
        const { count: quizzesCount } = await supabase
          .from("quizzes")
          .select("*", { count: "exact", head: true })

        // Conta usuários
        const { count: usersCount } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })

        setStats({
          totalCourses: coursesCount || 0,
          totalLessons: lessonsCount || 0,
          totalQuizzes: quizzesCount || 0,
          totalUsers: usersCount || 0,
        })
      } catch (error) {
        console.error("Erro ao carregar estatísticas:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [])

  const statCards = [
    { 
      title: "Cursos", 
      value: stats.totalCourses, 
      icon: BookOpen, 
      color: "text-blue-500",
      bgColor: "bg-blue-100",
      href: "/admin/cursos"
    },
    { 
      title: "Aulas", 
      value: stats.totalLessons, 
      icon: PlayCircle, 
      color: "text-green-500",
      bgColor: "bg-green-100",
      href: "/admin/cursos"
    },
    { 
      title: "Quizzes", 
      value: stats.totalQuizzes, 
      icon: HelpCircle, 
      color: "text-purple-500",
      bgColor: "bg-purple-100",
      href: "/admin/cursos"
    },
    { 
      title: "Usuários", 
      value: stats.totalUsers, 
      icon: Users, 
      color: "text-orange-500",
      bgColor: "bg-orange-100",
      href: "/admin/usuarios"
    },
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Visão geral da plataforma</p>
        </div>
        <Link href="/admin/cursos/novo">
          <Button className="bg-red-500 hover:bg-red-600">
            <Plus className="w-4 h-4 mr-2" />
            Novo Curso
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold">
                      {isLoading ? "..." : stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/admin/cursos/novo" className="block">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="w-4 h-4 mr-2" />
                Criar novo curso
              </Button>
            </Link>
            <Link href="/admin/cursos" className="block">
              <Button variant="outline" className="w-full justify-start">
                <BookOpen className="w-4 h-4 mr-2" />
                Gerenciar cursos
              </Button>
            </Link>
            <Link href="/admin/usuarios" className="block">
              <Button variant="outline" className="w-full justify-start">
                <Users className="w-4 h-4 mr-2" />
                Ver usuários
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Instruções</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600 space-y-3">
            <p>
              <strong>1. Criar Curso:</strong> Vá em Cursos → Novo Curso. 
              Defina título, descrição e nível (Faixa Branca, Azul ou Preta).
            </p>
            <p>
              <strong>2. Adicionar Módulos:</strong> Dentro do curso, crie módulos 
              para organizar o conteúdo (ex: "Nível 1: Fundamentos").
            </p>
            <p>
              <strong>3. Adicionar Aulas:</strong> Em cada módulo, adicione aulas 
              com vídeo do Panda Video.
            </p>
            <p>
              <strong>4. Criar Quiz:</strong> Adicione quizzes com imagens de ECG, 
              opções de resposta e vídeo de explicação.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

