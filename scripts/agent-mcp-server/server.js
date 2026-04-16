#!/usr/bin/env node

/**
 * Agent MCP Server
 *
 * 멀티 AI 프로바이더 지원 MCP 서버.
 * 환경변수 AI_PROVIDER로 gemini | anthropic 선택 (기본: gemini)
 *
 * 도구 목록:
 *   - bulk_replace: 대규모 문자열 치환/리팩토링
 *   - lint_fix: ESLint 에러 일괄 분석 및 수정
 *   - generate_docs: 문서 생성 (changelog, commit-summary, pr-description)
 *   - ask_agent: 자유 프롬프트로 코드 작업 위임
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { join, relative, dirname } from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = process.env.PROJECT_ROOT || join(__dirname, '..', '..')

// --- Config ---
import { config } from 'dotenv'
config({ path: join(PROJECT_ROOT, '.env.local') })

const AI_PROVIDER = (process.env.AI_PROVIDER || 'gemini').toLowerCase()

// --- AI Provider 추상화 ---

async function createProvider() {
  if (AI_PROVIDER === 'anthropic') {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      console.error('❌ ANTHROPIC_API_KEY 환경변수가 설정되지 않았습니다.')
      process.exit(1)
    }
    const { default: Anthropic } = await import('@anthropic-ai/sdk')
    const client = new Anthropic({ apiKey })
    const model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514'

    return {
      name: `anthropic/${model}`,
      async generate(prompt, options = {}) {
        const { temperature = 0.2, maxTokens = 8192 } = options
        try {
          const response = await client.messages.create({
            model,
            max_tokens: maxTokens,
            temperature,
            messages: [{ role: 'user', content: prompt }],
          })
          return response.content[0]?.text || ''
        } catch (error) {
          return `❌ Anthropic API 오류: ${error.message}`
        }
      },
    }
  }

  // 기본: Gemini
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY 환경변수가 설정되지 않았습니다.')
    process.exit(1)
  }
  const { GoogleGenAI } = await import('@google/genai')
  const ai = new GoogleGenAI({ apiKey })
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'

  return {
    name: `gemini/${model}`,
    async generate(prompt, options = {}) {
      const { temperature = 0.2, maxTokens = 8192 } = options
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: { temperature, maxOutputTokens: maxTokens },
        })
        return response.text || ''
      } catch (error) {
        return `❌ Gemini API 오류: ${error.message}`
      }
    },
  }
}

// --- Helpers ---

function collectFiles(
  dir,
  extensions = ['.ts', '.tsx', '.js', '.jsx'],
  maxFiles = 50
) {
  const files = []
  const ignored = ['node_modules', '.next', '.git', 'dist', 'build', 'coverage']

  function walk(currentDir) {
    if (files.length >= maxFiles) return
    try {
      const entries = readdirSync(currentDir, { withFileTypes: true })
      for (const entry of entries) {
        if (files.length >= maxFiles) return
        if (ignored.includes(entry.name)) continue
        const fullPath = join(currentDir, entry.name)
        if (entry.isDirectory()) {
          walk(fullPath)
        } else if (extensions.some((ext) => entry.name.endsWith(ext))) {
          files.push(fullPath)
        }
      }
    } catch {
      // 접근 불가 디렉토리 무시
    }
  }

  walk(dir)
  return files
}

function filesToContext(filePaths, maxCharsPerFile = 8000) {
  return filePaths
    .map((fp) => {
      try {
        const content = readFileSync(fp, 'utf-8')
        const trimmed =
          content.length > maxCharsPerFile
            ? content.slice(0, maxCharsPerFile) + '\n... (truncated)'
            : content
        return `--- ${relative(PROJECT_ROOT, fp)} ---\n${trimmed}`
      } catch {
        return `--- ${relative(PROJECT_ROOT, fp)} --- (읽기 실패)`
      }
    })
    .join('\n\n')
}

function runCommand(cmd, cwd = PROJECT_ROOT) {
  try {
    return execSync(cmd, { cwd, encoding: 'utf-8', timeout: 60000 })
  } catch (error) {
    return error.stdout || error.stderr || error.message
  }
}

// --- MCP Server Setup ---

async function main() {
  const provider = await createProvider()

  const server = new McpServer({
    name: 'agent-worker',
    version: '1.1.0',
  })

  // Tool 1: bulk_replace
  server.tool(
    'bulk_replace',
    '대규모 문자열 치환/리팩토링. 지정 디렉토리의 파일들을 분석하고 치환 작업 수행.',
    {
      directory: z.string().describe('대상 디렉토리 (예: src/components)'),
      find: z.string().describe('찾을 문자열 또는 패턴'),
      replace: z.string().describe('치환할 문자열'),
      fileExtensions: z
        .array(z.string())
        .optional()
        .describe('대상 파일 확장자 (기본: .ts, .tsx, .js, .jsx)'),
      dryRun: z
        .boolean()
        .optional()
        .describe('true면 변경 미리보기만 (기본: false)'),
    },
    async ({ directory, find, replace, fileExtensions, dryRun }) => {
      const targetDir = join(PROJECT_ROOT, directory)
      const extensions = fileExtensions || ['.ts', '.tsx', '.js', '.jsx']
      const files = collectFiles(targetDir, extensions)

      const results = []
      for (const filePath of files) {
        try {
          const content = readFileSync(filePath, 'utf-8')
          if (!content.includes(find)) continue

          const newContent = content.replaceAll(find, replace)
          const relPath = relative(PROJECT_ROOT, filePath)
          const count = (
            content.match(
              new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
            ) || []
          ).length

          if (!dryRun) {
            writeFileSync(filePath, newContent, 'utf-8')
            results.push(`✅ ${relPath}: ${count}건 치환 완료`)
          } else {
            results.push(`🔍 ${relPath}: ${count}건 발견 (dry-run)`)
          }
        } catch (err) {
          results.push(`❌ ${relative(PROJECT_ROOT, filePath)}: ${err.message}`)
        }
      }

      const summary =
        results.length > 0
          ? results.join('\n')
          : `"${find}" 패턴을 찾을 수 없습니다.`

      return { content: [{ type: 'text', text: summary }] }
    }
  )

  // Tool 2: lint_fix
  server.tool(
    'lint_fix',
    'ESLint 에러를 분석하고 AI로 수정 방안을 제시하거나 자동 수정.',
    {
      directory: z.string().optional().describe('대상 디렉토리 (기본: src)'),
      autoFix: z
        .boolean()
        .optional()
        .describe('true면 eslint --fix 먼저 실행 (기본: true)'),
    },
    async ({ directory, autoFix }) => {
      const targetDir = directory || 'src'
      const shouldAutoFix = autoFix !== false

      if (shouldAutoFix) {
        runCommand(`npx eslint ${targetDir} --fix --quiet 2>&1`)
      }

      const lintOutput = runCommand(
        `npx eslint ${targetDir} --format json 2>&1`
      )

      let errors = []
      try {
        const parsed = JSON.parse(lintOutput)
        errors = parsed
          .filter((f) => f.errorCount > 0 || f.warningCount > 0)
          .map((f) => ({
            file: relative(PROJECT_ROOT, f.filePath),
            messages: f.messages.map(
              (m) => `L${m.line}: [${m.ruleId}] ${m.message}`
            ),
          }))
      } catch {
        return {
          content: [
            {
              type: 'text',
              text: `eslint --fix 실행 완료. JSON 파싱 실패:\n${lintOutput.slice(0, 2000)}`,
            },
          ],
        }
      }

      if (errors.length === 0) {
        return {
          content: [
            { type: 'text', text: '✅ 린트 에러 없음. 모든 파일 통과.' },
          ],
        }
      }

      const errorSummary = errors
        .map((e) => `${e.file}:\n${e.messages.join('\n')}`)
        .join('\n\n')

      const prompt = `다음 ESLint 에러들을 분석하고 각각의 수정 방법을 제시해줘. 가능하면 수정된 코드 스니펫도 포함해줘.\n\n${errorSummary}`
      const suggestion = await provider.generate(prompt)

      return {
        content: [
          {
            type: 'text',
            text: `## 린트 에러 분석 (${errors.length}개 파일) [${provider.name}]\n\n${suggestion}`,
          },
        ],
      }
    }
  )

  // Tool 3: generate_docs
  server.tool(
    'generate_docs',
    '문서 생성 — changelog, commit-summary, pr-description 등.',
    {
      target: z
        .enum(['changelog', 'commit-summary', 'pr-description'])
        .describe('생성할 문서 타입'),
      context: z
        .string()
        .optional()
        .describe('추가 컨텍스트 (브랜치명, 이슈번호 등)'),
    },
    async ({ target, context }) => {
      let gitInfo = ''
      let prompt = ''

      switch (target) {
        case 'changelog': {
          gitInfo = runCommand('git log --oneline -20')
          prompt = `다음 git log를 분석해서 CHANGELOG 형식으로 정리해줘. 한글로 작성.\n\n${gitInfo}`
          break
        }
        case 'commit-summary': {
          gitInfo = runCommand('git diff --staged --stat')
          const diffContent = runCommand('git diff --staged').slice(0, 6000)
          prompt = `다음 staged 변경사항을 분석해서 커밋 메시지를 제안해줘.\n규칙: <type>: <한글 설명> (50자 이내, 첫 글자 소문자, 마침표 없음)\ntype: feat, fix, style, refactor, test, docs, chore\n\n변경 통계:\n${gitInfo}\n\nDiff:\n${diffContent}`
          break
        }
        case 'pr-description': {
          gitInfo = runCommand('git log develop..HEAD --oneline')
          const diffStat = runCommand('git diff develop..HEAD --stat')
          const extraContext = context || ''
          prompt = `다음 커밋 로그와 변경사항을 분석해서 PR 설명을 생성해줘.\n.github/PULL_REQUEST_TEMPLATE.md 형식에 맞춰서 작성. 한글로.\n${extraContext ? `추가 정보: ${extraContext}\n` : ''}\n커밋 로그:\n${gitInfo}\n\n변경 통계:\n${diffStat}`
          break
        }
      }

      const result = await provider.generate(prompt)
      return { content: [{ type: 'text', text: result }] }
    }
  )

  // Tool 4: ask_agent
  server.tool(
    'ask_agent',
    '자유 프롬프트로 AI 에이전트에게 코드 작업 위임. 파일 컨텍스트를 자동으로 수집하여 전달.',
    {
      prompt: z.string().describe('에이전트에게 전달할 작업 지시'),
      directory: z
        .string()
        .optional()
        .describe('컨텍스트로 포함할 디렉토리 (기본: src)'),
      files: z
        .array(z.string())
        .optional()
        .describe('컨텍스트로 포함할 특정 파일 경로 목록'),
      maxContextFiles: z
        .number()
        .optional()
        .describe('최대 컨텍스트 파일 수 (기본: 20)'),
    },
    async ({ prompt, directory, files, maxContextFiles }) => {
      let contextStr = ''

      if (files && files.length > 0) {
        const fullPaths = files.map((f) => join(PROJECT_ROOT, f))
        contextStr = filesToContext(fullPaths)
      } else if (directory) {
        const targetDir = join(PROJECT_ROOT, directory)
        const collected = collectFiles(
          targetDir,
          ['.ts', '.tsx', '.js', '.jsx'],
          maxContextFiles || 20
        )
        contextStr = filesToContext(collected)
      }

      const fullPrompt = contextStr
        ? `프로젝트 컨텍스트:\n${contextStr}\n\n---\n\n작업 지시:\n${prompt}`
        : prompt

      const result = await provider.generate(fullPrompt, { maxTokens: 16384 })
      return {
        content: [
          {
            type: 'text',
            text: `[${provider.name}]\n\n${result}`,
          },
        ],
      }
    }
  )

  // --- Start Server ---
  const transport = new StdioServerTransport()
  await server.connect(transport)
}

main().catch((error) => {
  console.error('MCP 서버 시작 실패:', error)
  process.exit(1)
})
