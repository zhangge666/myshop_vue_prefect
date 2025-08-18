import api from './index.js'

// 用户登录
export const login = async (username, password) => {
  return await api.post('/auth', {
    username,
    password
  }, { baseURL: '/' })
}

// 用户注册
export const register = async (userData) => {
  return await api.post('/auth/register', userData, { baseURL: '/' })
}

// 获取用户信息
export const getUserInfo = async () => {
  return await api.get('/auth/profile',{ baseURL: '/' })
}

// 更新用户信息
export const updateUserInfo = async (userData) => {
  return await api.post('/auth/profile/update', userData,{ baseURL: '/' })
}

// 修改密码
export const changePassword = async (passwordData) => {
  return await api.post('/auth/profile/update', passwordData,{ baseURL: '/' })
}
