import { defineStore } from 'pinia'
import { login, register, getUserInfo, updateUserInfo, changePassword } from '../api/auth'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    userInfo: JSON.parse(localStorage.getItem('userInfo')) || null
  }),
  getters: {
    isLoggedIn: (state) => !!state.token
  },
  actions: {
    // 登录
    async login(username, password) {
      try {
        const response = await login(username, password)
        // 响应拦截器已经处理了错误，这里只需要处理成功的情况
        this.token = response.token
        this.userInfo = response.user
        localStorage.setItem('token', this.token)
        localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
        return true
      } catch (error) {
        return false
      }
    },
    
    // 注册
    async register(userData) {
      try {
        const response = await register(userData)
        // 响应拦截器已经处理了错误，这里只需要处理成功的情况
        this.token = response.token
        this.userInfo = response.user
        localStorage.setItem('token', this.token)
        localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
        return true
      } catch (error) {
        return false
      }
    },
    
    // 退出登录
    logout() {
      this.token = null
      this.userInfo = null
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
    },
    
    // 获取用户信息
    async fetchUserInfo() {
      try {
        const response = await getUserInfo()
        // 响应拦截器已经处理了错误，这里只需要处理成功的情况
        this.userInfo = response
        localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
        return true
      } catch (error) {
        console.error('获取用户信息失败:', error)
        return false
      }
    },
    
    // 更新用户信息
    async updateUser(userData) {
      try {
        const response = await updateUserInfo(userData)
        // 响应拦截器已经处理了错误，这里只需要处理成功的情况
        this.userInfo = { ...this.userInfo, ...userData }
        localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
        return true
      } catch (error) {
        console.error('更新用户信息失败:', error)
        return false
      }
    },
    
    // 修改密码
    async changePassword(passwordData) {
      try {
        const response = await changePassword(passwordData)
        // 响应拦截器已经处理了错误，这里只需要处理成功的情况
        return true
      } catch (error) {
        console.error('修改密码失败:', error)
        return false
      }
    }
  }
})
