# Supabase 설정 가이드

이 가이드는 찬양 콘티 서비스에서 Supabase를 데이터베이스로 사용하기 위한 설정 방법을 설명합니다.

## 📋 목차

1. [Supabase 계정 생성](#1-supabase-계정-생성)
2. [새 프로젝트 생성](#2-새-프로젝트-생성)
3. [프로젝트 URL과 API Key 확인](#3-프로젝트-url과-api-key-확인)
4. [데이터베이스 스키마 설정](#4-데이터베이스-스키마-설정)
5. [환경 변수 설정](#5-환경-변수-설정)
6. [테스트](#6-테스트)

---

## 1. Supabase 계정 생성

### 1-1. Supabase 웹사이트 접속

1. [Supabase 공식 웹사이트](https://supabase.com/) 접속
2. 우측 상단의 **"Start your project"** 또는 **"Sign in"** 클릭

### 1-2. GitHub 계정으로 로그인 (권장)

1. **"Continue with GitHub"** 클릭
2. GitHub 계정으로 로그인 및 권한 승인
   - 또는 이메일/비밀번호로 가입 가능

---

## 2. 새 프로젝트 생성

### 2-1. 프로젝트 생성 시작

1. 로그인 후 대시보드에서 **"New Project"** 버튼 클릭

### 2-2. 프로젝트 정보 입력

다음 정보를 입력하세요:

1. **Organization** (조직)
   - 기존 조직 선택 또는 새 조직 생성
   - 개인 사용 시: "Personal" 선택

2. **Name** (프로젝트 이름)
   - 예: `찬양콘티` 또는 `worship-setlist`

3. **Database Password** (데이터베이스 비밀번호)
   - ⚠️ **중요**: 이 비밀번호는 나중에 복구할 수 없으므로 안전한 곳에 저장하세요!
   - 강력한 비밀번호 사용 권장 (최소 12자, 대소문자, 숫자, 특수문자 포함)
   - 예: `MyWorship2024!@#`

4. **Region** (지역)
   - 가장 가까운 지역 선택
   - 한국 사용자: `Northeast Asia (Seoul)` 또는 `Southeast Asia (Singapore)` 권장

5. **Pricing Plan**
   - **Free** 플랜 선택 (무료 요금제)

### 2-3. 프로젝트 생성 완료

1. **"Create new project"** 버튼 클릭
2. 프로젝트 생성 완료까지 약 2-3분 소요
   - "Setting up your project..." 메시지가 표시됨

---

## 3. 프로젝트 URL과 API Key 확인

프로젝트가 생성되면 자동으로 프로젝트 대시보드로 이동합니다.

### 3-1. Settings 메뉴로 이동

1. 왼쪽 사이드바에서 **"Settings"** (⚙️ 아이콘) 클릭
2. **"API"** 메뉴 클릭

### 3-2. Project URL 확인

**"Project URL"** 섹션에서 다음을 확인:

```
https://xxxxxxxxxxxxx.supabase.co
```

이 URL을 복사하세요. 이것이 `NEXT_PUBLIC_SUPABASE_URL` 값입니다.

### 3-3. API Keys 확인

**"Project API keys"** 섹션에서 두 가지 키를 확인할 수 있습니다:

#### 3-3-1. `anon` `public` 키 (사용할 키)

- **"anon" `public`** 라벨이 있는 키
- 이 키는 클라이언트에서 안전하게 사용할 수 있는 공개 키입니다
- **"Reveal"** 버튼을 클릭하여 키 표시
- 키를 복사하세요 (예: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

⚠️ **중요**: 이 키는 `NEXT_PUBLIC_SUPABASE_ANON_KEY`로 사용됩니다.

#### 3-3-2. `service_role` `secret` 키 (사용하지 않음)

- **"service_role" `secret`** 라벨이 있는 키
- ⚠️ **절대 클라이언트에 노출하지 마세요!**
- 서버 사이드에서만 사용해야 하며, 현재 프로젝트에서는 사용하지 않습니다

### 3-4. 키 복사 방법

1. **"Reveal"** 버튼 클릭
2. 키 옆의 **복사 아이콘** (📋) 클릭
3. 또는 키를 직접 선택하여 `Ctrl+C` (Windows) / `Cmd+C` (Mac)로 복사

---

## 4. 데이터베이스 스키마 설정

### 4-1. SQL Editor 열기

1. 왼쪽 사이드바에서 **"SQL Editor"** (📝 아이콘) 클릭
2. **"New query"** 버튼 클릭

### 4-2. 마이그레이션 SQL 실행

1. 프로젝트의 `supabase/migrations/001_initial_schema.sql` 파일을 열기
2. 파일의 전체 내용을 복사
3. SQL Editor에 붙여넣기
4. 우측 상단의 **"Run"** 버튼 클릭 (또는 `Ctrl+Enter`)

### 4-3. 실행 결과 확인

성공 메시지가 표시되면:
- ✅ `songs` 테이블 생성 완료
- ✅ `setlists` 테이블 생성 완료
- ✅ `setlist_songs` 테이블 생성 완료
- ✅ 인덱스 및 RLS 정책 생성 완료

### 4-4. 테이블 확인

1. 왼쪽 사이드바에서 **"Table Editor"** (📊 아이콘) 클릭
2. 다음 테이블들이 생성되었는지 확인:
   - `songs`
   - `setlists`
   - `setlist_songs`

---

## 5. 환경 변수 설정

### 5-1. .env.local 파일 생성

프로젝트 루트 디렉토리에 `.env.local` 파일을 생성하세요.

### 5-2. 환경 변수 입력

`.env.local` 파일에 다음 내용을 입력:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Google Drive API
GOOGLE_DRIVE_CLIENT_EMAIL=your_google_service_account_email
GOOGLE_DRIVE_PRIVATE_KEY="your_private_key"
GOOGLE_DRIVE_FOLDER_ID=your_folder_id

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5-3. 실제 값 입력

- `NEXT_PUBLIC_SUPABASE_URL`: 3-2에서 복사한 Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: 3-3-1에서 복사한 anon public 키

### 5-4. 파일 저장

`.env.local` 파일을 저장하세요.

---

## 6. 테스트

### 6-1. 개발 서버 재시작

환경 변수를 변경했으므로 개발 서버를 재시작해야 합니다:

```bash
# 서버가 실행 중이면 Ctrl+C로 중지 후
npm run dev
```

### 6-2. 데이터베이스 연결 테스트

1. 브라우저에서 `http://localhost:3000` 접속
2. **"악보 등록하기"** 클릭
3. 이미지 업로드 및 정보 입력
4. **"등록"** 클릭

### 6-3. Supabase에서 데이터 확인

1. Supabase 대시보드로 돌아가기
2. **"Table Editor"** 클릭
3. `songs` 테이블 선택
4. 방금 등록한 악보 데이터가 표시되는지 확인

---

## 📸 스크린샷 가이드

### Settings → API 페이지

```
Settings
├── General
├── API          ← 여기 클릭!
├── Database
└── ...
```

### Project URL 위치

```
Project URL
https://xxxxxxxxxxxxx.supabase.co  [복사 버튼]
```

### API Keys 위치

```
Project API keys

anon public
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  [Reveal] [복사]

service_role secret
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  [Reveal] [복사]
         ↑ 이 키는 사용하지 않음!
```

---

## 🔧 문제 해결

### 문제 1: "Invalid API key" 에러

**원인**: 잘못된 API 키 또는 URL

**해결**:
1. Supabase 대시보드에서 URL과 키를 다시 확인
2. `.env.local` 파일의 값이 정확한지 확인
3. 따옴표나 공백이 포함되지 않았는지 확인
4. 개발 서버 재시작

### 문제 2: "relation does not exist" 에러

**원인**: 데이터베이스 스키마가 생성되지 않음

**해결**:
1. SQL Editor에서 마이그레이션 SQL을 다시 실행
2. 에러 메시지 확인 및 수정
3. Table Editor에서 테이블이 생성되었는지 확인

### 문제 3: "permission denied" 에러

**원인**: RLS (Row Level Security) 정책 문제

**해결**:
1. SQL Editor에서 RLS 정책 확인
2. `001_initial_schema.sql` 파일의 정책이 제대로 실행되었는지 확인

---

## 📝 요약

1. ✅ Supabase 계정 생성 (GitHub 로그인)
2. ✅ 새 프로젝트 생성 (Free 플랜)
3. ✅ Settings → API에서 URL과 anon public 키 복사
4. ✅ SQL Editor에서 마이그레이션 실행
5. ✅ `.env.local` 파일에 환경 변수 설정
6. ✅ 개발 서버 재시작 및 테스트

---

## 🔗 유용한 링크

- [Supabase 공식 문서](https://supabase.com/docs)
- [Supabase 대시보드](https://app.supabase.com/)
- [Supabase 시작 가이드](https://supabase.com/docs/guides/getting-started)

---

## 💡 추가 팁

### 데이터베이스 비밀번호 분실 시

데이터베이스 비밀번호를 잊어버린 경우:
1. Settings → Database → Database password
2. **"Reset database password"** 클릭
3. 새 비밀번호 설정

### 프로젝트 삭제

프로젝트를 삭제하려면:
1. Settings → General
2. 맨 아래 **"Delete Project"** 클릭
3. 프로젝트 이름 입력하여 확인

⚠️ **주의**: 삭제된 프로젝트는 복구할 수 없습니다!
