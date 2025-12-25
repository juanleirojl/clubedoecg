"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BookOpen,
  GraduationCap,
  Heart,
  Home,
  LogOut,
  Settings,
  Trophy,
  User,
  HelpCircle,
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

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Meus Cursos", url: "/cursos", icon: BookOpen },
  { title: "Conquistas", url: "/conquistas", icon: Trophy },
]

export function AppSidebar() {
  const pathname = usePathname()

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
        <div className="p-4 m-2 rounded-xl bg-slate-50 border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-300 flex items-center justify-center">
              <span className="text-lg">🥋</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Faixa Branca</p>
              <p className="text-xs text-muted-foreground">35% concluído</p>
            </div>
          </div>
          <Progress value={35} className="h-2" />
        </div>

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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-xl p-2 hover:bg-slate-50 transition-colors">
              <Avatar className="h-10 w-10 border-2 border-slate-200">
                <AvatarImage src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200" />
                <AvatarFallback className="bg-primary text-white">JL</AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start text-sm">
                <span className="font-medium text-foreground">Juan Lorenzo</span>
                <span className="text-xs text-muted-foreground">Plano Gratuito</span>
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
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
