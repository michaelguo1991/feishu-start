import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'

import type * as schema from './schema'

let migrated = false

export function runMigrations(db: BetterSQLite3Database<typeof schema>) {
  if (migrated) return

  const migrationsFolder = resolve(process.cwd(), 'drizzle')
  if (!existsSync(migrationsFolder)) {
    throw new Error(`Drizzle migrations folder not found: ${migrationsFolder}`)
  }

  migrate(db, { migrationsFolder })
  migrated = true
}
