import { expect, test } from '@playwright/test'

import {
  E2E_USER_NAME,
  loginAsTestUser,
  resetProfileData,
  saveProfileAndReturn,
} from '../helpers'

test.describe('个人中心', () => {
  test.beforeEach(async ({ page, request }) => {
    await resetProfileData(request)
    await loginAsTestUser(page, '/profile')
  })

  test('展示飞书账号信息与空资料状态', async ({ page }) => {
    await expect(page.getByRole('heading', { name: '个人中心' })).toBeVisible()
    await expect(page.getByRole('heading', { name: E2E_USER_NAME })).toBeVisible()
    await expect(page.getByText('已通过飞书登录')).toBeVisible()
    await expect(page.getByText('还没有保存过资料。')).toBeVisible()
    await expect(page.getByText('ou_e2e_test')).toBeVisible()
    await expect(page.getByText('e2e@test.example.com')).toBeVisible()
  })

  test('点击编辑资料进入编辑页', async ({ page }) => {
    await page.getByRole('link', { name: '编辑资料' }).click()
    await expect(page).toHaveURL(/\/profile\/edit/)
    await expect(page.getByRole('heading', { name: '编辑个人资料' })).toBeVisible()
  })

  test('保存资料后在个人中心展示最新版本', async ({ page }) => {
    await saveProfileAndReturn(page, {
      displayName: '资料展示名',
      phone: '13800000000',
      department: '测试部',
      bio: 'E2E 简介',
    })
    await expect(page.getByText('当前 v1')).toBeVisible()
    await expect(page.getByText('资料展示名')).toBeVisible()
    await expect(page.getByText('13800000000')).toBeVisible()
    await expect(page.getByText('测试部')).toBeVisible()
    await expect(page.getByText('E2E 简介')).toBeVisible()
  })
})
