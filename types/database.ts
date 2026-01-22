export interface Song {
  id: string
  title: string
  artist: string
  key: string
  image_url: string
  storage_path?: string  // Storage 파일명 (삭제 시 사용)
  song_form?: string     // 송폼 (예: I - V - P - V)
  bpm?: number           // BPM
  time_signature?: string // 박자 (예: 4/4, 3/4, 6/8)
  description?: string   // 곡 설명
  youtube_url?: string   // 유튜브 링크
  author_id?: string     // 작성자 ID
  author_email?: string  // 작성자 이메일
  created_at: string
  updated_at: string
}

export interface Setlist {
  id: string
  date: string
  name: string
  description?: string
  author_id?: string     // 작성자 ID
  author_email?: string  // 작성자 이메일
  created_at: string
  updated_at: string
}

export interface SetlistSong {
  id: string
  setlist_id: string
  song_id: string
  song_order: number
  song?: Song
}
