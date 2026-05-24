import { COLLECTIONS, getCollection } from '@/lib/db'

export interface SecurityLogDocument {
  type: string
  severity: 'info' | 'warning' | 'error'
  userId?: string
  ip?: string
  details: Record<string, unknown>
  createdAt: Date
}

export async function writeSecurityLog(
  input: Omit<SecurityLogDocument, 'createdAt'>
): Promise<void> {
  try {
    const collection = await getCollection<SecurityLogDocument>(
      COLLECTIONS.SECURITY_LOGS
    )

    await collection.insertOne({
      ...input,
      createdAt: new Date(),
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to write security log:', error)
  }
}
