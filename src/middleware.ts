import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Rotas que precisam de autenticação
const protectedRoutes = ['/dashboard', '/cursos', '/conquistas', '/perfil', '/configuracoes', '/aula', '/quiz']

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Cria response base
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })
  
  // Cria cliente Supabase
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Atualiza sessão e obtém usuário
  const { data: { user } } = await supabase.auth.getUser()

  // =============================================
  // PROTEÇÃO DE ROTAS ADMIN (VERIFICAR PRIMEIRO!)
  // =============================================
  if (pathname.startsWith('/admin')) {
    // Se não está logado, redireciona para login
    if (!user) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Verifica se é admin
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    console.log('[MIDDLEWARE] Admin check:', { userId: user.id, profile, error })

    if (!profile || profile.role !== 'admin') {
      // Não é admin, redireciona para dashboard
      console.log('[MIDDLEWARE] Usuário não é admin, redirecionando...')
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    
    console.log('[MIDDLEWARE] Usuário é admin, permitindo acesso')
  }

  // =============================================
  // PROTEÇÃO DE ROTAS DO DASHBOARD
  // =============================================
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  
  if (isProtectedRoute && !user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // =============================================
  // SE LOGADO, NÃO PODE ACESSAR LOGIN/CADASTRO
  // =============================================
  if (user && (pathname === '/login' || pathname === '/cadastro')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    // Rotas protegidas - ser explícito
    '/dashboard/:path*',
    '/cursos/:path*',
    '/conquistas/:path*',
    '/perfil/:path*',
    '/configuracoes/:path*',
    '/aula/:path*',
    '/quiz/:path*',
    '/admin/:path*',
    '/login',
    '/cadastro',
  ],
}
