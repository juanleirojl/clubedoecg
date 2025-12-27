"use client"

import { Bell, Search, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function Header() {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-white px-4 md:px-6">
      <SidebarTrigger className="-ml-1" />
      
      <div className="flex flex-1 items-center gap-4 md:gap-6">
        {/* Search Bar */}
        <div className="relative hidden md:flex flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar aulas, quizzes..."
            className="pl-10 bg-slate-50 border-slate-200"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-white">
              2
            </span>
          </Button>
          
          {/* Upgrade CTA */}
          <Button className="hidden md:flex bg-gradient-to-r from-primary to-red-600 hover:from-red-600 hover:to-red-700 shadow-sm">
            <Sparkles className="h-4 w-4 mr-2" />
            Assinar Clube
          </Button>
        </div>
      </div>
    </header>
  )
}
