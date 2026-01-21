# Vercel 배포 가이드

이 가이드는 찬양 콘티 서비스를 Vercel에 배포하는 방법을 설명합니다.

## 📋 목차

1. [사전 준비](#1-사전-준비)
2. [GitHub에 프로젝트 푸시](#2-github에-프로젝트-푸시)
3. [Vercel 계정 생성](#3-vercel-계정-생성)
4. [Vercel에 프로젝트 배포](#4-vercel에-프로젝트-배포)
5. [환경 변수 설정](#5-환경-변수-설정)
6. [배포 확인](#6-배포-확인)
7. [문제 해결](#7-문제-해결)

---

## 1. 사전 준비

배포하기 전에 다음이 준비되어 있어야 합니다:

- ✅ Supabase 프로젝트 생성 완료
- ✅ Google Drive API 설정 완료
- ✅ `.env.local` 파일에 모든 환경 변수 설정 완료
- ✅ 로컬에서 `npm run dev`로 정상 작동 확인

---

## 2. GitHub에 프로젝트 푸시

### 2-1. Git 초기화 확인

프로젝트가 이미 Git 저장소인지 확인:

```bash
git status
```

이미 Git 저장소라면 2-2로 넘어가세요.

### 2-2. GitHub 저장소 생성

1. [GitHub](https://github.com) 접속 및 로그인
2. 우측 상단 **"+"** → **"New repository"** 클릭
3. 저장소 정보 입력:
   - **Repository name**: `worship-setlist` (원하는 이름)
   - **Description**: `찬양 콘티 관리 서비스` (선택사항)
   - **Visibility**: Private 또는 Public 선택
4. **"Create repository"** 클릭

### 2-3. 프로젝트 푸시

터미널에서 다음 명령어 실행:

```bash
# Git 초기화 (아직 안 했다면)
git init

# 모든 파일 추가
git add .

# 첫 커밋
git commit -m "Initial commit: 찬양 콘티 관리 서비스"

# GitHub 저장소 연결 (YOUR_USERNAME과 YOUR_REPO_NAME을 실제 값으로 변경)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# 브랜치 이름을 main으로 변경 (필요한 경우)
git branch -M main

# GitHub에 푸시
git push -u origin main
```

⚠️ **중요**: `.env.local` 파일은 `.gitignore`에 포함되어 있어 자동으로 제외됩니다. 절대 커밋하지 마세요!

---

## 3. Vercel 계정 생성

### 3-1. Vercel 웹사이트 접속

1. [Vercel](https://vercel.com) 접속
2. **"Sign Up"** 또는 **"Log In"** 클릭

### 3-2. GitHub로 로그인 (권장)

1. **"Continue with GitHub"** 클릭
2. GitHub 계정으로 로그인 및 권한 승인
   - Vercel이 GitHub 저장소에 접근할 수 있도록 권한 부여

---

## 4. Vercel에 프로젝트 배포

### 4-1. 새 프로젝트 생성

1. Vercel 대시보드에서 **"Add New..."** → **"Project"** 클릭
2. GitHub 저장소 목록에서 방금 푸시한 프로젝트 선택
3. **"Import"** 클릭

### 4-2. 프로젝트 설정

1. **Project Name**: 프로젝트 이름 (자동 입력됨, 변경 가능)
2. **Framework Preset**: Next.js (자동 감지됨)
3. **Root Directory**: `./` (기본값 유지)
4. **Build Command**: `npm run build` (기본값 유지)
5. **Output Directory**: `.next` (기본값 유지)
6. **Install Command**: `npm install` (기본값 유지)

### 4-3. 환경 변수 설정 (중요!)

**"Environment Variables"** 섹션에서 다음 변수들을 추가하세요:

#### Supabase 변수

1. **Name**: `NEXT_PUBLIC_SUPABASE_URL`
   - **Value**: Supabase 프로젝트 URL
   - 예: `https://xxxxxxxxxxxxx.supabase.co`

2. **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Value**: Supabase anon public 키
   - 예: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

#### Google Drive 변수

3. **Name**: `GOOGLE_DRIVE_CLIENT_EMAIL`
   - **Value**: 서비스 계정 이메일
   - 예: `drive-uploader@project-xxxxx.iam.gserviceaccount.com`

4. **Name**: `GOOGLE_DRIVE_PRIVATE_KEY`
   - **Value**: 서비스 계정 개인 키 (따옴표 포함!)
   - 예: `"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"`
   - ⚠️ **중요**: 따옴표로 감싸야 합니다!

5. **Name**: `GOOGLE_DRIVE_FOLDER_ID`
   - **Value**: Google Drive 폴더 ID
   - 예: `1a2b3c4d5e6f7g8h9i0j`

#### Next.js 변수

6. **Name**: `NEXT_PUBLIC_APP_URL`
   - **Value**: 배포 후 자동 생성된 URL (나중에 업데이트 가능)
   - 처음에는 빈 값으로 두거나 임시 URL 입력

### 4-4. 환경 변수 추가 방법

각 변수마다:
1. **"Add"** 또는 **"+"** 버튼 클릭
2. Name과 Value 입력
3. Environment 선택:
   - ✅ **Production** (필수)
   - ✅ **Preview** (선택, 개발 브랜치용)
   - ✅ **Development** (선택, 로컬 개발용)
4. **"Save"** 클릭

### 4-5. 배포 시작

1. 모든 환경 변수 추가 완료 후
2. **"Deploy"** 버튼 클릭
3. 배포 진행 상황 확인 (약 2-3분 소요)

---

## 5. 배포 확인

### 5-1. 배포 완료 확인

배포가 완료되면:
- ✅ **"Congratulations!"** 메시지 표시
- ✅ 배포된 URL 확인 (예: `https://worship-setlist.vercel.app`)

### 5-2. NEXT_PUBLIC_APP_URL 업데이트

1. Vercel 대시보드 → 프로젝트 → **"Settings"**
2. **"Environment Variables"** 클릭
3. `NEXT_PUBLIC_APP_URL` 찾기
4. **"Edit"** 클릭
5. Value를 배포된 URL로 변경 (예: `https://worship-setlist.vercel.app`)
6. **"Save"** 클릭
7. **"Redeploy"** 클릭하여 재배포

### 5-3. 웹사이트 테스트

1. 배포된 URL로 접속
2. **"악보 등록하기"** 클릭
3. 이미지 업로드 및 정보 입력
4. **"등록"** 클릭하여 정상 작동 확인

---

## 6. 자동 배포 설정

### 6-1. 자동 배포 동작

Vercel은 다음 경우에 자동으로 재배포합니다:
- ✅ `main` 브랜치에 푸시할 때
- ✅ Pull Request 생성 시 (Preview 배포)
- ✅ 환경 변수 변경 후 수동 재배포

### 6-2. 수동 재배포

1. Vercel 대시보드 → 프로젝트
2. **"Deployments"** 탭
3. 최신 배포의 **"..."** 메뉴 → **"Redeploy"** 클릭

---

## 7. 문제 해결

### 문제 1: "Build Failed" 에러

**원인**: 빌드 중 에러 발생

**해결**:
1. Vercel 대시보드에서 빌드 로그 확인
2. 에러 메시지 확인
3. 로컬에서 `npm run build` 실행하여 동일한 에러 재현
4. 에러 수정 후 다시 푸시

### 문제 2: "Environment Variable Missing" 에러

**원인**: 환경 변수가 설정되지 않음

**해결**:
1. Vercel 대시보드 → Settings → Environment Variables
2. 모든 필수 환경 변수가 추가되었는지 확인
3. Production 환경에 체크되어 있는지 확인
4. 재배포

### 문제 3: 이미지 업로드 실패

**원인**: Google Drive API 설정 오류

**해결**:
1. `GOOGLE_DRIVE_CLIVATE_KEY`가 따옴표로 감싸져 있는지 확인
2. `\n` 문자가 포함되어 있는지 확인
3. 서비스 계정에 폴더 공유 권한이 있는지 확인
4. Vercel 함수 로그 확인 (Functions 탭)

### 문제 4: 데이터베이스 연결 실패

**원인**: Supabase URL 또는 Key 오류

**해결**:
1. Supabase 대시보드에서 URL과 Key 재확인
2. Vercel 환경 변수 값이 정확한지 확인
3. 공백이나 따옴표가 잘못 포함되지 않았는지 확인

---

## 📝 배포 체크리스트

배포 전 확인사항:

- [ ] GitHub에 프로젝트 푸시 완료
- [ ] `.env.local` 파일이 커밋되지 않았는지 확인
- [ ] 로컬에서 `npm run build` 성공
- [ ] Supabase 프로젝트 생성 및 스키마 설정 완료
- [ ] Google Drive API 설정 완료
- [ ] Vercel 계정 생성 완료
- [ ] 모든 환경 변수 Vercel에 추가 완료
- [ ] 배포 후 웹사이트 테스트 완료

---

## 🔗 유용한 링크

- [Vercel 공식 문서](https://vercel.com/docs)
- [Vercel 대시보드](https://vercel.com/dashboard)
- [Next.js 배포 가이드](https://nextjs.org/docs/deployment)

---

## 💡 추가 팁

### 커스텀 도메인 설정

1. Vercel 대시보드 → 프로젝트 → Settings → Domains
2. 원하는 도메인 입력
3. DNS 설정 안내에 따라 도메인 연결

### 환경별 배포

- **Production**: `main` 브랜치 → 프로덕션 URL
- **Preview**: 다른 브랜치 → 임시 URL
- **Development**: 로컬 개발 환경

### 성능 모니터링

Vercel 대시보드에서:
- 배포 상태 확인
- 함수 실행 로그 확인
- 대역폭 사용량 확인

---

## 🎉 완료!

배포가 완료되면 전 세계 어디서나 접속 가능한 웹서비스가 됩니다!

배포된 URL을 공유하여 찬양 팀원들과 함께 사용하세요.
