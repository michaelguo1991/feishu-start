import { existsSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'

export default function globalSetup() {
  const dbPath = resolve(process.cwd(), '.data/e2e.sqlite')
  for (const suffix of ['', '-wal', '-shm']) {
    const path = `${dbPath}${suffix}`
    if (existsSync(path)) rmSync(path)
  }
}
