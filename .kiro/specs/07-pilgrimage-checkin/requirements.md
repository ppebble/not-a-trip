# Requirements Document: 성지순례 인증 시스템 (Pilgrimage Check-in)

## Introduction

기존의 애매한 커뮤니티 게시판을 **장소 기반 인증(Check-in) 시스템**으로 전면 개편합니다. 유저들이 실제로 성지를 방문하여 애니메이션 장면과 동일한 구도로 사진을 찍고 인증하는 것이 핵심 콘텐츠가 됩니다. 이를 통해 "덕질 퀘스트"와 "트로피 룸" 경험을 제공합니다.

## Glossary

- **Check-in (인증)**: 유저가 성지를 방문하여 사진을 찍고 인증하는 행위
- **Scene Comparison (씬 비교)**: 애니메이션 캡처와 실제 사진을 나란히 비교하는 UI
- **Pilgrimage (성지순례)**: 애니메이션/드라마/영화 등의 배경이 된 실제 장소를 방문하는 행위
- **Badge (뱃지)**: 특정 조건을 달성했을 때 부여되는 디지털 업적
- **Trophy Room (트로피 룸)**: 유저가 획득한 뱃지와 인증 기록을 전시하는 프로필 공간

## Requirements

### Requirement 1: 씬 인증샷 시스템

**User Story:** As a 성지순례 유저, I want 애니메이션 장면과 동일한 구도로 사진을 찍어 인증할 수 있기를, so that 나의 순례 기록을 남기고 다른 유저들과 공유할 수 있습니다.

#### Acceptance Criteria

1. WHEN 유저가 스팟 상세 페이지에서 "순례 인증" 버튼을 클릭할 때 THEN THE System SHALL 인증샷 업로드 모달을 표시한다
2. WHEN 유저가 인증샷을 업로드할 때 THEN THE System SHALL 해당 스팟의 대표 씬 이미지와 나란히 비교할 수 있는 UI를 제공한다
3. WHEN 인증샷이 업로드되면 THEN THE System SHALL 해당 스팟의 인증 목록에 추가하고 유저 프로필에도 기록한다
4. THE System SHALL 인증샷에 방문 날짜, 간단한 코멘트를 함께 저장할 수 있도록 한다
5. THE System SHALL 인증샷 목록을 최신순/인기순으로 정렬하여 표시한다

### Requirement 2: 씬 비교 뷰어 (Scene Comparison Viewer)

**User Story:** As a 유저, I want 애니메이션 장면과 실제 사진을 슬라이더로 비교할 수 있기를, so that 얼마나 정확하게 재현했는지 확인할 수 있습니다.

#### Acceptance Criteria

1. WHEN 인증샷을 조회할 때 THEN THE System SHALL 애니메이션 캡처와 실제 사진을 좌우 또는 슬라이더 형태로 비교할 수 있는 UI를 제공한다
2. WHEN 유저가 슬라이더를 드래그할 때 THEN THE System SHALL 두 이미지가 자연스럽게 오버랩되어 비교되도록 한다
3. THE System SHALL 모바일에서 터치 제스처로 슬라이더를 조작할 수 있도록 한다

### Requirement 3: 유저 프로필 및 트로피 룸

**User Story:** As a 유저, I want 내가 방문한 성지와 획득한 뱃지를 한눈에 볼 수 있기를, so that 나의 순례 기록을 자랑하고 관리할 수 있습니다.

#### Acceptance Criteria

1. WHEN 유저가 프로필 페이지에 접근할 때 THEN THE System SHALL 방문한 스팟 목록, 인증샷 갤러리, 획득한 뱃지를 표시한다
2. WHEN 유저가 특정 작품의 성지를 일정 비율 이상 방문하면 THEN THE System SHALL 해당 작품의 뱃지를 자동으로 부여한다
3. THE System SHALL 유저의 총 방문 스팟 수, 인증샷 수, 뱃지 수를 통계로 표시한다
4. THE System SHALL 프로필을 공개/비공개로 설정할 수 있도록 한다

### Requirement 4: 뱃지/업적 시스템

**User Story:** As a 유저, I want 특정 조건을 달성하면 뱃지를 획득할 수 있기를, so that 수집욕을 충족하고 성취감을 느낄 수 있습니다.

#### Acceptance Criteria

1. WHEN 유저가 특정 작품의 주요 성지 50% 이상을 인증하면 THEN THE System SHALL 해당 작품의 "탐험가" 뱃지를 부여한다
2. WHEN 유저가 특정 작품의 모든 성지를 인증하면 THEN THE System SHALL 해당 작품의 "정복자" 뱃지를 부여한다
3. WHEN 유저가 첫 인증샷을 올리면 THEN THE System SHALL "첫 발자국" 뱃지를 부여한다
4. THE System SHALL 뱃지 획득 시 알림을 표시하고 축하 애니메이션을 보여준다
5. THE System SHALL 뱃지별 획득 조건과 현재 진행 상황을 표시한다

### Requirement 5: 스팟 인증 현황 표시

**User Story:** As a 유저, I want 각 스팟의 인증 현황을 볼 수 있기를, so that 인기 있는 스팟과 다른 유저들의 인증샷을 확인할 수 있습니다.

#### Acceptance Criteria

1. WHEN 스팟 상세 페이지를 조회할 때 THEN THE System SHALL 해당 스팟의 총 인증 수와 최근 인증샷을 표시한다
2. WHEN 지도에서 스팟을 조회할 때 THEN THE System SHALL 인증 수가 많은 스팟을 시각적으로 구분하여 표시한다
3. THE System SHALL 스팟별 인증샷 갤러리를 제공한다

### Requirement 6: 기존 커뮤니티 기능 정리

**User Story:** As a 서비스 운영자, I want 기존의 애매한 자유게시판을 정리하고 인증 중심으로 전환하기를, so that 서비스의 방향성을 명확히 할 수 있습니다.

#### Acceptance Criteria

1. THE System SHALL 기존 자유게시판을 숨기거나 "공지사항/FAQ" 용도로만 제한한다
2. THE System SHALL 스팟별 게시판을 "인증샷 갤러리"로 전환한다
3. THE System SHALL 작품별 게시판을 "작품 성지 목록 및 인증 현황"으로 전환한다

</content>
