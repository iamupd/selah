'use client'

import { useMemo } from 'react'

interface YouTubePlayerProps {
    url: string
    title?: string
    className?: string
}

/**
 * YouTube 링크에서 Video ID를 추출합니다.
 * 지원 포맷:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://m.youtube.com/watch?v=VIDEO_ID
 */
function extractYouTubeId(url: string): string | null {
    if (!url) return null

    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
        /[?&]v=([a-zA-Z0-9_-]{11})/,
    ]

    for (const pattern of patterns) {
        const match = url.match(pattern)
        if (match && match[1]) {
            return match[1]
        }
    }

    return null
}

/**
 * YouTube URL이 유효한지 확인합니다.
 */
export function isValidYouTubeUrl(url: string): boolean {
    return extractYouTubeId(url) !== null
}

/**
 * YouTube 임베딩 플레이어 컴포넌트
 */
export default function YouTubePlayer({ url, title, className = '' }: YouTubePlayerProps) {
    const videoId = useMemo(() => extractYouTubeId(url), [url])

    if (!videoId) {
        return (
            <div className={`flex items-center justify-center bg-gray-100 rounded-lg p-4 ${className}`}>
                <p className="text-sm text-gray-500">유효하지 않은 YouTube 링크입니다.</p>
            </div>
        )
    }

    return (
        <div className={`relative w-full overflow-hidden rounded-lg ${className}`} style={{ paddingBottom: '56.25%' }}>
            <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                title={title || 'YouTube video player'}
                className="absolute top-0 left-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
            />
        </div>
    )
}
