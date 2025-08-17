import axios from 'axios'

// 用户登录
export const login = async (username, password) => {
  const response = await axios.post('/auth', {
    username,
    password
  })
  return response.data
}

// 用户注册
export const register = async (userData) => {
  const response = await axios.post('/auth/register', userData)
  return response.data
}
