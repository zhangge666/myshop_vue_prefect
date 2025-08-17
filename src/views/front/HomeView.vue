<!-- src/views/Home.vue -->
<template>
  <div class="home">
    <!-- 轮播图 -->
    <el-carousel height="400px" class="hero-carousel">
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
        <div class="announcement-content">

          <div class="announcement-text">
            <el-icon class="announcement-icon">
              <Bell />
            </el-icon>
            <h3>网站公告</h3>
            <p>{{ appStore.siteConfig.announcement }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 分类导航 -->
    <div class="categories-section">
      <h2 class="section-title">商品分类</h2>
      <div class="categories-grid">
        <div v-for="category in leafCategories" :key="category.id" class="category-card"
          @click="goToProducts(category.id)">
          <div class="category-icon">
            <el-icon size="40">
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
        <div v-for="product in recommendProducts" :key="product.id" class="product-card"
          @click="goToProductDetail(product.id)">
          <div class="product-image">
            <img :src="getProductImageUrl(product.coverImage)" :alt="product.name" />
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
          <el-icon size="40" color="#409EFF">
            <ShoppingBag />
          </el-icon>
          <h3>24小时发货</h3>
          <p>下单后24小时内自动发货，无需等待</p>
        </div>
        <div class="feature-item">
          <el-icon size="40" color="#67C23A">
            <ShoppingBag />
          </el-icon>
          <h3>安全保障</h3>
          <p>多重安全防护，保护您的支付安全</p>
        </div>
        <div class="feature-item">
          <el-icon size="40" color="#E6A23C">
            <ShoppingBag />
          </el-icon>
          <h3>专业客服</h3>
          <p>7×24小时在线客服，随时为您服务</p>
        </div>
        <div class="feature-item">
          <el-icon size="40" color="#F56C6C">
            <Star />
          </el-icon>
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
import {
  ShoppingBag,
  Document,
  Star,
  Bell
} from '@element-plus/icons-vue'
import { getProductImageUrl } from '@/utils/image'

const router = useRouter()
const appStore = useAppStore()
const orderStore = useOrderStore()

// 轮播图数据
const heroSlides = ref([
  { id: 1, title: '专业虚拟卡密平台', description: '安全可靠，24小时自动发货', image: '/images/hero-1.jpg' },
  { id: 2, title: '海量商品选择', description: '游戏充值、软件激活、会员服务', image: '/images/hero-2.jpg' },
  { id: 3, title: '优质客户服务', description: '7×24小时在线客服支持', image: '/images/hero-3.jpg' }
])

// 推荐商品
const recommendProducts = ref([])
const loading = ref(false)

// 获取叶子节点分类
const leafCategories = computed(() => {
  if (!appStore.categories || appStore.categories.length === 0) return []
  const leaves = []
  const findLeaves = (categories) => {
    categories.forEach(category => {
      if (category.children && category.children.length > 0) findLeaves(category.children)
      else leaves.push(category)
    })
  }
  findLeaves(appStore.categories)
  return leaves
})

// 分类图标
const getCategoryIcon = (categoryName) => {
  const iconMap = { '游戏': ShoppingBag, '音乐': ShoppingBag, '视频': ShoppingBag, '软件': ShoppingBag, '教育': Document, '其他': ShoppingBag }
  return iconMap[categoryName] || ShoppingBag
}

// 页面跳转
const goToProducts = (categoryId) => router.push({ path: '/products', query: categoryId ? { categoryId } : {} })
const goToProductDetail = (productId) => router.push(`/product/${productId}`)
const buyNow = (product) => { orderStore.setCurrentProduct(product); orderStore.setQuantity(1); router.push('/checkout') }

// 加载推荐商品
const loadRecommendProducts = async () => {
  try { loading.value = true; recommendProducts.value = await productApi.getRecommendProducts() || [] }
  catch (err) { console.error(err); recommendProducts.value = [] }
  finally { loading.value = false }
}

onMounted(() => { loadRecommendProducts() })
</script>

<style scoped>
.home {
  font-family: 'Segoe UI', sans-serif;
}

/* 轮播图 */
.hero-carousel .hero-slide {
  background-size: cover;
  background-position: center;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-content {
  background: rgba(0, 0, 0, 0.4);
  padding: 2rem;
  border-radius: 8px;
  color: #fff;
  text-align: center;
}

.hero-content h1 {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.hero-content p {
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

/* 分类导航 */
.categories-section {
  padding: 2rem 1rem;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
}

.category-card {
  text-align: center;
  padding: 1rem;
  background: #fff;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.3s;
}

.category-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.category-icon {
  margin-bottom: 0.5rem;
}

/* 推荐商品 */
.recommend-section {
  padding: 2rem 1rem;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
}

.product-card {
  background-color: #fff;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  transition: box-shadow 0.3s;
}

.product-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.product-image {
  width: 100%;
  aspect-ratio: 1/1;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.product-info {
  padding: 0.75rem 1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.product-name {
  font-weight: 600;
  margin: 0.25rem 0;
  font-size: 1rem;
}

.product-description {
  flex: 1;
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.product-price {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-price .price {
  font-size: 1rem;
  font-weight: 600;
  color: #F56C6C;
}

/* 服务特色 */
.features-section {
  padding: 2rem 1rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
  text-align: center;
}

.feature-item {
  background: #fff;
  padding: 1rem;
  border-radius: 8px;
  transition: transform 0.3s;
}

.feature-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.feature-item h3 {
  margin-top: 0.5rem;
  font-size: 1rem;
}

.feature-item p {
  font-size: 0.875rem;
  color: #666;
}

/* 移动端适配 */
@media (max-width: 767px) {
  .hero-carousel .hero-slide {
    height: 250px;
  }

  .hero-content h1 {
    font-size: 1.5rem;
  }

  .hero-content p {
    font-size: 0.9rem;
  }

  /* 商品卡片改为横向排布 */
  .products-grid {
    grid-template-columns: 1fr;
    /* 每行只显示一个 */
    gap: 0.75rem;
  }

  .product-card {
    flex-direction: row;
    align-items: center;
    padding: 0.5rem;
  }

  .product-image {
    flex: 0 0 80px;
    aspect-ratio: auto;
    height: 80px;
    border-radius: 6px;
    overflow: hidden;
  }

  .product-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .product-info {
    flex: 1;
    padding: 0 0.75rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .product-name {
    font-size: 1rem;
    margin: 0 0 0.25rem 0;
  }

  .product-description {
    font-size: 0.8rem;
    color: #666;
    margin-bottom: 0.25rem;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    /* 最多两行 */
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .product-price {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .product-price .price {
    font-size: 0.9rem;
    font-weight: 600;
    color: #F56C6C;
  }

  .product-price .el-button {
    flex-shrink: 0;
    margin-left: 0.5rem;
  }
}
</style>
