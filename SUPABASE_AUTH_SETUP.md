# Supabase 이메일/비밀번호 인증 설정 가이드

이 가이드는 찬양 콘티 서비스에서 Supabase 이메일/비밀번호 인증을 사용하기 위한 설정 방법을 설명합니다.

## 📋 목차

1. [Supabase 프로젝트 설정](#1-supabase-프로젝트-설정)
2. [데이터베이스 스키마 설정](#2-데이터베이스-스키마-설정)
3. [환경 변수 설정](#3-환경-변수-설정)
4. [테스트](#4-테스트)

---

## 1. Supabase 프로젝트 설정

### 1-1. Email Provider 활성화 확인

1. [Supabase Dashboard](https://app.supabase.com/) 접속
2. 프로젝트 선택
3. **Authentication** > **Providers** 메뉴 이동
4. **Email** Provider가 활성화되어 있는지 확인 (기본적으로 활성화됨)

### 1-2. 이메일 확인 비활성화 (권장)

회원가입 후 바로 로그인할 수 있도록 이메일 확인을 비활성화하는 것을 권장합니다:

1. **Authentication** > **Providers** 메뉴 이동
2. **Email** Provider 클릭
3. **"Confirm email"** 토글을 **비활성화**
4. **"Save"** 클릭

⚠️ **주의**: 이메일 확인을 비활성화하면 보안이 약간 낮아지지만, 개발 및 테스트 환경에서는 편의성을 위해 비활성화하는 것이 좋습니다.

### 1-3. 이메일 템플릿 설정 (선택사항)

1. **Authentication** > **Email Templates** 메뉴 이동
2. 필요에 따라 이메일 템플릿 커스터마이징 가능
   - Confirm signup (회원가입 확인)
   - Magic Link (매직 링크)
   - Change Email Address (이메일 변경)
   - Reset Password (비밀번호 재설정)

---

## 2. 데이터베이스 스키마 설정

### 2-1. 사용자 프로필 테이블 생성

Supabase Dashboard > **SQL Editor**에서 다음 SQL을 실행하세요:

```sql
-- Create user_profiles table to store additional user information
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  team_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create index
CREATE INDEX IF NOT EXISTS idx_user_profiles_id ON user_profiles(id);
```

또는 마이그레이션 파일(`supabase/migrations/006_create_user_profiles.sql`)을 사용할 수 있습니다.

---

## 3. 환경 변수 설정

### 3-1. 로컬 개발 환경

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase Storage (서버 사이드용)
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...

# Google Drive API
GOOGLE_DRIVE_CLIENT_EMAIL=...
GOOGLE_DRIVE_PRIVATE_KEY="..."
GOOGLE_DRIVE_FOLDER_ID=...

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_BACKGROUND_IMAGE_URL=...
```

### 3-2. 배포 환경 (Vercel)

Vercel 대시보드에서 환경 변수를 설정하세요. `NEXT_PUBLIC_APP_URL`은 배포된 도메인으로 설정합니다.

---

## 4. 테스트

### 4-1. 개발 서버 실행

```bash
npm run dev
```

### 4-2. 회원가입 테스트

1. 브라우저에서 `http://localhost:3000/auth` 접속
2. **"회원가입"** 버튼 클릭
3. 다음 정보 입력:
   - 이메일: `test@example.com`
   - 비밀번호: `Test123!` (6자 이상, 특수문자 포함)
   - 비밀번호 확인: `Test123!`
   - 이름: `홍길동`
   - 소속 찬양팀명: `찬양팀`
4. **"회원가입"** 버튼 클릭
5. 대시보드로 자동 리다이렉트되는지 확인

### 4-3. 로그인 테스트

1. 로그아웃 후 다시 `/auth` 접속
2. 이메일과 비밀번호 입력
3. **"로그인"** 버튼 클릭
4. 대시보드로 리다이렉트되는지 확인

---

## 비밀번호 규칙

- 최소 6자 이상
- 특수문자 포함 필수 (`!@#$%^&*()_+-=[]{}|;':",./<>?` 등)

---

## 문제 해결

### "회원가입 오류" 메시지

- 이메일 형식이 올바른지 확인
- 비밀번호가 규칙을 만족하는지 확인 (6자 이상, 특수문자 포함)
- Supabase Dashboard에서 Email Provider가 활성화되어 있는지 확인

### "로그인 오류" 메시지

- 이메일과 비밀번호가 올바른지 확인
- Supabase Dashboard > Authentication > Users에서 사용자가 생성되었는지 확인

### 프로필 정보가 표시되지 않음

- Supabase Dashboard > Table Editor에서 `user_profiles` 테이블에 데이터가 있는지 확인
- RLS 정책이 올바르게 설정되었는지 확인
