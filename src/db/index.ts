import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

import { env } from '#/lib/env'

import { runMigrations } from './migrate'
import * as schema from './schema'

type AppDb =
  | import('drizzle-orm/better-sqlite3').BetterSQLite3Database<typeof schema>
  | import('drizzle-orm/node-postgres').NodePgDatabase<typeof schema>

let sqlite: import('better-sqlite3').Database | null = null
let pool: import('pg').Pool | null = null
let db: AppDb | null = null

function resolveDatabasePath() {
  const configured = env.databasePath
  if (configured.startsWith('/')) return configured
  return resolve(process.cwd(), configured)
}

async function createPostgresDb() {
  const { Pool } = await import('pg')
  const { drizzle } = await import('drizzle-orm/node-postgres')

  pool = new Pool({ connectionString: env.databaseUrl })
  const connection = drizzle(pool, { schema })
  await runMigrations(connection)
  return connection
}

async function createSqliteDb() {
  const Database = (await import('better-sqlite3')).default
  const { drizzle } = await import('drizzle-orm/better-sqlite3')

  const databasePath = resolveDatabasePath()
  mkdirSync(dirname(databasePath), { recursive: true })

  sqlite = new Database(databasePath)
  sqlite.pragma('journal_mode = WAL')
  sqlite.pragma('foreign_keys = ON')

  const connection = drizzle(sqlite, { schema })
  await runMigrations(connection)
  return connection
}

export async function getDb() {
  if (db) return db

  db = env.usePostgres ? await createPostgresDb() : await createSqliteDb()
  return db
}
