import { expect, test } from '@playwright/test'

import { E2E_USER_NAME, loginAsTestUser } from '../helpers'

test.describe('设置', () => {
  test('未登录时账户操作区显示登录提示', async ({ page }) => {
    await page.goto('/settings')
    await expect(page.getByRole('heading', { name: '设置' })).toBeVisible()
    await expect(page.getByText('飞书凭证')).toBeVisible()
    await expect(page.getByText('已配置')).toBeVisible()
    await expect(page.getByRole('main').getByText('未登录')).toBeVisible()
    await expect(page.getByRole('heading', { name: '登录后可管理会话' })).toBeVisible()
  })

  test('已登录时展示运行状态与退出按钮', async ({ page }) => {
    await loginAsTestUser(page, '/settings')
    await expect(page.getByText(`已登录（${E2E_USER_NAME}）`)).toBeVisible()
    await expect(page.getByText('cli_e2e_test_app')).toBeVisible()
    await expect(
      page.getByText('http://localhost:3011/feishu-app/api/auth/feishu/callback'),
    ).toBeVisible()
    await expect(page.getByRole('button', { name: '退出登录' })).toBeVisible()
    await expect(page.getByText('部署路径：/feishu-app/')).toBeVisible()
  })
})
