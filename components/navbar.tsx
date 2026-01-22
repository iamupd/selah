'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface UserProfile {
  email?: string
  name?: string
  team_name?: string
}

export default function Navbar() {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (!error && data.session?.user) {
          // 프로필 정보 가져오기
          const { data: profileData, error: profileError } = await supabase
            .from('user_profiles')
            .select('name, team_name')
            .eq('id', data.session.user.id)
            .single()
          
          if (profileError) {
            console.error('Profile fetch error:', profileError)
            // 프로필이 없어도 이메일은 표시
            setProfile({ 
              email: data.session.user.email ?? undefined,
              name: undefined,
              team_name: undefined,
            })
          } else {
            setProfile({ 
              email: data.session.user.email ?? undefined,
              name: profileData?.name,
              team_name: profileData?.team_name,
            })
          }
        } else {
          setProfile(null)
        }
      } catch (err) {
        console.error('Profile fetch error:', err)
        setProfile(null)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()

    // 인증 상태 변경 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchProfile()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setProfile(null)
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="border-b border-gray-200 bg-white sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="flex h-14 md:h-16 items-center justify-between">
          <Link href="/dashboard" className="text-lg md:text-xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
            Selah
          </Link>
          
          <div className="flex items-center gap-3 md:gap-4">
            <Link
              href="/songs"
              className="text-xs md:text-sm font-medium text-gray-700 hover:text-blue-600 active:text-blue-700 transition-colors"
            >
              악보
            </Link>
            <Link
              href="/setlists"
              className="text-xs md:text-sm font-medium text-gray-700 hover:text-blue-600 active:text-blue-700 transition-colors"
            >
              콘티
            </Link>
            
            {!loading && profile && (
              <div className="flex items-center gap-2 md:gap-3 pl-3 md:pl-4 border-l border-gray-200">
                <div className="flex flex-col items-end text-right min-w-0">
                  <span className="text-xs md:text-sm font-semibold text-gray-900 truncate max-w-[120px] md:max-w-[180px]">
                    {profile.name || '사용자'}
                  </span>
                  {profile.team_name && (
                    <span className="text-xs text-gray-600 truncate max-w-[120px] md:max-w-[180px]">
                      {profile.team_name}
                    </span>
                  )}
                  <span className="text-xs text-gray-500 truncate max-w-[120px] md:max-w-[180px]" title={profile.email}>
                    {profile.email}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="text-xs md:text-sm h-8 md:h-9 px-2 md:px-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
                  로그아웃
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
