import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'

import { env } from '#/lib/env'

import * as schema from './schema'
import { runMigrations } from './migrate'

let sqlite: Database.Database | null = null
let db: ReturnType<typeof drizzle<typeof schema>> | null = null

function resolveDatabasePath() {
  const configured = env.databasePath
  if (configured.startsWith('/')) return configured
  return resolve(process.cwd(), configured)
}

export function getDb() {
  if (db) return db

  const databasePath = resolveDatabasePath()
  mkdirSync(dirname(databasePath), { recursive: true })

  sqlite = new Database(databasePath)
  sqlite.pragma('journal_mode = WAL')
  sqlite.pragma('foreign_keys = ON')

  db = drizzle(sqlite, { schema })
  runMigrations(db)

  return db
}
