# 찬양 콘티 관리 서비스

찬양인도자를 위한 간편한 콘티 공유 웹서비스입니다.

## 주요 기능

### 1. 악보 등록
- 이미지 파일을 클립보드에서 붙여넣기 또는 파일 업로드
- 곡명, 아티스트, Key 등록

### 2. 콘티 등록
- 예배 날짜, 예배명 입력
- 등록된 악보를 검색하여 추가 (곡명, 아티스트, Key로 검색)
- 곡 순서 조정 및 삭제

### 3. 콘티 공유
- 읽기 전용 공유 링크 생성
- 스마트폰 최적화 UI

## 기술 스택

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Storage**: Google Drive API
- **Deployment**: Vercel

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GOOGLE_DRIVE_CLIENT_EMAIL=your_google_service_account_email
GOOGLE_DRIVE_PRIVATE_KEY=your_google_service_account_private_key
GOOGLE_DRIVE_FOLDER_ID=your_google_drive_folder_id
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Supabase 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. SQL Editor에서 `supabase/migrations/001_initial_schema.sql` 파일의 내용 실행
3. 프로젝트 설정에서 URL과 Anon Key 복사하여 환경 변수에 설정

### 4. Google Drive API 설정

1. [Google Cloud Console](https://console.cloud.google.com)에서 프로젝트 생성
2. Google Drive API 활성화
3. 서비스 계정 생성 및 JSON 키 다운로드
4. 서비스 계정 이메일과 개인 키를 환경 변수에 설정
5. Google Drive에서 공유 폴더 생성 후 폴더 ID를 환경 변수에 설정

### 5. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 배포

### Vercel 배포

1. GitHub에 프로젝트 푸시
2. [Vercel](https://vercel.com)에서 프로젝트 import
3. 환경 변수 설정
4. 배포 완료!

## 프로젝트 구조

```
├── app/                    # Next.js App Router 페이지
│   ├── api/               # API 라우트
│   ├── songs/             # 악보 관련 페이지
│   ├── setlists/          # 콘티 관련 페이지
│   └── layout.tsx         # 루트 레이아웃
├── components/            # 재사용 가능한 컴포넌트
│   └── ui/                # UI 컴포넌트
├── lib/                   # 유틸리티 및 설정
│   ├── supabase/          # Supabase 클라이언트
│   └── google-drive.ts    # Google Drive API
├── types/                 # TypeScript 타입 정의
└── supabase/              # Supabase 마이그레이션
```

## 라이선스

MIT
