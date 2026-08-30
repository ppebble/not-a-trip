import fs from 'node:fs'
import path from 'node:path'

/**
 * @param {{ cwd?: string, env?: Record<string, string | undefined> }} options
 */
export function loadRepositoryEnv({
  cwd = process.cwd(),
  env = process.env,
} = {}) {
  for (const file of ['.env.local', '.env']) {
    const filePath = path.join(cwd, file)
    if (!fs.existsSync(filePath)) continue

    for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/)
      if (!match || env[match[1]]) continue

      let value = match[2].trim()
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }
      env[match[1]] = value
    }
  }

  return env
}

export function describeMongoTarget(uri) {
  try {
    const parsed = new URL(uri)
    const database = parsed.pathname.replace(/^\//, '') || 'default'
    return `${parsed.hostname}/${database}`
  } catch {
    return 'unparseable-target'
  }
}
