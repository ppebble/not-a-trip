# SEO 개선 실행 계획

## 목표

검색엔진이 공개 콘텐츠를 안정적으로 발견·렌더링·색인하고, 회원 전용·작성·운영 URL은 색인하지 않도록 한다.

## 완료 기준

- 공개 URL은 고유한 `title`, `description`, `canonical`을 출력한다.
- sitemap에는 200 응답을 반환하는 공개 URL만 포함한다.
- 비공개·작성·편집·운영 URL은 `noindex, nofollow`를 출력한다.
- 존재하지 않는 동적 상세 URL은 실제 404를 반환한다.
- 공개 상세 페이지는 서버 HTML에 핵심 제목과 설명을 포함한다.
- 스팟·코스·게시글은 적합한 JSON-LD를 출력한다.
- 운영 환경에서 사이트 URL이 누락되면 배포가 조용히 localhost를 사용하지 않는다.

## 작업 목록

### P0 — 색인 안정성

- [x] `/`와 `/welcome`의 canonical·sitemap 기준을 일관되게 정리
- [x] sitemap에서 리다이렉트 URL 제거
- [x] sitemap에서 스팟·코스·게시글 공개 데이터만 선택
- [x] 동적 상세 데이터가 없을 때 `notFound()` 처리
- [x] 회원·운영·작성·편집 페이지에 `noindex`
- [x] 운영 `NEXT_PUBLIC_BASE_URL` 필수 검증

### P1 — 검색 결과 품질

- [x] 공개 목록 페이지의 고유 canonical·metadata 보강
- [x] 콘텐츠 허브 URL의 canonical 보강
- [x] 스팟·코스 상세 서버 HTML에 핵심 텍스트 출력
- [x] 게시글 상세 서버 HTML에 제목·본문 요약 출력
- [x] 스팟·코스·게시글 JSON-LD 및 BreadcrumbList 보강

### P2 — 성장 작업

- [ ] 지역별 SEO 허브 페이지 추가
- [ ] 작품별 템플릿 콘텐츠 확장
- [ ] Search Console 색인·검색어 모니터링 대시보드 추가
- [ ] 공개 콘텐츠의 품질/중복/빈 페이지 자동 검증 추가

## 검증 명령

```bash
npm test -- --runInBand src/lib/deployment/seo-validator.test.ts
npm run type-check
npm run lint
```

배포 후 `/`, `/welcome`, `/gallery`, `/routes`, `/contents`, `/spots/{id}`, `/routes/{id}`, `/community/{id}`, `/robots.txt`, `/sitemap.xml`의 상태 코드와 HTML metadata를 Google Search Console URL 검사로 확인한다.

## 남은 위험

- 실제 공개 여부 필드의 의미는 운영 DB 데이터와 함께 확인해야 한다.
- 검색 노출과 순위는 기술 수정만으로 보장되지 않으며, 콘텐츠 품질·내부 링크·외부 언급이 추가로 필요하다.
