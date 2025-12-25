import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    
    // Troca o código pelo token de sessão
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error("Erro ao trocar código:", error)
      return NextResponse.redirect(`${origin}/login?error=auth_error`)
    }

    // Verifica se o usuário tem perfil, se não, cria
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single()

      // Se não tiver perfil, cria
      if (!profile) {
        await supabase.from("profiles").insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || "",
          avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || "",
          role: "user",
        })
      }
    }
  }

  // Redireciona para o dashboard
  return NextResponse.redirect(`${origin}/dashboard`)
}



