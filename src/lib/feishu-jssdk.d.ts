interface FeishuAuthCodeResult {
  code: string
}

interface FeishuJsapiError {
  errno?: number
  errString?: string
}

interface FeishuRequestAccessOptions {
  appID: string
  scopeList?: string[]
  state?: string
  success: (res: FeishuAuthCodeResult) => void
  fail: (error: FeishuJsapiError) => void
}

interface FeishuRequestAuthCodeOptions {
  appId: string
  success: (res: FeishuAuthCodeResult) => void
  fail: (error: FeishuJsapiError) => void
}

interface FeishuH5Sdk {
  ready: (callback: () => void) => void
}

interface Window {
  h5sdk?: FeishuH5Sdk
  tt?: {
    requestAccess?: (options: FeishuRequestAccessOptions) => void
    requestAuthCode: (options: FeishuRequestAuthCodeOptions) => void
  }
}
