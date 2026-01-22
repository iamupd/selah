import { google } from 'googleapis'
import { Readable } from 'stream'

export async function uploadToGoogleDrive(
  imageBuffer: Buffer,
  fileName: string,
  mimeType: string = 'image/png'
): Promise<string> {
  if (!process.env.GOOGLE_DRIVE_CLIENT_EMAIL) {
    throw new Error('GOOGLE_DRIVE_CLIENT_EMAIL 환경 변수가 설정되지 않았습니다.')
  }

  if (!process.env.GOOGLE_DRIVE_PRIVATE_KEY) {
    throw new Error('GOOGLE_DRIVE_PRIVATE_KEY 환경 변수가 설정되지 않았습니다.')
  }

  if (!process.env.GOOGLE_DRIVE_FOLDER_ID) {
    throw new Error('GOOGLE_DRIVE_FOLDER_ID 환경 변수가 설정되지 않았습니다.')
  }

  // private_key에서 따옴표 제거 및 \n 처리
  let privateKey = process.env.GOOGLE_DRIVE_PRIVATE_KEY
  if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.slice(1, -1)
  }
  privateKey = privateKey.replace(/\\n/g, '\n')

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
      private_key: privateKey,
    },
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  })

  const drive = google.drive({ version: 'v3', auth })

  const fileMetadata = {
    name: fileName,
    parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
  }

  // Buffer를 Readable 스트림으로 변환하여 pipe 에러 방지
  const stream = Readable.from(imageBuffer)

  // MIME 타입을 실제 파일 타입에 맞게 설정
  const media = {
    mimeType: mimeType || 'image/png',
    body: stream,
  }

  const response = await drive.files.create({
    requestBody: fileMetadata,
    media: media,
    fields: 'id, webViewLink',
  })

  if (!response.data.id) {
    throw new Error('파일 업로드는 성공했지만 파일 ID를 가져올 수 없습니다.')
  }

  // 공개 링크 생성
  await drive.permissions.create({
    fileId: response.data.id,
    requestBody: {
      role: 'reader',
      type: 'anyone',
    },
  })

  // 공개 링크 URL 생성
  const fileId = response.data.id
  return `https://drive.google.com/uc?export=view&id=${fileId}`
}
