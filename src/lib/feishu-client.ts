const FEISHU_H5_SDK =
  'https://lf1-cdn-tos.bytegoofy.com/goofy/ee/lark/h5/jssdk/h5sdk-1.5.23.js'

const FEISHU_UA_PATTERN = /Lark|Feishu|lark|feishu/i
const H5SDK_READY_TIMEOUT_MS = 8000

let sdkPromise: Promise<void> | null = null

function isFeishuUserAgent() {
  return typeof navigator !== 'undefined' && FEISHU_UA_PATTERN.test(navigator.userAgent)
}

function findFeishuSdkScript() {
  return document.querySelector<HTMLScriptElement>(
    `script[src="${FEISHU_H5_SDK}"], script[data-feishu-h5-sdk="true"]`,
  )
}

function waitForH5SdkReady(timeoutMs = H5SDK_READY_TIMEOUT_MS) {
  if (window.tt) {
    return Promise.resolve(true)
  }

  if (!window.h5sdk) {
    return Promise.resolve(false)
  }

  return new Promise<boolean>((resolve) => {
    let settled = false
    const finish = (ready: boolean) => {
      if (settled) return
      settled = true
      resolve(ready)
    }

    window.h5sdk!.ready(() => finish(!!window.tt))
    window.setTimeout(() => finish(!!window.tt), timeoutMs)
  })
}

function loadFeishuSdk() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('飞书 SDK 仅能在浏览器环境加载'))
  }

  if (window.tt && window.h5sdk) {
    return Promise.resolve()
  }

  if (!sdkPromise) {
    sdkPromise = new Promise((resolve, reject) => {
      const existing = findFeishuSdkScript()
      if (existing) {
        if (existing.dataset.feishuH5SdkLoaded === 'true' || window.h5sdk) {
          resolve()
          return
        }

        existing.addEventListener(
          'load',
          () => {
            existing.dataset.feishuH5SdkLoaded = 'true'
            resolve()
          },
          { once: true },
        )
        existing.addEventListener(
          'error',
          () => reject(new Error('飞书 H5 SDK 加载失败')),
          { once: true },
        )
        return
      }

      const script = document.createElement('script')
      script.src = FEISHU_H5_SDK
      script.async = true
      script.dataset.feishuH5Sdk = 'true'
      script.onload = () => {
        script.dataset.feishuH5SdkLoaded = 'true'
        resolve()
      }
      script.onerror = () => reject(new Error('飞书 H5 SDK 加载失败'))
      document.head.appendChild(script)
    })
  }

  return sdkPromise
}

export function isInFeishuClient() {
  return typeof window !== 'undefined' && !!window.tt
}

export async function ensureFeishuClientReady() {
  const likelyFeishu = isFeishuUserAgent() || !!window.tt || !!window.h5sdk
  if (!likelyFeishu) {
    return false
  }

  try {
    await loadFeishuSdk()
  } catch {
    return false
  }

  return waitForH5SdkReady()
}

function requestAuthCode(appId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    window.tt!.requestAuthCode({
      appId,
      success: (res) => resolve(res.code),
      fail: (error) =>
        reject(new Error(error.errString || 'requestAuthCode 失败')),
    })
  })
}

export async function requestFeishuCode(appId: string): Promise<string> {
  const ready = await ensureFeishuClientReady()
  if (!ready || !window.tt || !window.h5sdk) {
    throw new Error('当前环境不是飞书客户端')
  }

  return new Promise((resolve, reject) => {
    window.h5sdk!.ready(() => {
      if (!window.tt) {
        reject(new Error('飞书 JSAPI 未就绪'))
        return
      }

      if (window.tt.requestAccess) {
        window.tt.requestAccess({
          appID: appId,
          scopeList: [],
          success: (res) => resolve(res.code),
          fail: (error) => {
            if (error.errno === 103) {
              requestAuthCode(appId).then(resolve).catch(reject)
              return
            }
            reject(new Error(error.errString || 'requestAccess 失败'))
          },
        })
        return
      }

      requestAuthCode(appId).then(resolve).catch(reject)
    })
  })
}

export async function loginViaFeishuJsapi(appId: string) {
  const code = await requestFeishuCode(appId)

  const response = await fetch('/feishu-app/api/auth/feishu/jsapi', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ code }),
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || '服务端免登失败')
  }

  return response.json() as Promise<{ ok: true; user: { name: string } }>
}
