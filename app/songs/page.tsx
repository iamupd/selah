'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Plus, Loader2, Edit, Trash2 } from 'lucide-react'
import { Song } from '@/types/database'
import { createClient } from '@/lib/supabase/client'

export default function SongsPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    fetchSongs()
    // 현재 사용자 ID 가져오기
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setCurrentUserId(session?.user?.id ?? null)
    }
    fetchUser()
  }, [supabase])

  const fetchSongs = async () => {
    try {
      const response = await fetch('/api/songs', { cache: 'no-store' })
      if (response.ok) {
        const data = await response.json()
        setSongs(data)
      }
    } catch (error) {
      console.error('Fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}" 악보를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
      return
    }

    setDeletingId(id)
    try {
      const response = await fetch(`/api/songs/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || '삭제 실패'
        const errorDetails = errorData.details ? `\n상세: ${errorData.details}` : ''
        throw new Error(`${errorMessage}${errorDetails}`)
      }

      // 목록에서 제거
      setSongs(songs.filter((song) => song.id !== id))
    } catch (error) {
      console.error('Delete error:', error)
      const errorMessage = error instanceof Error ? error.message : '악보 삭제에 실패했습니다.'
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
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">악보 목록</h1>
        <Button onClick={() => router.push('/songs/new')}>
          <Plus className="mr-2 h-4 w-4" />
          새 악보
        </Button>
      </div>

      {songs.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500 py-8">
              등록된 악보가 없습니다.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-200">
              {songs.map((song) => (
                <div
                  key={song.id}
                  className="flex flex-col gap-2 px-3 py-3 md:px-4 md:py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2 text-sm text-gray-900">
                    <span className="font-semibold truncate">{song.title}</span>
                    <span className="text-gray-400">·</span>
                    <span className="truncate text-gray-700">{song.artist}</span>
                    <span className="text-gray-400">·</span>
                    <span className="text-gray-700">Key: {song.key}</span>
                  </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                    <span>송폼: {song.song_form || '-'}</span>
                    <span>BPM: {song.bpm ?? '-'}</span>
                    <span>박자: {song.time_signature || '-'}</span>
                    {song.description ? (
                      <span className="truncate max-w-full text-gray-700">
                        설명: {song.description}
                      </span>
                    ) : (
                      <span className="text-gray-400">설명 없음</span>
                    )}
                      {song.author_email ? (
                        <span className="text-gray-500">작성자: {song.author_email}</span>
                      ) : song.author_id ? (
                        <span className="text-gray-500">
                          작성자: {song.author_id.substring(0, 8)}...
                        </span>
                      ) : (
                        <span className="text-gray-400">작성자 정보 없음</span>
                      )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/songs/${song.id}/edit`)}
                      className="flex-1"
                    >
                      <Edit className="mr-1 h-3 w-3" />
                      수정
                    </Button>
                    {(currentUserId === song.author_id || !song.author_id) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(song.id, song.title)}
                        disabled={deletingId === song.id}
                        className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        {deletingId === song.id ? (
                          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="mr-1 h-3 w-3" />
                        )}
                        삭제
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
