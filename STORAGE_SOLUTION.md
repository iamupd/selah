# 저장소 문제 해결 가이드

"Service Accounts do not have storage quota" 에러 해결 방법

## 문제 원인

Google 서비스 계정(Service Account)은 자체 저장소 할당량이 없습니다. 서비스 계정은 개인 Google 계정처럼 15GB의 무료 용량을 가지지 않습니다.

---

## 해결 방법 1: Google Drive 계속 사용 (폴더 공유 방식)

### 설정 방법

1. **개인 Google 계정의 폴더 생성**
   - 본인의 Google Drive에 폴더 생성 (예: `찬양콘티-악보`)
   - 이 폴더는 본인의 15GB 할당량을 사용합니다

2. **서비스 계정에 폴더 공유**
   - 폴더 우클릭 → "공유"
   - 서비스 계정 이메일 주소 입력
     - 예: `drive-uploader@project-xxxxx.iam.gserviceaccount.com`
   - 권한: **"편집자"** 선택
   - "완료" 클릭

3. **폴더 ID 확인**
   - 폴더 URL에서 ID 복사
   - 예: `https://drive.google.com/drive/folders/1a2b3c4d5e6f7g8h9i0j`
   - `1a2b3c4d5e6f7g8h9i0j` 부분이 폴더 ID

4. **환경 변수 설정**
   ```env
   GOOGLE_DRIVE_FOLDER_ID=1a2b3c4d5e6f7g8h9i0j
   ```

### 중요 사항

- ✅ 서비스 계정은 공유받은 폴더에만 파일을 업로드할 수 있습니다
- ✅ 파일은 폴더 소유자(본인)의 할당량을 사용합니다
- ✅ 서비스 계정의 자체 할당량은 없지만, 공유 폴더를 통해 업로드 가능

---

## 해결 방법 2: Supabase Storage로 전환 (권장)

이미 Supabase를 사용하고 있으므로, **Supabase Storage**로 전환하는 것이 더 간단하고 효율적입니다.

### 장점

1. ✅ **간단한 설정**: Google API 설정 불필요
2. ✅ **통합 관리**: 데이터베이스와 스토리지를 한 곳에서 관리
3. ✅ **빠른 속도**: CDN을 통한 빠른 이미지 서빙
4. ✅ **무료 1GB**: 무료 요금제에서 1GB 제공
5. ✅ **에러 없음**: 서비스 계정 할당량 문제 없음

### Supabase Storage 설정

#### 1. Supabase 대시보드에서 Storage 설정

1. Supabase 대시보드 → **Storage** 클릭
2. **"New bucket"** 클릭
3. 버킷 정보 입력:
   - **Name**: `sheets` (또는 원하는 이름)
   - **Public bucket**: ✅ 체크 (공개 읽기)
4. **"Create bucket"** 클릭

#### 2. Storage Policy 설정

1. Storage → **Policies** 클릭
2. `sheets` 버킷 선택
3. **"New Policy"** 클릭
4. 정책 설정:
   - **Policy name**: `Allow public uploads`
   - **Allowed operation**: `INSERT`, `SELECT`
   - **Policy definition**: 
     ```sql
     (bucket_id = 'sheets')
     ```
5. **"Save"** 클릭

#### 3. 환경 변수 추가

`.env.local` 파일에 추가:

```env
# Supabase Service Role Key (서버 사이드용)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Service Role Key 확인 방법**:
1. Supabase 대시보드 → Settings → API
2. **"service_role" `secret`** 키 복사
3. ⚠️ **주의**: 이 키는 서버에서만 사용하고 클라이언트에 노출하지 마세요!

---

## 코드 수정: Supabase Storage로 전환

### 1. 업로드 API 수정

`app/api/songs/upload/route.ts` 파일을 다음과 같이 수정:

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Service Role Key로 서버 클라이언트 생성 (업로드 권한 필요)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: '파일이 제공되지 않았습니다.' },
        { status: 400 }
      )
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // 파일명 생성
    const fileName = `${Date.now()}-${file.name}`

    // Supabase Storage에 업로드
    const { data, error } = await supabaseAdmin.storage
      .from('sheets')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      console.error('Storage upload error:', error)
      return NextResponse.json(
        { error: '이미지 업로드에 실패했습니다.', details: error.message },
        { status: 500 }
      )
    }

    // 공개 URL 가져오기
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('sheets')
      .getPublicUrl(fileName)

    return NextResponse.json({ image_url: publicUrl })
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
```

### 2. Supabase 서버 클라이언트 수정

`lib/supabase/server.ts`에 Service Role Key 지원 추가:

```typescript
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
          }
        },
      },
    }
  )
}

// Service Role Key를 사용하는 관리자 클라이언트
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
```

---

## 비교: Google Drive vs Supabase Storage

| 항목 | Google Drive | Supabase Storage |
|------|-------------|------------------|
| 설정 복잡도 | 복잡 (서비스 계정, 공유 설정) | 간단 (버킷 생성만) |
| 무료 용량 | 15GB (개인 계정) | 1GB |
| 속도 | 보통 | 빠름 (CDN) |
| 통합 관리 | 별도 관리 | Supabase와 통합 |
| 에러 가능성 | 서비스 계정 할당량 문제 | 없음 |
| 권장 | ❌ | ✅ |

---

## 권장 사항

**Supabase Storage로 전환하는 것을 강력히 권장합니다.**

이유:
1. 이미 Supabase를 사용 중이므로 통합 관리 가능
2. 설정이 훨씬 간단함
3. Google Drive의 복잡한 공유 설정 불필요
4. 서비스 계정 할당량 문제 없음
5. 더 빠른 이미지 서빙

---

## 다음 단계

### Google Drive 계속 사용 시:
1. 개인 Google 계정의 폴더 생성
2. 서비스 계정에 폴더 공유 (편집자 권한)
3. 폴더 ID를 환경 변수에 설정
4. 재시도

### Supabase Storage로 전환 시:
1. Supabase 대시보드에서 Storage 버킷 생성
2. Storage Policy 설정
3. Service Role Key 환경 변수 추가
4. 코드 수정 (위 예시 참고)
5. 테스트

---

## 질문

어떤 방법을 선택하시겠습니까?
- 방법 1: Google Drive 계속 사용 (폴더 공유)
- 방법 2: Supabase Storage로 전환 (권장)

선택하시면 해당 방법으로 코드를 수정해드리겠습니다.
