"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { User } from "@supabase/supabase-js"
import { ROUTES } from "@/lib/constants"
import { useRouter } from "next/navigation"

interface Profile {
  id: string
  name: string
  avatar_url: string | null
  role: "user" | "admin"
  subscription_type: "free" | "monthly" | "yearly"
}

interface UseAuthReturn {
  user: User | null
  profile: Profile | null
  isLoading: boolean
  isAdmin: boolean
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

/**
 * Hook para gerenciar autenticação
 * Fornece estado do usuário, perfil e funções de auth
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("id, name, avatar_url, role, subscription_type")
      .eq("id", userId)
      .single()
    
    if (data) {
      setProfile(data as Profile)
    }
  }, [supabase])

  const refreshUser = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        await fetchProfile(user.id)
      } else {
        setProfile(null)
      }
    } finally {
      setIsLoading(false)
    }
  }, [supabase, fetchProfile])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    router.push(ROUTES.LOGIN)
  }, [supabase, router])

  useEffect(() => {
    refreshUser()

    // Escutar mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          setUser(session.user)
          await fetchProfile(session.user.id)
        } else if (event === "SIGNED_OUT") {
          setUser(null)
          setProfile(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase, refreshUser, fetchProfile])

  return {
    user,
    profile,
    isLoading,
    isAdmin: profile?.role === "admin",
    signOut,
    refreshUser,
  }
}

