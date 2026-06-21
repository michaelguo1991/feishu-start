import { createServerFn } from '@tanstack/react-start'
import { and, desc, eq } from 'drizzle-orm'
import { z } from 'zod'

import { getDb } from '#/db'
import { notes } from '#/db/schema'
import { requireOpenId } from '#/lib/session'

const noteInputSchema = z.object({
  title: z.string().trim().min(1, '标题不能为空').max(100),
  content: z.string().trim().max(10000).optional().default(''),
})

function toNoteDto(row: typeof notes.$inferSelect) {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export const listNotes = createServerFn({ method: 'GET' }).handler(async () => {
  const openId = requireOpenId()
  const db = await getDb()

  const rows = await db.query.notes.findMany({
    where: eq(notes.feishuOpenId, openId),
    orderBy: [desc(notes.createdAt), desc(notes.id)],
  })

  return rows.map(toNoteDto)
})

export const createNote = createServerFn({ method: 'POST' })
  .validator(noteInputSchema)
  .handler(async ({ data }) => {
    const openId = requireOpenId()
    const db = await getDb()
    const now = new Date().toISOString()

    const [row] = await db
      .insert(notes)
      .values({
        feishuOpenId: openId,
        title: data.title,
        content: data.content,
        createdAt: now,
        updatedAt: now,
      })
      .returning()

    if (!row) {
      throw new Error('保存失败')
    }

    return toNoteDto(row)
  })

const idSchema = z.object({
  id: z.number().int().positive(),
})

const noteUpdateSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().trim().min(1, '标题不能为空').max(100),
  content: z.string().trim().max(10000).optional().default(''),
})

export const getNote = createServerFn({ method: 'GET' })
  .validator(idSchema)
  .handler(async ({ data }) => {
    const openId = requireOpenId()
    const db = await getDb()

    const row = await db.query.notes.findFirst({
      where: and(eq(notes.feishuOpenId, openId), eq(notes.id, data.id)),
    })

    if (!row) {
      throw new Error('笔记不存在')
    }

    return toNoteDto(row)
  })

export const updateNote = createServerFn({ method: 'POST' })
  .validator(noteUpdateSchema)
  .handler(async ({ data }) => {
    const openId = requireOpenId()
    const db = await getDb()
    const now = new Date().toISOString()

    const [row] = await db
      .update(notes)
      .set({ title: data.title, content: data.content, updatedAt: now })
      .where(and(eq(notes.feishuOpenId, openId), eq(notes.id, data.id)))
      .returning()

    if (!row) {
      throw new Error('笔记不存在')
    }

    return toNoteDto(row)
  })

export const deleteNote = createServerFn({ method: 'POST' })
  .validator(idSchema)
  .handler(async ({ data }) => {
    const openId = requireOpenId()
    const db = await getDb()

    // Idempotent: scoped by (openId AND id), so a missing/foreign row is a
    // silent no-op (no existence leak). Matches slice #6 acceptance criteria.
    await db
      .delete(notes)
      .where(and(eq(notes.feishuOpenId, openId), eq(notes.id, data.id)))

    return { ok: true }
  })

export type NoteDto = Awaited<ReturnType<typeof getNote>>
