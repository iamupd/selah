import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

type RouteContext = { params: Promise<{ id: string; songId: string }> }

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  const { id, songId } = await context.params

  if (!id || id === 'undefined' || !songId || songId === 'undefined') {
    return NextResponse.json(
      { error: '유효하지 않은 ID입니다.' },
      { status: 400 }
    )
  }

  const supabase = await createClient()
  const body = await request.json()

  const { youtube_url } = body as {
    youtube_url?: string | null
  }

  // songs 테이블의 youtube_url 업데이트
  const { error: updateError } = await supabase
    .from('songs')
    .update({ youtube_url: youtube_url || null })
    .eq('id', songId)

  if (updateError) {
    console.error('Update error:', updateError)
    return NextResponse.json(
      { 
        error: updateError.message,
        details: updateError.details,
        hint: updateError.hint,
      },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
