import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json({ exists: false }, { status: 200 })
    }

    const supabase = await createClient()
    
    // Supabase Admin API를 사용하여 이메일 존재 여부 확인
    // 하지만 클라이언트에서는 직접 확인할 수 없으므로,
    // Service Role Key를 사용하는 별도 엔드포인트가 필요합니다.
    // 여기서는 간단하게 항상 false를 반환하고,
    // 실제 중복은 회원가입 시도 시 확인합니다.
    
    // 실제 구현을 위해서는 Service Role Key가 필요하지만,
    // 보안상 클라이언트에서 직접 호출하는 것은 권장하지 않습니다.
    
    return NextResponse.json({ exists: false }, { status: 200 })
  } catch (error) {
    console.error('Email check error:', error)
    return NextResponse.json({ exists: false }, { status: 200 })
  }
}
