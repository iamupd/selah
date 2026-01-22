import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(
  request: Request,
  context: RouteContext
) {
  const { id } = await context.params

  if (!id || id === 'undefined') {
    return NextResponse.json(
      { error: '유효하지 않은 콘티 ID입니다.' },
      { status: 400 }
    )
  }

  const supabase = await createClient()

  const { data: setlist, error: setlistError, status: setlistStatus } =
    await supabase
      .from('setlists')
      .select('*')
      .eq('id', id)
      .single()

  if (setlistError) {
    const statusCode = setlistStatus === 406 || setlistStatus === 404 ? 404 : 500
    return NextResponse.json(
      { error: setlistError.message },
      { status: statusCode }
    )
  }

  const { data: setlistSongs, error: songsError } = await supabase
    .from('setlist_songs')
    // song 별칭으로 반환해 프론트에서 일관되게 접근
    .select('id, setlist_id, song_order, song:songs!inner(*)')
    .eq('setlist_id', id)
    .order('song_order', { ascending: true })

  if (songsError) {
    return NextResponse.json({ error: songsError.message }, { status: 500 })
  }

  return NextResponse.json({
    ...setlist,
    songs: (setlistSongs ?? []).filter((song) => song !== null),
  })
}

export async function PUT(
  request: Request,
  context: RouteContext
) {
  const { id } = await context.params

  if (!id || id === 'undefined') {
    return NextResponse.json(
      { error: '유효하지 않은 콘티 ID입니다.' },
      { status: 400 }
    )
  }

  // RLS가 작동하도록 일반 클라이언트 사용 (작성자만 수정 가능)
  const supabase = await createClient()
  const body = await request.json()

  const { description, songs } = body as {
    description?: string
    songs?: Array<{ song_id: string; youtube_url?: string | null }>
  }

  // 1) setlists 테이블 업데이트 (description만) - RLS가 작성자만 허용
  let setlistResult = await supabase
    .from('setlists')
    .update({ description, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (setlistResult.error?.message?.includes('description')) {
    return NextResponse.json(
      {
        error: 'DB 스키마에 description 컬럼이 없습니다. 최신 마이그레이션을 적용하세요.',
        details: setlistResult.error.message,
      },
      { status: 400 }
    )
  }

  if (setlistResult.error) {
    return NextResponse.json({ error: setlistResult.error.message }, { status: 500 })
  }

  // 2) setlist_songs 업데이트 (전체 재작성)
  if (Array.isArray(songs)) {
    // 기존 곡 모두 삭제
    const { error: deleteError } = await supabase
      .from('setlist_songs')
      .delete()
      .eq('setlist_id', id)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    if (songs.length > 0) {
      const payload = songs.map((s, index) => {
        const songItem = s as { song_id: string; youtube_url?: string | null }
        return {
          setlist_id: id,
          song_id: songItem.song_id,
          song_order: index + 1,
          youtube_url: songItem.youtube_url || null,
        }
      })

      const { error: insertError } = await supabase
        .from('setlist_songs')
        .insert(payload)

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 })
      }
    }
  }

  // 3) 최신 데이터 재조회 후 반환 (곡 포함)
  const { data: setlist, error: fetchSetlistError } = await supabase
    .from('setlists')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchSetlistError) {
    return NextResponse.json({ error: fetchSetlistError.message }, { status: 500 })
  }

  const { data: setlistSongs, error: songsError } = await supabase
    .from('setlist_songs')
    .select('id, setlist_id, song_order, youtube_url, song:songs!inner(*)')
    .eq('setlist_id', id)
    .order('song_order', { ascending: true })

  if (songsError) {
    return NextResponse.json({ error: songsError.message }, { status: 500 })
  }

  return NextResponse.json({
    ...setlist,
    songs: (setlistSongs ?? []).filter((s) => s !== null),
  })
}

export async function DELETE(
  request: Request,
  context: RouteContext
) {
  const { id } = await context.params

  if (!id || id === 'undefined') {
    return NextResponse.json(
      { error: '유효하지 않은 콘티 ID입니다.' },
      { status: 400 }
    )
  }

  // RLS가 작동하도록 일반 클라이언트 사용 (작성자만 삭제 가능)
  const supabase = await createClient()

  // 콘티 삭제 - RLS가 작성자만 허용
  // setlist_songs는 ON DELETE CASCADE로 자동 삭제됨
  const { error: deleteError } = await supabase
    .from('setlists')
    .delete()
    .eq('id', id)

  if (deleteError) {
    console.error('Database delete error:', deleteError)
    return NextResponse.json(
      {
        error: '데이터베이스에서 콘티 삭제에 실패했습니다.',
        details: deleteError.message
      },
      { status: 500 }
    )
  }

  console.log('Setlist deleted successfully:', id)
  return NextResponse.json({ success: true })
}
