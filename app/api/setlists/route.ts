import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('setlists')
    .select('*')
    .order('date', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()

  const { date, name, description, songs } = body as {
    date: string
    name: string
    description?: string | null
    songs?: Array<{ song_id: string }>
  }

  if (!date || !name) {
    return NextResponse.json(
      { error: '필수 필드가 누락되었습니다.' },
      { status: 400 }
    )
  }

  // 작성자 정보 가져오기
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: '인증된 사용자를 찾을 수 없습니다.' }, { status: 401 })
  }

  // 사용자 역할 확인 (인도자만 콘티 생성 가능)
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return NextResponse.json({ error: '사용자 프로필을 찾을 수 없습니다.' }, { status: 403 })
  }

  if (profile.role !== '인도자') {
    return NextResponse.json(
      { error: '찬양 콘티는 인도자만 생성할 수 있습니다.' },
      { status: 403 }
    )
  }

  // Setlist 생성 (작성자 정보 포함)
  const { data: setlist, error: setlistError } = await supabase
    .from('setlists')
    .insert([{ date, name, description, author_id: user.id, author_email: user.email }])
    .select()
    .single()

  if (setlistError) {
    return NextResponse.json({ error: setlistError.message }, { status: 500 })
  }

  // SetlistSongs 생성
  if (songs && songs.length > 0) {
    const setlistSongs = songs.map((song, index: number) => ({
      setlist_id: setlist.id,
      song_id: song.song_id,
      song_order: index + 1,
    }))

    const { error: songsError } = await supabase
      .from('setlist_songs')
      .insert(setlistSongs)

    if (songsError) {
      return NextResponse.json({ error: songsError.message }, { status: 500 })
    }
  }

  return NextResponse.json(setlist)
}
