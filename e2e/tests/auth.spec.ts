import { expect, test } from '@playwright/test'

import { E2E_USER_NAME, loginAsTestUser } from '../helpers'

test.describe('认证', () => {
  test('未登录访问个人中心显示登录提示', async ({ page }) => {
    await page.goto('/profile')
    await expect(page.getByRole('heading', { name: '登录后查看个人信息' })).toBeVisible()
    await expect(page.getByRole('link', { name: '前往首页登录' })).toBeVisible()
  })

  test('未登录访问编辑资料显示登录提示', async ({ page }) => {
    await page.goto('/profile/edit')
    await expect(page.getByRole('heading', { name: '登录后编辑个人资料' })).toBeVisible()
  })

  test('未登录访问版本历史显示登录提示', async ({ page }) => {
    await page.goto('/profile/history')
    await expect(page.getByRole('heading', { name: '登录后查看版本历史' })).toBeVisible()
  })

  test('首页展示飞书 OAuth 登录入口', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('link', { name: '飞书登录' })).toBeVisible()
    await expect(page.getByRole('heading', { name: '使用飞书账号登录' })).toBeVisible()
  })

  test('OAuth 登录接口跳转到飞书授权页', async ({ request }) => {
    const response = await request.get('/api/auth/feishu/login', {
      maxRedirects: 0,
    })
    expect(response.status()).toBe(302)
    const location = response.headers()['location'] ?? ''
    expect(location).toContain('accounts.feishu.cn')
    expect(location).toContain('client_id=cli_e2e_test_app')
    expect(location).toContain(
      encodeURIComponent('http://localhost:3011/feishu-app/api/auth/feishu/callback'),
    )
  })

  test('E2E 测试登录后显示已登录状态', async ({ page }) => {
    await loginAsTestUser(page, '/settings')
    await expect(
      page.getByRole('main').getByText(`已登录（${E2E_USER_NAME}）`),
    ).toBeVisible()
  })

  test('退出登录后回到未登录状态', async ({ page }) => {
    await loginAsTestUser(page, '/settings')
    await page.getByRole('button', { name: '退出登录' }).click()
    await expect(page).toHaveURL(/\/feishu-app\/?$/)
    await expect(page.getByRole('heading', { name: '使用飞书账号登录' })).toBeVisible()
  })

  test('E2E 测试登录接口可设置会话', async ({ request }) => {
    const response = await request.get('/api/test/login?redirect=/settings', {
      maxRedirects: 0,
    })
    expect(response.status()).toBe(302)
    expect(response.headers()['set-cookie'] ?? '').toContain('feishu_start_session=')
  })
})
