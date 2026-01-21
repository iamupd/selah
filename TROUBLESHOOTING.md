# 문제 해결 가이드

이미지 업로드 실패 문제를 해결하는 방법을 안내합니다.

## 🔍 이미지 업로드 실패 원인 진단

### 1. 환경 변수 확인

`.env.local` 파일에 다음 변수들이 올바르게 설정되어 있는지 확인하세요:

```env
GOOGLE_DRIVE_CLIENT_EMAIL=drive-uploader@project-xxxxx.iam.gserviceaccount.com
GOOGLE_DRIVE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n실제_개인키_내용\n-----END PRIVATE KEY-----\n"
GOOGLE_DRIVE_FOLDER_ID=1a2b3c4d5e6f7g8h9i0j
```

### 2. 환경 변수 설정 확인 방법

터미널에서 다음 명령어로 확인:

```bash
# Windows PowerShell
Get-Content .env.local

# Windows CMD
type .env.local

# Mac/Linux
cat .env.local
```

### 3. 일반적인 문제들

#### 문제 1: "GOOGLE_DRIVE_CLIENT_EMAIL이 설정되지 않았습니다"

**해결**:
1. `.env.local` 파일에 `GOOGLE_DRIVE_CLIENT_EMAIL` 추가
2. 값은 서비스 계정 이메일 주소 (JSON 파일의 `client_email` 필드)
3. 개발 서버 재시작

#### 문제 2: "GOOGLE_DRIVE_PRIVATE_KEY가 설정되지 않았습니다"

**해결**:
1. `.env.local` 파일에 `GOOGLE_DRIVE_PRIVATE_KEY` 추가
2. 값은 JSON 파일의 `private_key` 필드를 **따옴표로 감싸서** 입력
3. 예: `"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"`
4. 개발 서버 재시작

#### 문제 3: "GOOGLE_DRIVE_FOLDER_ID가 설정되지 않았습니다"

**해결**:
1. Google Drive에서 폴더 열기
2. URL에서 폴더 ID 복사
3. `.env.local` 파일에 `GOOGLE_DRIVE_FOLDER_ID` 추가
4. 개발 서버 재시작

#### 문제 4: "Permission denied" 또는 "Insufficient permissions"

**해결**:
1. Google Drive에서 폴더 공유 설정 확인
2. 서비스 계정 이메일이 **"편집자"** 권한으로 추가되었는지 확인
3. 서비스 계정 이메일 주소 확인:
   - JSON 파일의 `client_email` 필드
   - 또는 Google Cloud Console → IAM & Admin → Service Accounts

#### 문제 5: "Invalid credentials" 또는 "Authentication failed"

**해결**:
1. `GOOGLE_DRIVE_PRIVATE_KEY`가 따옴표로 감싸져 있는지 확인
2. `\n` 문자가 포함되어 있는지 확인
3. JSON 파일에서 `private_key` 값을 정확히 복사했는지 확인
4. 공백이나 특수문자가 잘못 포함되지 않았는지 확인

#### 문제 6: "File not found" 또는 "Folder not found"

**해결**:
1. `GOOGLE_DRIVE_FOLDER_ID`가 올바른지 확인
2. 폴더가 삭제되지 않았는지 확인
3. 서비스 계정에 폴더 접근 권한이 있는지 확인

---

## 🛠️ 단계별 해결 방법

### Step 1: 환경 변수 파일 확인

`.env.local` 파일이 프로젝트 루트에 있는지 확인:

```
프로젝트 루트/
├── .env.local  ← 여기에 있어야 함
├── app/
├── lib/
└── ...
```

### Step 2: 환경 변수 형식 확인

`.env.local` 파일 형식:

```env
# 올바른 형식
GOOGLE_DRIVE_CLIENT_EMAIL=drive-uploader@project-xxxxx.iam.gserviceaccount.com
GOOGLE_DRIVE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n실제키내용\n-----END PRIVATE KEY-----\n"
GOOGLE_DRIVE_FOLDER_ID=1a2b3c4d5e6f7g8h9i0j

# 잘못된 형식 (따옴표 없음)
GOOGLE_DRIVE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n실제키내용\n-----END PRIVATE KEY-----\n

# 잘못된 형식 (공백 포함)
GOOGLE_DRIVE_CLIENT_EMAIL = drive-uploader@project-xxxxx.iam.gserviceaccount.com
```

### Step 3: 개발 서버 재시작

환경 변수를 변경했다면 **반드시** 개발 서버를 재시작하세요:

```bash
# 서버 중지 (Ctrl+C)
# 서버 재시작
npm run dev
```

### Step 4: 브라우저 콘솔 확인

1. 브라우저에서 `F12` 또는 `Ctrl+Shift+I`로 개발자 도구 열기
2. **Console** 탭에서 에러 메시지 확인
3. **Network** 탭에서 `/api/songs/upload` 요청 확인
   - Status가 500이면 서버 에러
   - Response에서 상세 에러 메시지 확인

### Step 5: 서버 로그 확인

터미널에서 서버 로그를 확인하세요. 에러 메시지가 표시됩니다.

---

## 📝 체크리스트

업로드 실패 시 다음을 확인하세요:

- [ ] `.env.local` 파일이 프로젝트 루트에 있음
- [ ] `GOOGLE_DRIVE_CLIENT_EMAIL` 설정됨
- [ ] `GOOGLE_DRIVE_PRIVATE_KEY` 설정됨 (따옴표 포함)
- [ ] `GOOGLE_DRIVE_FOLDER_ID` 설정됨
- [ ] 환경 변수 값에 공백이나 잘못된 문자가 없음
- [ ] 개발 서버 재시작함
- [ ] Google Drive 폴더에 서비스 계정 공유됨 (편집자 권한)
- [ ] 브라우저 콘솔에서 에러 메시지 확인함
- [ ] 서버 로그에서 에러 메시지 확인함

---

## 🔧 빠른 테스트

환경 변수가 올바르게 설정되었는지 테스트:

1. `.env.local` 파일 확인
2. 개발 서버 재시작
3. 브라우저에서 `http://localhost:3000/songs/new` 접속
4. 이미지 업로드 시도
5. 브라우저 콘솔과 서버 로그 확인

---

## 💡 추가 팁

### Google Drive API 할당량 확인

Google Drive API는 일일 할당량이 있습니다:
- 무료 계정: 일일 1,000,000,000 할당량 단위
- 일반적으로 문제없지만, 많은 업로드 시 확인 필요

### 로그 확인 위치

- **브라우저 콘솔**: 클라이언트 사이드 에러
- **서버 터미널**: 서버 사이드 에러
- **Vercel Functions 로그**: 배포 후 에러 (Vercel 대시보드)

---

## 🆘 여전히 문제가 해결되지 않으면

1. 브라우저 콘솔의 전체 에러 메시지 복사
2. 서버 터미널의 에러 메시지 복사
3. `.env.local` 파일의 환경 변수 확인 (민감 정보 제외)
4. Google Cloud Console에서 API 활성화 확인
5. Google Drive 폴더 공유 설정 재확인
