/* eslint-disable no-console */

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent'

type LogMetadata = Record<string, unknown> | Error | unknown

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  silent: 50,
}

function resolveLogLevel(): LogLevel {
  const configured = process.env.RUNTIME_LOG_LEVEL?.toLowerCase()

  if (
    configured === 'debug' ||
    configured === 'info' ||
    configured === 'warn' ||
    configured === 'error' ||
    configured === 'silent'
  ) {
    return configured
  }

  return process.env.NODE_ENV === 'production' ? 'warn' : 'info'
}

function shouldWrite(level: Exclude<LogLevel, 'silent'>): boolean {
  return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[resolveLogLevel()]
}

function normalizeMetadata(metadata: LogMetadata | undefined) {
  if (metadata instanceof Error) {
    return {
      name: metadata.name,
      message: metadata.message,
      stack: metadata.stack,
    }
  }

  return metadata
}

function writeLog(
  level: Exclude<LogLevel, 'silent'>,
  message: string,
  metadata?: LogMetadata
): void {
  if (!shouldWrite(level)) return

  const normalizedMetadata = normalizeMetadata(metadata)
  const payload = {
    level,
    message,
    ...(normalizedMetadata === undefined
      ? {}
      : { metadata: normalizedMetadata }),
  }

  if (level === 'error') {
    console.error(payload)
    return
  }

  if (level === 'warn') {
    console.warn(payload)
    return
  }

  if (level === 'debug') {
    console.debug(payload)
    return
  }

  console.info(payload)
}

export const runtimeLogger = {
  debug(message: string, metadata?: LogMetadata): void {
    writeLog('debug', message, metadata)
  },
  info(message: string, metadata?: LogMetadata): void {
    writeLog('info', message, metadata)
  },
  warn(message: string, metadata?: LogMetadata): void {
    writeLog('warn', message, metadata)
  },
  error(message: string, metadata?: LogMetadata): void {
    writeLog('error', message, metadata)
  },
}
