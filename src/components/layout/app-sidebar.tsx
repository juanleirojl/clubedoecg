"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  BookOpen,
  Crown,
  Heart,
  Home,
  LogOut,
  Settings,
  Shield,
  Trophy,
  User,
  HelpCircle,
  Sparkles,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { getCurrentCourseProgress } from "@/lib/supabase/progress"

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Meus Cursos", url: "/cursos", icon: BookOpen },
  { title: "Conquistas", url: "/conquistas", icon: Trophy },
]

// Configuração dos planos
const planConfig = {
  free: {
    label: "Plano Gratuito",
    color: "bg-slate-100 text-slate-600",
    icon: null,
  },
  basic: {
    label: "Plano Básico",
    color: "bg-blue-100 text-blue-700",
    icon: Sparkles,
  },
  pro: {
    label: "Plano PRO",
    color: "bg-gradient-to-r from-amber-400 to-orange-500 text-white",
    icon: Crown,
  },
}

interface UserProfile {
  id: string
  email: string
  full_name: string
  avatar_url: string
  role: string
  subscription_plan: string
}

interface CourseProgress {
  courseName: string
  belt: "white" | "blue" | "black"
  progressPercentage: number
  slug: string
}

// Configuração das faixas
const beltConfig = {
  white: { name: "Faixa Branca", emoji: "🥋", gradient: "from-gray-100 to-gray-200", border: "border-gray-300" },
  blue: { name: "Faixa Azul", emoji: "🥋", gradient: "from-blue-100 to-blue-200", border: "border-blue-400" },
  black: { name: "Faixa Preta", emoji: "🥋", gradient: "from-gray-800 to-gray-900", border: "border-gray-700" },
}

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [courseProgress, setCourseProgress] = useState<CourseProgress | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  // Evita mismatch de hidratação
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Carregar perfil
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()
        
        if (profileData) {
          setProfile(profileData)
        }

        // Carregar progresso do curso atual
        const progress = await getCurrentCourseProgress()
        if (progress) {
          setCourseProgress(progress)
        }
      }
      
      setIsLoading(false)
    }
    
    loadData()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  const plan = profile?.subscription_plan || "free"
  const planInfo = planConfig[plan as keyof typeof planConfig] || planConfig.free
  const PlanIcon = planInfo.icon
  
  const initials = profile?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?"

  return (
    <Sidebar className="border-r border-border bg-white">
      <SidebarHeader className="p-4 border-b">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <Heart className="h-6 w-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-foreground">
              Clube do ECG
            </span>
            <span className="text-xs text-muted-foreground">
              Método CAMPOS-ECG™
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="p-2">
        {/* Current Belt Progress */}
        {courseProgress && (
          <Link href={`/cursos/${courseProgress.slug}`} className="block">
            <div className="p-4 m-2 rounded-xl bg-slate-50 border hover:bg-slate-100 transition-colors cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${beltConfig[courseProgress.belt].gradient} border-2 ${beltConfig[courseProgress.belt].border} flex items-center justify-center`}>
                  <span className="text-lg">{beltConfig[courseProgress.belt].emoji}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{beltConfig[courseProgress.belt].name}</p>
                  <p className="text-xs text-muted-foreground">{courseProgress.progressPercentage}% concluído</p>
                </div>
              </div>
              <Progress value={courseProgress.progressPercentage} className="h-2" />
            </div>
          </Link>
        )}
        {!courseProgress && !isLoading && (
          <Link href="/cursos" className="block">
            <div className="p-4 m-2 rounded-xl bg-slate-50 border hover:bg-slate-100 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-300 flex items-center justify-center">
                  <span className="text-lg">🥋</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Comece sua jornada</p>
                  <p className="text-xs text-muted-foreground">Escolha um curso</p>
                </div>
              </div>
            </div>
          </Link>
        )}

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs text-muted-foreground uppercase tracking-wider px-4">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    className="rounded-lg mx-2 transition-colors"
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Menu - só aparece se o usuário for admin */}
        {profile?.role === "admin" && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs text-muted-foreground uppercase tracking-wider px-4">
              Admin
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith("/admin")}
                    className="rounded-lg mx-2 transition-colors"
                  >
                    <Link href="/admin">
                      <Shield className="h-4 w-4" />
                      <span>Painel Admin</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel className="text-xs text-muted-foreground uppercase tracking-wider px-4">
            Suporte
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="rounded-lg mx-2">
                  <Link href="/ajuda">
                    <HelpCircle className="h-4 w-4" />
                    <span>Ajuda</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t">
        {isMounted ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center gap-3 rounded-xl p-2 hover:bg-slate-50 transition-colors">
                <Avatar className="h-10 w-10 border-2 border-slate-200">
                  <AvatarImage src={profile?.avatar_url || ""} />
                  <AvatarFallback className="bg-primary text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start text-sm flex-1 min-w-0">
                  <span className="font-medium text-foreground truncate w-full">
                    {profile?.full_name || "Usuário"}
                  </span>
                  <Badge className={`text-[10px] px-1.5 py-0 ${planInfo.color} border-0`}>
                    {PlanIcon && <PlanIcon className="h-3 w-3 mr-1" />}
                    {planInfo.label}
                  </Badge>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link href="/perfil">
                  <User className="mr-2 h-4 w-4" />
                  Meu Perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/configuracoes">
                  <Settings className="mr-2 h-4 w-4" />
                  Configurações
                </Link>
              </DropdownMenuItem>
              {profile?.role === "admin" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/admin">
                      <Shield className="mr-2 h-4 w-4" />
                      Painel Admin
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive cursor-pointer"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex w-full items-center gap-3 rounded-xl p-2">
            <div className="h-10 w-10 rounded-full bg-slate-200 animate-pulse" />
            <div className="flex flex-col gap-1 flex-1">
              <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
              <div className="h-3 w-16 bg-slate-200 rounded animate-pulse" />
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
