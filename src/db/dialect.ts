import { env } from '#/lib/env'

export function migrationsFolder() {
  return env.usePostgres ? 'drizzle' : 'drizzle-sqlite'
}
