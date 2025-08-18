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
    
    // 处理不同的响应格式
    if (data.code === 0) {
      // 标准格式：{ code: 0, data: {...}, msg: "success" }
      return data.data !== undefined ? data.data : data
    } else if (data.code === 200) {
      // 兼容格式：{ code: 200, data: {...}, message: "success" }
      return data.data !== undefined ? data.data : data
    } else {
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
      console.log("这里是状态："+status)
      // 服务器返回错误状态码
      const { status, data } = error.response
      
      if (status === 401) {
        console.log("检测到未登录")
        errorMsg = '未授权，请重新登录'
        // 清除本地存储的token
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
        // 可以在这里添加重定向到登录页的逻辑
        try {
          const current = window.location.pathname + window.location.search
          sessionStorage.setItem('postLoginRedirect', current)
        } catch {}
        window.location.href = '/login'
      } else if (status === 403) {
        errorMsg = '权限不足，请重新登录'
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
        try {
          const current = window.location.pathname + window.location.search
          sessionStorage.setItem('postLoginRedirect', current)
        } catch {}
        window.location.href = '/login'
      } else if (status === 403) {
        errorMsg = '权限不足'
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
  createOrder(productId, quantity) {
    return api.post('/orders/create', null, { 
      params: {
        productId,
        quantity
      }
    })
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
  },
  
  // 更新订单联系信息
  // updateOrderContact(orderId, contactData) {
  //   return api.post(`/orders/${orderId}/contact`, contactData)
  // }
}

// 支付相关API
export const paymentApi = {
  // 获取可用支付渠道
  getChannels() {
    return api.get('/payments/channels')
  },
  
  // 发起支付
  createPayment(contact, contactType, orderId, paymentChannelId, productName) {
    return api.get('/payments/create', {
      params: {
        contact,
        contactType,
        order_id: orderId,
        paymentChannel_id: paymentChannelId,
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

// 卡密相关API
export const cardApi = {

  // 根据订单号获取卡密文本
  getCardTextsByOrderNo(orderNo) {
    return api.get(`/cards/text/order/${orderNo}`)
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
    return api.get('/auth/profile',{ baseURL: '/' })
  },
  // 更新用户信息
  updateProfile(data) {
    return api.post('/auth/profile/update', data,{ baseURL: '/' })
  },
  // 修改密码
  changePassword(data) {
    return api.post('/auth/profile/update', data,{ baseURL: '/' })
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