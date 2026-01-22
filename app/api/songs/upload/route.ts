import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    // 환경 변수 확인
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다.')
      return NextResponse.json(
        { error: 'Supabase Storage 설정이 완료되지 않았습니다. SUPABASE_SERVICE_ROLE_KEY를 확인하세요.' },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: '파일이 제공되지 않았습니다.' },
        { status: 400 }
      )
    }

    // Supabase Admin 클라이언트 생성 (업로드 권한 필요)
    const supabaseAdmin = createAdminClient()

    // 파일명 생성
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`

    // 파일을 ArrayBuffer로 변환
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Supabase Storage에 업로드
    const { data, error } = await supabaseAdmin.storage
      .from('sheets')
      .upload(fileName, buffer, {
        contentType: file.type || 'image/png',
        upsert: false,
      })

    if (error) {
      console.error('Storage upload error:', error)
      return NextResponse.json(
        { 
          error: '이미지 업로드에 실패했습니다.',
          details: error.message 
        },
        { status: 500 }
      )
    }

    // 공개 URL 가져오기
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('sheets')
      .getPublicUrl(fileName)

    return NextResponse.json({ image_url: publicUrl, storage_path: fileName })
  } catch (error) {
    console.error('Upload error:', error)
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
    return NextResponse.json(
      { 
        error: '이미지 업로드에 실패했습니다.',
        details: errorMessage 
      },
      { status: 500 }
    )
  }
}
