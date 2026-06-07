import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

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
