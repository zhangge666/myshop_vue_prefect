// 认证工具，处理token和userInfo的localStorage操作
export const authUtils = {
  // 获取存储的token
  getToken() {
    return localStorage.getItem('token')
  },
  
  // 设置token
  setToken(token) {
    if (token) {
      localStorage.setItem('token', token)
    } else {
      localStorage.removeItem('token')
    }
  },
  
  // 清除token
  clearToken() {
    localStorage.removeItem('token')
  },
  
  // 获取用户信息
  getUserInfo() {
    const userInfo = localStorage.getItem('userInfo')
    return userInfo ? JSON.parse(userInfo) : null
  },
  
  // 设置用户信息
  setUserInfo(userInfo) {
    if (userInfo) {
      localStorage.setItem('userInfo', JSON.stringify(userInfo))
    } else {
      localStorage.removeItem('userInfo')
    }
  },
  
  // 清除所有认证数据
  clearAll() {
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }
}
