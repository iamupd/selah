import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') || '/dashboard'
  const envUrl = process.env.NEXT_PUBLIC_APP_URL;
  const baseUrl = (envUrl && !envUrl.includes('localhost')) ? envUrl : origin;

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/auth?error=missing_code`)
  }

  const cookieStore = await cookies()
  
  // 응답 객체를 먼저 생성하여 쿠키를 설정할 수 있게 함
  const response = NextResponse.redirect(`${baseUrl}${next}`)
  
  // Route Handler에서 쿠키를 직접 관리
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          // 쿠키를 응답 객체에 설정
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, {
              ...options,
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              path: '/',
            })
          })
        },
      },
    }
  )

  // 코드를 세션으로 교환 (이 과정에서 쿠키가 자동으로 설정됨)
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(
      `${baseUrl}/auth?error=${encodeURIComponent(error.message)}`
    )
  }

  // 세션 확인
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return NextResponse.redirect(
      `${baseUrl}/auth?error=session_not_created`
    )
  }

  return response
}
