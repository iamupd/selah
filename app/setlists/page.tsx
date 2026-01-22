'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Plus, Share2, Loader2, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { createClient } from '@/lib/supabase/client'

interface Setlist {
  id: string
  date: string
  name: string
  author_email?: string
  author_id?: string
  created_at: string
}

export default function SetlistsPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [setlists, setSetlists] = useState<Setlist[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [copyToast, setCopyToast] = useState<string | null>(null)

  const fetchSetlists = async () => {
    try {
      const response = await fetch('/api/setlists')
      if (response.ok) {
        const data = await response.json()
        setSetlists(data)
      }
    } catch (error) {
      console.error('Fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSetlists()
    // 현재 사용자 ID 가져오기
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setCurrentUserId(session?.user?.id ?? null)
    }
    fetchUser()
  }, [supabase])

  const handleShare = (id: string) => {
    const url = `${window.location.origin}/setlists/${id}`
    navigator.clipboard.writeText(url).then(() => {
      setCopyToast('클립보드에 콘티 공유 주소가 복사되었습니다.')
      setTimeout(() => setCopyToast(null), 2000)
    })
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" 콘티를 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
      return
    }

    setDeletingId(id)
    try {
      const response = await fetch(`/api/setlists/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || '삭제 실패')
      }

      // 목록에서 제거
      setSetlists(setlists.filter((setlist) => setlist.id !== id))
    } catch (error) {
      console.error('Delete error:', error)
      const errorMessage = error instanceof Error ? error.message : '콘티 삭제에 실패했습니다.'
      alert(errorMessage)
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">콘티 목록</h1>
        <Button onClick={() => router.push('/setlists/new')}>
          <Plus className="mr-2 h-4 w-4" />
          새 콘티
        </Button>
      </div>

      {setlists.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500 py-8">
              등록된 콘티가 없습니다.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {setlists.map((setlist) => (
            <Card key={setlist.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>{setlist.name}</CardTitle>
                <p className="text-sm text-gray-600">
                  {format(new Date(setlist.date), 'yyyy년 M월 d일')}
                </p>
                {setlist.author_email ? (
                  <p className="text-xs text-gray-500 mt-1">
                    작성자: {setlist.author_email}
                  </p>
                ) : setlist.author_id ? (
                  <p className="text-xs text-gray-500 mt-1">
                    작성자: {setlist.author_id.substring(0, 8)}...
                  </p>
                ) : (
                  <p className="text-xs text-gray-400 mt-1">작성자 정보 없음</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Link href={`/setlists/${setlist.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      보기
                    </Button>
                  </Link>
                  {(currentUserId === setlist.author_id || !setlist.author_id) && (
                    <>
                      <Link href={`/setlists/${setlist.id}?mode=edit`} className="flex-1">
                        <Button variant="outline" className="w-full">
                          수정
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        onClick={() => handleDelete(setlist.id, setlist.name)}
                        disabled={deletingId === setlist.id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="삭제"
                      >
                        {deletingId === setlist.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => handleShare(setlist.id)}
                    title="링크 복사"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {copyToast && (
        <div className="fixed inset-x-0 bottom-6 flex justify-center px-4 pointer-events-none">
          <div className="bg-gray-900 text-white text-sm px-4 py-2 rounded-full shadow-lg opacity-90 animate-fade-in-out">
            {copyToast}
          </div>
        </div>
      )}
    </div>
  )
}
