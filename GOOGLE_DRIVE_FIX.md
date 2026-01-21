# Google Drive 서비스 계정 할당량 문제 해결

"Service Accounts do not have storage quota" 에러 해결 가이드

## 문제 원인

Google 서비스 계정은 자체 저장소 할당량이 없습니다. 따라서 **개인 Google 계정의 폴더를 서비스 계정과 공유**해야 합니다.

---

## 해결 단계

### 1단계: 개인 Google 계정의 폴더 확인

1. [Google Drive](https://drive.google.com) 접속
2. 이미 생성한 폴더가 있다면:
   - 폴더 우클릭 → "공유" 클릭
   - 공유된 사용자 목록 확인
3. 폴더가 없다면:
   - "새로 만들기" → "폴더" 클릭
   - 폴더 이름 입력 (예: `찬양콘티-악보`)
   - 폴더 생성

### 2단계: 서비스 계정 이메일 확인

서비스 계정 이메일 주소를 확인하세요:

1. 다운로드한 JSON 파일 열기
2. `client_email` 필드 확인
   - 예: `drive-uploader@project-xxxxx.iam.gserviceaccount.com`
3. 또는 Google Cloud Console에서 확인:
   - IAM & Admin → Service Accounts
   - 서비스 계정 클릭 → 이메일 주소 확인

### 3단계: 폴더 공유 설정

1. Google Drive에서 폴더 우클릭 → **"공유"** 클릭
2. **"사용자 및 그룹 추가"** 입력란에 서비스 계정 이메일 주소 입력
   - 예: `drive-uploader@project-xxxxx.iam.gserviceaccount.com`
3. 권한 선택: **"편집자"** (중요!)
4. **"완료"** 클릭

### 4단계: 폴더 ID 확인

1. Google Drive에서 공유한 폴더 열기
2. 브라우저 주소창의 URL 확인
   - 형식: `https://drive.google.com/drive/folders/폴더ID`
   - 예: `https://drive.google.com/drive/folders/1a2b3c4d5e6f7g8h9i0j`
3. **폴더 ID 복사** (위 예시에서 `1a2b3c4d5e6f7g8h9i0j` 부분)

### 5단계: 환경 변수 확인

`.env.local` 파일에서 다음을 확인:

```env
GOOGLE_DRIVE_CLIENT_EMAIL=drive-uploader@project-xxxxx.iam.gserviceaccount.com
GOOGLE_DRIVE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_DRIVE_FOLDER_ID=1a2b3c4d5e6f7g8h9i0j
```

**중요 확인 사항**:
- ✅ `GOOGLE_DRIVE_CLIENT_EMAIL`이 서비스 계정 이메일과 일치하는가?
- ✅ `GOOGLE_DRIVE_FOLDER_ID`가 공유한 폴더의 ID인가?
- ✅ 폴더가 서비스 계정 이메일과 공유되었는가? (편집자 권한)

### 6단계: 개발 서버 재시작

환경 변수를 변경했다면:

```bash
# Ctrl+C로 서버 중지 후
npm run dev
```

### 7단계: 테스트

1. 브라우저에서 `http://localhost:3000/songs/new` 접속
2. 이미지 업로드 시도
3. 성공하면 Google Drive 폴더에 파일이 생성되는지 확인

---

## 문제 해결 체크리스트

업로드가 실패하면 다음을 확인하세요:

- [ ] 폴더가 개인 Google 계정에 생성되었는가?
- [ ] 서비스 계정 이메일 주소가 정확한가?
- [ ] 폴더가 서비스 계정 이메일과 공유되었는가?
- [ ] 공유 권한이 "편집자"인가?
- [ ] `GOOGLE_DRIVE_FOLDER_ID`가 올바른 폴더 ID인가?
- [ ] 환경 변수가 올바르게 설정되었는가?
- [ ] 개발 서버를 재시작했는가?

---

## 자주 묻는 질문

### Q: 서비스 계정 이메일을 찾을 수 없어요

**A**: 
1. Google Cloud Console → IAM & Admin → Service Accounts
2. 생성한 서비스 계정 클릭
3. 이메일 주소 확인

또는 다운로드한 JSON 파일의 `client_email` 필드 확인

### Q: 폴더 ID를 어떻게 찾나요?

**A**:
1. Google Drive에서 폴더 열기
2. 브라우저 주소창 URL 확인
3. `/folders/` 뒤의 문자열이 폴더 ID

### Q: 공유했는데도 에러가 나요

**A**:
1. 공유 권한이 "편집자"인지 확인 (읽기 전용이면 안 됨)
2. 서비스 계정 이메일 주소가 정확한지 확인
3. 폴더 ID가 올바른지 확인
4. 개발 서버 재시작

### Q: 여러 폴더를 사용할 수 있나요?

**A**: 네, 여러 폴더를 공유하고 각각 다른 `GOOGLE_DRIVE_FOLDER_ID`를 사용할 수 있습니다.

---

## 추가 팁

### 폴더 공유 확인 방법

1. Google Drive에서 폴더 우클릭
2. "공유" 클릭
3. 공유된 사용자 목록에서 서비스 계정 이메일 확인
4. 권한이 "편집자"로 표시되어 있는지 확인

### 테스트 방법

1. Google Drive에서 공유한 폴더 열기
2. 이미지 업로드 시도
3. 폴더에 파일이 생성되는지 확인
4. 파일이 생성되면 공유 설정이 올바른 것입니다

---

## 여전히 문제가 있나요?

다음을 확인하세요:

1. **브라우저 콘솔**: 개발자 도구(F12) → Console 탭에서 에러 메시지 확인
2. **서버 로그**: 터미널에서 에러 메시지 확인
3. **Google Cloud Console**: API 할당량 확인
4. **Google Drive**: 폴더 공유 설정 재확인

문제가 계속되면 에러 메시지를 알려주세요.
