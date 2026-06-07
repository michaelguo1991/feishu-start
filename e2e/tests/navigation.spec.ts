import { expect, test } from '@playwright/test'

import { loginAsTestUser, mobileBottomNav } from '../helpers'

test.describe('导航', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page, '/')
  })

  test('桌面侧栏可访问各页面', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })

    await page.getByRole('link', { name: '个人', exact: true }).click()
    await expect(page).toHaveURL(/\/profile\/?$/)
    await expect(page.getByRole('heading', { name: '个人中心' })).toBeVisible()

    await page.getByRole('link', { name: '应用', exact: true }).click()
    await expect(page).toHaveURL(/\/apps/)
    await expect(page.getByRole('heading', { name: '应用入口' })).toBeVisible()

    await page.getByRole('link', { name: '设置', exact: true }).click()
    await expect(page).toHaveURL(/\/settings/)
    await expect(page.getByRole('heading', { name: '设置' })).toBeVisible()

    await page.getByRole('link', { name: '首页', exact: true }).click()
    await expect(page).toHaveURL(/\/feishu-app\/?$/)
    await expect(page.getByText('欢迎回来')).toBeVisible()
  })

  test('移动端底部导航可访问各页面', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })

    const nav = mobileBottomNav(page)
    await nav.getByRole('link', { name: '个人', exact: true }).click()
    await expect(page.getByRole('heading', { name: '个人中心' })).toBeVisible()

    await nav.getByRole('link', { name: '应用', exact: true }).click()
    await expect(page.getByRole('heading', { name: '应用入口' })).toBeVisible()

    await nav.getByRole('link', { name: '设置', exact: true }).click()
    await expect(page.getByRole('heading', { name: '设置' })).toBeVisible()

    await nav.getByRole('link', { name: '首页', exact: true }).click()
    await expect(page.getByText('欢迎回来')).toBeVisible()
  })
})
