import { createServerFn } from '@tanstack/react-start'
import { desc, eq, and } from 'drizzle-orm'
import { z } from 'zod'

import { getDb } from '#/db'
import { profileVersions } from '#/db/schema'
import { readSession } from '#/lib/session'

const profileInputSchema = z.object({
  displayName: z.string().trim().min(1, '姓名不能为空').max(50),
  phone: z.string().trim().max(20).optional().default(''),
  department: z.string().trim().max(100).optional().default(''),
  bio: z.string().trim().max(500).optional().default(''),
})

const versionSchema = z.object({
  version: z.number().int().positive(),
})

function requireOpenId() {
  const session = readSession()
  const openId = session?.user?.openId
  if (!openId) {
    throw new Error('未登录')
  }
  return { openId, createdBy: openId }
}

function toProfileDto(row: typeof profileVersions.$inferSelect) {
  return {
    version: row.version,
    displayName: row.displayName,
    phone: row.phone,
    department: row.department,
    bio: row.bio,
    createdAt: row.createdAt,
    createdBy: row.createdBy,
  }
}

async function nextVersion(openId: string) {
  const db = await getDb()
  const latest = await db.query.profileVersions.findFirst({
    where: eq(profileVersions.feishuOpenId, openId),
    orderBy: desc(profileVersions.version),
    columns: { version: true },
  })
  return (latest?.version ?? 0) + 1
}

async function insertProfileVersion(
  openId: string,
  createdBy: string,
  data: z.infer<typeof profileInputSchema>,
) {
  const db = await getDb()
  const version = await nextVersion(openId)
  const createdAt = new Date().toISOString()

  const [row] = await db
    .insert(profileVersions)
    .values({
      feishuOpenId: openId,
      version,
      displayName: data.displayName,
      phone: data.phone ?? '',
      department: data.department ?? '',
      bio: data.bio ?? '',
      createdAt,
      createdBy,
      updatedBy: createdBy,
    })
    .returning()

  if (!row) {
    throw new Error('保存失败')
  }

  return toProfileDto(row)
}

export const getLatestProfile = createServerFn({ method: 'GET' }).handler(async () => {
  const { openId } = requireOpenId()
  const db = await getDb()

  const row = await db.query.profileVersions.findFirst({
    where: eq(profileVersions.feishuOpenId, openId),
    orderBy: desc(profileVersions.version),
  })

  return row ? toProfileDto(row) : null
})

export const listProfileVersions = createServerFn({ method: 'GET' }).handler(async () => {
  const { openId } = requireOpenId()
  const db = await getDb()

  const rows = await db.query.profileVersions.findMany({
    where: eq(profileVersions.feishuOpenId, openId),
    orderBy: desc(profileVersions.version),
    columns: {
      version: true,
      displayName: true,
      createdAt: true,
      createdBy: true,
    },
  })

  return rows
})

export const getProfileVersion = createServerFn({ method: 'GET' })
  .validator(versionSchema)
  .handler(async ({ data }) => {
    const { openId } = requireOpenId()
    const db = await getDb()

    const row = await db.query.profileVersions.findFirst({
      where: and(
        eq(profileVersions.feishuOpenId, openId),
        eq(profileVersions.version, data.version),
      ),
    })

    if (!row) {
      throw new Error('版本不存在')
    }

    return toProfileDto(row)
  })

export const saveProfile = createServerFn({ method: 'POST' })
  .validator(profileInputSchema)
  .handler(async ({ data }) => {
    const { openId, createdBy } = requireOpenId()
    return insertProfileVersion(openId, createdBy, data)
  })

export const restoreProfileVersion = createServerFn({ method: 'POST' })
  .validator(versionSchema)
  .handler(async ({ data }) => {
    const { openId, createdBy } = requireOpenId()
    const db = await getDb()

    const row = await db.query.profileVersions.findFirst({
      where: and(
        eq(profileVersions.feishuOpenId, openId),
        eq(profileVersions.version, data.version),
      ),
    })

    if (!row) {
      throw new Error('版本不存在')
    }

    return insertProfileVersion(openId, createdBy, {
      displayName: row.displayName,
      phone: row.phone,
      department: row.department,
      bio: row.bio,
    })
  })

export type ProfileDto = Awaited<ReturnType<typeof getLatestProfile>>
