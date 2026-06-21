import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core'

export const profileVersions = sqliteTable(
  'profile_versions',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    feishuOpenId: text('feishu_open_id').notNull(),
    version: integer('version').notNull(),
    displayName: text('display_name').notNull(),
    phone: text('phone').notNull().default(''),
    department: text('department').notNull().default(''),
    bio: text('bio').notNull().default(''),
    createdAt: text('created_at').notNull(),
    createdBy: text('created_by').notNull(),
    updatedBy: text('updated_by').notNull().default('michael'),
  },
  (table) => [
    uniqueIndex('profile_versions_user_version_idx').on(
      table.feishuOpenId,
      table.version,
    ),
  ],
)

export type ProfileVersion = typeof profileVersions.$inferSelect
export type NewProfileVersion = typeof profileVersions.$inferInsert

export const notes = sqliteTable(
  'notes',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    feishuOpenId: text('feishu_open_id').notNull(),
    title: text('title').notNull(),
    content: text('content').notNull().default(''),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [index('notes_open_id_idx').on(table.feishuOpenId)],
)

export type Note = typeof notes.$inferSelect
export type NewNote = typeof notes.$inferInsert
