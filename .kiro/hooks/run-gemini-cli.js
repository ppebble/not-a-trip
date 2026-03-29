#!/usr/bin/env node

import { execSync } from 'child_process'

// 터미널에서 전달받은 인자값 파싱
// 예: node run-gemini-cli.js bulk-replace ./src/components
const taskType = process.argv[2]
const targetDir = process.argv[3] || './src'

if (taskType === 'bulk-replace') {
  console.log(
    `🚀 Kiro Hook: [${targetDir}] 디렉토리의 대규모 작업을 Gemini CLI로 위임합니다...`
  )

  try {
    // 🔥 실제 환경에 맞게 gemini-cli 명령어를 세팅하세요.
    // stdio: 'inherit'을 주어야 CLI의 실행 로그와 에러가 현재 터미널에 그대로 출력됩니다.
    const command = `gemini-cli prompt "현재 ${targetDir} 하위의 파일들에서 대규모 문자열 치환 및 리팩토링 작업을 수행해줘" --execute`

    execSync(command, { stdio: 'inherit' })
    console.log('✅ Gemini CLI 위임 작업이 성공적으로 완료되었습니다.')
  } catch (error) {
    console.error('❌ Gemini CLI 실행 중 치명적 오류 발생:', error.message)
    // 훅 실행 실패 시 프로세스를 종료하여 파이프라인(커밋 등)을 중단시킴
    process.exit(1)
  }
} else {
  console.log(`⚠️ Kiro Hook: 알 수 없는 Task 타입입니다. (${taskType})`)
}
