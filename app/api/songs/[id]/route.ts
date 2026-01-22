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
      { error: '유효하지 않은 악보 ID입니다.' },
      { status: 400 }
    )
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function PUT(
  request: Request,
  context: RouteContext
) {
  const { id } = await context.params

  if (!id || id === 'undefined') {
    return NextResponse.json(
      { error: '유효하지 않은 악보 ID입니다.' },
      { status: 400 }
    )
  }

  // 악보는 모두 수정 가능하므로 일반 클라이언트 사용
  const supabase = await createClient()
  const body = await request.json()

  const { title, artist, key, image_url, storage_path, song_form, bpm, time_signature, description } = body

  if (!title || !artist || !key) {
    return NextResponse.json(
      { error: '필수 필드가 누락되었습니다.' },
      { status: 400 }
    )
  }

  const updateData: Record<string, unknown> = {
    title,
    artist,
    key,
    image_url,
    updated_at: new Date().toISOString()
  }

  // 새 이미지가 업로드된 경우에만 storage_path 업데이트
  if (storage_path) {
    updateData.storage_path = storage_path
  }

  // 추가 정보 필드 업데이트
  if (song_form !== undefined) {
    updateData.song_form = song_form || null
  }
  if (bpm !== undefined) {
    updateData.bpm = bpm !== null && bpm !== '' ? parseInt(bpm, 10) : null
  }
  if (time_signature !== undefined) {
    updateData.time_signature = time_signature || null
  }
  if (description !== undefined) {
    updateData.description = description || null
  }

  const { data, error } = await supabase
    .from('songs')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    // 스키마에 컬럼이 없을 때 명확히 알려준다
    if (error.message?.includes('time_signature') || error.message?.includes('song_form') || error.message?.includes('bpm') || error.message?.includes('description')) {
      return NextResponse.json(
        {
          error: 'DB 스키마에 필요한 컬럼이 없습니다. 최신 마이그레이션을 적용하세요.',
          details: error.message,
        },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function DELETE(
  request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params

    if (!id || id === 'undefined') {
      return NextResponse.json(
        { error: '유효하지 않은 악보 ID입니다.' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // 먼저 악보 정보 가져오기 (storage_path 확인용)
    let result = await supabase
      .from('songs')
      .select('image_url, storage_path, author_id')
      .eq('id', id)
      .single()

    // storage_path 컬럼이 없으면 image_url만으로 재조회
    if (result.error?.message?.includes('storage_path')) {
      console.log('storage_path column not found, fetching with image_url only')
      result = await supabase
        .from('songs')
        .select('image_url, author_id')
        .eq('id', id)
        .single()
    }

    const { data: song, error: fetchError } = result

    if (fetchError) {
      console.error('Fetch song error:', fetchError)
      return NextResponse.json(
        {
          error: '악보를 찾을 수 없습니다.',
          details: fetchError.message
        },
        { status: 404 }
      )
    }

    if (!song) {
      return NextResponse.json(
        { error: '악보를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // Storage에서 이미지 삭제 (관리자 키 필요)
    const supabaseAdmin = createAdminClient()
    if (song.storage_path) {
      // storage_path가 있으면 직접 사용 (권장)
      const { error: deleteError } = await supabaseAdmin.storage
        .from('sheets')
        .remove([song.storage_path])

      if (deleteError) {
        console.error('Storage delete error:', deleteError)
      } else {
        console.log('Storage file deleted successfully:', song.storage_path)
      }
    } else if (song.image_url) {
      // 이전 데이터 호환: storage_path가 없으면 URL에서 추출 시도
      try {
        const url = new URL(song.image_url)
        const pathParts = url.pathname.split('/')
        const sheetsIndex = pathParts.indexOf('sheets')
        const fileName = sheetsIndex !== -1 && sheetsIndex < pathParts.length - 1
          ? pathParts[sheetsIndex + 1]
          : pathParts[pathParts.length - 1]

        if (fileName) {
          const { error: deleteError } = await supabaseAdmin.storage
            .from('sheets')
            .remove([fileName])

          if (deleteError) {
            console.error('Storage delete error (legacy):', deleteError)
          } else {
            console.log('Storage file deleted (legacy):', fileName)
          }
        }
      } catch (error) {
        console.error('Legacy URL parsing error:', error)
      }
    }

    // 데이터베이스에서 악보 삭제 - RLS가 작성자만 허용
    const { error: deleteError, data: deleteData } = await supabase
      .from('songs')
      .delete()
      .eq('id', id)
      .select()

    if (deleteError) {
      console.error('Database delete error:', deleteError)
      console.error('Delete error details:', JSON.stringify(deleteError, null, 2))
      return NextResponse.json(
        {
          error: '데이터베이스에서 악보 삭제에 실패했습니다.',
          details: deleteError.message
        },
        { status: 500 }
      )
    }

    // 삭제된 행이 없으면 에러
    if (!deleteData || deleteData.length === 0) {
      console.error('No rows deleted. ID:', id)
      return NextResponse.json(
        {
          error: '악보를 찾을 수 없거나 삭제할 수 없습니다.',
          details: '해당 ID의 악보가 존재하지 않거나 삭제 권한이 없습니다.'
        },
        { status: 404 }
      )
    }

    console.log('Song deleted successfully:', id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete error:', error)
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
    return NextResponse.json(
      {
        error: '악보 삭제에 실패했습니다.',
        details: errorMessage
      },
      { status: 500 }
    )
  }
}
