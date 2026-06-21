import { expect, test } from '@playwright/test'

import {
  createNoteAndReturn,
  fillNoteForm,
  loginAsTestUser,
  resetNotesData,
} from '../helpers'

test.describe('笔记', () => {
  test.beforeEach(async ({ request }) => {
    await resetNotesData(request)
  })

  test('未登录访问提示登录', async ({ page }) => {
    await page.goto('/notes')
    await expect(
      page.getByRole('heading', { name: '登录后查看笔记' }),
    ).toBeVisible()
  })

  test('空状态展示新建入口', async ({ page }) => {
    await loginAsTestUser(page, '/notes')
    await expect(page.getByRole('heading', { name: '笔记' })).toBeVisible()
    await expect(page.getByText('还没有笔记。')).toBeVisible()
    await expect(
      page.getByRole('link', { name: '写第一条笔记' }),
    ).toBeVisible()
  })

  test('从空状态进入新建并保存后列表展示', async ({ page }) => {
    await loginAsTestUser(page, '/notes')
    await page.getByRole('link', { name: '写第一条笔记' }).click()
    await expect(page.getByRole('heading', { name: '新建笔记' })).toBeVisible()

    await fillNoteForm(page, { title: '第一条笔记', content: '内容一' })
    await page.getByRole('button', { name: '保存' }).click()

    await expect(page).toHaveURL(/\/notes\/?$/, { timeout: 15_000 })
    await expect(page.getByText('第一条笔记')).toBeVisible({ timeout: 15_000 })
  })

  test('标题为空时无法提交', async ({ page }) => {
    await loginAsTestUser(page, '/notes/new')
    await page.getByRole('button', { name: '保存' }).click()
    await expect(page).toHaveURL(/\/notes\/new/)
  })

  test('多条笔记按创建时间倒序', async ({ page }) => {
    await loginAsTestUser(page, '/')
    await createNoteAndReturn(page, { title: '笔记一', content: '一' })
    await createNoteAndReturn(page, { title: '笔记二', content: '二' })

    await page.goto('/notes')
    const items = page.getByRole('listitem')
    await expect(items).toHaveCount(2)
    await expect(items.first()).toContainText('笔记二')
    await expect(items.nth(1)).toContainText('笔记一')
  })

  test('桌面侧栏可进入笔记', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await loginAsTestUser(page, '/')
    await page.getByRole('link', { name: '笔记', exact: true }).first().click()
    await expect(page).toHaveURL(/\/notes\/?$/)
    await expect(page.getByRole('heading', { name: '笔记' })).toBeVisible()
  })
})

test.describe('编辑笔记', () => {
  test.beforeEach(async ({ request, page }) => {
    await resetNotesData(request)
    await loginAsTestUser(page, '/')
  })

  test('从列表进入编辑并原地更新', async ({ page }) => {
    await createNoteAndReturn(page, { title: '原标题', content: '原内容' })

    await page.goto('/notes')
    await page.getByRole('link', { name: /原标题/ }).click()
    await expect(page).toHaveURL(/\/notes\/\d+\/edit/)
    await expect(page.getByRole('heading', { name: '编辑笔记' })).toBeVisible()
    await expect(page.getByRole('textbox', { name: /标题/ })).toHaveValue('原标题')
    await expect(page.getByRole('textbox', { name: /正文/ })).toHaveValue('原内容')

    await fillNoteForm(page, { title: '新标题', content: '新内容' })
    await page.getByRole('button', { name: '保存修改' }).click()
    await expect(page).toHaveURL(/\/notes\/?$/, { timeout: 15_000 })

    await page.goto('/notes')
    await expect(page.getByRole('listitem')).toHaveCount(1)
    await expect(page.getByText('新标题')).toBeVisible()
    await expect(page.getByText('原标题')).toHaveCount(0)
  })

  test('打开不存在的笔记显示空态', async ({ page }) => {
    await page.goto('/notes/9999/edit')
    await expect(page.getByText('笔记不存在或已被删除')).toBeVisible()
  })

  test('取消返回列表且不保存改动', async ({ page }) => {
    await createNoteAndReturn(page, { title: '保留标题' })

    await page.goto('/notes')
    await page.getByRole('link', { name: /保留标题/ }).click()
    await fillNoteForm(page, { title: '改动不该保存' })
    await page.getByRole('link', { name: '取消' }).click()

    await expect(page).toHaveURL(/\/notes\/?$/)
    await page.goto('/notes')
    await expect(page.getByText('保留标题')).toBeVisible()
    await expect(page.getByText('改动不该保存')).toHaveCount(0)
  })
})

test.describe('删除笔记', () => {
  test.beforeEach(async ({ request, page }) => {
    await resetNotesData(request)
    await loginAsTestUser(page, '/')
  })

  test('从列表确认删除后笔记消失', async ({ page }) => {
    await createNoteAndReturn(page, { title: '待删除' })
    await page.goto('/notes')
    await expect(page.getByRole('listitem')).toHaveCount(1)

    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toContain('删除')
      await dialog.accept()
    })
    await page.getByRole('button', { name: '删除' }).click()

    await expect(page.getByRole('listitem')).toHaveCount(0)
    await expect(page.getByText('还没有笔记。')).toBeVisible()
  })

  test('取消删除后笔记保留', async ({ page }) => {
    await createNoteAndReturn(page, { title: '保留笔记' })
    await page.goto('/notes')

    page.once('dialog', async (dialog) => {
      await dialog.dismiss()
    })
    await page.getByRole('button', { name: '删除' }).click()

    await expect(page.getByRole('listitem')).toHaveCount(1)
    await expect(page.getByText('保留笔记')).toBeVisible()
  })

  test('从编辑页删除笔记', async ({ page }) => {
    await createNoteAndReturn(page, { title: '编辑页删除' })
    await page.goto('/notes')
    await page.getByRole('link', { name: /编辑页删除/ }).click()
    await expect(page).toHaveURL(/\/notes\/\d+\/edit/)

    page.once('dialog', async (dialog) => {
      await dialog.accept()
    })
    await page.getByRole('button', { name: '删除' }).click()

    await expect(page).toHaveURL(/\/notes\/?$/, { timeout: 15_000 })
    await expect(page.getByText('还没有笔记。')).toBeVisible()
  })
})
