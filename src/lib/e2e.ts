import type { FeishuUserInfo } from '#/lib/feishu'

export const E2E_TEST_USER: FeishuUserInfo = {
  name: 'E2E 测试用户',
  enName: 'E2E User',
  avatarUrl: '',
  openId: 'ou_e2e_test',
  unionId: 'on_e2e_test',
  email: 'e2e@test.example.com',
  userId: 'e2e_user_id',
  tenantKey: 'e2e_tenant',
}

export function isE2eTestMode() {
  return process.env.E2E_TEST_MODE === 'true'
}

export function e2eNotFound() {
  return new Response('Not Found', { status: 404 })
}
