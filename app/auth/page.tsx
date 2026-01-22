'use client'

import { useEffect, useMemo, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'

interface Profile {
  email?: string
  name?: string
  team_name?: string
}

function AuthPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(
    searchParams.get('error')
  )
  const [isSignUp, setIsSignUp] = useState(false)
  
  // 회원가입 폼 상태
  const [signUpData, setSignUpData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    teamName: '',
  })
  
  // 로그인 폼 상태
  const [signInData, setSignInData] = useState({
    email: '',
    password: '',
  })

  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    let isMounted = true
    
    const fetchSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (!isMounted) return
        
        if (!error && data.session?.user) {
          // 프로필 정보 가져오기
          const { data: profileData } = await supabase
            .from('user_profiles')
            .select('name, team_name')
            .eq('id', data.session.user.id)
            .single()
          
          setProfile({ 
            email: data.session.user.email ?? undefined,
            name: profileData?.name,
            team_name: profileData?.team_name,
          })
          
          // 세션이 있으면 자동으로 dashboard로 리다이렉트
          const next = searchParams.get('next') || '/dashboard'
          window.location.href = next
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

    // 타임아웃 안전장치 (3초 후 강제로 로딩 해제)
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        console.warn('Session fetch timeout, showing login form')
        setLoading(false)
      }
    }, 3000)

    fetchSession()

    return () => {
      isMounted = false
      clearTimeout(timeoutId)
    }
  }, [supabase, router, searchParams])

  // 비밀번호 검증 (6자 이상, 특수문자 포함)
  const validatePassword = (password: string): string | null => {
    if (password.length < 6) {
      return '비밀번호는 6자 이상이어야 합니다.'
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return '비밀번호에 특수문자가 포함되어야 합니다.'
    }
    return null
  }

  const handleSignUp = async () => {
    try {
      setErrorMessage(null)
      
      // 입력 검증
      if (!signUpData.email || !signUpData.password || !signUpData.name || !signUpData.teamName) {
        setErrorMessage('모든 필드를 입력해주세요.')
        return
      }
      
      if (signUpData.password !== signUpData.confirmPassword) {
        setErrorMessage('비밀번호가 일치하지 않습니다.')
        return
      }
      
      const passwordError = validatePassword(signUpData.password)
      if (passwordError) {
        setErrorMessage(passwordError)
        return
      }

      setLoading(true)
      
      // 회원가입
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: signUpData.email,
        password: signUpData.password,
      })

      if (authError) {
        setErrorMessage(`회원가입 오류: ${authError.message}`)
        setLoading(false)
        return
      }

      if (!authData.user) {
        setErrorMessage('회원가입에 실패했습니다.')
        setLoading(false)
        return
      }

      // 프로필 정보 저장
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          name: signUpData.name,
          team_name: signUpData.teamName,
        })

      if (profileError) {
        console.error('Profile creation error:', profileError)
        // 프로필 생성 실패해도 계정은 생성되었으므로 계속 진행
      }

      // 회원가입 성공 후 자동 로그인
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: signUpData.email,
        password: signUpData.password,
      })

      if (signInError) {
        setErrorMessage(`로그인 오류: ${signInError.message}`)
        setLoading(false)
        return
      }

      // 대시보드로 리다이렉트
      const next = searchParams.get('next') || '/dashboard'
      window.location.href = next
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.'
      setErrorMessage(`회원가입 중 오류가 발생했습니다: ${errorMessage}`)
      console.error('Sign up exception:', err)
      setLoading(false)
    }
  }

  const handleSignIn = async () => {
    try {
      setErrorMessage(null)
      
      if (!signInData.email || !signInData.password) {
        setErrorMessage('이메일과 비밀번호를 입력해주세요.')
        return
      }

      setLoading(true)
      
      const { error } = await supabase.auth.signInWithPassword({
        email: signInData.email,
        password: signInData.password,
      })
      
      if (error) {
        setErrorMessage(`로그인 오류: ${error.message}`)
        setLoading(false)
        return
      }

      // 대시보드로 리다이렉트
      const next = searchParams.get('next') || '/dashboard'
      window.location.href = next
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.'
      setErrorMessage(`로그인 중 오류가 발생했습니다: ${errorMessage}`)
      console.error('Sign in exception:', err)
      setLoading(false)
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
          <CardTitle>{isSignUp ? '회원가입' : '로그인'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {errorMessage && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
              {errorMessage}
            </p>
          )}

          {loading ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">처리 중...</p>
              <p className="text-xs text-gray-400">잠시만 기다려주세요...</p>
            </div>
          ) : profile ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-700">
                로그인됨: <span className="font-medium">{profile.email}</span>
              </p>
              {profile.name && (
                <p className="text-sm text-gray-600">
                  {profile.name} ({profile.team_name})
                </p>
              )}
              <Button variant="outline" onClick={handleSignOut} className="w-full">
                로그아웃
              </Button>
            </div>
          ) : isSignUp ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">이메일</label>
                <Input
                  type="email"
                  placeholder="이메일을 입력하세요"
                  value={signUpData.email}
                  onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">비밀번호 (6자 이상, 특수문자 포함)</label>
                <Input
                  type="password"
                  placeholder="비밀번호를 입력하세요"
                  value={signUpData.password}
                  onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">비밀번호 확인</label>
                <Input
                  type="password"
                  placeholder="비밀번호를 다시 입력하세요"
                  value={signUpData.confirmPassword}
                  onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">이름</label>
                <Input
                  type="text"
                  placeholder="이름을 입력하세요"
                  value={signUpData.name}
                  onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">소속 찬양팀명</label>
                <Input
                  type="text"
                  placeholder="찬양팀명을 입력하세요"
                  value={signUpData.teamName}
                  onChange={(e) => setSignUpData({ ...signUpData, teamName: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSignUp} className="flex-1">
                  회원가입
                </Button>
                <Button variant="outline" onClick={() => setIsSignUp(false)} className="flex-1">
                  로그인으로
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">이메일</label>
                <Input
                  type="email"
                  placeholder="이메일을 입력하세요"
                  value={signInData.email}
                  onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">비밀번호</label>
                <Input
                  type="password"
                  placeholder="비밀번호를 입력하세요"
                  value={signInData.password}
                  onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSignIn()
                    }
                  }}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSignIn} className="flex-1">
                  로그인
                </Button>
                <Button variant="outline" onClick={() => setIsSignUp(true)} className="flex-1">
                  회원가입
                </Button>
              </div>
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
