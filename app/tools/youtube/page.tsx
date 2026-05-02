'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Download, Loader2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

type Mode = 'video' | 'audio'

function parseFilenameFromDisposition(cd: string | null): string | null {
  if (!cd) return null
  const star = cd.match(/filename\*=UTF-8''([^;]+)/i)
  if (star?.[1]) {
    try {
      return decodeURIComponent(star[1].trim())
    } catch {
      return star[1].trim()
    }
  }
  const q = cd.match(/filename="([^"]+)"/i)
  if (q?.[1]) return q[1]
  const u = cd.match(/filename=([^;]+)/i)
  return u?.[1]?.trim() ?? null
}

export default function YoutubeDownloadPage() {
  const [url, setUrl] = useState('')
  const [mode, setMode] = useState<Mode>('audio')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDownload = async () => {
    setError(null)
    const trimmed = url.trim()
    if (!trimmed) {
      setError('YouTube 링크를 입력해 주세요.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/youtube/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ url: trimmed, mode }),
      })

      const ct = res.headers.get('content-type') || ''
      if (!res.ok) {
        if (ct.includes('application/json')) {
          const data = (await res.json()) as { error?: string }
          setError(data.error || '요청에 실패했습니다.')
        } else {
          setError('요청에 실패했습니다.')
        }
        return
      }

      const blob = await res.blob()
      const cd = res.headers.get('content-disposition')
      const name = parseFilenameFromDisposition(cd) || `youtube-${mode}.${blob.type.includes('webm') ? 'webm' : 'mp4'}`

      const href = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = href
      a.download = name
      a.rel = 'noopener'
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(href)
    } catch {
      setError('네트워크 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto max-w-2xl px-4 py-10">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            대시보드로
          </Link>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl">YouTube 받기</CardTitle>
            <p className="text-sm text-gray-600 pt-1">
              저작권이 있는 콘텐츠는 권리자 허용 범위에서만 이용해 주세요. 서버 부하가 크므로 긴 영상은 실패할 수 있습니다.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="yt-url" className="text-sm font-medium text-gray-800">
                YouTube 주소
              </label>
              <Input
                id="yt-url"
                type="url"
                inputMode="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={loading}
                className="font-mono text-sm"
              />
            </div>

            <fieldset className="space-y-2">
              <legend className="text-sm font-medium text-gray-800 mb-2">형식</legend>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    name="mode"
                    checked={mode === 'audio'}
                    onChange={() => setMode('audio')}
                    disabled={loading}
                    className="accent-blue-600"
                  />
                  음성만 (용량이 작고 안정적인 경우가 많음)
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    name="mode"
                    checked={mode === 'video'}
                    onChange={() => setMode('video')}
                    disabled={loading}
                    className="accent-blue-600"
                  />
                  영상+음성 (단일 파일이 있을 때만 가능)
                </label>
              </div>
            </fieldset>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</div>
            )}

            <Button type="button" className="w-full" size="lg" onClick={handleDownload} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  받는 중…
                </>
              ) : (
                <>
                  <Download className="mr-2 h-5 w-5" />
                  다운로드
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
