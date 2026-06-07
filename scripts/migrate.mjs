import { createRequire } from 'node:module'
import { existsSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(resolve(root, 'package.json'))

function loadBetterSqlite3() {
  const traced = resolve(root, '.output/server/node_modules/better-sqlite3')
  if (existsSync(traced)) {
    return require(traced)
  }

  return require('better-sqlite3')
}

const Database = loadBetterSqlite3()
const { drizzle } = require('drizzle-orm/better-sqlite3')
const { migrate } = require('drizzle-orm/better-sqlite3/migrator')

function resolveDatabasePath() {
  const configured = process.env.DATABASE_PATH?.trim() || '.data/db.sqlite'
  if (configured.startsWith('/')) return configured
  return resolve(root, configured)
}

const databasePath = resolveDatabasePath()
const migrationsFolder = resolve(root, 'drizzle')

if (!existsSync(migrationsFolder)) {
  console.error(`Migrations folder not found: ${migrationsFolder}`)
  process.exit(1)
}

mkdirSync(dirname(databasePath), { recursive: true })

const sqlite = new Database(databasePath)
sqlite.pragma('journal_mode = WAL')
sqlite.pragma('foreign_keys = ON')

const db = drizzle(sqlite)

console.log(`Running migrations on ${databasePath}...`)
migrate(db, { migrationsFolder })
sqlite.close()
console.log('Migrations complete.')
