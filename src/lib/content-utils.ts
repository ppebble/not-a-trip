import { RelatedContent } from '@/types'

/**
 * 콘텐츠 이름 정규화 (중복 검사용)
 * 대소문자를 무시하고 앞뒤 공백을 제거하여 비교 가능한 형태로 변환
 * @param name - 정규화할 콘텐츠 이름
 * @returns 정규화된 이름 (소문자, 공백 제거)
 */
export function normalizeContentName(name: string): string {
  return name.trim().toLowerCase()
}

/**
 * 중복 콘텐츠 검사
 * 기존 배열에 동일한 이름의 콘텐츠가 있는지 확인
 * @param contents - 기존 RelatedContent 배열
 * @param newName - 검사할 새 콘텐츠 이름
 * @returns 중복 여부 (true: 중복, false: 중복 아님)
 */
export function isDuplicateContent(
  contents: RelatedContent[],
  newName: string
): boolean {
  const normalizedNew = normalizeContentName(newName)
  return contents.some((c) => normalizeContentName(c.name) === normalizedNew)
}

/**
 * 콘텐츠 순서 변경
 * 드래그 앤 드롭으로 항목 순서를 변경할 때 사용
 * @param contents - 기존 RelatedContent 배열
 * @param fromIndex - 이동할 항목의 현재 인덱스
 * @param toIndex - 이동할 목표 인덱스
 * @returns 순서가 변경된 새 배열 (원본 불변)
 */
export function reorderContents(
  contents: RelatedContent[],
  fromIndex: number,
  toIndex: number
): RelatedContent[] {
  // 유효하지 않은 인덱스인 경우 원본 반환
  if (
    fromIndex < 0 ||
    fromIndex >= contents.length ||
    toIndex < 0 ||
    toIndex >= contents.length
  ) {
    return contents
  }

  // 같은 위치면 원본 반환
  if (fromIndex === toIndex) {
    return contents
  }

  const result = [...contents]
  const [removed] = result.splice(fromIndex, 1)
  result.splice(toIndex, 0, removed)

  return result
}

/**
 * 특정 인덱스의 콘텐츠 삭제
 * @param contents - 기존 RelatedContent 배열
 * @param index - 삭제할 항목의 인덱스
 * @returns 항목이 삭제된 새 배열 (원본 불변)
 */
export function removeContentAtIndex(
  contents: RelatedContent[],
  index: number
): RelatedContent[] {
  // 유효하지 않은 인덱스인 경우 원본 반환
  if (index < 0 || index >= contents.length) {
    return contents
  }

  return contents.filter((_, i) => i !== index)
}

/**
 * 콘텐츠 마스터 데이터에서 이미지 URL 조회
 * 스팟 등록 시 기존 콘텐츠 이미지 자동 적용에 사용
 * @param contentMasters - 콘텐츠 마스터 데이터 맵 (정규화된 이름 -> imageUrl)
 * @param contentName - 조회할 콘텐츠 이름
 * @returns 이미지 URL 또는 undefined
 */
export function getContentImageUrl(
  contentMasters: Map<string, string>,
  contentName: string
): string | undefined {
  const normalizedName = normalizeContentName(contentName)
  return contentMasters.get(normalizedName)
}

/**
 * RelatedContent 배열에 마스터 이미지 자동 적용
 * 스팟 등록/수정 시 기존 콘텐츠 이미지를 자동으로 적용
 * @param contents - RelatedContent 배열
 * @param contentMasters - 콘텐츠 마스터 데이터 맵 (정규화된 이름 -> imageUrl)
 * @returns 이미지가 적용된 새 배열 (원본 불변)
 */
export function applyMasterImages(
  contents: RelatedContent[],
  contentMasters: Map<string, string>
): RelatedContent[] {
  return contents.map((content) => {
    // 이미 이미지가 있으면 유지
    if (content.imageUrl) {
      return content
    }

    const imageUrl = getContentImageUrl(contentMasters, content.name)
    if (imageUrl) {
      return { ...content, imageUrl }
    }

    return content
  })
}
