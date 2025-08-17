import axios from 'axios'
import { ElMessage } from 'element-plus'

// 创建axios实例
const api = axios.create({
  baseURL: '/api/v1',
  timeout: 10000
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    // 添加token到请求头
    const token = localStorage.getItem('token')
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
    const { data } = response
    if (data.code === 0) {
      return data.data
    } else {
      ElMessage.error(data.msg || '请求失败')
      return Promise.reject(new Error(data.msg || '请求失败'))
    }
  },
  error => {
    ElMessage.error(error.message || '网络错误')
    return Promise.reject(error)
  }
)

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
  // 创建订单
  createOrder(params) {
    return api.post('/orders/create', null, { params })
  },
  
  // 获取订单列表
  getOrders(params) {
    return api.get('/orders', { params })
  },
  
  // 获取订单详情
  getOrderDetail(orderId) {
    return api.get(`/orders/detail/${orderId}`)
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
  createPayment(paymentOrderId) {
    return api.get(`/payments/create?order_id=${paymentOrderId}`)
  },
  
  // 查询支付状态
  queryPaymentStatus(paymentOrderId) {
    return api.get(`/payments/query?id=${paymentOrderId}`)
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

// 卡密相关API
export const cardApi = {
  // 根据订单ID获取卡密文本
  getCardTexts(orderId) {
    return api.get(`/cards/text/${orderId}`)
  },
  // 根据订单号获取卡密文本
  getCardTextsByOrderNo(orderNo) {
    return api.get(`/cards/text/order/${orderNo}`)
  },
  // 根据订单ID获取卡密图片URL
  getCardImage(orderId) {
    return `/api/v1/cards/image/${orderId}`
  },
  // 根据订单号获取卡密图片URL
  getCardImageByOrderNo(orderNo) {
    return `/api/v1/cards/image/order/${orderNo}`
  },
  // 根据订单ID生成二维码
  generateQRCodes(orderId) {
    return api.get(`/cards/qrcodes/${orderId}`)
  },
  // 根据订单号生成二维码
  generateQRCodesByOrderNo(orderNo) {
    return api.get(`/cards/qrcodes/order/${orderNo}`)
  }
}

// 认证相关API
export const authApi = {
  // 用户登录
  login(data) {
    return api.post('/auth', data, { baseURL: '/' })
  },
  // 用户注册
  register(data) {
    return api.post('/auth/register', data, { baseURL: '/' })
  },
  // 获取用户信息
  getProfile() {
    return api.get('/auth/profile')
  },
  // 更新用户信息
  updateProfile(data) {
    return api.post('/auth/profile/update', data)
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