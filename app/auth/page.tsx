'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

interface Profile {
  email?: string
}

export default function AuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(
    searchParams.get('error')
  )

  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    const fetchSession = async () => {
      const { data, error } = await supabase.auth.getSession()
      if (!error && data.session?.user) {
        setProfile({ email: data.session.user.email ?? undefined })
      } else {
        setProfile(null)
      }
      setLoading(false)
    }

    fetchSession()
  }, [supabase])

  const handleSignIn = async () => {
    const origin = window.location.origin
    const redirectTo = `${origin}/auth/callback?next=/dashboard`
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
        setErrorMessage(error.message)
      }
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
            <p className="text-sm text-gray-600">세션 확인 중...</p>
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
