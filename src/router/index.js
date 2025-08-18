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
import { useUserStore } from '../store/user'

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
    }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  // 已登录用户不能访问登录和注册页
  if (userStore.isLoggedIn && to.meta.guest) {
    next('/')
  } else {
    next()
  }
})

export default router
