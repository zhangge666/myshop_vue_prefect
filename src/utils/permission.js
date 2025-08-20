import { useUserStore } from '../store/user'
import { useRouter } from 'vue-router'

// 权限检查工具
export const permissionUtils = {
  // 检查是否是管理员
  isAdmin() {
    const userStore = useUserStore()
    return userStore.isAdmin
  },
  
  // 检查是否是普通用户
  isUser() {
    const userStore = useUserStore()
    return userStore.isUser
  },
  
  // 检查是否已登录
  isLoggedIn() {
    const userStore = useUserStore()
    return userStore.isLoggedIn
  },
  
  // 检查是否是游客
  isGuest() {
    const userStore = useUserStore()
    return userStore.isGuest
  },
  
  // 检查是否有指定角色
  hasRole(role) {
    const userStore = useUserStore()
    return userStore.hasRole(role)
  },
  
  // 检查是否有指定权限
  hasPermission(permission) {
    const userStore = useUserStore()
    return userStore.hasRole(permission)
  },
  
  // 跳转到权限不足页面
  redirectToNoPermission(targetPath = '', fromPath = '', reason = '') {
    const router = useRouter()
    router.push({
      path: '/no-permission',
      query: {
        target: targetPath,
        from: fromPath,
        code: '403',
        reason: reason
      }
    })
  },
  
  // 检查管理员权限并跳转
  checkAdminPermission(targetPath = '') {
    if (!this.isAdmin()) {
      this.redirectToNoPermission(targetPath, '', 'admin_required')
      return false
    }
    return true
  },
  
  // 检查用户权限并跳转
  checkUserPermission(targetPath = '') {
    if (!this.isUser()) {
      this.redirectToNoPermission(targetPath, '', 'user_required')
      return false
    }
    return true
  },
  
  // 检查登录状态并跳转
  checkLoginPermission(targetPath = '') {
    if (!this.isLoggedIn()) {
      // 保存当前路径，登录后跳转回来
      sessionStorage.setItem('postLoginRedirect', targetPath || window.location.pathname)
      const router = useRouter()
      router.push('/login')
      return false
    }
    return true
  }
}

// 权限指令
export const permissionDirective = {
  mounted(el, binding) {
    const { value } = binding
    const userStore = useUserStore()
    
    let hasPermission = false
    
    if (typeof value === 'string') {
      // 单个权限检查
      hasPermission = userStore.hasRole(value)
    } else if (Array.isArray(value)) {
      // 多个权限检查（任一满足即可）
      hasPermission = value.some(permission => userStore.hasRole(permission))
    } else if (typeof value === 'object') {
      // 复杂权限检查
      if (value.admin && !userStore.isAdmin) {
        hasPermission = false
      } else if (value.user && !userStore.isUser) {
        hasPermission = false
      } else if (value.roles && !value.roles.some(role => userStore.hasRole(role))) {
        hasPermission = false
      } else {
        hasPermission = true
      }
    }
    
    if (!hasPermission) {
      el.style.display = 'none'
    }
  }
}

// 权限混入
export const permissionMixin = {
  methods: {
    // 检查管理员权限
    checkAdmin() {
      return permissionUtils.checkAdminPermission()
    },
    
    // 检查用户权限
    checkUser() {
      return permissionUtils.checkUserPermission()
    },
    
    // 检查登录权限
    checkLogin() {
      return permissionUtils.checkLoginPermission()
    },
    
    // 跳转到权限不足页面
    goToNoPermission(targetPath = '', reason = '') {
      permissionUtils.redirectToNoPermission(targetPath, this.$route.path, reason)
    }
  }
}
