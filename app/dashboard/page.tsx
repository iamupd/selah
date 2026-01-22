'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Music, List, BookOpen } from "lucide-react";
import { createClient } from '@/lib/supabase/client'

export default function DashboardPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [userRole, setUserRole] = useState<string | null>(null)
  const [roleToast, setRoleToast] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserRole = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()
        
        setUserRole(profile?.role ?? null)
      }
    }
    fetchUserRole()
  }, [supabase])

  const handleNewSetlist = (e: React.MouseEvent) => {
    e.preventDefault()
    if (userRole === '인도자') {
      router.push('/setlists/new')
    } else {
      setRoleToast('콘티 등록은 인도자만 가능합니다.')
      setTimeout(() => setRoleToast(null), 3000)
    }
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto max-w-4xl px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Selah
          </h1>
          <p className="text-lg text-gray-600">
            서울-안디옥교회 찬양팀을 위한 간편한 콘티 관리 서비스
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Music className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>악보 목록</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                등록된 모든 악보를 확인하세요
              </p>
              <Link href="/songs">
                <Button className="w-full">악보 목록 보기</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <List className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>콘티 목록</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                모든 콘티를 관리하고 공유하세요
              </p>
              <Link href="/setlists">
                <Button className="w-full">콘티 목록 보기</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Music className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>악보 등록</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                이미지를 업로드하거나 붙여넣어 악보를 등록하세요
              </p>
              <Link href="/songs/new">
                <Button variant="outline" className="w-full">악보 등록하기</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <List className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>콘티 만들기</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                예배 정보를 입력하고 찬양 곡을 추가하세요
              </p>
              <Button variant="outline" className="w-full" onClick={handleNewSetlist}>
                콘티 만들기
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Link href="/guide">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg mb-1 text-blue-900">사용 가이드</h3>
                    <p className="text-sm text-blue-700">
                      Selah 서비스 사용 방법을 확인하세요
                    </p>
                  </div>
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>

      {roleToast && (
        <div className="fixed inset-x-0 bottom-6 flex justify-center px-4 pointer-events-none z-50">
          <div className="bg-red-600 text-white text-sm px-4 py-2 rounded-full shadow-lg opacity-90 animate-fade-in-out">
            {roleToast}
          </div>
        </div>
      )}
    </div>
  );
}
