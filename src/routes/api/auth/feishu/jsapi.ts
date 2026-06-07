import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { completeFeishuLogin } from '#/lib/feishu'
import { isFeishuConfigured } from '#/lib/env'
import { jsonResponse, sessionCookieHeader } from '#/lib/session'

const bodySchema = z.object({
  code: z.string().min(1),
})

export const Route = createFileRoute('/api/auth/feishu/jsapi')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isFeishuConfigured()) {
          return new Response('飞书应用未配置', { status: 503 })
        }

        let body: unknown
        try {
          body = await request.json()
        } catch {
          return new Response('请求体必须是 JSON', { status: 400 })
        }

        const parsed = bodySchema.safeParse(body)
        if (!parsed.success) {
          return new Response('缺少 code 参数', { status: 400 })
        }

        try {
          const login = await completeFeishuLogin(parsed.data.code, 'jsapi')

          return jsonResponse(
            {
              ok: true,
              user: login.user,
              expiresAt: Date.now() + login.expiresIn * 1000,
            },
            [
              sessionCookieHeader({
                accessToken: login.accessToken,
                expiresAt: Date.now() + login.expiresIn * 1000,
                user: login.user,
              }),
            ],
          )
        } catch (error) {
          console.error('[feishu jsapi]', error)
          return new Response(
            error instanceof Error ? error.message : '飞书客户端免登失败',
            { status: 502 },
          )
        }
      },
    },
  },
})
