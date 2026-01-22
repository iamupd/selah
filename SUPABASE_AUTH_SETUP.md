# Supabase Google 로그인 설정 가이드

## 1. Google Cloud Console 설정

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 선택 또는 새 프로젝트 생성
3. **APIs & Services** > **Credentials** 이동
4. **Create Credentials** > **OAuth client ID** 선택
5. Application type: **Web application** 선택
6. **Authorized redirect URIs**에 다음 URL 추가:
   ```
   https://[YOUR_PROJECT_REF].supabase.co/auth/v1/callback
   ```
   - `[YOUR_PROJECT_REF]`는 Supabase 프로젝트 URL에서 확인 가능
   - 예: `https://abcdefghijklmnop.supabase.co/auth/v1/callback`
7. **Client ID**와 **Client Secret** 복사

## 2. Supabase Dashboard 설정

1. [Supabase Dashboard](https://app.supabase.com/) 접속
2. 프로젝트 선택
3. **Authentication** > **Providers** 메뉴 이동
4. **Google** Provider 찾기
5. **Enable Google** 토글 활성화
6. **Client ID (for OAuth)**에 Google Cloud Console에서 복사한 Client ID 입력
7. **Client Secret (for OAuth)**에 Google Cloud Console에서 복사한 Client Secret 입력
8. **Save** 클릭

## 3. Redirect URL 확인

Supabase Dashboard > **Authentication** > **URL Configuration**에서:

### 로컬 개발용 설정
- **Site URL**: `http://localhost:3000`
- **Redirect URLs**: 다음 추가
  ```
  http://localhost:3000/auth/callback
  ```

### 배포 환경 설정 (중요!)
배포 후에는 반드시 다음을 설정해야 합니다:
- **Site URL**: 배포된 도메인으로 변경 (예: `https://selah-zeta.vercel.app`)
- **Redirect URLs**: 배포된 도메인의 콜백 URL 추가
  ```
  https://selah-zeta.vercel.app/auth/callback
  ```

⚠️ **주의**: Site URL과 Redirect URLs 모두 배포 URL로 설정해야 로그인 후 올바른 도메인으로 리다이렉트됩니다.

## 4. 테스트

1. 로컬 서버 실행: `npm run dev`
2. 브라우저에서 `http://localhost:3000/auth` 접속
3. "Google로 로그인" 버튼 클릭
4. Google 로그인 화면이 나타나면 성공!

## 문제 해결

### "Unsupported provider" 오류
- Supabase Dashboard에서 Google Provider가 활성화되어 있는지 확인
- Client ID와 Client Secret이 올바르게 입력되었는지 확인

### 리디렉트 오류
- Google Cloud Console의 Authorized redirect URIs에 Supabase 콜백 URL이 정확히 입력되었는지 확인
- Supabase Dashboard의 Redirect URLs에 앱의 콜백 URL이 추가되었는지 확인

### 로그인 후 localhost로 리다이렉트되는 문제
- Supabase Dashboard > **Authentication** > **URL Configuration**에서:
  - **Site URL**이 배포된 도메인으로 설정되어 있는지 확인 (예: `https://selah-zeta.vercel.app`)
  - **Redirect URLs**에 배포된 도메인의 콜백 URL이 추가되어 있는지 확인 (예: `https://selah-zeta.vercel.app/auth/callback`)
  - 설정 변경 후 Supabase가 변경사항을 적용하는데 몇 분이 걸릴 수 있습니다
