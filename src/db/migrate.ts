import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

import { env } from '#/lib/env'

import { migrationsFolder } from './dialect'
import type * as schema from './schema'

let migrated = false

export async function runMigrations(
  db:
    | import('drizzle-orm/better-sqlite3').BetterSQLite3Database<typeof schema>
    | import('drizzle-orm/node-postgres').NodePgDatabase<typeof schema>,
) {
  if (migrated) return

  const folder = resolve(process.cwd(), migrationsFolder())
  if (!existsSync(folder)) {
    throw new Error(`Drizzle migrations folder not found: ${folder}`)
  }

  if (env.usePostgres) {
    const { migrate } = await import('drizzle-orm/node-postgres/migrator')
    await migrate(
      db as import('drizzle-orm/node-postgres').NodePgDatabase<typeof schema>,
      { migrationsFolder: folder },
    )
  } else {
    const { migrate } = await import('drizzle-orm/better-sqlite3/migrator')
    migrate(
      db as import('drizzle-orm/better-sqlite3').BetterSQLite3Database<
        typeof schema
      >,
      { migrationsFolder: folder },
    )
  }

  migrated = true
}
