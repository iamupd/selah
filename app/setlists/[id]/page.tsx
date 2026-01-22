'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, Search, X, Share2, XCircle } from 'lucide-react'
import { format } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import { Song } from '@/types/database'

interface SetlistSong {
  id: string
  song_order: number
  song?: Song
}

interface Setlist {
  id: string
  date: string
  name: string
  description?: string
  author_email?: string
  author_id?: string
  songs?: SetlistSong[]
}

export default function SetlistViewPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const supabase = useMemo(() => createClient(), [])
  const isEditMode = searchParams.get('mode') === 'edit'
  const [setlist, setSetlist] = useState<Setlist | null>(null)
  const [description, setDescription] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [selectedSongs, setSelectedSongs] = useState<
    Array<{ id?: string; song_id: string; song: Song }>
  >([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Song[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [copyToast, setCopyToast] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<{ url: string; title: string } | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  // 모바일 감지
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedImage) {
        setSelectedImage(null)
      }
    }
    if (selectedImage) {
      document.addEventListener('keydown', handleEscape)
      // 모달이 열릴 때 body 스크롤 방지
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [selectedImage])

  useEffect(() => {
    const fetchSetlist = async () => {
      try {
        const response = await fetch(`/api/setlists/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setSetlist({
            ...data,
            songs: data.songs ?? [],
          })
          setDescription(data.description || '')
          const incomingSongs =
            (data.songs ?? []).map((s: SetlistSong) => ({
              id: s.id,
              song_id: s.song?.id ?? '',
              song: s.song as Song,
            })) ?? []
          setSelectedSongs(incomingSongs)
        }
      } catch (error) {
        console.error('Fetch error:', error)
      } finally {
        setLoading(false)
      }
    }

    // 현재 사용자 ID 가져오기
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setCurrentUserId(session?.user?.id ?? null)
    }

    if (params.id) {
      fetchSetlist()
      fetchUser()
    }
  }, [params.id, supabase])

  // 카카오톡 공유를 위한 메타 태그 설정
  useEffect(() => {
    if (!setlist) return

    const envUrl = process.env.NEXT_PUBLIC_APP_URL;
    const origin = (envUrl && !envUrl.includes('localhost')) ? envUrl : (typeof window !== 'undefined' ? window.location.origin : '');
    const url = `${origin}/setlists/${setlist.id}`
    const dateStr = format(new Date(setlist.date), 'yyyy년 M월 d일')
    const title = `${setlist.name || '콘티'} - ${dateStr}`
    const description = setlist.description || `${dateStr} 찬양 콘티`

    // 기존 메타 태그 제거
    const existingOgTitle = document.querySelector('meta[property="og:title"]')
    const existingOgDescription = document.querySelector('meta[property="og:description"]')
    const existingOgUrl = document.querySelector('meta[property="og:url"]')
    const existingOgImage = document.querySelector('meta[property="og:image"]')
    const existingTitle = document.querySelector('title')

    if (existingOgTitle) existingOgTitle.remove()
    if (existingOgDescription) existingOgDescription.remove()
    if (existingOgUrl) existingOgUrl.remove()
    if (existingOgImage) existingOgImage.remove()

    // 새 메타 태그 추가
    const ogTitle = document.createElement('meta')
    ogTitle.setAttribute('property', 'og:title')
    ogTitle.setAttribute('content', title)
    document.head.appendChild(ogTitle)

    const ogDescription = document.createElement('meta')
    ogDescription.setAttribute('property', 'og:description')
    ogDescription.setAttribute('content', description)
    document.head.appendChild(ogDescription)

    const ogUrl = document.createElement('meta')
    ogUrl.setAttribute('property', 'og:url')
    ogUrl.setAttribute('content', url)
    document.head.appendChild(ogUrl)

    const ogImage = document.createElement('meta')
    ogImage.setAttribute('property', 'og:image')
    ogImage.setAttribute('content', `${origin}/selah.jpg`)
    document.head.appendChild(ogImage)

    // 페이지 제목도 변경
    if (existingTitle) {
      existingTitle.textContent = title
    } else {
      const titleTag = document.createElement('title')
      titleTag.textContent = title
      document.head.appendChild(titleTag)
    }

    // 정리 함수
    return () => {
      ogTitle.remove()
      ogDescription.remove()
      ogUrl.remove()
      ogImage.remove()
    }
  }, [setlist])

  const handleSave = async () => {
    if (!setlist) return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/setlists/${setlist.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description,
          songs: selectedSongs.map((s) => ({
            song_id: s.song_id,
          })),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Save error response:', errorData)
        const errorMessage = errorData.error || errorData.message || `저장 실패 (${response.status})`
        throw new Error(errorMessage)
      }

      const updatedSetlist = await response.json()
      setSetlist((prev) => {
        if (prev) {
          return {
            ...prev,
            ...updatedSetlist,
            songs: prev.songs ?? [],
          }
        }
        return {
          ...updatedSetlist,
          songs: [],
        }
      })
    } catch (error) {
      console.error('Save error:', error)
      const errorMessage = error instanceof Error ? error.message : '저장에 실패했습니다.'
      alert(`저장 실패: ${errorMessage}\n\n브라우저 콘솔을 확인해주세요.`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }
    setIsSearching(true)
    try {
      const response = await fetch(`/api/songs?q=${encodeURIComponent(query)}`, {
        cache: 'no-store',
      })
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
    if (selectedSongs.find((s) => s.song_id === song.id)) return
    setSelectedSongs([...selectedSongs, { song_id: song.id, song }])
    setSearchQuery('')
    setSearchResults([])
  }

  const handleRemoveSong = (songId: string) => {
    setSelectedSongs(selectedSongs.filter((s) => s.song_id !== songId))
  }

  const handleShare = () => {
    const envUrl = process.env.NEXT_PUBLIC_APP_URL;
    const origin = (envUrl && !envUrl.includes('localhost')) ? envUrl : window.location.origin;
    const url = `${origin}/setlists/${setlist?.id}`
    navigator.clipboard.writeText(url).then(() => {
      setCopyToast('클립보드에 콘티 공유 주소가 복사되었습니다.')
      setTimeout(() => setCopyToast(null), 2000)
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!setlist) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">콘티를 찾을 수 없습니다.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-4 md:py-8">
      <Card className="md:shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl md:text-2xl">{setlist.name}</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
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
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="ml-4"
              title="공유 링크 복사"
            >
              <Share2 className="h-4 w-4 mr-2" />
              공유
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-4 md:px-6">
          {/* 콘티 설명 영역 */}
          <div className="mb-4 md:mb-6">
            <label className="block text-sm font-medium mb-2 text-gray-700">
              콘티 설명
            </label>
            {isEditMode && (!setlist.author_id || currentUserId === setlist.author_id) ? (
              <div className="space-y-2">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="이번 콘티에 대한 전반적인 내용을 입력하세요..."
                  className="w-full min-h-[100px] rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="inline-flex items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        저장 중...
                      </>
                    ) : (
                      '저장'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDescription(setlist.description || '')}
                    disabled={isSaving}
                    className="inline-flex items-center justify-center rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    취소
                  </button>
                </div>
              </div>
            ) : (
              <div className="min-h-[100px] p-3 rounded-lg border border-gray-200 bg-gray-50">
                {setlist.description ? (
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {setlist.description}
                  </p>
                ) : (
                  <p className="text-sm text-gray-400 italic">
                    등록된 설명이 없습니다.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* 곡 목록 / 편집 */}
          <div className="border-t border-gray-200 pt-4 md:pt-6">
            <h3 className="text-lg font-semibold mb-3 md:mb-4 text-gray-800">
              찬양 곡 목록
            </h3>

            {isEditMode && (
              <div className="mb-4 space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  곡 검색 및 추가
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="곡명, 아티스트, Key로 검색..."
                    className="pl-10 text-sm md:text-base"
                  />
                </div>
                {searchResults.length > 0 && (
                  <div className="border border-gray-200 rounded-lg max-h-48 md:max-h-60 overflow-y-auto">
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
                  <div className="text-xs md:text-sm text-gray-500 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    검색 중...
                  </div>
                )}
              </div>
            )}

            <div className="space-y-3 md:space-y-4">
              {selectedSongs.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  등록된 곡이 없습니다.
                </p>
              ) : (
                selectedSongs.map((item, index) => {
                  const song = item.song
                  return (
                    <div
                      key={`${item.id ?? item.song_id}-${index}`}
                      className="border border-gray-200 rounded-lg p-3 md:p-4 hover:shadow-md transition-shadow bg-white"
                    >
                      <div className="flex items-start gap-3 md:gap-4">
                        <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-sm md:text-base">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base md:text-lg mb-1 break-words">
                            {song?.title ?? '삭제된 곡'}
                          </h3>
                          <p className="text-xs md:text-sm text-gray-600 mb-2 break-words">
                            {song?.artist ?? 'N/A'} · Key: {song?.key ?? 'N/A'}
                          </p>
                          <div className="text-xs md:text-sm text-gray-700 space-y-1 mb-2">
                            <div>송폼: {song?.song_form || '-'}</div>
                            <div className="flex flex-wrap gap-2">
                              <span>BPM: {song?.bpm ?? '-'}</span>
                              <span>박자: {song?.time_signature || '-'}</span>
                            </div>
                            <div className="text-gray-600">
                              설명: {song?.description ? song.description : '설명 없음'}
                            </div>
                          </div>
                          {song?.image_url && !isEditMode && (
                            <div className="mt-3">
                              <img
                                src={song.image_url}
                                alt={song.title}
                                onClick={() => setSelectedImage({ url: song.image_url, title: song.title })}
                                className="w-full rounded-lg border border-gray-200 max-h-64 md:max-h-96 object-contain bg-gray-50 cursor-pointer hover:opacity-90 transition-opacity"
                                loading="lazy"
                              />
                            </div>
                          )}
                        </div>
                        {isEditMode && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSong(item.song_id)}
                            className="text-red-500 hover:text-red-700 p-1 flex-shrink-0"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {isEditMode && (
              <div className="mt-4 flex justify-end">
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="min-w-[120px]"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      저장 중...
                    </>
                  ) : (
                    '변경사항 저장'
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {copyToast && (
        <div className="fixed inset-x-0 bottom-6 flex justify-center px-4 pointer-events-none z-50">
          <div className="bg-gray-900 text-white text-sm px-4 py-2 rounded-full shadow-lg opacity-90 animate-fade-in-out">
            {copyToast}
          </div>
        </div>
      )}

      {/* 악보 확대 모달 */}
      {selectedImage && (
        <>
          {isMobile ? (
            // 모바일: 전체화면
            <div
              className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
              onClick={() => setSelectedImage(null)}
            >
              <div className="relative w-full h-full flex items-center justify-center p-4">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.title}
                  className="max-w-full max-h-full object-contain"
                  onClick={(e) => e.stopPropagation()}
                />
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>
          ) : (
            // 데스크탑: 배경 어둡게 + 확대
            <div
              className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4"
              onClick={() => setSelectedImage(null)}
            >
              <div className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.title}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                />
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
                  title="닫기 (ESC)"
                >
                  <XCircle className="h-8 w-8" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
