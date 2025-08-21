import axios from 'axios'
import { ElMessage } from 'element-plus'
import { guestInit } from '@/utils/guestInit'
// 创建axios实例
const api = axios.create({
  baseURL: '/api/v1',
  timeout: 150000
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    // 添加token到请求头
    const token = localStorage.getItem('token')
    console.log("这里是请求拦截其中的token："+token)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    const { data,config } = response
    
    // 处理不同的响应格式
    if (data.code === 0 || data.code === 200) {
      const responseData = data.data !== undefined ? data.data : data
      
      // 不再自动存储token和userInfo，让store处理
      // 只返回数据，让调用方决定如何处理
      return responseData
    }else {
      // 错误情况
      const errorMsg = data.msg || data.message || '请求失败'
      ElMessage.error(errorMsg)
      return Promise.reject(new Error(errorMsg))
    }
  },
  error => {
    // 处理网络错误和HTTP错误
    let errorMsg = '网络错误'
    
    if (error.response) {
      // 服务器返回错误状态码
      const { status, data } = error.response
      if (status === 401) {
        errorMsg = '未授权，请重新登录'
        // 清除本地存储的token
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
        //获取游客JWT
        // guestInit.init().then(async () => {
        //   ElMessage.success("获取游客身份成功")
        //   // 初始化完成后，解析用户信息
        //   const { useUserStore } = await import('@/store/user.js')
        //   const userStore = useUserStore()
        //   userStore.init()
        // }).catch(error => {
        //   console.error('用户状态初始化失败:', error)
        // })
        // 可以在这里添加重定向到登录页的逻辑
        try {
          const current = window.location.pathname + window.location.search
          sessionStorage.setItem('postLoginRedirect', current)
        } catch {}
        window.location.href = '/'
      } else if (status === 403) {
        errorMsg = '权限不足，请切换账号登陆'
      } else if (status === 404) {
        errorMsg = '请求的资源不存在'
      } else if (status === 500) {
        errorMsg = '服务器内部错误'
      } else if (data && data.msg) {
        errorMsg = data.msg
      } else if (data && data.message) {
        errorMsg = data.message
      } else {
        errorMsg = `请求失败 (${status})`
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      errorMsg = '网络连接失败，请检查网络设置'
    } else {
      // 其他错误
      errorMsg = error.message || '未知错误'
    }
    
    ElMessage.error(errorMsg)
    return Promise.reject(error)
  }
)

// 辅助：识别联系方式类型（1 邮箱，2 手机号）
const detectContactType = (contact) => {
  if (!contact) return undefined
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const phonePattern = /^1[3-9]\d{9}$/
  if (emailPattern.test(contact)) return 1
  if (phonePattern.test(contact)) return 2
  return undefined
}

// 商品相关API
export const productApi = {
  // 获取商品列表
  getProducts(params) {
    return api.get('/products', { params })
  },
  // 获取商品详情
  getProduct(id) {
    return api.get(`/products/${id}`)
  },
  // 获取推荐商品
  getRecommendProducts() {
    return api.get('/products/recommend')
  }
}

// 分类相关API
export const categoryApi = {
  // 获取分类列表
  getCategories() {
    return api.get('/categories')
  }
}

// 订单相关API
export const orderApi = {
  // 创建订单（支持自动识别联系方式类型）
  createOrder(productId, quantity, contact, contactType) {
    const finalType = contactType ?? detectContactType(contact)
    return api.post('/orders/create', null, { 
      params: {
        productId,
        quantity,
        contact,
        contactType: finalType
      }
    })
  },
  
  // 获取订单列表
  getOrders(params) {
    return api.get('/orders', { params })
  },
  
  // 获取订单详情
  getOrderDetail(orderNo) {
    return api.get(`/orders/detail/${orderNo}`)
  },
  
  // 取消订单
  cancelOrder(orderId) {
    return api.post(`/orders/cancel/${orderId}`)
  },
  
  // 支付订单
  payOrder(orderId) {
    return api.post(`/orders/pay/${orderId}`)
  }
}

// 支付相关API
export const paymentApi = {
  // 获取可用支付渠道
  getChannels() {
    return api.get('/payments/channels')
  },
  
  // 发起支付
  createPayment(orderNo, channelId, productName) {
    // 如果未传 contactType，自动识别
    return api.get('/payments/create', {
      params: {
        orderNo: orderNo,
        channelId: channelId,
        productName: productName
      }
    })
  },
  
  // 查询支付状态
  queryPaymentStatus(paymentOrderId) {
    return api.get('/payments/query', {
      params: { id: paymentOrderId }
    })
  }
}

// 站点配置API
export const configApi = {
  // 获取所有配置
  getConfigs() {
    return api.get('/configs')
  },
  // 根据key获取配置
  getConfigByKey(key) {
    return api.get(`/configs/${key}`)
  }
}

// 支付结果/回调校验
export const paymentResultApi = {
  // 前端收到支付平台回跳后，将查询参数透传给后端验证
  verifyReturn(params) {
    return api.get('/payments/return', { params })
  }
}

// 卡密相关API
export const cardApi = {

  // 根据订单号获取卡密文本
  getCardTextsByOrderNo(orderNo) {
    return api.get(`/cards/text/order/${orderNo}`)
  }
}

// 认证相关API
export const authApi = {
  // 用户登录
  login(username, password) {
    const data = {
      username: username,
      password: password
    }
    return api.post('/auth', data,{baseURL:'/'})
  },
  // 用户注册
  register(data) {
    return api.post('/auth/register', data,{baseURL:'/'})
  },
  // 获取游客JWT
  getGuestToken() {
    return api.get('/auth/guest',{baseURL:'/'})
  },
  // 获取用户信息
  getProfile() {
    return api.get('/auth/profile',{baseURL:'/'})
  },
  // 更新用户信息
  updateProfile(data) {
    return api.post('/auth/profile/update', data,{baseURL:'/'})
  },
  // 修改密码
  changePassword(data) {
    return api.post('/auth/profile/update', data,{baseURL:'/'})
  }
}

// 文件上传API
export const uploadApi = {
  // 上传图片
  uploadImage(file) {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}

export default api