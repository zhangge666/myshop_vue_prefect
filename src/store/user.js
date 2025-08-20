import { defineStore } from 'pinia'
import { authApi } from '../api'
import { authUtils } from '../utils/auth'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: authUtils.getToken(),
    userInfo: authUtils.getUserInfo() || null // 从localStorage获取用户信息
  }),
  getters: {
    // 基础状态判断
    isLoggedIn: (state) => !!state.token,
    isGuest: (state) => {
      if (!state.token) return true
      try {
        const payload = JSON.parse(atob(state.token.split('.')[1]))
        return payload.type === 'guest'
      } catch (e) {
        return true
      }
    },
    
    // 从userInfo中获取用户属性
    userId: (state) => state.userInfo?.id || null,
    guestId: (state) => state.userInfo?.guestId || null,
    username: (state) => state.userInfo?.username || '未知用户',
    avatar: (state) => state.userInfo?.avatar || '/images/avatar.png',
    balance: (state) => state.userInfo?.balance || 0,
    contact: (state) => state.userInfo?.contact || null,
    contactType: (state) => state.userInfo?.contactType || 0,
    roles: (state) => state.userInfo?.roles || [],
    
    // 角色判断
    isAdmin: (state) => {
      const roles = state.userInfo?.roles || []
      return roles.includes('ROLE_ADMIN')
    },
    isUser: (state) => {
      const roles = state.userInfo?.roles || []
      return roles.includes('ROLE_USER')
    },
    
    // 权限检查
    hasRole: (state) => (role) => {
      const roles = state.userInfo?.roles || []
      return roles.includes(role)
    }
  },
  actions: {
    // 从JWT解析用户信息到userInfo
    parseUserInfoFromToken() {
      const token = this.token
      if (!token) {
        this.userInfo = null
        authUtils.setUserInfo(null) // 清除localStorage中的userInfo
        return
      }
      
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        
        if (payload.type === 'user') {
          // 登录用户
          this.userInfo = {
            id: payload.uid,
            username: payload.name || '用户',
            avatar: payload.avatar || '/images/avatar.png',
            balance: payload.balance || 0,
            contact: payload.contact,
            contactType: payload.contact_type,
            roles: payload.roles || []
          }
        } else if (payload.type === 'guest') {
          // 游客
          this.userInfo = {
            id: null,
            username: '游客',
            avatar: '/images/avatar.png',
            balance: 0,
            contact: payload.contact || '',
            contactType: payload.contact_type || 0,
            roles: payload.roles || ['ROLE_GUEST'],
            guestId: payload.gid
          }
        } else {
          this.userInfo = null
        }
        
        // 同步到localStorage
        authUtils.setUserInfo(this.userInfo)
      } catch (error) {
        console.error('解析JWT失败:', error)
        this.userInfo = null
        authUtils.setUserInfo(null)
      }
    },
    
    // 设置token（同时解析用户信息）
    setToken(token) {
      this.token = token
      // localStorage存储token
      authUtils.setToken(token)
      // 解析token到userInfo（会自动同步到localStorage）
      this.parseUserInfoFromToken()
    },
    
    // 更新store状态（从localStorage重新读取token和userInfo）
    updateState() {
      this.token = authUtils.getToken()
      this.userInfo = authUtils.getUserInfo()
      
      // 如果localStorage中没有userInfo但有token，则解析token
      if (!this.userInfo && this.token) {
        this.parseUserInfoFromToken()
      }
    },
    
    // 直接设置用户信息（同时更新localStorage）
    setUserInfo(userInfo) {
      this.userInfo = userInfo
      authUtils.setUserInfo(userInfo)
    },
    
    // 登录
    async login(username, password) {
      try {
        const response = await authApi.login(username, password)
        
        if (response && response.token) {
          // 设置token（会自动解析到userInfo并同步到localStorage）
          this.setToken(response.token)
          
          // 如果后端返回了额外的用户信息，合并到userInfo
          if (response.user) {
            const updatedUserInfo = { ...this.userInfo, ...response.user }
            this.setUserInfo(updatedUserInfo)
          }
        }
        
        // 发送登录成功事件
        window.dispatchEvent(new CustomEvent('loginSuccess'))
        
        return true
      } catch (error) {
        console.error('登录失败:', error)
        return false
      }
    },
    
    // 注册
    async register(userData) {
      try {
        const response = await authApi.register(userData)
        
        if (response && response.token) {
          // 设置token（会自动解析到userInfo并同步到localStorage）
          this.setToken(response.token)
          
          // 如果后端返回了额外的用户信息，合并到userInfo
          if (response.user) {
            const updatedUserInfo = { ...this.userInfo, ...response.user }
            this.setUserInfo(updatedUserInfo)
          }
        }
        
        // 发送注册成功事件
        window.dispatchEvent(new CustomEvent('registerSuccess'))
        
        return true
      } catch (error) {
        return false
      }
    },
    
    // 退出登录
    async logout() {
      // 清除token和userInfo
      this.token = null
      this.userInfo = null
      // 清除localStorage中的token和userInfo
      authUtils.clearToken()
      authUtils.setUserInfo(null)
      
      // 发送退出登录事件
      window.dispatchEvent(new CustomEvent('logoutSuccess'))
    },
    
    // 获取用户信息（从后端API）
    async fetchUserInfo() {
      try {
        const response = await authApi.getProfile()
        // 更新userInfo（会自动同步到localStorage）
        const updatedUserInfo = { ...this.userInfo, ...response }
        this.setUserInfo(updatedUserInfo)
        return true
      } catch (error) {
        console.error('获取用户信息失败:', error)
        return false
      }
    },
    
    // 更新用户信息
    async updateUser(userData) {
      try {
        const response = await authApi.updateProfile(userData)
        // 更新userInfo（会自动同步到localStorage）
        const updatedUserInfo = { ...this.userInfo, ...userData }
        this.setUserInfo(updatedUserInfo)
        return true
      } catch (error) {
        console.error('更新用户信息失败:', error)
        return false
      }
    },
    
    // 修改密码
    async changePassword(passwordData) {
      try {
        const response = await authApi.updateProfile(passwordData)
        return true
      } catch (error) {
        console.error('修改密码失败:', error)
        return false
      }
    },
    
    // 获取JWT信息（用于调试）
    getJwtInfo() {
      const token = this.token
      if (!token) return '无Token'
      
      try {
        const parts = token.split('.')
        if (parts.length !== 3) return 'Token格式错误'
        
        const header = JSON.parse(atob(parts[0]))
        const payload = JSON.parse(atob(parts[1]))
        
        return {
          header,
          payload,
          signature: parts[2].substring(0, 20) + '...'
        }
      } catch (error) {
        return `Token解析失败: ${error.message}`
      }
    },
    
    // 初始化store（在应用启动时调用）
    init() {
      // 从localStorage恢复状态
      this.updateState()
      
      // 监听游客token事件
      window.addEventListener('guestTokenReceived', (event) => {
        const { token } = event.detail
        this.setToken(token)
      })
    }
  }
})
