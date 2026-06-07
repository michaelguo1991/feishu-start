import { expect, test } from '@playwright/test'

import {
  fillProfileForm,
  loginAsTestUser,
  resetProfileData,
  saveProfileAndReturn,
} from '../helpers'

test.describe('编辑资料', () => {
  test.beforeEach(async ({ page, request }) => {
    await resetProfileData(request)
    await loginAsTestUser(page, '/profile/edit')
  })

  test('展示编辑表单与操作按钮', async ({ page }) => {
    await expect(page.getByRole('heading', { name: '编辑个人资料' })).toBeVisible()
    await expect(page.getByLabel(/显示姓名/)).toBeVisible()
    await expect(page.getByLabel(/手机号/)).toBeVisible()
    await expect(page.getByLabel(/部门/)).toBeVisible()
    await expect(page.getByLabel(/简介/)).toBeVisible()
    await expect(page.getByRole('button', { name: '保存新版本' })).toBeVisible()
    await expect(page.getByRole('link', { name: '查看历史版本' })).toBeVisible()
    await expect(page.getByRole('link', { name: '取消' })).toBeVisible()
  })

  test('保存第一份资料并跳转回个人中心', async ({ page }) => {
    await saveProfileAndReturn(page, {
      displayName: '第一份资料',
      department: '研发部',
    })
    await expect(page.getByText('第一份资料')).toBeVisible()
    await expect(page.getByText('当前 v1')).toBeVisible()
  })

  test('再次保存会递增版本号', async ({ page }) => {
    await saveProfileAndReturn(page, { displayName: '版本一' })
    await saveProfileAndReturn(page, { displayName: '版本二' })
    await expect(page.getByText('当前 v2')).toBeVisible()
    await expect(page.getByText('版本二')).toBeVisible()
  })

  test('姓名为空时无法提交', async ({ page }) => {
    await page.getByLabel(/显示姓名/).fill('')
    await page.getByRole('button', { name: '保存新版本' }).click()
    await expect(page).toHaveURL(/\/profile\/edit/)
  })

  test('取消返回个人中心', async ({ page }) => {
    await page.getByRole('link', { name: '取消' }).click()
    await expect(page).toHaveURL(/\/profile\/?$/)
    await expect(page.getByRole('heading', { name: '个人中心' })).toBeVisible({
      timeout: 15_000,
    })
  })
})
