import type {
  RelatedContent,
  SpotContentRelation,
  RelationType,
  ConfidenceLevel,
  Officialness,
  RelationStatus,
  ContentType,
} from '@/types/spot'

/**
 * contentId 생성용 이름 정규화
 * - 소문자 변환, 앞뒤 공백 제거, 공백을 하이픈으로 치환, 특수문자 제거
 */
export function normalizeContentName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9가-힣ぁ-んァ-ヶ一-龥\-]/g, '')
}

/**
 * contentId 생성: {spotId}_{normalizedName} 형식
 */
export function generateContentId(spotId: string, contentName: string): string {
  const normalized = normalizeContentName(contentName)
  return `${spotId}_${normalized}`
}

/**
 * RelatedContent 항목을 SpotContentRelation으로 변환
 *
 * 기본값:
 * - relationType: scene_depicted
 * - confidenceLevel: medium
 * - officialness: user_submitted
 * - status: active
 * - displayPriority: index
 */
export function convertRelatedContentToRelation(
  spotId: string,
  content: RelatedContent,
  index: number
): SpotContentRelation {
  const now = new Date()

  // summary 생성: year와 additionalInfo 결합
  let summary: string | undefined
  if (content.year && content.additionalInfo) {
    summary = `${content.year}년 · ${content.additionalInfo}`
  } else if (content.year) {
    summary = `${content.year}년`
  } else if (content.additionalInfo) {
    summary = content.additionalInfo
  }

  return {
    id: crypto.randomUUID(),
    spotId,
    contentId: generateContentId(spotId, content.name),
    contentName: content.name,
    contentType: content.type as ContentType,
    contentImageUrl: content.imageUrl,
    relationType: 'scene_depicted' as RelationType,
    confidenceLevel: 'medium' as ConfidenceLevel,
    officialness: 'user_submitted' as Officialness,
    displayPriority: index,
    status: 'active' as RelationStatus,
    summary,
    createdAt: now,
    updatedAt: now,
  }
}

/**
 * 대표 관계 선택: displayPriority가 가장 낮은 관계 반환
 */
export function getPrimaryRelation(
  relations: SpotContentRelation[]
): SpotContentRelation | undefined {
  if (!relations || relations.length === 0) return undefined

  return relations.reduce((primary, current) =>
    current.displayPriority < primary.displayPriority ? current : primary
  )
}

/**
 * 작품명 목록 추출: relations 우선, relatedContent 폴백
 */
export function getContentNamesFromRelations(
  relations?: SpotContentRelation[],
  relatedContent?: RelatedContent[]
): string[] {
  if (relations && relations.length > 0) {
    return relations.map((r) => r.contentName)
  }

  if (relatedContent && relatedContent.length > 0) {
    return relatedContent.map((c) => c.name)
  }

  return []
}

/**
 * 대표 작품명 추출: relations의 대표 관계 우선, relatedContent[0] 폴백
 */
export function getPrimaryContentName(
  relations?: SpotContentRelation[],
  relatedContent?: RelatedContent[]
): string | undefined {
  if (relations && relations.length > 0) {
    const primary = getPrimaryRelation(relations)
    return primary?.contentName
  }

  if (relatedContent && relatedContent.length > 0) {
    return relatedContent[0].name
  }

  return undefined
}
