# Google Drive API 설정 가이드

이 가이드는 찬양 콘티 서비스에서 Google Drive를 이미지 스토리지로 사용하기 위한 설정 방법을 설명합니다.

## 📋 목차

1. [Google Cloud Console 프로젝트 생성](#1-google-cloud-console-프로젝트-생성)
2. [Google Drive API 활성화](#2-google-drive-api-활성화)
3. [서비스 계정 생성](#3-서비스-계정-생성)
4. [서비스 계정 키 다운로드](#4-서비스-계정-키-다운로드)
5. [Google Drive 폴더 생성 및 공유](#5-google-drive-폴더-생성-및-공유)
6. [환경 변수 설정](#6-환경-변수-설정)
7. [테스트](#7-테스트)

---

## 1. Google Cloud Console 프로젝트 생성

### 1-1. Google Cloud Console 접속

1. [Google Cloud Console](https://console.cloud.google.com/)에 접속
2. Google 계정으로 로그인

### 1-2. 새 프로젝트 생성

1. 상단의 프로젝트 선택 드롭다운 클릭
2. **"새 프로젝트"** 클릭
3. 프로젝트 이름 입력 (예: `찬양콘티-스토리지`)
4. **"만들기"** 클릭
5. 프로젝트가 생성될 때까지 대기 (약 1-2분)

---

## 2. Google Drive API 활성화

### 2-1. API 라이브러리로 이동

1. 왼쪽 메뉴에서 **"API 및 서비스"** → **"라이브러리"** 클릭
2. 검색창에 **"Google Drive API"** 입력
3. **"Google Drive API"** 선택

### 2-2. API 활성화

1. **"사용 설정"** 버튼 클릭
2. API가 활성화될 때까지 대기

---

## 3. 서비스 계정 생성

### 3-1. 서비스 계정 메뉴로 이동

1. 왼쪽 메뉴에서 **"API 및 서비스"** → **"사용자 인증 정보"** 클릭
2. 상단의 **"사용자 인증 정보 만들기"** 클릭
3. **"서비스 계정"** 선택

### 3-2. 서비스 계정 정보 입력

1. **서비스 계정 이름**: `drive-uploader` (원하는 이름 입력)
2. **서비스 계정 ID**: 자동 생성됨 (변경 가능)
3. **설명**: `Google Drive에 이미지 업로드용 서비스 계정` (선택사항)
4. **"만들기"** 클릭

### 3-3. 역할 설정 (선택사항)

1. 역할 선택 화면에서 **"건너뛰기"** 클릭 (또는 원하는 역할 선택)
2. **"완료"** 클릭

---

## 4. 서비스 계정 키 다운로드

### 4-1. 서비스 계정 선택

1. **"사용자 인증 정보"** 페이지로 돌아가기
2. 방금 생성한 서비스 계정 클릭 (이메일 주소로 표시됨)

### 4-2. 키 생성 및 다운로드

1. **"키"** 탭 클릭
2. **"키 추가"** → **"새 키 만들기"** 클릭
3. 키 유형: **"JSON"** 선택
4. **"만들기"** 클릭
5. JSON 파일이 자동으로 다운로드됨 (예: `찬양콘티-스토리지-xxxxx.json`)

⚠️ **중요**: 이 JSON 파일은 **절대 공개 저장소에 업로드하지 마세요!** `.gitignore`에 이미 포함되어 있습니다.

---

## 5. Google Drive 폴더 생성 및 공유

### 5-1. Google Drive에서 폴더 생성

1. [Google Drive](https://drive.google.com/) 접속
2. **"새로 만들기"** → **"폴더"** 클릭
3. 폴더 이름 입력 (예: `찬양콘티-악보`)
4. 폴더 생성

### 5-2. 서비스 계정에 폴더 공유

1. 생성한 폴더를 **우클릭** → **"공유"** 클릭
2. 공유 대상 입력란에 **서비스 계정 이메일 주소** 입력
   - 서비스 계정 이메일은 다운로드한 JSON 파일의 `client_email` 필드에 있습니다
   - 예: `drive-uploader@찬양콘티-스토리지.iam.gserviceaccount.com`
3. 권한: **"편집자"** 선택
4. **"완료"** 클릭

### 5-3. 폴더 ID 확인

1. Google Drive에서 공유한 폴더 열기
2. 브라우저 주소창의 URL 확인
   - URL 형식: `https://drive.google.com/drive/folders/폴더ID`
   - 예: `https://drive.google.com/drive/folders/1a2b3c4d5e6f7g8h9i0j`
3. **폴더 ID 복사** (위 예시에서 `1a2b3c4d5e6f7g8h9i0j` 부분)

---

## 6. 환경 변수 설정

### 6-1. JSON 파일에서 정보 추출

다운로드한 JSON 파일을 열어서 다음 정보를 확인하세요:

```json
{
  "type": "service_account",
  "project_id": "찬양콘티-스토리지",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "drive-uploader@찬양콘티-스토리지.iam.gserviceaccount.com",
  "client_id": "...",
  ...
}
```

### 6-2. .env.local 파일 생성

프로젝트 루트 디렉토리에 `.env.local` 파일을 생성하고 다음 내용을 입력하세요:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Drive API
GOOGLE_DRIVE_CLIENT_EMAIL=drive-uploader@찬양콘티-스토리지.iam.gserviceaccount.com
GOOGLE_DRIVE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
GOOGLE_DRIVE_FOLDER_ID=1a2b3c4d5e6f7g8h9i0j

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 6-3. 중요 사항

1. **GOOGLE_DRIVE_CLIENT_EMAIL**: JSON 파일의 `client_email` 값
2. **GOOGLE_DRIVE_PRIVATE_KEY**: JSON 파일의 `private_key` 값을 **그대로** 복사
   - 따옴표로 감싸야 합니다
   - `\n` 문자가 포함되어 있어야 합니다 (코드에서 자동으로 처리됨)
3. **GOOGLE_DRIVE_FOLDER_ID**: 5-3에서 복사한 폴더 ID

### 6-4. Vercel 배포 시 환경 변수 설정

Vercel에 배포할 때도 동일한 환경 변수를 설정해야 합니다:

1. Vercel 대시보드 → 프로젝트 선택
2. **"Settings"** → **"Environment Variables"** 클릭
3. 각 환경 변수를 추가:
   - `GOOGLE_DRIVE_CLIENT_EMAIL`
   - `GOOGLE_DRIVE_PRIVATE_KEY` (따옴표 포함)
   - `GOOGLE_DRIVE_FOLDER_ID`

---

## 7. 테스트

### 7-1. 개발 서버 실행

```bash
npm run dev
```

### 7-2. 악보 등록 테스트

1. 브라우저에서 `http://localhost:3000` 접속
2. **"악보 등록하기"** 클릭
3. 이미지 파일 업로드 또는 붙여넣기
4. 곡명, 아티스트, Key 입력
5. **"등록"** 클릭

### 7-3. 확인

1. Google Drive 폴더 확인
   - 업로드한 이미지 파일이 폴더에 생성되었는지 확인
2. 브라우저 콘솔 확인
   - 개발자 도구(F12) → Console 탭에서 에러 확인

---

## 🔧 문제 해결

### 문제 1: "Permission denied" 에러

**원인**: 서비스 계정에 폴더 공유 권한이 없음

**해결**:
1. Google Drive에서 폴더 공유 설정 확인
2. 서비스 계정 이메일이 **"편집자"** 권한으로 추가되었는지 확인

### 문제 2: "Invalid credentials" 에러

**원인**: 환경 변수 설정 오류

**해결**:
1. `.env.local` 파일의 `GOOGLE_DRIVE_CLIENT_EMAIL` 확인
2. `GOOGLE_DRIVE_PRIVATE_KEY`가 따옴표로 감싸져 있는지 확인
3. `private_key`의 `\n` 문자가 제대로 포함되어 있는지 확인

### 문제 3: 이미지가 보이지 않음

**원인**: 파일이 공개되지 않음

**해결**:
- 코드에서 자동으로 공개 권한을 설정하지만, 수동으로 확인:
  1. Google Drive에서 파일 우클릭
  2. **"공유"** → **"링크가 있는 모든 사용자"** 선택

---

## 📝 요약

1. ✅ Google Cloud Console에서 프로젝트 생성
2. ✅ Google Drive API 활성화
3. ✅ 서비스 계정 생성 및 JSON 키 다운로드
4. ✅ Google Drive 폴더 생성 및 서비스 계정에 공유
5. ✅ 환경 변수 설정 (`.env.local`)
6. ✅ 테스트

모든 설정이 완료되면 악보 이미지가 Google Drive에 자동으로 업로드되고, 공개 링크가 생성되어 웹에서 표시됩니다!
