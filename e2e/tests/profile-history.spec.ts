import { expect, test } from '@playwright/test'

import {
  loginAsTestUser,
  resetProfileData,
  saveProfileAndReturn,
} from '../helpers'

test.describe('资料版本历史', () => {
  test.beforeEach(async ({ request }) => {
    await resetProfileData(request)
  })

  test('无资料时历史页展示空状态', async ({ page }) => {
    await loginAsTestUser(page, '/profile/history')
    await expect(page.getByRole('heading', { name: '资料版本历史' })).toBeVisible()
    await expect(page.getByText('还没有保存过个人资料。')).toBeVisible()
    await expect(page.getByRole('link', { name: '去填写第一份资料' })).toBeVisible()
  })

  test('保存后历史列表按版本倒序展示', async ({ page }) => {
    await loginAsTestUser(page, '/')
    await saveProfileAndReturn(page, {
      displayName: '历史版本 A',
      department: '部门 A',
    })
    await saveProfileAndReturn(page, {
      displayName: '历史版本 B',
      department: '部门 B',
    })

    await page.goto('/profile/history')
    const items = page.locator('a[href*="/profile/history/"]')
    await expect(items).toHaveCount(2)
    await expect(items.first()).toContainText('v2')
    await expect(items.first()).toContainText('历史版本 B')
    await expect(items.nth(1)).toContainText('v1')
    await expect(items.nth(1)).toContainText('历史版本 A')
  })

  test('版本详情页展示完整字段', async ({ page }) => {
    await loginAsTestUser(page, '/')
    await saveProfileAndReturn(page, {
      displayName: '详情测试',
      department: '详情部门',
      bio: '详情简介',
    })

    await page.goto('/profile/history')
    await page.getByRole('link', { name: /v1 · 详情测试/ }).click()

    await expect(page).toHaveURL(/\/profile\/history\/1/)
    await expect(page.getByRole('heading', { name: '详情测试' })).toBeVisible()
    await expect(page.getByText('详情部门')).toBeVisible()
    await expect(page.getByText('详情简介')).toBeVisible()
    await expect(page.getByText('版本 v1')).toBeVisible()
    await expect(page.getByRole('button', { name: '恢复此版本' })).toBeVisible()
    await expect(page.getByRole('link', { name: '编辑资料' })).toBeVisible()
  })

  test('恢复旧版本会生成新版本且保留历史', async ({ page }) => {
    await loginAsTestUser(page, '/')
    await saveProfileAndReturn(page, {
      displayName: '旧版本名',
      department: '旧部门',
    })
    await saveProfileAndReturn(page, {
      displayName: '新版本名',
      department: '新部门',
    })

    await page.goto('/profile/history/1')
    await page.getByRole('button', { name: '恢复此版本' }).click()

    await expect(page.getByRole('heading', { name: '个人中心' })).toBeVisible()
    await expect(page.getByText('当前 v3')).toBeVisible()
    await expect(page.getByText('旧版本名')).toBeVisible()

    await page.goto('/profile/history')
    await expect(page.locator('a[href*="/profile/history/"]')).toHaveCount(3)
    await expect(page.getByRole('link', { name: /v3 · 旧版本名/ })).toBeVisible()
  })
})
