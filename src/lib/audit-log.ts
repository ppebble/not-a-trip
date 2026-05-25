import { getCollection, COLLECTIONS } from '@/lib/db'
import type {
  AuditActionType,
  AuditFieldChange,
  AuditLogRecord,
  AuditResourceType,
} from '@/types/audit-log'

const RETENTION_DAYS = 90
let ensureAuditLogIndexesPromise: Promise<void> | null = null

export interface LogAdminActionInput {
  adminId: string
  adminName?: string
  actionType: AuditActionType
  resourceType: AuditResourceType
  resourceId: string
  changes?: AuditFieldChange[]
  ipAddress?: string
}

export function createAuditLogRecord(
  input: LogAdminActionInput,
  now = new Date()
): AuditLogRecord {
  const expiresAt = new Date(now)
  expiresAt.setDate(expiresAt.getDate() + RETENTION_DAYS)

  return {
    adminId: input.adminId,
    adminName: input.adminName,
    actionType: input.actionType,
    resourceType: input.resourceType,
    resourceId: input.resourceId,
    changes: input.changes ?? [],
    ipAddress: input.ipAddress,
    createdAt: now,
    expiresAt,
  }
}

export async function logAdminAction(
  input: LogAdminActionInput
): Promise<void> {
  const collection = await getCollection(COLLECTIONS.AUDIT_LOGS)
  if (!ensureAuditLogIndexesPromise) {
    ensureAuditLogIndexesPromise = collection
      .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
      .then(() => undefined)
      .catch((error) => {
        ensureAuditLogIndexesPromise = null
        throw error
      })
  }
  await ensureAuditLogIndexesPromise
  const record = createAuditLogRecord(input)
  await collection.insertOne(record)
}

export function extractClientIp(headers: Headers): string | undefined {
  const forwardedFor = headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim()
  }

  const realIp = headers.get('x-real-ip')
  if (realIp) {
    return realIp.trim()
  }

  return undefined
}
