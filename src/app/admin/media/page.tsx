'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import {
  type AdminMediaScene,
  useAdminSpotMedia,
  useUpdateAdminSpotMedia,
} from '@/hooks/useAdminQueries'

function splitLines(value: string): string[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

function joinLines(values: string[] = []): string {
  return values.join('\n')
}

async function uploadAdminImage(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch('/api/upload', { method: 'POST', body: formData })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || '이미지 업로드 실패')
  return data.card || data.imageUrl || data.original
}

export default function AdminMediaPage() {
  const { isLoading: authLoading, isAuthorized } = useAdminAuth()
  const [spotIdInput, setSpotIdInput] = useState('')
  const [activeSpotId, setActiveSpotId] = useState('')
  const { data, isLoading, error } = useAdminSpotMedia(activeSpotId)
  const updateMedia = useUpdateAdminSpotMedia()
  const [photosText, setPhotosText] = useState('')
  const [scenes, setScenes] = useState<AdminMediaScene[]>([])
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!data) return
    setPhotosText(joinLines(data.spot.photos))
    setScenes(data.scenes)
  }, [data])

  if (authLoading) {
    return <div className="p-8 text-neutral-500">로딩 중...</div>
  }

  if (!isAuthorized) return null

  const handleLoad = (event: React.FormEvent) => {
    event.preventDefault()
    setMessage(null)
    setActiveSpotId(spotIdInput.trim())
  }

  const handlePhotoUpload = async (file: File) => {
    const imageUrl = await uploadAdminImage(file)
    setPhotosText((current) => `${current}${current ? '\n' : ''}${imageUrl}`)
  }

  const handleSceneUpload = async (index: number, file: File) => {
    const imageUrl = await uploadAdminImage(file)
    setScenes((current) =>
      current.map((scene, sceneIndex) =>
        sceneIndex === index ? { ...scene, imageUrl } : scene
      )
    )
  }

  const handleSave = async () => {
    if (!activeSpotId) return
    setMessage(null)
    await updateMedia.mutateAsync({
      spotId: activeSpotId,
      photos: splitLines(photosText),
      scenes,
    })
    setMessage('저장되었습니다.')
  }

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="border-b border-neutral-200 bg-surface px-6 py-4">
        <h1 className="text-xl font-bold text-neutral-800">미디어 관리</h1>
        <p className="mt-1 text-sm text-neutral-500">
          스팟 상세 사진과 작품 장면 이미지를 어드민에서 수정/삭제합니다.
        </p>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8">
        <form onSubmit={handleLoad} className="mb-6 flex gap-2">
          <input
            value={spotIdInput}
            onChange={(event) => setSpotIdInput(event.target.value)}
            placeholder="SPOT-001"
            className="w-full max-w-sm rounded-lg border border-neutral-300 px-4 py-2"
          />
          <button className="rounded-lg bg-primary px-4 py-2 font-medium text-white">
            불러오기
          </button>
        </form>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error instanceof Error ? error.message : '조회 실패'}
          </div>
        )}
        {message && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            {message}
          </div>
        )}

        {isLoading && <div className="text-neutral-500">미디어 로딩 중...</div>}

        {data && (
          <div className="space-y-6">
            <section className="rounded-xl border border-neutral-200 bg-surface p-6 shadow-sm">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-neutral-800">
                    {data.spot.name} 상세 사진
                  </h2>
                  <p className="text-sm text-neutral-500">
                    한 줄에 하나씩 URL을 유지합니다. 비우면 사진이 삭제됩니다.
                  </p>
                </div>
                <label className="cursor-pointer rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100">
                  사진 업로드
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0]
                      if (file) void handlePhotoUpload(file)
                      event.currentTarget.value = ''
                    }}
                  />
                </label>
              </div>
              <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                {splitLines(photosText).map((photo) => (
                  <div
                    key={photo}
                    className="relative aspect-video overflow-hidden rounded-lg border"
                  >
                    <Image
                      src={photo}
                      alt="스팟 사진"
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
              <textarea
                value={photosText}
                onChange={(event) => setPhotosText(event.target.value)}
                rows={6}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 font-mono text-sm"
              />
            </section>

            <section className="rounded-xl border border-neutral-200 bg-surface p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-neutral-800">
                  작품 장면
                </h2>
                <button
                  type="button"
                  onClick={() =>
                    setScenes((current) => [
                      ...current,
                      {
                        imageUrl: '',
                        animeTitle: '',
                        episodeInfo: '',
                        description: '',
                      },
                    ])
                  }
                  className="rounded-lg bg-neutral-800 px-3 py-2 text-sm font-medium text-white"
                >
                  장면 추가
                </button>
              </div>
              <div className="space-y-4">
                {scenes.map((scene, index) => (
                  <div
                    key={scene.id ?? index}
                    className="grid gap-4 rounded-lg border border-neutral-200 p-4 md:grid-cols-[160px_1fr]"
                  >
                    <div>
                      {scene.imageUrl ? (
                        <div className="relative aspect-video overflow-hidden rounded-lg border">
                          <Image
                            src={scene.imageUrl}
                            alt="작품 장면"
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex aspect-video items-center justify-center rounded-lg bg-neutral-100 text-sm text-neutral-400">
                          이미지 없음
                        </div>
                      )}
                      <label className="mt-2 block cursor-pointer rounded bg-blue-50 px-3 py-2 text-center text-sm text-blue-700 hover:bg-blue-100">
                        업로드
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/gif,image/webp"
                          className="hidden"
                          onChange={(event) => {
                            const file = event.target.files?.[0]
                            if (file) void handleSceneUpload(index, file)
                            event.currentTarget.value = ''
                          }}
                        />
                      </label>
                    </div>
                    <div className="space-y-2">
                      <input
                        value={scene.imageUrl}
                        onChange={(event) =>
                          setScenes((current) =>
                            current.map((item, itemIndex) =>
                              itemIndex === index
                                ? { ...item, imageUrl: event.target.value }
                                : item
                            )
                          )
                        }
                        placeholder="이미지 URL"
                        className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
                      />
                      <input
                        value={scene.animeTitle ?? ''}
                        onChange={(event) =>
                          setScenes((current) =>
                            current.map((item, itemIndex) =>
                              itemIndex === index
                                ? { ...item, animeTitle: event.target.value }
                                : item
                            )
                          )
                        }
                        placeholder="작품명"
                        className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
                      />
                      <input
                        value={scene.episodeInfo ?? ''}
                        onChange={(event) =>
                          setScenes((current) =>
                            current.map((item, itemIndex) =>
                              itemIndex === index
                                ? { ...item, episodeInfo: event.target.value }
                                : item
                            )
                          )
                        }
                        placeholder="에피소드/장면 정보"
                        className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
                      />
                      <textarea
                        value={scene.description ?? ''}
                        onChange={(event) =>
                          setScenes((current) =>
                            current.map((item, itemIndex) =>
                              itemIndex === index
                                ? { ...item, description: event.target.value }
                                : item
                            )
                          )
                        }
                        placeholder="설명"
                        rows={2}
                        className="w-full rounded border border-neutral-300 px-3 py-2 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setScenes((current) =>
                            current.filter(
                              (_, itemIndex) => itemIndex !== index
                            )
                          )
                        }
                        className="rounded bg-red-50 px-3 py-1.5 text-sm text-red-700 hover:bg-red-100"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="sticky bottom-4 flex justify-end">
              <button
                onClick={handleSave}
                disabled={updateMedia.isPending}
                className="rounded-xl bg-primary px-6 py-3 font-semibold text-white shadow-lg disabled:opacity-50"
              >
                {updateMedia.isPending ? '저장 중...' : '미디어 저장'}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
