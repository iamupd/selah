'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Upload, X, Loader2 } from 'lucide-react'

export default function NewSongPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [key, setKey] = useState('')
  const [songForm, setSongForm] = useState('')
  const [bpm, setBpm] = useState('')
  const [timeSignature, setTimeSignature] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pasteAreaRef = useRef<HTMLDivElement>(null)

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.')
      return
    }

    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      setImageUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile()
        if (file) {
          handleFileSelect(file)
        }
      }
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleRemoveImage = () => {
    setImageUrl(null)
    setImageFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleUpload = async () => {
    if (!imageFile) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', imageFile)

      const response = await fetch('/api/songs/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || '업로드 실패'
        const errorDetails = errorData.details ? `\n상세: ${errorData.details}` : ''
        throw new Error(`${errorMessage}${errorDetails}`)
      }

      const data = await response.json()
      if (!data.image_url) {
        throw new Error('이미지 URL을 받아오지 못했습니다.')
      }
      return { image_url: data.image_url, storage_path: data.storage_path }
    } catch (error) {
      console.error('Upload error:', error)
      const errorMessage = error instanceof Error ? error.message : '이미지 업로드에 실패했습니다.'
      alert(errorMessage)
      return null
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !artist || !key || !imageFile) {
      alert('모든 필드를 입력하고 이미지를 업로드해주세요.')
      return
    }

    setIsSubmitting(true)

    try {
      // 이미지 업로드
      const uploadResult = await handleUpload()
      if (!uploadResult) {
        setIsSubmitting(false)
        return
      }

      // 악보 등록
      const response = await fetch('/api/songs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          artist,
          key,
          image_url: uploadResult.image_url,
          storage_path: uploadResult.storage_path,
          song_form: songForm || null,
          bpm: bpm ? parseInt(bpm, 10) : null,
          time_signature: timeSignature || null,
          description: description || null,
        }),
      })

      if (!response.ok) {
        throw new Error('등록 실패')
      }

      router.push('/songs')
    } catch (error) {
      console.error('Submit error:', error)
      alert('악보 등록에 실패했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-4 md:py-8">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-xl md:text-2xl">새 악보 등록</CardTitle>
        </CardHeader>
        <CardContent className="px-4 md:px-6">
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            {/* 이미지 업로드 영역 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                악보 이미지
              </label>
              {!imageUrl ? (
                <div
                  ref={pasteAreaRef}
                  onPaste={handlePaste}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 md:p-8 text-center cursor-pointer hover:border-blue-500 transition-colors active:bg-gray-50"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mx-auto h-8 w-8 md:h-12 md:w-12 text-gray-400 mb-3 md:mb-4" />
                  <p className="text-xs md:text-sm text-gray-600 mb-2">
                    이미지를 드래그하거나 클릭하여 업로드
                  </p>
                  <p className="text-xs text-gray-500">
                    또는 클립보드에서 붙여넣기
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full rounded-lg border border-gray-300 max-h-96 object-contain bg-gray-50"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 active:bg-red-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* 곡명 */}
            <div>
              <label className="block text-sm font-medium mb-2">곡명</label>
              <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="곡명을 입력하세요"
                required
              />
            </div>

            {/* 아티스트 */}
            <div>
              <label className="block text-sm font-medium mb-2">아티스트</label>
              <Input
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="아티스트를 입력하세요"
                required
              />
            </div>

            {/* Key */}
            <div>
              <label className="block text-sm font-medium mb-2">Key</label>
              <Input
                type="text"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="예: C, D, E 등"
                required
              />
            </div>

            {/* 송폼 */}
            <div>
              <label className="block text-sm font-medium mb-2">송폼</label>
              <Input
                type="text"
                value={songForm}
                onChange={(e) => setSongForm(e.target.value)}
                placeholder="예: I - V - P - V, V - C - V - C 등"
              />
            </div>

            {/* BPM */}
            <div>
              <label className="block text-sm font-medium mb-2">BPM</label>
              <Input
                type="number"
                value={bpm}
                onChange={(e) => setBpm(e.target.value)}
                placeholder="예: 120"
                min="0"
                max="300"
              />
            </div>

            {/* 박자 */}
            <div>
              <label className="block text-sm font-medium mb-2">박자</label>
              <Select
                value={timeSignature}
                onChange={(e) => setTimeSignature(e.target.value)}
              >
                <option value="">선택하세요</option>
                <option value="4/4">4/4 (Common Time)</option>
                <option value="3/4">3/4 (Waltz)</option>
                <option value="2/4">2/4</option>
                <option value="6/8">6/8</option>
                <option value="12/8">12/8</option>
                <option value="5/4">5/4</option>
                <option value="7/8">7/8</option>
                <option value="9/8">9/8</option>
              </Select>
            </div>

            {/* 설명 */}
            <div>
              <label className="block text-sm font-medium mb-2">설명</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="이 곡에 대한 설명을 입력하세요..."
                className="min-h-[100px] resize-y"
              />
            </div>

            {/* 제출 버튼 */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1"
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || isUploading}
                className="flex-1"
              >
                {isSubmitting || isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    등록 중...
                  </>
                ) : (
                  '등록'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
