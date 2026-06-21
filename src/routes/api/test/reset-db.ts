import { createFileRoute } from '@tanstack/react-router'

import { getDb } from '#/db'
import { notes, profileVersions } from '#/db/schema'
import { e2eNotFound, isE2eTestMode } from '#/lib/e2e'

export const Route = createFileRoute('/api/test/reset-db')({
  server: {
    handlers: {
      POST: async () => {
        if (!isE2eTestMode()) return e2eNotFound()

        const db = await getDb()
        await db.delete(notes)
        await db.delete(profileVersions)

        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      },
    },
  },
})
