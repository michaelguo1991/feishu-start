import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'

import { getCookie } from '@tanstack/react-start/server'

import type { FeishuUserInfo } from '#/lib/feishu'
import { env } from '#/lib/env'

const SESSION_COOKIE = 'feishu_start_session'
const OAUTH_STATE_COOKIE = 'feishu_oauth_state'
const COOKIE_PATH = '/feishu-app'

export type SessionPayload = {
  accessToken: string
  expiresAt: number
  user: FeishuUserInfo
}

function sign(value: string) {
  return createHmac('sha256', env.sessionSecret).update(value).digest('base64url')
}

function encodeSession(payload: SessionPayload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signature = sign(body)
  return `${body}.${signature}`
}

function decodeSession(raw: string): SessionPayload | null {
  const [body, signature] = raw.split('.')
  if (!body || !signature) return null

  const expected = sign(body)
  const left = Buffer.from(signature)
  const right = Buffer.from(expected)
  if (left.length !== right.length || !timingSafeEqual(left, right)) {
    return null
  }

  try {
    return JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as SessionPayload
  } catch {
    return null
  }
}

function cookieSuffix(maxAge: number) {
  const parts = [
    `Max-Age=${maxAge}`,
    `Path=${COOKIE_PATH}`,
    'HttpOnly',
    'SameSite=Lax',
  ]
  if (env.nodeEnv === 'production') {
    parts.push('Secure')
  }
  return parts.join('; ')
}

function serializeCookie(name: string, value: string, maxAge: number) {
  return `${name}=${value}; ${cookieSuffix(maxAge)}`
}

function serializeDeletedCookie(name: string) {
  return `${name}=; ${cookieSuffix(0)}`
}

export function createOAuthState() {
  return randomBytes(24).toString('base64url')
}

export function oauthStateCookieHeader(state: string) {
  return serializeCookie(OAUTH_STATE_COOKIE, state, 60 * 10)
}

export function clearOAuthStateCookieHeader() {
  return serializeDeletedCookie(OAUTH_STATE_COOKIE)
}

export function sessionCookieHeader(payload: SessionPayload) {
  return serializeCookie(SESSION_COOKIE, encodeSession(payload), 60 * 60 * 24 * 7)
}

export function clearSessionCookieHeader() {
  return serializeDeletedCookie(SESSION_COOKIE)
}

export function appHomeUrl(search?: Record<string, string>) {
  const url = new URL(`${env.appBaseUrl.replace(/\/$/, '')}/`)
  if (search) {
    for (const [key, value] of Object.entries(search)) {
      url.searchParams.set(key, value)
    }
  }
  return url.toString()
}

export function redirectResponse(location: string, cookieHeaders: string[] = []) {
  const headers = new Headers()
  headers.set('Location', location)
  for (const cookie of cookieHeaders) {
    headers.append('Set-Cookie', cookie)
  }
  return new Response(null, { status: 302, headers })
}

export function jsonResponse(
  data: unknown,
  cookieHeaders: string[] = [],
  status = 200,
) {
  const headers = new Headers({ 'Content-Type': 'application/json' })
  for (const cookie of cookieHeaders) {
    headers.append('Set-Cookie', cookie)
  }
  return new Response(JSON.stringify(data), { status, headers })
}

export function readOAuthStateCookie() {
  return getCookie(OAUTH_STATE_COOKIE)
}

export function readSession(): SessionPayload | null {
  const raw = getCookie(SESSION_COOKIE)
  if (!raw) return null

  const session = decodeSession(raw)
  if (!session) return null
  if (session.expiresAt <= Date.now()) return null

  return session
}

export function requireOpenId(): string {
  const session = readSession()
  const openId = session?.user?.openId
  if (!openId) {
    throw new Error('未登录')
  }
  return openId
}
