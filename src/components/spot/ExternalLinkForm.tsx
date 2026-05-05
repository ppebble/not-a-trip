'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import {
  ExternalLink,
  ExternalLinkType,
  LINK_TYPE_CONFIG,
  SpotCategory,
} from '@/types'

/** select option용 링크 타입 이모지 매핑 */
const LINK_TYPE_EMOJI: Record<ExternalLinkType, string> = {
  official: '🏠',
  ticket: '🎫',
  schedule: '📅',
  sns: '📱',
  other: '🔗',
}

/**
 * ExternalLinkForm 컴포넌트 Props
 */
interface ExternalLinkFormProps {
  /** 현재 링크 목록 */
  links: ExternalLink[]
  /** 링크 변경 핸들러 */
  onChange: (links: ExternalLink[]) => void
  /** 스팟 카테고리 */
  category: SpotCategory
  /** 비활성화 상태 */
  disabled?: boolean
}

/**
 * URL 유효성 검사
 * https:// 로 시작하는지 확인
 */
function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * 고유 ID 생성
 */
function generateId(): string {
  return `link_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

/**
 * 링크 추가 폼 컴포넌트
 */
function AddLinkForm({
  onAdd,
  existingUrls,
  disabled,
}: {
  onAdd: (link: ExternalLink) => void
  existingUrls: string[]
  disabled?: boolean
}) {
  const [type, setType] = useState<ExternalLinkType>('official')
  const [label, setLabel] = useState('')
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = useCallback(() => {
    setError('')

    // 유효성 검사
    if (!label.trim()) {
      setError('링크 이름을 입력해주세요')
      return
    }
    if (!url.trim()) {
      setError('URL을 입력해주세요')
      return
    }
    if (!isValidUrl(url)) {
      setError('올바른 URL 형식이 아닙니다 (https:// 필수)')
      return
    }
    if (existingUrls.includes(url)) {
      setError('이미 등록된 URL입니다')
      return
    }

    // 링크 추가
    onAdd({
      id: generateId(),
      type,
      label: label.trim(),
      url: url.trim(),
    })

    // 폼 초기화
    setType('official')
    setLabel('')
    setUrl('')
  }, [type, label, url, existingUrls, onAdd])

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <h4 className="text-text-secondary mb-3 text-sm font-medium">
        링크 추가
      </h4>

      <div className="space-y-3">
        {/* 링크 타입 선택 */}
        <div>
          <label className="text-text-secondary mb-1 block text-xs">
            링크 타입
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as ExternalLinkType)}
            disabled={disabled}
            className="text-text-primary w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {(Object.keys(LINK_TYPE_CONFIG) as ExternalLinkType[]).map(
              (key) => (
                <option key={key} value={key}>
                  {LINK_TYPE_EMOJI[key]} {LINK_TYPE_CONFIG[key].label}
                </option>
              )
            )}
          </select>
        </div>

        {/* 링크 이름 */}
        <div>
          <label className="text-text-secondary mb-1 block text-xs">
            링크 이름
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="예: FC 바르셀로나 공식 사이트"
            disabled={disabled}
            className="text-text-primary w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm placeholder-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
            maxLength={100}
          />
        </div>

        {/* URL 입력 */}
        <div>
          <label className="text-text-secondary mb-1 block text-xs">URL</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            disabled={disabled}
            className="text-text-primary w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm placeholder-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <p className="mt-1 text-xs text-muted">https:// 로 시작해야 합니다</p>
        </div>

        {/* 에러 메시지 */}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {/* 추가 버튼 */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={disabled}
          className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          링크 추가
        </button>
      </div>
    </div>
  )
}

/**
 * 링크 아이템 컴포넌트
 */
function LinkItem({
  link,
  onRemove,
  disabled,
}: {
  link: ExternalLink
  onRemove: () => void
  disabled?: boolean
}) {
  const config = LINK_TYPE_CONFIG[link.type]

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-surface p-3">
      {/* 아이콘 */}
      <span className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
        <span
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: config.color, opacity: 0.08 }}
        />
        <Image
          src={config.icon}
          alt={config.label}
          width={20}
          height={20}
          className="relative z-10"
        />
      </span>

      {/* 텍스트 */}
      <div className="min-w-0 flex-1">
        <p className="text-text-primary truncate text-sm font-medium">
          {link.label}
        </p>
        <p className="truncate text-xs text-muted">{link.url}</p>
      </div>

      {/* 삭제 버튼 */}
      <button
        type="button"
        onClick={onRemove}
        disabled={disabled}
        className="flex-shrink-0 rounded p-1 text-muted transition-colors hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="링크 삭제"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </button>
    </div>
  )
}

/**
 * ExternalLinkForm 컴포넌트
 *
 * 외부 링크를 추가/삭제할 수 있는 폼 컴포넌트입니다.
 * 스포츠/음악 카테고리에서 사용됩니다.
 *
 * Requirements:
 * - 4.1: 스포츠/음악 카테고리에서 외부 링크 섹션 표시
 * - 4.2: 여러 외부 링크 추가 가능 (타입, 라벨, URL)
 * - 4.3: 기존 외부 링크 삭제 가능
 * - 4.4: 프리셋 링크 타입 제공 (공식 홈페이지, 티켓 예매, 일정, SNS)
 */
export function ExternalLinkForm({
  links,
  onChange,
  category,
  disabled = false,
}: ExternalLinkFormProps) {
  const existingUrls = links.map((link) => link.url)
  const maxLinks = 10

  const handleAddLink = useCallback(
    (newLink: ExternalLink) => {
      if (links.length >= maxLinks) {
        return
      }
      onChange([...links, newLink])
    },
    [links, onChange]
  )

  const handleRemoveLink = useCallback(
    (linkId: string) => {
      onChange(links.filter((link) => link.id !== linkId))
    },
    [links, onChange]
  )

  // 스포츠/음악/게임 카테고리에서만 표시
  const showForm = ['sports', 'music', 'game'].includes(category)

  if (!showForm) {
    return null
  }

  // 카테고리별 섹션 제목
  const getSectionTitle = () => {
    if (category === 'sports') return '경기/이벤트 관련 링크'
    if (category === 'music') return '공연/이벤트 관련 링크'
    return '관련 링크'
  }
  const sectionTitle = getSectionTitle()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-text-primary text-lg font-semibold">
          {sectionTitle}
        </h3>
        <span className="text-sm text-muted">
          {links.length}/{maxLinks}
        </span>
      </div>

      {/* 등록된 링크 목록 */}
      {links.length > 0 && (
        <div className="space-y-2">
          {links.map((link) => (
            <LinkItem
              key={link.id}
              link={link}
              onRemove={() => handleRemoveLink(link.id)}
              disabled={disabled}
            />
          ))}
        </div>
      )}

      {/* 링크 추가 폼 */}
      {links.length < maxLinks ? (
        <AddLinkForm
          onAdd={handleAddLink}
          existingUrls={existingUrls}
          disabled={disabled}
        />
      ) : (
        <p className="text-center text-sm text-muted">
          최대 {maxLinks}개의 링크만 등록할 수 있습니다
        </p>
      )}

      {/* 도움말 */}
      <div className="rounded-lg bg-primary-50 p-3">
        <p className="text-sm text-primary-700">
          💡 공식 홈페이지, 티켓 예매 사이트, 일정 페이지 등 방문자에게 유용한
          링크를 추가해주세요.
        </p>
      </div>
    </div>
  )
}
