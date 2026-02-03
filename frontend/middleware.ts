import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Verificar se as variáveis de ambiente estão configuradas
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Se as variáveis não estiverem configuradas, permitir acesso sem autenticação
  if (!supabaseUrl || !supabaseAnonKey) {
    return response
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Rotas públicas que não requerem autenticação
  const publicRoutes = ['/login', '/reset-password']
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  // Se o usuário não está logado e não está em uma rota pública, redireciona para login
  if (!user && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Se o usuário está logado e está tentando acessar a página de login, redireciona para home
  if (user && request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Rotas que requerem role admin
  const adminOnlyRoutes = ['/usuarios']
  const adminOnlySubRoutes = ['/configuracoes/bairros'] // Sub-rotas de configurações que requerem admin
  const isAdminOnlyRoute = adminOnlyRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )
  const isAdminOnlySubRoute = adminOnlySubRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  )

  // Verificar se o usuário está ativo (para todas as rotas protegidas)
  if (user && !isPublicRoute) {
    const { data: userData } = await supabase
      .from('users')
      .select('is_active, role')
      .eq('id', user.id)
      .single()

    // Se o usuário não existir ou estiver inativo, fazer logout e redirecionar para login
    if (!userData || !userData.is_active) {
      // Limpar sessão usando o método do Supabase
      await supabase.auth.signOut()
      
      // Criar resposta de redirecionamento para login com mensagem
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('error', 'inactive')
      const redirectResponse = NextResponse.redirect(loginUrl)
      
      return redirectResponse
    }

    // Se a rota requer admin, verificar o role do usuário
    if (isAdminOnlyRoute && userData.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Se a sub-rota requer admin, verificar o role do usuário
    if (isAdminOnlySubRoute && userData.role !== 'admin') {
      return NextResponse.redirect(new URL('/configuracoes', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
