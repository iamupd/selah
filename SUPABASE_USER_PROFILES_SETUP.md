# user_profiles 테이블 생성 가이드

이 가이드는 Supabase에서 `user_profiles` 테이블을 생성하는 방법을 설명합니다.

## ⚠️ 중요

회원가입 시 이름과 소속 찬양팀명을 저장하기 위해 반드시 `user_profiles` 테이블을 생성해야 합니다.

---

## 1. Supabase Dashboard 접속

1. [Supabase Dashboard](https://app.supabase.com/) 접속
2. 프로젝트 선택

---

## 2. SQL Editor에서 테이블 생성

### 2-1. SQL Editor 열기

1. 왼쪽 사이드바에서 **"SQL Editor"** 클릭
2. **"New query"** 버튼 클릭

### 2-2. SQL 실행

다음 SQL을 복사하여 SQL Editor에 붙여넣고 실행하세요:

```sql
-- Create user_profiles table to store additional user information
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  team_name TEXT NOT NULL,
  role TEXT DEFAULT '팀원' CHECK (role IN ('인도자', '팀원')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (에러 방지)
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

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

### 2-3. 실행

1. SQL Editor 우측 상단의 **"Run"** 버튼 클릭 (또는 `Ctrl+Enter`)
2. 성공 메시지 확인

---

## 3. 테이블 확인

### 3-1. Table Editor에서 확인

1. 왼쪽 사이드바에서 **"Table Editor"** 클릭
2. `user_profiles` 테이블이 표시되는지 확인
3. 테이블 구조 확인:
   - `id` (UUID, Primary Key)
   - `name` (TEXT)
   - `team_name` (TEXT)
   - `role` (TEXT, '인도자' 또는 '팀원')
   - `created_at` (Timestamp)
   - `updated_at` (Timestamp)

---

## 4. 기존 사용자 프로필 추가 (선택사항)

이미 회원가입한 사용자가 있다면, 수동으로 프로필을 추가할 수 있습니다:

```sql
-- 예시: 기존 사용자에게 프로필 추가
-- auth.users 테이블에서 사용자 ID를 확인한 후 실행

INSERT INTO user_profiles (id, name, team_name, role)
VALUES 
  ('사용자_UUID_여기', '사용자 이름', '찬양팀명', '팀원')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  team_name = EXCLUDED.team_name,
  role = EXCLUDED.role;
```

---

## 5. 문제 해결

### 테이블이 생성되지 않음

- SQL Editor에서 에러 메시지 확인
- `CREATE TABLE IF NOT EXISTS`를 사용했으므로 이미 존재하면 에러가 발생하지 않습니다
- 에러가 발생하면 에러 메시지를 확인하고 수정하세요

### RLS 정책 오류

- 기존 정책이 있으면 `DROP POLICY IF EXISTS`로 삭제 후 재생성
- 정책 이름이 충돌하면 다른 이름 사용

### 프로필 조회가 안 됨

- RLS 정책이 올바르게 설정되었는지 확인
- 사용자가 로그인되어 있는지 확인
- `auth.uid()`가 올바르게 작동하는지 확인

---

## 6. 테스트

1. 회원가입 페이지에서 새 계정 생성
2. 이름과 소속 찬양팀명 입력
3. 회원가입 완료 후 네비게이션 바에서 이름과 팀명이 표시되는지 확인
4. Supabase Dashboard > Table Editor > user_profiles에서 데이터 확인
