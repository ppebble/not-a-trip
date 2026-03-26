'use client'

import { useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Image from 'next/image'
import { ContentTypeIcon } from '@/components/common'
import { ContentType, CONTENT_TYPE_CONFIG } from '@/types'
import {
  useAdminContentImages,
  useInvalidateAdminContentImages,
} from '@/hooks/useAdminQueries'

export default function AdminContentImagesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const invalidateContentImages = useInvalidateAdminContentImages()

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [syncing, setSyncing] = useState(false)

  // 업로드 모달 상태
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedContent, setSelectedContent] = useState<{
    id: string
    normalizedName: string
    displayName: string
    type?: ContentType
  } | null>(null)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadPreview, setUploadPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  // 새 콘텐츠 추가 상태
  const [newContentName, setNewContentName] = useState('')
  const [newContentType, setNewContentType] = useState<ContentType>('anime')
  const [newContentYear, setNewContentYear] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  // React Query로 콘텐츠 목록 조회
  const { data, isLoading } = useAdminContentImages(search, page)
  const contents = data?.items ?? []
  const totalPages = data?.totalPages ?? 1

  // 권한 체크
  useEffect(() => {
    if (status === 'loading') return
    if (!session?.user || session.user.role !== 'admin') {
      router.push('/')
    }
  }, [status, session, router])

  const handleSync = async () => {
    if (syncing) return
    try {
      setSyncing(true)
      const res = await fetch('/api/admin/content-images/sync', {
        method: 'POST',
      })
      if (!res.ok) throw new Error('Sync failed')
      const data = await res.json()
      alert(data.message)
      invalidateContentImages()
    } catch {
      alert('동기화에 실패했습니다')
    } finally {
      setSyncing(false)
    }
  }

  const handleUpload = async () => {
    if (uploading) return
    const contentName = selectedContent?.displayName || newContentName.trim()
    if (!contentName) {
      alert('콘텐츠 이름을 입력해주세요')
      return
    }
    if (!uploadFile && !selectedContent) {
      alert('이미지를 선택해주세요')
      return
    }
    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('contentName', contentName)
      if (uploadFile) formData.append('file', uploadFile)
      if (!selectedContent) {
        formData.append('contentType', newContentType)
        if (newContentYear) formData.append('year', newContentYear)
      }
      const res = await fetch('/api/admin/content-images', {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Upload failed')
      }
      alert('업로드 완료!')
      closeUploadModal()
      invalidateContentImages()
    } catch (error) {
      alert(error instanceof Error ? error.message : '업로드에 실패했습니다')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteImage = async (normalizedName: string) => {
    if (!confirm('이미지를 삭제하시겠습니까?')) return
    try {
      const res = await fetch(
        `/api/admin/content-images?normalizedName=${encodeURIComponent(normalizedName)}`,
        { method: 'DELETE' }
      )
      if (!res.ok) throw new Error('Delete failed')
      alert('이미지가 삭제되었습니다')
      invalidateContentImages()
    } catch {
      alert('삭제에 실패했습니다')
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setUploadPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const openUploadModal = (content?: {
    id: string
    normalizedName: string
    displayName: string
    type?: string
  }) => {
    setSelectedContent(
      content
        ? { ...content, type: content.type as ContentType | undefined }
        : null
    )
    setUploadFile(null)
    setUploadPreview(null)
    setNewContentName('')
    setNewContentType('anime')
    setNewContentYear('')
    setShowUploadModal(true)
  }

  const closeUploadModal = () => {
    setShowUploadModal(false)
    setSelectedContent(null)
    setUploadFile(null)
    setUploadPreview(null)
    setNewContentName('')
    setNewContentType('anime')
    setNewContentYear('')
  }

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    )
  }

  if (!session?.user || session.user.role !== 'admin') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold text-gray-800">
            접근 권한 없음
          </h1>
          <p className="text-gray-600">관리자만 접근할 수 있습니다.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              콘텐츠 이미지 관리
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              관련 콘텐츠의 대표 이미지를 관리합니다
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSync}
              disabled={syncing}
              className="rounded-lg bg-gray-600 px-4 py-2 text-white hover:bg-gray-700 disabled:opacity-50"
            >
              {syncing ? '동기화 중...' : '스팟 데이터 동기화'}
            </button>
            <button
              onClick={() => openUploadModal()}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              + 새 콘텐츠 추가
            </button>
          </div>
        </div>

        <div className="mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="콘텐츠 이름으로 검색..."
            className="w-full max-w-md rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-gray-500">로딩 중...</div>
        ) : contents.length === 0 ? (
          <div className="py-12 text-center">
            <p className="mb-4 text-gray-500">
              {search ? '검색 결과가 없습니다' : '등록된 콘텐츠가 없습니다'}
            </p>
            {!search && (
              <button
                onClick={handleSync}
                className="text-blue-600 hover:underline"
              >
                스팟 데이터에서 동기화하기
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {contents.map((content) => (
              <div
                key={content.id}
                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    {content.imageUrl ? (
                      <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-gray-200">
                        <Image
                          src={content.imageUrl}
                          alt={content.displayName}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                        <ContentTypeIcon
                          type={(content.type || 'other') as ContentType}
                          size="lg"
                        />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-medium text-gray-800">
                      {content.displayName}
                    </h3>
                    <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                      {content.type && (
                        <span>
                          {
                            CONTENT_TYPE_CONFIG[content.type as ContentType]
                              ?.label
                          }
                        </span>
                      )}
                      {content.year && <span>({content.year})</span>}
                    </div>
                    <p className="mt-1 text-xs text-gray-400">
                      {content.spotCount}개 스팟에서 사용
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2 border-t border-gray-100 pt-3">
                  <button
                    onClick={() => openUploadModal(content)}
                    className="flex-1 rounded bg-blue-50 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-100"
                  >
                    {content.imageUrl ? '이미지 변경' : '이미지 추가'}
                  </button>
                  {content.imageUrl && (
                    <button
                      onClick={() => handleDeleteImage(content.normalizedName)}
                      className="rounded bg-red-50 px-3 py-1.5 text-sm text-red-600 hover:bg-red-100"
                    >
                      삭제
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-neutral-300 px-4 py-2 disabled:opacity-50"
            >
              이전
            </button>
            <span className="px-4 py-2 text-neutral-600">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-lg border border-neutral-300 px-4 py-2 disabled:opacity-50"
            >
              다음
            </button>
          </div>
        )}
      </div>

      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold text-gray-800">
              {selectedContent ? '이미지 업로드' : '새 콘텐츠 추가'}
            </h2>
            {selectedContent ? (
              <div className="mb-4 rounded-lg bg-gray-50 p-3">
                <p className="font-medium">{selectedContent.displayName}</p>
                {selectedContent.type && (
                  <p className="text-sm text-gray-500">
                    {CONTENT_TYPE_CONFIG[selectedContent.type]?.label}
                  </p>
                )}
              </div>
            ) : (
              <div className="mb-4 space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    콘텐츠 이름 *
                  </label>
                  <input
                    type="text"
                    value={newContentName}
                    onChange={(e) => setNewContentName(e.target.value)}
                    placeholder="예: 도쿄 구울"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    콘텐츠 타입
                  </label>
                  <select
                    value={newContentType}
                    onChange={(e) =>
                      setNewContentType(e.target.value as ContentType)
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(CONTENT_TYPE_CONFIG).map(
                      ([key, config]) => (
                        <option key={key} value={key}>
                          {config.label}
                        </option>
                      )
                    )}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    연도 (선택)
                  </label>
                  <input
                    type="number"
                    value={newContentYear}
                    onChange={(e) => setNewContentYear(e.target.value)}
                    placeholder="예: 2014"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                대표 이미지 {!selectedContent && '(선택)'}
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-4 text-center transition-colors hover:border-blue-500"
              >
                {uploadPreview ? (
                  <div className="relative mx-auto h-24 w-24 overflow-hidden rounded-full">
                    <Image
                      src={uploadPreview}
                      alt="Preview"
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="text-gray-500">
                    <p>클릭하여 이미지 선택</p>
                    <p className="mt-1 text-xs">
                      JPG, PNG, GIF, WEBP (최대 5MB)
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={closeUploadModal}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleUpload}
                disabled={
                  uploading || (!selectedContent && !newContentName.trim())
                }
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {uploading ? '업로드 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
