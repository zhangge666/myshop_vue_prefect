<!-- src/views/Home.vue -->
<template>
  <div class="home">
    <!-- 轮播图 -->
    <el-carousel height="400px" class="hero-carousel" :autoplay="true" arrow="always">
      <el-carousel-item v-for="item in heroSlides" :key="item.id">
        <div class="hero-slide" :style="{ backgroundImage: `url(${item.image})` }">
          <div class="hero-content">
            <h1>{{ item.title }}</h1>
            <p>{{ item.description }}</p>
            <el-button type="primary" size="large" @click="goToProducts">
              立即购买
            </el-button>
          </div>
        </div>
      </el-carousel-item>
    </el-carousel>

    <!-- 网站公告 -->
    <div v-if="appStore.siteConfig.announcement" class="announcement-section">
      <div class="container">
        <el-icon class="announcement-icon"><Bell /></el-icon>
        <div class="announcement-text">
          <h3>网站公告</h3>
          <p>{{ appStore.siteConfig.announcement }}</p>
        </div>
      </div>
    </div>

    <!-- 分类导航 -->
    <div class="categories-section">
      <h2 class="section-title">商品分类</h2>
      <div class="categories-grid">
        <div
          v-for="category in leafCategories"
          :key="category.id"
          class="category-card"
          @click="goToProducts(category.id)"
        >
          <div class="category-icon">
            <el-icon size="36">
              <component :is="getCategoryIcon(category.name)" />
            </el-icon>
          </div>
          <h3>{{ category.name }}</h3>
          <p>{{ category.description || '精选商品' }}</p>
        </div>
      </div>
    </div>

    <!-- 推荐商品 -->
    <div class="recommend-section">
      <h2 class="section-title">热门推荐</h2>
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="3" animated />
      </div>
      <div v-else class="products-grid">
        <div
          v-for="product in recommendProducts"
          :key="product.id"
          class="product-card"
          @click="goToProductDetail(product.id)"
        >
          <div class="product-image">
            <img :src="getProductImageUrl(product.coverImage)" :alt="product.name" />
            <div class="product-overlay">
              <el-button type="primary" @click.stop="buyNow(product)">
                立即购买
              </el-button>
            </div>
          </div>
          <div class="product-info">
            <h3 class="product-name">{{ product.name }}</h3>
            <p class="product-description">{{ product.description }}</p>
            <div class="product-price">
              <span class="price">¥{{ product.price }}</span>
              <el-button type="primary" size="small" @click.stop="buyNow(product)">
                立即购买
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 服务特色 -->
    <div class="features-section">
      <h2 class="section-title">服务特色</h2>
      <div class="features-grid">
        <div class="feature-item">
          <el-icon size="36" color="#409EFF"><ShoppingBag /></el-icon>
          <h3>24小时发货</h3>
          <p>下单后24小时内自动发货，无需等待</p>
        </div>
        <div class="feature-item">
          <el-icon size="36" color="#67C23A"><ShoppingBag /></el-icon>
          <h3>安全保障</h3>
          <p>多重安全防护，保护您的支付安全</p>
        </div>
        <div class="feature-item">
          <el-icon size="36" color="#E6A23C"><ShoppingBag /></el-icon>
          <h3>专业客服</h3>
          <p>7×24小时在线客服，随时为您服务</p>
        </div>
        <div class="feature-item">
          <el-icon size="36" color="#F56C6C"><Star /></el-icon>
          <h3>品质保证</h3>
          <p>精选优质商品，品质有保障</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/store/app'
import { useOrderStore } from '@/store/order'
import { productApi } from '@/api'
import { ShoppingBag, Document, Star, Bell } from '@element-plus/icons-vue'
import { getProductImageUrl } from '@/utils/image'

const router = useRouter()
const appStore = useAppStore()
const orderStore = useOrderStore()

const heroSlides = ref([
  { id: 1, title: '专业虚拟卡密平台', description: '安全可靠，24小时自动发货', image: '/images/hero-1.jpg' },
  { id: 2, title: '海量商品选择', description: '游戏充值、软件激活、会员服务', image: '/images/hero-2.jpg' },
  { id: 3, title: '优质客户服务', description: '7×24小时在线客服支持', image: '/images/hero-3.jpg' }
])

