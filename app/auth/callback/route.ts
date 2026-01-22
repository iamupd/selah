import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') || '/dashboard'
  const envUrl = process.env.NEXT_PUBLIC_APP_URL;
  const baseUrl = (envUrl && !envUrl.includes('localhost')) ? envUrl : origin;

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/auth?error=missing_code`)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(
      `${baseUrl}/auth?error=${encodeURIComponent(error.message)}`
    )
  }

  // 세션이 성공적으로 설정되었는지 확인
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return NextResponse.redirect(
      `${baseUrl}/auth?error=session_not_created`
    )
  }

  // 쿠키가 제대로 설정되도록 리다이렉트
  const response = NextResponse.redirect(`${baseUrl}${next}`)
  
  // 세션 쿠키가 제대로 전달되도록 헤더 설정
  return response
}
