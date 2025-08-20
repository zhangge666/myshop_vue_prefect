// 游客身份初始化工具
import { authUtils } from './auth.js'
import { authApi } from '../api/index.js'

export const guestInit = {
  // 初始化游客身份（如果还没有token）
  async initGuestIfNeeded() {
    if (!authUtils.getToken()) {
      console.log('检测到没有token，开始初始化游客身份...')
      
      try {
        // 调用后端接口获取游客JWT
        const response = await authApi.getGuestToken()
        if (response && response.token) {
          // 设置到localStorage
          authUtils.setToken(response.token)
          console.log('游客JWT已从后端获取并存储')
          
          // 通知store更新状态
          window.dispatchEvent(new CustomEvent('guestTokenReceived', {
            detail: { token: response.token }
          }))
        } else {
          console.warn('后端未返回游客JWT，使用本地创建')
          const guestToken = this.createGuestToken()
          authUtils.setToken(guestToken)
          console.log('使用本地游客JWT作为备选方案')
        }
      } catch (error) {
        console.warn('获取游客JWT失败:', error)
        // 如果API调用失败，创建一个本地游客token作为备选方案
        const guestToken = this.createGuestToken()
        authUtils.setToken(guestToken)
        console.log('使用本地游客JWT作为备选方案')
      }
    } else {
      console.log('已存在token，跳过游客身份初始化')
    }
  },
  
  // 创建游客JWT（备选方案，实际应该由后端生成）
  createGuestToken() {
    const guestId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    const payload = {
      type: 'guest',
      gid: guestId,
      contact_type: 0, // 匿名用户
      contact: 'anonymous',
      roles: ['ROLE_GUEST'],
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7天过期
    }
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    const payloadStr = btoa(JSON.stringify(payload))
    const signature = 'mock_signature_for_demo'
    return `${header}.${payloadStr}.${signature}`
  },
  
  // 在应用启动时调用
  async init() {
    await this.initGuestIfNeeded()
  }
}