const recommendProducts = ref([])
const loading = ref(false)

const leafCategories = computed(() => {
  if (!appStore.categories || !appStore.categories.length) return []
  const leaves = []
  const findLeaves = (categories) => {
    categories.forEach(cat => {
      if (cat.children && cat.children.length) findLeaves(cat.children)
      else leaves.push(cat)
    })
  }
  findLeaves(appStore.categories)
  return leaves
})

const getCategoryIcon = (name) => {
  const iconMap = { '游戏': ShoppingBag, '音乐': ShoppingBag, '视频': ShoppingBag, '软件': ShoppingBag, '教育': Document, '其他': ShoppingBag }
  return iconMap[name] || ShoppingBag
}

const goToProducts = (categoryId) => {
  router.push({ path: '/products', query: categoryId ? { categoryId } : {} })
}

const goToProductDetail = (productId) => {
  router.push(`/product/${productId}`)
}

const buyNow = (product) => {
  orderStore.setCurrentProduct(product)
  orderStore.setQuantity(1)
  router.push('/checkout')
}

const loadRecommendProducts = async () => {
  try {
    loading.value = true
    const products = await productApi.getRecommendProducts()
    recommendProducts.value = products || []
  } catch {
    recommendProducts.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadRecommendProducts()
})
</script>

<style scoped>
.home {
  width: 100%;
  font-family: 'Helvetica Neue', Arial, sans-serif;
}

/* 轮播图 */
.hero-carousel .hero-slide {
  height: 400px;
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.hero-content {
  background-color: rgba(0,0,0,0.4);
  padding: 2rem;
  color: white;
  max-width: 400px;
  border-radius: 10px;
}

.hero-content h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.hero-content p {
  margin-bottom: 1rem;
}

/* 公告 */
.announcement-section {
  background-color: #f0f9ff;
  padding: 1rem;
  display: flex;
  justify-content: center;
}

.announcement-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.announcement-text h3 {
  margin: 0;
  font-size: 1rem;
  color: #409EFF;
}

.announcement-text p {
  margin: 0;
  font-size: 0.875rem;
  color: #333;
}

/* 分类 */
.categories-section {
  padding: 2rem 1rem;
}

.categories-section .section-title {
  text-align: center;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: #333;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
}

.category-card {
  background: #fff;
  border-radius: 10px;
  padding: 1rem;
  text-align: center;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.category-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.category-icon {
  margin-bottom: 0.5rem;
}

/* 推荐商品 */
.recommend-section {
  padding: 2rem 1rem;
  background-color: #f9f9f9;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.product-card {
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
}

.product-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.product-image {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9比例 */
  overflow: hidden;
}

.product-image img {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  background: rgba(0,0,0,0.35);
  transition: opacity 0.3s;
}

.product-card:hover .product-overlay {
  opacity: 1;
}

.product-info {
  padding: 0.75rem 1rem;
}

.product-name {
  font-size: 1rem;
  font-weight: 600;
}

.product-description {
  font-size: 0.875rem;
  color: #666;
  margin: 0.25rem 0 0.5rem 0;
}

.product-price {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  color: #F56C6C;
  font-weight: bold;
}

/* 服务特色 */
.features-section {
  padding: 2rem 1rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  text-align: center;
}

.feature-item h3 {
  margin: 0.5rem 0;
  font-size: 1.1rem;
}

.feature-item p {
  font-size: 0.875rem;
  color: #666;
}

/* 响应式 */
@media (max-width: 768px) {
  .hero-carousel {
    height: 250px;
  }

  .hero-content {
    max-width: 90%;
    padding: 1rem;
  }

  .categories-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }

  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }

  .features-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
}

@media (max-width: 480px) {
  .hero-carousel {
    height: 180px;
  }

  .hero-content h1 {
    font-size: 1.2rem;
  }

  .hero-content p {
    font-size: 0.85rem;
  }
}
</style>
