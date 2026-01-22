import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname
  
  // 홈은 누구나 접근 가능
  if (pathname === '/') {
    return NextResponse.next()
  }

  // 콘티 공유 링크는 누구나 접근 가능 (단, edit 모드는 제외)
  if (pathname.startsWith('/setlists/') && !req.nextUrl.searchParams.has('mode')) {
    return NextResponse.next()
  }

  // 응답 객체를 먼저 만들어 쿠키 설정 가능하게 함
  const res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  // Supabase 세션 확인 (middleware에서는 createServerClient 사용)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookies) {
          cookies.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // 로그인되지 않은 경우 /auth 로 이동
  if (!session) {
    const redirectUrl = new URL('/auth', req.url)
    redirectUrl.searchParams.set('next', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

// 정적 파일, API, 인증 경로는 제외
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|auth|auth/callback|api|public).*)',
  ],
}
