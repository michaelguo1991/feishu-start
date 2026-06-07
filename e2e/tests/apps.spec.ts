import { expect, test } from '@playwright/test'

const appLinks = [
  { name: '站点首页', href: 'https://zhangjie.life/' },
  { name: '静态工作台', href: 'https://zhangjie.life/feishu/' },
  { name: '镜像仓库', href: 'https://registry.zhangjie.life/' },
  { name: '飞书开放平台', href: 'https://open.feishu.cn/app' },
]

test.describe('应用入口', () => {
  test('展示全部外部链接', async ({ page }) => {
    await page.goto('/apps')
    await expect(page.getByRole('heading', { name: '应用入口' })).toBeVisible()

    for (const app of appLinks) {
      const link = page.getByRole('link', { name: app.name })
      await expect(link).toBeVisible()
      await expect(link).toHaveAttribute('href', app.href)
      await expect(link).toHaveAttribute('target', '_blank')
    }
  })
})
