import { revalidateTag } from "next/cache"
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * API para revalidar o cache do Next.js
 * Chamada automaticamente quando dados são alterados no admin
 * 
 * POST /api/revalidate
 * Body: { tags: ["courses"] } ou { tags: ["courses", "lessons", "quizzes"] }
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar se o usuário é admin
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      )
    }

    // Verificar se é admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profile?.role !== "admin") {
      return NextResponse.json(
        { error: "Acesso negado" },
        { status: 403 }
      )
    }

    // Obter tags para revalidar
    const body = await request.json()
    const tags = body.tags || ["courses", "lessons", "quizzes"]

    // Revalidar cada tag
    for (const tag of tags) {
      revalidateTag(tag)
    }

    return NextResponse.json({
      success: true,
      message: `Cache revalidado para: ${tags.join(", ")}`,
      revalidatedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error("Erro ao revalidar cache:", error)
    return NextResponse.json(
      { error: "Erro interno ao revalidar cache" },
      { status: 500 }
    )
  }
}

/**
 * Revalida todo o cache - GET simples para testes
 * GET /api/revalidate?secret=your-secret
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get("secret")

  // Em produção, use uma variável de ambiente para o secret
  const expectedSecret = process.env.REVALIDATE_SECRET || "clube-do-ecg-revalidate"

  if (secret !== expectedSecret) {
    return NextResponse.json(
      { error: "Token inválido" },
      { status: 401 }
    )
  }

  // Revalidar todas as tags
  const tags = ["courses", "lessons", "quizzes", "all-courses"]
  for (const tag of tags) {
    revalidateTag(tag)
  }

  return NextResponse.json({
    success: true,
    message: "Todo o cache foi revalidado",
    tags,
    revalidatedAt: new Date().toISOString()
  })
}

