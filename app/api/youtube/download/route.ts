import { Innertube } from 'youtubei.js'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300

type DownloadMode = 'video' | 'audio'

const CHROME_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'

function asciiFileBase(videoId: string, ext: string) {
  return `${videoId}.${ext}`.replace(/[^\w.-]/g, '_')
}

/** EditThisCookie-style JSON array → `a=b; c=d` for Innertube `cookie`. */
function getCookieHeaderFromEnv(): string | undefined {
  const raw = process.env.YOUTUBE_COOKIES_JSON
  if (!raw?.trim()) return undefined
  try {
    const arr: unknown = JSON.parse(raw)
    if (!Array.isArray(arr)) return undefined
    const pairs: string[] = []
    for (const item of arr) {
      if (
        item &&
        typeof item === 'object' &&
        'name' in item &&
        'value' in item &&
        typeof (item as { name: unknown }).name === 'string' &&
        typeof (item as { value: unknown }).value === 'string'
      ) {
        pairs.push(`${(item as { name: string }).name}=${(item as { value: string }).value}`)
      }
    }
    return pairs.length ? pairs.join('; ') : undefined
  } catch {
    return undefined
  }
}

function extractVideoId(input: string): string | null {
  const trimmed = input.trim()
  if (/^[\w-]{11}$/.test(trimmed)) return trimmed
  try {
    const u = new URL(trimmed)
    const host = u.hostname.replace(/^www\./, '')
    if (host === 'youtu.be') {
      const id = u.pathname.split('/').filter(Boolean)[0]
      return id && /^[\w-]{11}$/.test(id) ? id : null
    }
    if (host.includes('youtube.com')) {
      const v = u.searchParams.get('v')
      if (v && /^[\w-]{11}$/.test(v)) return v
      const shorts = u.pathname.match(/^\/shorts\/([\w-]{11})/)
      if (shorts) return shorts[1]
      const embed = u.pathname.match(/^\/embed\/([\w-]{11})/)
      if (embed) return embed[1]
    }
  } catch {
    return null
  }
  return null
}

async function createInnertube() {
  const cookie = getCookieHeaderFromEnv()
  const visitor_data = process.env.YOUTUBE_VISITOR_DATA?.trim() || undefined
  const po_token = process.env.YOUTUBE_PO_TOKEN?.trim() || undefined

  return Innertube.create({
    lang: 'ko',
    location: 'KR',
    user_agent: CHROME_UA,
    generate_session_locally: true,
    ...(cookie ? { cookie } : {}),
    ...(visitor_data ? { visitor_data } : {}),
    ...(po_token ? { po_token } : {}),
  })
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

  const videoId = extractVideoId(rawUrl)
  if (!videoId) {
    return Response.json({ error: '유효한 YouTube 주소가 아닙니다.' }, { status: 400 })
  }

  const downloadOpts =
    mode === 'audio'
      ? { type: 'audio' as const, quality: 'best' as const, format: 'any' as const }
      : { type: 'video+audio' as const, quality: 'best' as const, format: 'mp4' as const }

  try {
    const yt = await createInnertube()
    const info = await yt.getBasicInfo(videoId)

    let format
    try {
      format = info.chooseFormat(downloadOpts)
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
      typeof format.mime_type === 'string'
        ? format.mime_type.split(';')[0]?.trim() || 'application/octet-stream'
        : 'application/octet-stream'
    const ext = mime.includes('webm') ? 'webm' : mime.includes('mp4') ? 'mp4' : 'bin'

    const title = (info.basic_info.title ?? 'video').replace(/["\r\n]/g, ' ').slice(0, 120)
    const asciiName = asciiFileBase(videoId, ext)
    const utf8Name = `${title}.${ext}`

    const stream = await info.download(downloadOpts)

    return new Response(stream, {
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
