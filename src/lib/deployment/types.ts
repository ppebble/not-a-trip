export type ValidationLevel = 'error' | 'warning' | 'info'

export interface ValidationIssue {
  level: ValidationLevel
  code: string
  message: string
  file?: string
  suggestion?: string
}
