import axios from 'axios'
import { ElMessage } from 'element-plus'

// 独立的后台管理 axios 实例
const adminApiClient = axios.create({
  baseURL: '/admin/api/v1',
  timeout: 15000
})

adminApiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

adminApiClient.interceptors.response.use(
  response => {
    const { data } = response
    if (data && (data.code === 0 || data.code === 200)) {
      return data.data !== undefined ? data.data : data
    }
    const msg = data?.msg || data?.message || '请求失败'
    ElMessage.error(msg)
    return Promise.reject(new Error(msg))
  },
  error => {
    let msg = '网络错误'
    const res = error.response
    if (res) {
      if (res.status === 401) {
        msg = '未授权，请重新登录'
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
      } else {
        msg = res.data?.msg || res.data?.message || `请求失败(${res.status})`
      }
    }
    ElMessage.error(msg)
    return Promise.reject(error)
  }
)

// 用户管理
export const adminUsers = {
  list(params) {
    return adminApiClient.get('/users', { params })
  },
  detail(id) {
    return adminApiClient.get(`/users/${id}`)
  },
  update(id, data) {
    return adminApiClient.put(`/users/${id}`, data)
  },
  remove(id) {
    return adminApiClient.delete(`/users/${id}`)
  },
  toggle(id, enable) {
    return adminApiClient.post(`/users/${id}/toggle`, null, { params: { enable } })
  }
}

// 商品管理
export const adminProducts = {
  list(params) {
    return adminApiClient.get('/products', { params })
  },
  detail(id) {
    return adminApiClient.get(`/products/${id}`)
  },
  create(data) {
    return adminApiClient.post('/products', data)
  },
  update(id, data) {
    return adminApiClient.put(`/products/${id}`, data)
  },
  remove(id) {
    return adminApiClient.delete(`/products/${id}`)
  }
}

// 订单管理
export const adminOrders = {
  list(params) {
    return adminApiClient.get('/orders', { params })
  },
  detail(id) {
    return adminApiClient.get(`/orders/${id}`)
  },
  update(id, data) {
    return adminApiClient.put(`/orders/${id}`, data)
  },
  remove(id) {
    return adminApiClient.delete(`/orders/${id}`)
  }
}

// 卡密管理
export const adminCards = {
  list(params) {
    return adminApiClient.get('/cards', { params })
  },
  create(importReq) {
    return adminApiClient.post('/cards', importReq)
  },
  update(card) {
    return adminApiClient.put('/cards', card)
  },
  remove(id) {
    return adminApiClient.delete(`/cards/${id}`)
  },
  batchDelete(ids) {
    return adminApiClient.post('/cards/batch-delete', ids)
  },
  patchStatus(id) {
    return adminApiClient.patch(`/cards/${id}/status`)
  }
}

// 支付渠道
export const adminPayments = {
  list(params) {
    return adminApiClient.get('/payments/channels', { params })
  },
  create(data) {
    return adminApiClient.post('/payments/channels', data)
  },
  update(id, data) {
    return adminApiClient.put(`/payments/channels/${id}`, data)
  },
  remove(id) {
    return adminApiClient.delete(`/payments/channels/${id}`)
  }
}

// 站点配置
export const adminConfigs = {
  list() {
    return adminApiClient.get('/configs')
  },
  detail(id) {
    return adminApiClient.get(`/configs/${id}`)
  },
  create(data) {
    return adminApiClient.post('/configs', data)
  },
  update(id, data) {
    return adminApiClient.put(`/configs/${id}`, data)
  },
  remove(id) {
    return adminApiClient.delete(`/configs/${id}`)
  }
}

// 分类管理
export const adminCategories = {
  list(params) {
    return adminApiClient.get('/categories', { params })
  },
  create(data) {
    return adminApiClient.post('/categories', data)
  },
  update(id, data) {
    return adminApiClient.put(`/categories/${id}`, data)
  },
  remove(id) {
    return adminApiClient.delete(`/categories/${id}`)
  }
}

// 仪表盘
export const adminDashboard = {
  stats() {
    return adminApiClient.get('/dashboard/stats')
  }
}

export default adminApiClient


