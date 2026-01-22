import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') || ''

  const supabase = await createClient()

  let queryBuilder = supabase
    .from('songs')
    .select('*')
    .order('created_at', { ascending: false })

  if (query) {
    queryBuilder = queryBuilder.or(
      `title.ilike.%${query}%,artist.ilike.%${query}%,key.ilike.%${query}%`
    )
  }

  const { data, error } = await queryBuilder

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()

  const { title, artist, key, image_url, storage_path, song_form, bpm, time_signature, description } = body

  if (!title || !artist || !key || !image_url) {
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

  // 모든 필드를 포함한 insertData 생성
  const insertData: Record<string, unknown> = {
    title,
    artist,
    key,
    image_url,
    author_id: user.id,
    author_email: user.email,
  }
  if (storage_path) {
    insertData.storage_path = storage_path
  }
  if (song_form) {
    insertData.song_form = song_form
  }
  if (bpm !== null && bpm !== undefined) {
    insertData.bpm = bpm
  }
  if (time_signature) {
    insertData.time_signature = time_signature
  }
  if (description) {
    insertData.description = description
  }

  let result = await supabase
    .from('songs')
    .insert([insertData])
    .select()
    .single()

  // 컬럼이 없으면 해당 필드 제외하고 재시도 (마이그레이션 전 호환성)
  if (result.error?.message?.includes('storage_path') || 
      result.error?.message?.includes('song_form') ||
      result.error?.message?.includes('bpm') ||
      result.error?.message?.includes('time_signature') ||
      result.error?.message?.includes('description')) {
    console.log('Some columns not found, inserting with basic fields only')
    result = await supabase
      .from('songs')
      .insert([{ title, artist, key, image_url }])
      .select()
      .single()
  }

  const { data, error } = result

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
