#!/usr/bin/env node

/**
 * Kiro → Gemini CLI 위임 스크립트
 *
 * 사용법:
 *   node .kiro/hooks/run-gemini-cli.js <task-type> [args...]
 *
 * 지원 task-type:
 *   bulk-replace <dir>       - 대규모 문자열 치환
 *   create-issue <json>      - GitHub Issue 생성
 *   create-pr <json>         - GitHub PR 생성
 *   generate-docs <target>   - 문서 생성 (커밋 메시지, 변경 로그 등)
 *   lint-fix <dir>           - 린트 에러 일괄 수정
 */

import { execSync } from 'child_process'
import { readFileSync, writeFileSync, unlinkSync } from 'fs'
import { join } from 'path'

const taskType = process.argv[2]
const taskArg = process.argv[3]

function runGemini(prompt, options = {}) {
  const { cwd, timeout = 120000 } = options
  try {
    const result = execSync(`gemini -p "${prompt.replace(/"/g, '\\"')}"`, {
      stdio: 'inherit',
      cwd: cwd || process.cwd(),
      timeout,
    })
    return result
  } catch (error) {
    console.error('❌ Gemini CLI 실행 오류:', error.message)
    process.exit(1)
  }
}

switch (taskType) {
  case 'bulk-replace': {
    const targetDir = taskArg || './src'
    console.log(
      `🚀 [bulk-replace] ${targetDir} 대규모 치환 작업을 Gemini CLI로 위임합니다...`
    )
    runGemini(
      `${targetDir} 하위 파일들에서 대규모 문자열 치환 및 리팩토링 작업을 수행해줘`
    )
    console.log('✅ 대규모 치환 작업 완료')
    break
  }

  case 'create-issue': {
    if (!taskArg) {
      console.error('❌ Issue 정보 JSON이 필요합니다.')
      console.error(
        '사용법: node run-gemini-cli.js create-issue \'{"title":"...","type":"feat",...}\''
      )
      process.exit(1)
    }
    console.log(
      '🚀 [create-issue] GitHub Issue 생성을 Gemini CLI로 위임합니다...'
    )
    const issueData = JSON.parse(taskArg)
    const templateMap = {
      feat: '.github/ISSUE_TEMPLATE/feature.md',
      fix: '.github/ISSUE_TEMPLATE/bug.md',
      chore: '.github/ISSUE_TEMPLATE/chore.md',
      test: '.github/ISSUE_TEMPLATE/test.md',
      ui: '.github/ISSUE_TEMPLATE/ui-improvement.md',
      enhancement: '.github/ISSUE_TEMPLATE/enhancement.md',
    }
    const templatePath = templateMap[issueData.type] || templateMap['feat']
    const prompt = [
      `GitHub Issue를 생성해줘.`,
      `리포지토리: ppebble/anime-pilgrim`,
      `템플릿 파일: ${templatePath}`,
      `제목: ${issueData.title}`,
      `타입: ${issueData.type}`,
      issueData.taskNumber ? `Task 번호: ${issueData.taskNumber}` : '',
      issueData.requirements ? `Requirements: ${issueData.requirements}` : '',
      issueData.description ? `설명: ${issueData.description}` : '',
      issueData.checklist ? `작업 내용: ${issueData.checklist}` : '',
      `템플릿 형식에 맞춰서 gh issue create 명령어로 생성해줘. 라벨은 ${issueData.type}으로 설정.`,
    ]
      .filter(Boolean)
      .join('\n')
    runGemini(prompt)
    console.log('✅ GitHub Issue 생성 완료')
    break
  }

  case 'create-pr': {
    if (!taskArg) {
      console.error('❌ PR 정보 JSON이 필요합니다.')
      process.exit(1)
    }
    console.log('🚀 [create-pr] GitHub PR 생성을 Gemini CLI로 위임합니다...')
    const prData = JSON.parse(taskArg)
    const prompt = [
      `GitHub Pull Request를 생성해줘.`,
      `리포지토리: ppebble/anime-pilgrim`,
      `PR 템플릿: .github/PULL_REQUEST_TEMPLATE.md`,
      `제목: ${prData.title}`,
      `base 브랜치: develop`,
      `head 브랜치: ${prData.branch}`,
      prData.issueNumber
        ? `관련 이슈: #${prData.issueNumber} (Closes #${prData.issueNumber})`
        : '',
      prData.type ? `PR 타입: ${prData.type}` : '',
      prData.summary ? `작업 개요: ${prData.summary}` : '',
      prData.changes ? `변경 사항: ${prData.changes}` : '',
      `템플릿 형식에 맞춰서 gh pr create 명령어로 생성해줘.`,
    ]
      .filter(Boolean)
      .join('\n')
    runGemini(prompt)
    console.log('✅ GitHub PR 생성 완료')
    break
  }

  case 'generate-docs': {
    const target = taskArg || 'changelog'
    console.log(
      `🚀 [generate-docs] ${target} 문서 생성을 Gemini CLI로 위임합니다...`
    )
    const prompts = {
      changelog:
        'git log를 분석해서 최근 변경 사항을 CHANGELOG 형식으로 정리해줘.',
      'commit-summary':
        'git diff --staged를 분석해서 적절한 커밋 메시지를 한글로 제안해줘. 형식: <type>: <description> (50자 이내)',
      'pr-description':
        'git log develop..HEAD를 분석해서 PR 설명을 .github/PULL_REQUEST_TEMPLATE.md 형식에 맞춰 생성해줘.',
    }
    runGemini(prompts[target] || prompts['changelog'])
    console.log(`✅ ${target} 문서 생성 완료`)
    break
  }

  case 'lint-fix': {
    const targetDir = taskArg || './src'
    console.log(
      `🚀 [lint-fix] ${targetDir} 린트 에러 일괄 수정을 Gemini CLI로 위임합니다...`
    )
    runGemini(
      `${targetDir} 하위 파일들의 ESLint 에러를 분석하고 일괄 수정해줘. npm run lint 결과를 참고해서 수정해.`
    )
    console.log('✅ 린트 에러 일괄 수정 완료')
    break
  }

  default:
    console.log(`⚠️ 알 수 없는 task 타입: ${taskType}`)
    console.log(
      '지원 타입: bulk-replace, create-issue, create-pr, generate-docs, lint-fix'
    )
    process.exit(1)
}
