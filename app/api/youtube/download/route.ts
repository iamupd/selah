import { Readable } from 'node:stream'
import ytdl from '@distube/ytdl-core'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300

type DownloadMode = 'video' | 'audio'

/** YouTube 봇 차단 시 — 브라우저에서 로그인한 계정의 쿠키(JSON 배열)를 서버 환경변수로 넣으면 완화되는 경우가 많습니다. */
let youtubeAgentState: 'unset' | 'none' | ReturnType<typeof ytdl.createAgent> = 'unset'

function getYoutubeAgent(): ReturnType<typeof ytdl.createAgent> | undefined {
  if (youtubeAgentState === 'unset') {
    const raw = process.env.YOUTUBE_COOKIES_JSON
    if (!raw?.trim()) {
      youtubeAgentState = 'none'
    } else {
      try {
        const parsed: unknown = JSON.parse(raw)
        if (!Array.isArray(parsed) || parsed.length === 0) {
          youtubeAgentState = 'none'
        } else {
          youtubeAgentState = ytdl.createAgent(parsed as Parameters<typeof ytdl.createAgent>[0])
        }
      } catch {
        youtubeAgentState = 'none'
      }
    }
  }
  return youtubeAgentState === 'none' ? undefined : youtubeAgentState
}

function humanizeYoutubeError(message: string): string {
  const m = message.toLowerCase()
  if (
    m.includes('sign in') ||
    m.includes('not a bot') ||
    m.includes("you're not a bot") ||
    m.includes('confirm you') ||
    m.includes('login required')
  ) {
    return (
      'YouTube가 이 서버의 접속을 자동화(봇)로 보고 막은 상태입니다. ' +
      '브라우저에 뜨는 “로그인”은 Selah 계정이 아니라 YouTube/Google 확인입니다. ' +
      '배포 서버 환경변수 `YOUTUBE_COOKIES_JSON`에 YouTube에 로그인한 브라우저에서보낸 쿠키 배열(EditThisCookie 등)을 넣으면 통과되는 경우가 많습니다. ' +
      '자세한 형식은 @distube/ytdl-core README의 Cookies Support를 참고하세요.'
    )
  }
  return message
}

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

  const agent = getYoutubeAgent()
  const ytdlOpts = agent ? { agent } : {}

  try {
    const info = await ytdl.getInfo(rawUrl, ytdlOpts)
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

    const stream = ytdl.downloadFromInfo(info, { ...chooseOptions, format, ...ytdlOpts })
    const webStream = Readable.toWeb(stream)

    return new Response(webStream as unknown as BodyInit, {
      headers: {
        'Content-Type': mime,
        'Content-Disposition': `attachment; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(utf8Name)}`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (e) {
    const raw = e instanceof Error ? e.message : '다운로드에 실패했습니다.'
    return Response.json({ error: humanizeYoutubeError(raw) }, { status: 502 })
  }
}
