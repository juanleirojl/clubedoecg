"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { 
  User, 
  Mail, 
  Calendar, 
  BookOpen, 
  Clock, 
  Trophy, 
  Star,
  TrendingUp,
  Award,
  Settings,
  Edit3,
  CheckCircle2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useUser, useCourses } from "@/contexts/user-context"
import { cn } from "@/lib/utils"

export default function PerfilPage() {
  const { user, profile } = useUser()
  const { courses } = useCourses()
  
  // Calcular estatísticas
  const totalCourses = courses.length
  const coursesInProgress = courses.filter(c => c.progress > 0 && c.progress < 100).length
  const coursesCompleted = courses.filter(c => c.progress >= 100).length
  const totalLessonsCompleted = courses.reduce((acc, c) => acc + c.completedLessons, 0)
  const totalLessons = courses.reduce((acc, c) => acc + c.totalLessons, 0)
  
  // Calcular horas assistidas (estimativa baseada em lições completadas)
  const hoursWatched = Math.round(totalLessonsCompleted * 0.25) // ~15 min por lição
  
  // Nível do usuário baseado em progresso
  const overallProgress = totalLessons > 0 ? Math.round((totalLessonsCompleted / totalLessons) * 100) : 0
  const userLevel = overallProgress < 20 ? "Iniciante" : overallProgress < 50 ? "Intermediário" : overallProgress < 80 ? "Avançado" : "Mestre"
  
  // Conquistas
  const achievements = [
    { 
      id: 1, 
      name: "Primeiro Passo", 
      description: "Completou sua primeira aula",
      icon: "🎯",
      unlocked: totalLessonsCompleted >= 1
    },
    { 
      id: 2, 
      name: "Dedicado", 
      description: "Assistiu 5 aulas",
      icon: "📚",
      unlocked: totalLessonsCompleted >= 5
    },
    { 
      id: 3, 
      name: "Estudante Aplicado", 
      description: "Completou 10 aulas",
      icon: "🌟",
      unlocked: totalLessonsCompleted >= 10
    },
    { 
      id: 4, 
      name: "Faixa Branca", 
      description: "Completou o curso Faixa Branca",
      icon: "🥋",
      unlocked: courses.find(c => c.difficulty === "iniciante")?.progress === 100
    },
    { 
      id: 5, 
      name: "Maratonista", 
      description: "Assistiu 5 horas de conteúdo",
      icon: "⏱️",
      unlocked: hoursWatched >= 5
    },
    { 
      id: 6, 
      name: "Expert ECG", 
      description: "Completou todos os cursos",
      icon: "🏆",
      unlocked: coursesCompleted === totalCourses && totalCourses > 0
    },
  ]
  
  const unlockedAchievements = achievements.filter(a => a.unlocked).length

  // Data de entrada formatada
  const memberSince = user?.created_at 
    ? new Date(user.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    : "Dezembro 2024"

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* Header do Perfil */}
      <div className="relative">
        {/* Banner */}
        <div className="h-32 md:h-40 bg-gradient-to-r from-red-600 via-red-500 to-orange-500 rounded-xl overflow-hidden">
          <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />
        </div>
        
        {/* Avatar e Info */}
        <div className="relative px-6 pb-6">
          <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-16 md:-mt-12">
            {/* Avatar */}
            <div className="relative">
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-white dark:border-slate-900 overflow-hidden bg-slate-200 shadow-xl">
                {profile?.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={profile.full_name || "Avatar"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-500 to-orange-500 text-white text-4xl font-bold">
                    {(profile?.full_name || user?.email || "U")[0].toUpperCase()}
                  </div>
                )}
              </div>
              {/* Nível Badge */}
              <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                {userLevel}
              </div>
            </div>
            
            {/* Info */}
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                {profile?.full_name || "Usuário"}
              </h1>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-muted-foreground text-sm">
                <span className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {user?.email}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Membro desde {memberSince}
                </span>
              </div>
            </div>
            
            {/* Ações */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/configuracoes">
                  <Settings className="w-4 h-4 mr-2" />
                  Configurações
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-foreground">{coursesInProgress}</p>
            <p className="text-xs text-muted-foreground">Cursos em Andamento</p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-foreground">{coursesCompleted}</p>
            <p className="text-xs text-muted-foreground">Cursos Completos</p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-foreground">{hoursWatched}h</p>
            <p className="text-xs text-muted-foreground">Horas Assistidas</p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-foreground">{unlockedAchievements}</p>
            <p className="text-xs text-muted-foreground">Conquistas</p>
          </CardContent>
        </Card>
      </div>

      {/* Progresso Geral */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Progresso Geral
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {totalLessonsCompleted} de {totalLessons} aulas completadas
              </span>
              <span className="font-medium text-primary">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
            
            {/* Cursos individuais */}
            <div className="grid gap-3 mt-6">
              {courses.map((course) => (
                <div key={course.id} className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold",
                    course.difficulty === "iniciante" ? "bg-white border-2 border-gray-300 text-gray-800" :
                    course.difficulty === "intermediario" ? "bg-blue-500 text-white" :
                    "bg-gray-900 text-white"
                  )}>
                    🥋
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{course.title}</span>
                      <span className="text-muted-foreground">{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conquistas */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" />
            Conquistas
            <span className="text-sm font-normal text-muted-foreground">
              ({unlockedAchievements}/{achievements.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <div 
                key={achievement.id}
                className={cn(
                  "p-4 rounded-xl border-2 text-center transition-all",
                  achievement.unlocked 
                    ? "border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20" 
                    : "border-slate-200 dark:border-slate-700 opacity-50 grayscale"
                )}
              >
                <div className="text-3xl mb-2">{achievement.icon}</div>
                <h4 className="font-semibold text-sm">{achievement.name}</h4>
                <p className="text-xs text-muted-foreground mt-1">{achievement.description}</p>
                {achievement.unlocked && (
                  <div className="mt-2">
                    <Star className="w-4 h-4 text-yellow-500 mx-auto fill-yellow-500" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

