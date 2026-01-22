'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Plus, X, Search, Loader2, Youtube } from 'lucide-react'
import { Song } from '@/types/database'
import { createClient } from '@/lib/supabase/client'

export default function NewSetlistPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [date, setDate] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [showDetail, setShowDetail] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Song[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedSongs, setSelectedSongs] = useState<Array<{ song_id: string; song: Song; youtube_url?: string }>>([])
  const [youtubeUrls, setYoutubeUrls] = useState<{ [songId: string]: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [checkingRole, setCheckingRole] = useState(true)

  // 사용자 역할 확인
  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session?.user) {
          router.push('/auth')
          return
        }

        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()

        if (error || !profile) {
          setUserRole(null)
        } else {
          setUserRole(profile.role)
          
          // 인도자가 아니면 콘티 목록으로 리다이렉트
          if (profile.role !== '인도자') {
            router.push('/setlists')
          }
        }
      } catch (error) {
        console.error('Role check error:', error)
        setUserRole(null)
      } finally {
        setCheckingRole(false)
      }
    }

    checkUserRole()
  }, [supabase, router])

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(`/api/songs?q=${encodeURIComponent(query)}`)
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data)
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    handleSearch(query)
  }

  const handleAddSong = (song: Song) => {
    if (!selectedSongs.find((s) => s.song_id === song.id)) {
      setSelectedSongs([...selectedSongs, { song_id: song.id, song, youtube_url: '' }])
      setSearchQuery('')
      setSearchResults([])
    }
  }

  const handleYoutubeUrlChange = (songId: string, url: string) => {
    setYoutubeUrls({ ...youtubeUrls, [songId]: url })
  }

  const handleRemoveSong = (songId: string) => {
    setSelectedSongs(selectedSongs.filter((s) => s.song_id !== songId))
    const newYoutubeUrls = { ...youtubeUrls }
    delete newYoutubeUrls[songId]
    setYoutubeUrls(newYoutubeUrls)
  }

  const handleConfirm = async () => {
    if (!date || !name) {
      alert('예배 날짜와 예배명을 입력해주세요.')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/setlists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date,
          name,
          description: description || null,
          songs: selectedSongs.map((s) => ({
            song_id: s.song_id,
            youtube_url: youtubeUrls[s.song_id] || null,
          })),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || '등록 실패'
        
        if (response.status === 403) {
          alert(errorMessage)
          router.push('/setlists')
          return
        }
        
        throw new Error(errorMessage)
      }

      router.push('/setlists')
    } catch (error) {
      console.error('Submit error:', error)
      alert('콘티 등록에 실패했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 역할 확인 중이면 로딩 표시
  if (checkingRole) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  // 인도자가 아니면 접근 불가 메시지 (리다이렉트 전 잠깐 표시될 수 있음)
  if (userRole !== '인도자') {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>접근 권한 없음</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-500 py-8">
              찬양 콘티는 인도자만 생성할 수 있습니다.
            </p>
            <Button onClick={() => router.push('/setlists')} className="w-full">
              콘티 목록으로 돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!showDetail) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>새 콘티 등록</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  예배 날짜
                </label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  예배명
                </label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="예: 주일예배, 수요예배 등"
                  required
                />
              </div>
              <Button
                onClick={() => {
                  if (date && name) {
                    setShowDetail(true)
                  } else {
                    alert('예배 날짜와 예배명을 입력해주세요.')
                  }
                }}
                className="w-full"
              >
                확인
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-4 md:py-8">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-xl md:text-2xl">콘티 상세 등록</CardTitle>
        </CardHeader>
        <CardContent className="px-4 md:px-6">
          <div className="space-y-4 md:space-y-6">
            {/* 기본 정보 표시 */}
            <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600">예배 날짜</p>
              <p className="font-medium text-sm md:text-base">{date}</p>
              <p className="text-xs md:text-sm text-gray-600 mt-2">예배명</p>
              <p className="font-medium text-sm md:text-base">{name}</p>
              <p className="text-xs md:text-sm text-gray-600 mt-2">콘티 설명</p>
              <p className="font-medium text-sm md:text-base whitespace-pre-wrap">
                {description || '설명 없음'}
              </p>
            </div>

            {/* 콘티 설명 입력 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                콘티 설명
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="이번 콘티에 대한 전반적인 내용을 입력하세요..."
                className="min-h-[100px] resize-y"
              />
            </div>

            {/* 곡 검색 및 추가 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                찬양 곡 추가
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="곡명, 아티스트, Key로 검색..."
                  className="pl-10 text-sm md:text-base"
                />
              </div>

              {/* 검색 결과 */}
              {searchResults.length > 0 && (
                <div className="mt-2 border border-gray-200 rounded-lg max-h-48 md:max-h-60 overflow-y-auto">
                  {searchResults.map((song) => (
                    <div
                      key={song.id}
                      className="p-2 md:p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 active:bg-gray-100"
                      onClick={() => handleAddSong(song)}
                    >
                      <p className="font-medium text-sm md:text-base break-words">{song.title}</p>
                      <p className="text-xs md:text-sm text-gray-600 break-words">
                        {song.artist} · Key: {song.key}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {isSearching && (
                <div className="mt-2 text-center text-xs md:text-sm text-gray-500">
                  <Loader2 className="inline h-4 w-4 animate-spin mr-2" />
                  검색 중...
                </div>
              )}
            </div>

            {/* 선택된 곡 목록 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                선택된 곡 ({selectedSongs.length})
              </label>
              {selectedSongs.length === 0 ? (
                <p className="text-xs md:text-sm text-gray-500 text-center py-8">
                  검색창에서 곡을 검색하여 추가하세요
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedSongs.map((item, index) => (
                    <div
                      key={item.song_id}
                      className="p-2 md:p-3 border border-gray-200 rounded-lg space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <span className="text-xs md:text-sm text-gray-500 mr-2">
                            {index + 1}.
                          </span>
                          <span className="font-medium text-sm md:text-base break-words">{item.song.title}</span>
                          <span className="text-xs md:text-sm text-gray-600 ml-2 break-words">
                            {item.song.artist} · Key: {item.song.key}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveSong(item.song_id)}
                          className="text-red-500 hover:text-red-700 p-1 flex-shrink-0 ml-2"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      {/* 유튜브 링크 입력 */}
                      <div className="flex gap-2 items-center">
                        <Youtube className="h-4 w-4 text-red-600 flex-shrink-0" />
                        <Input
                          type="url"
                          value={youtubeUrls[item.song_id] || ''}
                          onChange={(e) => handleYoutubeUrlChange(item.song_id, e.target.value)}
                          placeholder="유튜브 링크를 입력하세요 (선택사항)"
                          className="flex-1 text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 제출 버튼 */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDetail(false)}
                className="flex-1"
              >
                뒤로
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    저장 중...
                  </>
                ) : (
                  '저장'
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
