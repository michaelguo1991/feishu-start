import { expect, type APIRequestContext, type Page } from '@playwright/test'

export const E2E_USER_NAME = 'E2E 测试用户'

export async function resetProfileData(request: APIRequestContext) {
  const response = await request.post('/api/test/reset-db')
  if (!response.ok()) {
    throw new Error(`Failed to reset e2e database: ${response.status()}`)
  }
}

export async function loginAsTestUser(page: Page, redirect = '/') {
  await page.goto(`/api/test/login?redirect=${encodeURIComponent(redirect)}`)
  await page.waitForURL((url) => url.pathname.startsWith('/feishu-app'))
  await page.waitForLoadState('domcontentloaded')
}

async function fillTextbox(page: Page, name: RegExp, value: string) {
  const input = page.getByRole('textbox', { name })
  await input.click()
  await input.clear()
  await input.pressSequentially(value, { delay: 20 })
  await expect(input).toHaveValue(value)
}

export async function fillProfileForm(
  page: Page,
  data: {
    displayName: string
    phone?: string
    department?: string
    bio?: string
  },
) {
  await expect(page.getByRole('heading', { name: '编辑个人资料' })).toBeVisible()
  await expect(page.getByRole('textbox', { name: /显示姓名/ })).toBeEditable()
  await fillTextbox(page, /显示姓名/, data.displayName)
  if (data.phone !== undefined) {
    await fillTextbox(page, /手机号/, data.phone)
  }
  if (data.department !== undefined) {
    await fillTextbox(page, /部门/, data.department)
  }
  if (data.bio !== undefined) {
    const bio = page.getByRole('textbox', { name: /简介/ })
    await bio.click()
    await bio.fill(data.bio)
    await expect(bio).toHaveValue(data.bio)
  }
}

export async function saveProfileAndReturn(
  page: Page,
  data: {
    displayName: string
    phone?: string
    department?: string
    bio?: string
  },
) {
  await page.goto('/profile/edit')
  await fillProfileForm(page, data)
  await page.getByRole('button', { name: '保存新版本' }).click()
  await expect(page.getByRole('heading', { name: '个人中心' })).toBeVisible({
    timeout: 15_000,
  })
}

export function mainContent(page: Page) {
  return page.getByRole('main')
}

export function mobileBottomNav(page: Page) {
  return page.locator('nav.fixed.inset-x-0')
}

export async function hideDevtoolsOverlay(page: Page) {
  await page.addStyleTag({
    content:
      'button[aria-label="Open TanStack Devtools"], [data-testid="tanstack-devtools"] { display: none !important; pointer-events: none !important; }',
  })
}
