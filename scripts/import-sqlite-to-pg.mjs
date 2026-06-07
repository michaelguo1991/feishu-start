import { createRequire } from 'node:module'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(resolve(root, 'package.json'))

const sqlitePath = process.argv[2] ?? process.env.SQLITE_PATH
const databaseUrl = process.env.DATABASE_URL?.trim()

if (!sqlitePath || !existsSync(sqlitePath)) {
  console.error('Usage: SQLITE_PATH=/path/to/db.sqlite DATABASE_URL=... node scripts/import-sqlite-to-pg.mjs')
  process.exit(1)
}

if (!databaseUrl) {
  console.error('DATABASE_URL is required.')
  process.exit(1)
}

const Database = require('better-sqlite3')
const { Pool } = require('pg')

const sqlite = new Database(sqlitePath, { readonly: true })
const rows = sqlite.prepare('SELECT * FROM profile_versions ORDER BY id').all()
sqlite.close()

if (rows.length === 0) {
  console.log('No profile_versions rows to import.')
  process.exit(0)
}

const pool = new Pool({ connectionString: databaseUrl })

try {
  for (const row of rows) {
    await pool.query(
      `INSERT INTO profile_versions (
        feishu_open_id, version, display_name, phone, department, bio,
        created_at, created_by, updated_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (feishu_open_id, version) DO NOTHING`,
      [
        row.feishu_open_id,
        row.version,
        row.display_name,
        row.phone ?? '',
        row.department ?? '',
        row.bio ?? '',
        row.created_at,
        row.created_by,
        row.updated_by ?? 'michael',
      ],
    )
  }

  const { rows: imported } = await pool.query(
    'SELECT id, feishu_open_id, version, updated_by FROM profile_versions ORDER BY id',
  )
  console.log(`Imported ${rows.length} row(s). Current table:`)
  console.log(imported)
} finally {
  await pool.end()
}
