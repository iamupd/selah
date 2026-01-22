'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Loader2, Edit, Search, ChevronRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Song } from '@/types/database'
import { createClient } from '@/lib/supabase/client'

export default function SongsPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredSongs, setFilteredSongs] = useState<Song[]>([])

  useEffect(() => {
    fetchSongs()
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

  const handleEdit = (e: React.MouseEvent, songId: string) => {
    e.stopPropagation()
    router.push(`/songs/${songId}/edit`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      {/* 헤더 */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
        <h1 className="text-2xl font-bold">악보 목록</h1>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:flex-initial md:w-56">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="검색..."
              className="pl-9 h-9 text-sm"
            />
          </div>
          <Button size="sm" onClick={() => router.push('/songs/new')}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 곡 수 표시 */}
      <p className="text-xs text-gray-500 mb-2">
        총 {filteredSongs.length}곡
      </p>

      {/* 목록 */}
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
            <div className="divide-y divide-gray-100">
              {filteredSongs.length === 0 && searchQuery ? (
                <div className="px-4 py-8 text-center text-gray-500 text-sm">
                  검색 결과가 없습니다.
                </div>
              ) : (
                filteredSongs.map((song) => {
                  const canEdit = currentUserId === song.author_id || !song.author_id
                  return (
                    <div
                      key={song.id}
                      onClick={() => router.push(`/songs/${song.id}`)}
                      className="flex items-center px-3 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors group"
                    >
                      {/* 곡 정보 - 한 줄 */}
                      <div className="flex-1 min-w-0 flex items-center gap-2">
                        <span className="font-medium text-sm truncate">{song.title}</span>
                        <span className="text-xs text-gray-400">·</span>
                        <span className="text-xs text-gray-500 truncate">{song.artist}</span>
                        <span className="text-xs text-gray-400">·</span>
                        <span className="text-xs text-gray-500 flex-shrink-0">{song.key}</span>
                      </div>

                      {/* 우측 버튼들 */}
                      <div className="flex items-center gap-1 ml-2">
                        {canEdit && (
                          <button
                            onClick={(e) => handleEdit(e, song.id)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="수정"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-400" />
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
