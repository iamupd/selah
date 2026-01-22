'use client'

import { useEffect, useMemo, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

interface Profile {
  email?: string
}

function AuthPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(
    searchParams.get('error')
  )

  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    let isMounted = true
    
    const fetchSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (!isMounted) return
        
        if (!error && data.session?.user) {
          setProfile({ email: data.session.user.email ?? undefined })
          // 세션이 있으면 자동으로 dashboard로 리다이렉트
          const next = searchParams.get('next') || '/dashboard'
          router.push(next)
          return
        } else {
          setProfile(null)
        }
      } catch (err) {
        console.error('Session fetch error:', err)
        if (isMounted) {
          setProfile(null)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    // 타임아웃 안전장치 (5초 후 강제로 로딩 해제)
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        console.warn('Session fetch timeout, showing login button')
        setLoading(false)
      }
    }, 5000)

    fetchSession()

    return () => {
      isMounted = false
      clearTimeout(timeoutId)
    }
  }, [supabase, router, searchParams])

  const handleSignIn = async () => {
    try {
      setErrorMessage(null)
      const envUrl = process.env.NEXT_PUBLIC_APP_URL;
      const origin = (envUrl && !envUrl.includes('localhost')) ? envUrl : window.location.origin;
      const next = searchParams.get('next') || '/dashboard'
      const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(next)}`
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
        },
      })
      
      if (error) {
        // Google Provider가 활성화되지 않은 경우 더 명확한 메시지 표시
        if (error.message.includes('provider is not enabled') || error.message.includes('Unsupported provider')) {
          setErrorMessage('Google 로그인이 설정되지 않았습니다. Supabase Dashboard에서 Google Provider를 활성화해주세요. 자세한 내용은 SUPABASE_AUTH_SETUP.md 파일을 참고하세요.')
        } else {
          setErrorMessage(`로그인 오류: ${error.message}`)
        }
        console.error('Sign in error:', error)
      }
      // 에러가 없으면 OAuth 리다이렉트가 시작되므로 여기서는 아무것도 하지 않음
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.'
      setErrorMessage(`로그인 중 오류가 발생했습니다: ${errorMessage}`)
      console.error('Sign in exception:', err)
    }
  }

  const handleSignOut = async () => {
    setLoading(true)
    await supabase.auth.signOut()
    setProfile(null)
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="container mx-auto max-w-md px-4 py-8">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>로그인</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {errorMessage && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
              {errorMessage}
            </p>
          )}

          {loading ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">세션 확인 중...</p>
              <p className="text-xs text-gray-400">잠시만 기다려주세요...</p>
            </div>
          ) : profile ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-700">
                로그인됨: <span className="font-medium">{profile.email}</span>
              </p>
              <Button variant="outline" onClick={handleSignOut} className="w-full">
                로그아웃
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                구글 계정으로 로그인하여 콘티 수정 기능을 이용하세요.
              </p>
              <Button onClick={handleSignIn} className="w-full">
                Google로 로그인
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto max-w-md px-4 py-8">
        <Card className="shadow-md">
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">로딩 중...</p>
          </CardContent>
        </Card>
      </div>
    }>
      <AuthPageContent />
    </Suspense>
  )
}
