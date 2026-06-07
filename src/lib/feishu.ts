import { env, getFeishuRedirectUri } from '#/lib/env'

const FEISHU_AUTHORIZE_URL =
  'https://accounts.feishu.cn/open-apis/authen/v1/authorize'
const FEISHU_TOKEN_URL = 'https://open.feishu.cn/open-apis/authen/v2/oauth/token'
const FEISHU_JSAPI_TOKEN_URL =
  'https://open.feishu.cn/open-apis/authen/v1/access_token'
const FEISHU_APP_TOKEN_URL =
  'https://open.feishu.cn/open-apis/auth/v3/app_access_token/internal'
const FEISHU_USER_INFO_URL =
  'https://open.feishu.cn/open-apis/authen/v1/user_info'

export type FeishuUserInfo = {
  name: string
  enName: string
  avatarUrl: string
  openId: string
  unionId: string
  email: string
  userId: string
  tenantKey: string
}

type FeishuApiResponse<T> = {
  code: number
  msg?: string
  data?: T
}

type TokenResponse = {
  code: number
  access_token?: string
  expires_in?: number
  refresh_token?: string
  scope?: string
  token_type?: string
  msg?: string
}

type JsapiTokenResponse = {
  code: number
  msg?: string
  data?: {
    access_token?: string
    expires_in?: number
    refresh_token?: string
  }
}

type AppTokenResponse = {
  code: number
  msg?: string
  app_access_token?: string
  expire?: number
}

export type FeishuLoginResult = {
  accessToken: string
  expiresIn: number
  user: FeishuUserInfo
}

async function getAppAccessToken() {
  const response = await fetch(FEISHU_APP_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      app_id: env.feishuAppId,
      app_secret: env.feishuAppSecret,
    }),
  })

  const payload = (await response.json()) as AppTokenResponse
  if (payload.code !== 0 || !payload.app_access_token) {
    throw new Error(payload.msg || '获取 app_access_token 失败')
  }

  return payload.app_access_token
}

export async function exchangeJsapiCode(code: string) {
  const appAccessToken = await getAppAccessToken()
  const response = await fetch(FEISHU_JSAPI_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${appAccessToken}`,
    },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code,
    }),
  })

  const payload = (await response.json()) as JsapiTokenResponse
  if (payload.code !== 0 || !payload.data?.access_token) {
    throw new Error(payload.msg || '飞书 JSAPI token 交换失败')
  }

  return {
    accessToken: payload.data.access_token,
    expiresIn: payload.data.expires_in ?? 7200,
    refreshToken: payload.data.refresh_token,
    scope: '',
  }
}

export async function completeFeishuLogin(code: string, mode: 'browser' | 'jsapi') {
  const token =
    mode === 'browser'
      ? await exchangeFeishuCode(code)
      : await exchangeJsapiCode(code)
  const user = await fetchFeishuUserInfo(token.accessToken)

  return {
    accessToken: token.accessToken,
    expiresIn: token.expiresIn,
    user,
  } satisfies FeishuLoginResult
}

export function buildFeishuAuthorizeUrl(state: string) {
  const params = new URLSearchParams({
    client_id: env.feishuAppId,
    redirect_uri: getFeishuRedirectUri(),
    response_type: 'code',
    state,
  })

  return `${FEISHU_AUTHORIZE_URL}?${params.toString()}`
}

export async function exchangeFeishuCode(code: string) {
  const response = await fetch(FEISHU_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      client_id: env.feishuAppId,
      client_secret: env.feishuAppSecret,
      code,
      redirect_uri: getFeishuRedirectUri(),
    }),
  })

  const payload = (await response.json()) as TokenResponse
  if (payload.code !== 0 || !payload.access_token) {
    throw new Error(payload.msg || '飞书 token 交换失败')
  }

  return {
    accessToken: payload.access_token,
    expiresIn: payload.expires_in ?? 7200,
    refreshToken: payload.refresh_token,
    scope: payload.scope ?? '',
  }
}

export async function fetchFeishuUserInfo(accessToken: string) {
  const response = await fetch(FEISHU_USER_INFO_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  const payload = (await response.json()) as FeishuApiResponse<{
    name: string
    en_name: string
    avatar_url: string
    open_id: string
    union_id: string
    email: string
    user_id: string
    tenant_key: string
  }>

  if (payload.code !== 0 || !payload.data) {
    throw new Error(payload.msg || '获取飞书用户信息失败')
  }

  return {
    name: payload.data.name,
    enName: payload.data.en_name,
    avatarUrl: payload.data.avatar_url,
    openId: payload.data.open_id,
    unionId: payload.data.union_id,
    email: payload.data.email,
    userId: payload.data.user_id,
    tenantKey: payload.data.tenant_key,
  } satisfies FeishuUserInfo
}
