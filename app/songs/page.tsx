'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Plus, Loader2, Edit, Trash2, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Song } from '@/types/database'
import { createClient } from '@/lib/supabase/client'

export default function SongsPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredSongs, setFilteredSongs] = useState<Song[]>([])

  useEffect(() => {
    fetchSongs()
    // 현재 사용자 ID 가져오기
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setCurrentUserId(session?.user?.id ?? null)
    }
    fetchUser()
  }, [supabase])

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = songs.filter(
        (song) =>
          song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
          song.key.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredSongs(filtered)
    } else {
      setFilteredSongs(songs)
    }
  }, [searchQuery, songs])

  const fetchSongs = async (query: string = '') => {
    try {
      const url = query ? `/api/songs?q=${encodeURIComponent(query)}` : '/api/songs'
      const response = await fetch(url, { cache: 'no-store' })
      if (response.ok) {
        const data = await response.json()
        setSongs(data)
        setFilteredSongs(data)
      }
    } catch (error) {
      console.error('Fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.trim()) {
      fetchSongs(query)
    } else {
      fetchSongs()
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">악보 목록</h1>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:flex-initial md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="곡명, 아티스트, Key로 검색..."
              className="pl-10"
            />
          </div>
          <Button onClick={() => router.push('/songs/new')}>
            <Plus className="mr-2 h-4 w-4" />
            새 악보
          </Button>
        </div>
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
              {filteredSongs.length === 0 && searchQuery ? (
                <div className="px-4 py-8 text-center text-gray-500">
                  검색 결과가 없습니다.
                </div>
              ) : (
                filteredSongs.map((song) => (
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
              )))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
