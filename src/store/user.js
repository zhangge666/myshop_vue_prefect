import { defineStore } from 'pinia'
import { login, register } from '../api/auth'

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
      const response = await login(username, password)
      if (response.code === 0) {
        this.token = response.data.token
        this.userInfo = response.data.user
        localStorage.setItem('token', this.token)
        localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
        return true
      }
      return false
    },
    
    // 注册
    async register(userData) {
      const response = await register(userData)
      if (response.code === 0) {
        this.token = response.data.token
        this.userInfo = response.data.user
        localStorage.setItem('token', this.token)
        localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
        return true
      }
      return false
    },
    
    // 退出登录
    logout() {
      this.token = null
      this.userInfo = null
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
    }
  }
})
