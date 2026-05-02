import { Readable } from 'node:stream'
import ytdl from '@distube/ytdl-core'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300

type DownloadMode = 'video' | 'audio'

function asciiFileBase(videoId: string, ext: string) {
  return `${videoId}.${ext}`.replace(/[^\w.-]/g, '_')
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return Response.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  let body: { url?: unknown; mode?: unknown }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: '요청 본문이 올바르지 않습니다.' }, { status: 400 })
  }

  const rawUrl = typeof body.url === 'string' ? body.url.trim() : ''
  const mode: DownloadMode = body.mode === 'audio' ? 'audio' : 'video'

  if (!rawUrl || !ytdl.validateURL(rawUrl)) {
    return Response.json({ error: '유효한 YouTube 주소가 아닙니다.' }, { status: 400 })
  }

  try {
    const info = await ytdl.getInfo(rawUrl)
    const chooseOptions =
      mode === 'audio'
        ? { quality: 'highestaudio' as const, filter: 'audioonly' as const }
        : { quality: 'highest' as const, filter: 'audioandvideo' as const }

    let format
    try {
      format = ytdl.chooseFormat(info.formats, chooseOptions)
    } catch {
      return Response.json(
        {
          error:
            mode === 'video'
              ? '이 영상은 영상+음성 단일 파일로 제공되지 않습니다. 음성만 받기를 시도해 보세요.'
              : '다운로드할 음성 형식을 찾지 못했습니다.',
        },
        { status: 422 },
      )
    }

    const mime =
      typeof format.mimeType === 'string'
        ? format.mimeType.split(';')[0]?.trim() || 'application/octet-stream'
        : 'application/octet-stream'

    const ext =
      (typeof format.container === 'string' && format.container) ||
      (mime.includes('webm') ? 'webm' : mime.includes('mp4') ? 'mp4' : 'bin')

    const videoId = info.videoDetails.videoId
    const title = info.videoDetails.title
      .replace(/["\r\n]/g, ' ')
      .slice(0, 120)
    const asciiName = asciiFileBase(videoId, ext)
    const utf8Name = `${title}.${ext}`

    const stream = ytdl.downloadFromInfo(info, { ...chooseOptions, format })
    const webStream = Readable.toWeb(stream)

    return new Response(webStream as unknown as BodyInit, {
      headers: {
        'Content-Type': mime,
        'Content-Disposition': `attachment; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(utf8Name)}`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : '다운로드에 실패했습니다.'
    return Response.json({ error: message }, { status: 502 })
  }
}
