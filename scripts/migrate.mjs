import { createRequire } from 'node:module'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(resolve(root, 'package.json'))

const databaseUrl = process.env.DATABASE_URL?.trim()
if (!databaseUrl) {
  console.error('DATABASE_URL is required for production migrations.')
  process.exit(1)
}

const { Pool } = require('pg')
const { drizzle } = require('drizzle-orm/node-postgres')
const { migrate } = require('drizzle-orm/node-postgres/migrator')

const migrationsFolder = resolve(root, 'drizzle')
if (!existsSync(migrationsFolder)) {
  console.error(`Migrations folder not found: ${migrationsFolder}`)
  process.exit(1)
}

const pool = new Pool({ connectionString: databaseUrl })
const db = drizzle(pool)

console.log('Running PostgreSQL migrations...')
await migrate(db, { migrationsFolder })
await pool.end()
console.log('Migrations complete.')
