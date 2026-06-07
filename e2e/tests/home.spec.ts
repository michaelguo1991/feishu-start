import { expect, test } from '@playwright/test'

import { E2E_USER_NAME, loginAsTestUser } from '../helpers'

test.describe('首页', () => {
  test('访客看到登录面板', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: '飞书工作台' })).toBeVisible()
    await expect(page.getByText('飞书客户端内自动免登；外部浏览器走 OAuth 登录。')).toBeVisible()
    await expect(page.getByRole('link', { name: '飞书登录' })).toBeVisible()
  })

  test('已登录看到欢迎信息与快捷入口', async ({ page }) => {
    await loginAsTestUser(page, '/')
    await expect(page.getByText('欢迎回来')).toBeVisible()
    await expect(page.getByRole('heading', { name: E2E_USER_NAME })).toBeVisible()
    const main = page.getByRole('main')
    await expect(main.getByRole('link', { name: '个人中心' })).toBeVisible()
    await expect(main.getByRole('link', { name: '应用入口' })).toBeVisible()
    await expect(main.getByRole('link', { name: '设置' })).toBeVisible()
  })

  test('OAuth 错误信息会展示在首页', async ({ page }) => {
    await page.goto('/?error=access_denied')
    await expect(page.getByText('你已取消飞书授权。')).toBeVisible()

    await page.goto('/?error=invalid_state')
    await expect(page.getByText('授权状态校验失败，请重新登录。')).toBeVisible()

    await page.goto('/?error=token_exchange_failed')
    await expect(
      page.getByText('换取飞书访问凭证失败，请检查应用配置与权限。'),
    ).toBeVisible()
  })
})
