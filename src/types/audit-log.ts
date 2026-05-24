export type AuditActionType =
  | 'review_spot_report'
  | 'review_status_report'
  | 'transition_spot_lifecycle'

export type AuditResourceType = 'spot_report' | 'status_report' | 'spot'

export interface AuditFieldChange {
  field: string
  before: unknown
  after: unknown
}

export interface AuditLogRecord {
  adminId: string
  adminName?: string
  actionType: AuditActionType
  resourceType: AuditResourceType
  resourceId: string
  changes: AuditFieldChange[]
  ipAddress?: string
  createdAt: Date
  expiresAt: Date
}
