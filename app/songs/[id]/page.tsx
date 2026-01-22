'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, ArrowLeft, Edit, XCircle } from 'lucide-react'
import { Song } from '@/types/database'
import { createClient } from '@/lib/supabase/client'

export default function SongDetailPage() {
    const params = useParams()
    const router = useRouter()
    const supabase = useMemo(() => createClient(), [])
    const [song, setSong] = useState<Song | null>(null)
    const [loading, setLoading] = useState(true)
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)
    const [selectedImage, setSelectedImage] = useState<string | null>(null)
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
            document.body.style.overflow = 'hidden'
        }
        return () => {
            document.removeEventListener('keydown', handleEscape)
            document.body.style.overflow = 'unset'
        }
    }, [selectedImage])

    useEffect(() => {
        const fetchSong = async () => {
            try {
                const response = await fetch(`/api/songs/${params.id}`)
                if (response.ok) {
                    const data = await response.json()
                    setSong(data)
                }
            } catch (error) {
                console.error('Fetch error:', error)
            } finally {
                setLoading(false)
            }
        }

        const fetchUser = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            setCurrentUserId(session?.user?.id ?? null)
        }

        if (params.id) {
            fetchSong()
            fetchUser()
        }
    }, [params.id, supabase])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
    }

    if (!song) {
        return (
            <div className="container mx-auto max-w-4xl px-4 py-8">
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-center text-gray-500 py-8">
                            악보를 찾을 수 없습니다.
                        </p>
                        <Button onClick={() => router.push('/songs')} className="w-full">
                            악보 목록으로 돌아가기
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const canEdit = currentUserId === song.author_id || !song.author_id

    return (
        <div className="container mx-auto max-w-4xl px-4 py-4 md:py-8">
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-4">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/songs')}
                    className="gap-1"
                >
                    <ArrowLeft className="h-4 w-4" />
                    목록
                </Button>
                {canEdit && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/songs/${song.id}/edit`)}
                    >
                        <Edit className="h-4 w-4 mr-1" />
                        수정
                    </Button>
                )}
            </div>

            {/* 곡 정보 */}
            <Card className="mb-4">
                <CardContent className="pt-6">
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">{song.title}</h1>
                    <p className="text-lg text-gray-600 mb-4">{song.artist}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div className="bg-gray-50 rounded-lg p-3">
                            <span className="text-gray-500 block text-xs">Key</span>
                            <span className="font-semibold text-lg">{song.key}</span>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                            <span className="text-gray-500 block text-xs">BPM</span>
                            <span className="font-semibold text-lg">{song.bpm ?? '-'}</span>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                            <span className="text-gray-500 block text-xs">박자</span>
                            <span className="font-semibold text-lg">{song.time_signature || '-'}</span>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                            <span className="text-gray-500 block text-xs">송폼</span>
                            <span className="font-semibold text-lg">{song.song_form || '-'}</span>
                        </div>
                    </div>

                    {song.description && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-500 block text-xs mb-1">설명</span>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{song.description}</p>
                        </div>
                    )}

                    {song.author_email && (
                        <p className="text-xs text-gray-400 mt-4">
                            작성자: {song.author_email}
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* 악보 이미지 */}
            {song.image_url && (
                <Card>
                    <CardContent className="p-2 md:p-4">
                        <img
                            src={song.image_url}
                            alt={song.title}
                            onClick={() => setSelectedImage(song.image_url)}
                            className="w-full rounded-lg cursor-pointer hover:opacity-95 transition-opacity"
                            loading="lazy"
                        />
                        <p className="text-xs text-gray-400 text-center mt-2">
                            클릭하여 확대
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* 악보 확대 모달 */}
            {selectedImage && (
                <>
                    {isMobile ? (
                        <div
                            className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
                            onClick={() => setSelectedImage(null)}
                        >
                            <div className="relative w-full h-full flex items-center justify-center p-2">
                                <img
                                    src={selectedImage}
                                    alt={song.title}
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
                        <div
                            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
                            onClick={() => setSelectedImage(null)}
                        >
                            <div className="relative max-w-[95vw] max-h-[95vh] flex items-center justify-center">
                                <img
                                    src={selectedImage}
                                    alt={song.title}
                                    className="max-w-full max-h-full object-contain"
                                    onClick={(e) => e.stopPropagation()}
                                />
                                <button
                                    onClick={() => setSelectedImage(null)}
                                    className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
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
