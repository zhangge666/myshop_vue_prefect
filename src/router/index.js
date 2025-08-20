import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/front/HomeView.vue'
import CategoriesView from '../views/front/CategoriesView.vue'
import ProductDetailView from '../views/front/ProductDetailView.vue'
import OrderListView from '../views/front/OrderListView.vue'
import ProfileView from '../views/front/ProfileView.vue'
import EditProfileView from '../views/front/EditProfileView.vue'
import ChangePasswordView from '../views/front/ChangePasswordView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import AdminLayout from '../components/layout/admin/AdminLayout.vue'
import DashboardView from '../views/admin/DashboardView.vue'
import UsersView from '../views/admin/UsersView.vue'
import OrdersView from '../views/admin/OrdersView.vue'
import ProductsView from '../views/admin/ProductsView.vue'
import CardsView from '../views/admin/CardsView.vue'
import ConfigsView from '../views/admin/ConfigsView.vue'
import PaymentsView from '../views/admin/PaymentsView.vue'
import CategoriesViewAdmin from '../views/admin/CategoriesView.vue'
import { useUserStore } from '../store/user'
import PaymentResultView from '../views/front/PaymentResultView.vue'
import TestUserStatus from '../views/TestUserStatus.vue'
import SimpleTest from '../views/SimpleTest.vue'
import NoPermission from '../views/NoPermission.vue'
import LoginTest from '../views/LoginTest.vue'
import NavbarTest from '../views/NavbarTest.vue'
import UserFlowTest from '../views/UserFlowTest.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/categories',
      name: 'categories',
      component: CategoriesView
    },
    {
      path: '/product/:id',
      name: 'product-detail',
      component: ProductDetailView
    },
    {
      path: '/orders',
      name: 'orders',
      component: OrderListView
    },
    {
      path: '/payment/result',
      name: 'payment-result',
      component: PaymentResultView
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView
    },
    {
      path: '/profile/edit',
      name: 'edit-profile',
      component: EditProfileView
    },
    {
      path: '/profile/password',
      name: 'change-password',
      component: ChangePasswordView
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: {
        guest: true // 不需要登录即可访问
      }
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: {
        guest: true // 不需要登录即可访问
      }
    },
    {
      path: '/test-user-status',
      name: 'test-user-status',
      component: TestUserStatus,
      meta: {
        guest: true // 测试页面，不需要登录
      }
    },
    {
      path: '/simple-test',
      name: 'simple-test',
      component: SimpleTest,
      meta: {
        guest: true // 测试页面，不需要登录
      }
    },
    {
      path: '/no-permission',
      name: 'no-permission',
      component: NoPermission,
      meta: {
        guest: true // 测试页面，不需要登录
      }
    },
    {
      path: '/login-test',
      name: 'login-test',
      component: LoginTest,
      meta: {
        guest: true // 测试页面，不需要登录
      }
    },
    {
      path: '/navbar-test',
      name: 'navbar-test',
      component: NavbarTest,
      meta: {
        guest: true // 测试页面，不需要登录
      }
    },
    {
      path: '/user-flow-test',
      name: 'user-flow-test',
      component: UserFlowTest,
      meta: {
        guest: true // 测试页面，不需要登录
      }
    },
    {
      path: '/admin',
      component: AdminLayout,
      meta: { admin: true, title: '仪表盘' },
      children: [
        { path: '', name: 'admin-dashboard', component: DashboardView, meta: { admin: true, title: '仪表盘' } },
        { path: 'users', name: 'admin-users', component: UsersView, meta: { admin: true, title: '用户管理' } },
        { path: 'orders', name: 'admin-orders', component: OrdersView, meta: { admin: true, title: '订单管理' } },
        { path: 'categories', name: 'admin-categories', component: CategoriesViewAdmin, meta: { admin: true, title: '分类管理' } },
        { path: 'products', name: 'admin-products', component: ProductsView, meta: { admin: true, title: '商品管理' } },
        { path: 'cards', name: 'admin-cards', component: CardsView, meta: { admin: true, title: '卡密管理' } },
        { path: 'configs', name: 'admin-configs', component: ConfigsView, meta: { admin: true, title: '网站配置' } },
        { path: 'payments', name: 'admin-payments', component: PaymentsView, meta: { admin: true, title: '支付渠道' } }
      ]
    }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  console.log('路由守卫:', to.path, '用户状态:', userStore.isLoggedIn, '是否游客:', userStore.isGuest)
  
  // 已登录用户（非游客）不能访问登录和注册页
  if (userStore.isLoggedIn && !userStore.isGuest && to.meta.guest && !to.path.includes('test') && !to.path.includes('no-permission')) {
    console.log('已登录用户访问游客页面，重定向到首页')
    next('/')
    return
  }
  
  // 管理员页面需要管理员权限
  if (to.meta.admin && !userStore.isAdmin) {
    console.log('非管理员访问管理页面，重定向到权限不足页面')
    // 跳转到权限不足页面，并传递相关信息
    next({
      path: '/no-permission',
      query: {
        target: to.path,
        from: from.path,
        code: '403',
        reason: 'admin_required'
      }
    })
    return
  }
  
  // 需要登录的页面（除了游客页面）
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    console.log('需要登录的页面，重定向到登录页')
    sessionStorage.setItem('postLoginRedirect', to.fullPath)
    next('/login')
    return
  }
  
  // 其他情况正常通过
  console.log('路由守卫通过:', to.path)
  next()
})

export default router
