# Supabase Storage 설정 가이드

Google Drive 대신 Supabase Storage를 사용하여 이미지를 저장하는 방법입니다.

## 📋 목차

1. [Supabase Storage 버킷 생성](#1-supabase-storage-버킷-생성)
2. [Storage Policy 설정](#2-storage-policy-설정)
3. [Service Role Key 확인](#3-service-role-key-확인)
4. [환경 변수 설정](#4-환경-변수-설정)
5. [테스트](#5-테스트)

---

## 1. Supabase Storage 버킷 생성

### 1-1. Supabase 대시보드 접속

1. [Supabase 대시보드](https://app.supabase.com) 접속
2. 프로젝트 선택

### 1-2. Storage 메뉴로 이동

1. 왼쪽 사이드바에서 **"Storage"** (📦 아이콘) 클릭

### 1-3. 새 버킷 생성

1. **"New bucket"** 버튼 클릭
2. 버킷 정보 입력:
   - **Name**: `sheets` (또는 원하는 이름)
   - **Public bucket**: ✅ **체크** (중요! 공개 읽기 필요)
3. **"Create bucket"** 클릭

⚠️ **중요**: 버킷 이름은 `sheets`로 설정하세요. 코드에서 이 이름을 사용합니다.

---

## 2. Storage Policy 설정

### 2-1. Policies 메뉴로 이동

1. Storage → **"Policies"** 탭 클릭
2. `sheets` 버킷 선택

### 2-2. INSERT 정책 생성 (업로드 허용)

1. **"New Policy"** 클릭
2. **"Create a policy from scratch"** 선택
3. 정책 정보 입력:
   - **Policy name**: `Allow public uploads`
   - **Allowed operation**: `INSERT` 선택
   - **Policy definition**: 
     ```sql
     (bucket_id = 'sheets')
     ```
4. **"Review"** → **"Save policy"** 클릭

### 2-3. SELECT 정책 생성 (읽기 허용)

1. **"New Policy"** 클릭
2. **"Create a policy from scratch"** 선택
3. 정책 정보 입력:
   - **Policy name**: `Allow public reads`
   - **Allowed operation**: `SELECT` 선택
   - **Policy definition**: 
     ```sql
     (bucket_id = 'sheets')
     ```
4. **"Review"** → **"Save policy"** 클릭

### 2-4. 정책 확인

다음 두 정책이 생성되었는지 확인:
- ✅ `Allow public uploads` (INSERT)
- ✅ `Allow public reads` (SELECT)

---

## 3. Service Role Key 확인

### 3-1. Settings 메뉴로 이동

1. 왼쪽 사이드바에서 **"Settings"** (⚙️ 아이콘) 클릭
2. **"API"** 메뉴 클릭

### 3-2. Service Role Key 복사

1. **"Project API keys"** 섹션에서
2. **"service_role" `secret`** 키 찾기
3. **"Reveal"** 버튼 클릭
4. 키 복사 (예: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

⚠️ **중요**: 
- 이 키는 **서버에서만** 사용하세요
- 클라이언트에 노출하면 안 됩니다
- `.env.local` 파일에만 저장하세요

---

## 4. 환경 변수 설정

### 4-1. .env.local 파일 수정

프로젝트 루트의 `.env.local` 파일에 다음을 추가:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase Storage (서버 사이드용)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4-2. Google Drive 환경 변수 제거 (선택사항)

Google Drive를 더 이상 사용하지 않으므로 다음 변수들을 제거할 수 있습니다:

```env
# 더 이상 필요 없음 (제거 가능)
# GOOGLE_DRIVE_CLIENT_EMAIL=...
# GOOGLE_DRIVE_PRIVATE_KEY=...
# GOOGLE_DRIVE_FOLDER_ID=...
```

---

## 5. 테스트

### 5-1. 개발 서버 재시작

환경 변수를 변경했으므로 개발 서버를 재시작하세요:

```bash
# Ctrl+C로 서버 중지 후
npm run dev
```

### 5-2. 이미지 업로드 테스트

1. 브라우저에서 `http://localhost:3000` 접속
2. **"악보 등록하기"** 클릭
3. 이미지 파일 업로드 또는 붙여넣기
4. 곡명, 아티스트, Key 입력
5. **"등록"** 버튼 클릭

### 5-3. Supabase Storage에서 확인

1. Supabase 대시보드 → **Storage** → **"sheets"** 버킷 클릭
2. 업로드한 이미지 파일이 표시되는지 확인
3. 파일 클릭하여 이미지가 정상적으로 표시되는지 확인

---

## 📝 요약

1. ✅ Supabase Storage 버킷 생성 (`sheets`, Public)
2. ✅ Storage Policy 설정 (INSERT, SELECT)
3. ✅ Service Role Key 복사
4. ✅ 환경 변수 설정 (`.env.local`)
5. ✅ 개발 서버 재시작
6. ✅ 테스트

---

## 🔧 문제 해결

### 문제 1: "SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다"

**해결**:
1. `.env.local` 파일에 `SUPABASE_SERVICE_ROLE_KEY` 추가
2. Supabase 대시보드에서 Service Role Key 복사
3. 개발 서버 재시작

### 문제 2: "new row violates row-level security policy"

**해결**:
1. Storage → Policies 확인
2. `sheets` 버킷에 INSERT, SELECT 정책이 있는지 확인
3. 정책이 없다면 위의 2단계를 다시 수행

### 문제 3: "Bucket not found"

**해결**:
1. 버킷 이름이 `sheets`인지 확인
2. 버킷이 Public으로 설정되었는지 확인
3. Supabase 대시보드에서 버킷이 생성되었는지 확인

### 문제 4: 이미지가 보이지 않음

**해결**:
1. 버킷이 Public으로 설정되었는지 확인
2. SELECT 정책이 설정되었는지 확인
3. 브라우저 콘솔에서 이미지 URL 확인

---

## 💡 장점

Supabase Storage 사용의 장점:

1. ✅ **간단한 설정**: Google API 설정 불필요
2. ✅ **통합 관리**: 데이터베이스와 스토리지를 한 곳에서 관리
3. ✅ **빠른 속도**: CDN을 통한 빠른 이미지 서빙
4. ✅ **무료 1GB**: 무료 요금제에서 1GB 제공
5. ✅ **에러 없음**: 서비스 계정 할당량 문제 없음
6. ✅ **이미지 최적화**: URL 파라미터로 이미지 크기 조절 가능

---

## 🎉 완료!

이제 Supabase Storage를 사용하여 이미지를 업로드할 수 있습니다!

Google Drive 설정은 더 이상 필요하지 않습니다.
