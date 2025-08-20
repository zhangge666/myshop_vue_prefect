<template>
  <div class="product-detail-view">
    <div class="container">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="5" animated />
      </div>

      <!-- 商品详情 -->
      <div v-else-if="product" class="product-detail">
        <!-- 面包屑导航 -->
        <!-- <el-breadcrumb separator="/" class="breadcrumb">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item :to="{ path: '/categories' }">商品分类</el-breadcrumb-item>
          <el-breadcrumb-item>{{ product.name }}</el-breadcrumb-item>
        </el-breadcrumb> -->

        <div class="product-content">
          <!-- 左侧：商品图片 -->
          <div class="product-image-section">
            <div class="main-image">
              <img :src="getProductImageUrl(product.coverImage)" :alt="product.name" />
              <div v-if="product.stock <= 0" class="out-of-stock-overlay">
                <span>缺货</span>
              </div>
            </div>
          </div>

          <!-- 右侧：商品信息 -->
          <div class="product-info-section">
            <div class="product-header">
              <h1 class="product-title">{{ product.name }}</h1>
              <p v-if="product.subtitle" class="product-subtitle">{{ product.subtitle }}</p>
              
              <!-- 商品标签 -->
              <div v-if="product.tags" class="product-tags">
                <el-tag
                  v-for="tag in product.tags.split(',')"
                  :key="tag"
                  size="small"
                  type="primary"
                >
                  {{ tag.trim() }}
                </el-tag>
              </div>
            </div>

            <!-- 价格信息 -->
            <div class="price-section">
              <div class="current-price">
                <span class="price-label">售价：</span>
                <span class="price">¥{{ product.price }}</span>
              </div>
              <div v-if="product.costPrice && product.costPrice !== product.price" class="original-price">
                <span class="price-label">原价：</span>
                <span class="price">¥{{ product.costPrice }}</span>
              </div>
            </div>

            <!-- 商品统计 -->
            <div class="product-stats">
              <div class="stat-item">
                <span class="stat-label">销量：</span>
                <span class="stat-value">{{ product.sales }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">库存：</span>
                <span class="stat-value" :class="{ 'low-stock': product.stock <= 10 }">
                  {{ product.stock }}
                </span>
              </div>
              <div v-if="product.limitPerUser > 0" class="stat-item">
                <span class="stat-label">限购：</span>
                <span class="stat-value">每人限购{{ product.limitPerUser }}件</span>
              </div>
            </div>

            <!-- 联系方式（新增） -->
            <div class="contact-input-section">
              <span class="contact-label">联系方式：</span>
              <el-input
                v-model="contact"
                placeholder="请输入手机号/邮箱"
                clearable
                style="max-width: 320px"
              />
            </div>

            <!-- 购买数量选择 -->
            <div class="quantity-section">
              <span class="quantity-label">购买数量：</span>
              <el-input-number
                v-model="quantity"
                :min="1"
                :max="getMaxQuantity()"
                :disabled="product.stock <= 0"
                size="large"
              />
              <span class="quantity-tip">
                {{ product.limitPerUser > 0 ? `最多可购买${getMaxQuantity()}件` : `库存${product.stock}件` }}
              </span>
            </div>

            <!-- 购买按钮 -->
            <div class="action-buttons">
              <el-button
                type="primary"
                size="large"
                :disabled="product.stock <= 0"
                @click="handleBuyNow"
                class="buy-button"
              >
                <el-icon><ShoppingCart /></el-icon>
                {{ product.stock <= 0 ? '缺货' : '立即购买' }}
              </el-button>
            </div>

            <!-- 发货方式 -->
            <div class="delivery-info">
              <div class="delivery-item">
                <el-icon><Van /></el-icon>
                <span>发货方式：{{ getDeliveryMethodText(product.deliveryMethod) }}</span>
              </div>
              <div v-if="product.autoDelivery === 1" class="delivery-item">
                <el-icon><Clock /></el-icon>
                <span>自动发货：支付成功后立即发货</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 商品详细描述 -->
        <div class="product-description">
          <h2>商品详情</h2>
          <div class="description-content" v-html="formatDescription(product.description)"></div>
        </div>

        <!-- 推荐商品 -->
        <div v-if="recommendProducts.length > 0" class="recommend-section">
          <h2>相关推荐</h2>
          <div class="recommend-grid">
            <div
              v-for="item in recommendProducts"
              :key="item.id"
              class="recommend-card"
              @click="goToProduct(item.id)"
            >
              <div class="recommend-image">
                <img :src="getProductImageUrl(item.coverImage)" :alt="item.name" />
              </div>
              <div class="recommend-info">
                <h4>{{ item.name }}</h4>
                <p class="recommend-price">¥{{ item.price }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 商品不存在 -->
      <div v-else class="not-found">
        <el-empty description="商品不存在或已下架">
          <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
        </el-empty>
      </div>
    </div>

    <!-- 下单弹窗 -->
    <OrderDialog
      v-model:visible="orderDialogVisible"
      :order="currentOrder"
      @success="handleOrderSuccess"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { orderApi,productApi } from '@/api'
import { getProductImageUrl } from '@/utils/image'
import OrderDialog from '@/views/front/OrderDialog.vue'
import { useUserStore } from '@/store/user'
import {
  ShoppingCart,
  Van,
  Clock,
  Star
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 响应式数据
const product = ref(null)
const loading = ref(false)
const quantity = ref(1)
const recommendProducts = ref([])
const orderDialogVisible = ref(false)
const currentOrder = ref(null)
const contact = ref('')

// 计算属性
const productId = computed(() => route.params.id)

// 辅助：识别联系方式类型（1 邮箱，2 手机号）
const detectContactType = (val) => {
  if (!val) return undefined
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const phonePattern = /^1[3-9]\d{9}$/
  if (emailPattern.test(val)) return 1
  if (phonePattern.test(val)) return 2
  return undefined
}

// 获取最大购买数量
const getMaxQuantity = () => {
  if (!product.value) return 1
  
  const stock = product.value.stock
  const limit = product.value.limitPerUser
  
  if (limit > 0) {
    return Math.min(stock, limit)
  }
  return stock
}

// 获取发货方式文本
const getDeliveryMethodText = (method) => {
  const methodMap = {
    'auto': '自动发货',
    'manual': '人工发货',
    'email': '邮箱发货',
    'download': '下载链接'
  }
  return methodMap[method] || '自动发货'
}

// 格式化商品描述
const formatDescription = (description) => {
  if (!description) return '暂无详细描述'
  
  // 简单的换行处理
  return description.replace(/\n/g, '<br>')
}

// 加载商品详情
const loadProduct = async () => {
  try {
    loading.value = true
    product.value = await productApi.getProduct(productId.value)
    
    // 重置购买数量
    quantity.value = 1
    
    // 加载推荐商品
    loadRecommendProducts()
  } catch (error) {
    console.error('加载商品详情失败:', error)
    product.value = null
  } finally {
    loading.value = false
  }
}

// 加载推荐商品
const loadRecommendProducts = async () => {
  try {
    const products = await productApi.getRecommendProducts()
    // 过滤掉当前商品，最多显示4个
    recommendProducts.value = (products || [])
      .filter(item => item.id !== product.value?.id)
      .slice(0, 4)
  } catch (error) {
    console.error('加载推荐商品失败:', error)
    recommendProducts.value = []
  }
}

// 立即购买
const handleBuyNow = async () => {
  if (!product.value || product.value.stock <= 0) {
    ElMessage.warning('商品缺货')
    return
  }
  
  if (quantity.value > getMaxQuantity()) {
    ElMessage.warning(`最多只能购买${getMaxQuantity()}件`)
    return
  }

  const ct = contact.value?.trim()
  const ctype = detectContactType(ct)
  if (!ct) {
    ElMessage.error('请输入手机号或邮箱')
    return
  }
  if (!ctype) {
    ElMessage.error('请输入正确的手机号或邮箱')
    return
  }
  
  try {
    // 若是游客，且userinfo缺少联系方式，则写回并持久化
    try {
      const isGuest = userStore.isGuest
      const ui = userStore.userInfo || {}
      const missingContact = !ui.contact || ui.contact === ''
      const defaultType = ui.contactType === undefined || ui.contactType === null || ui.contactType === 0
      if (isGuest && (missingContact || defaultType)) {
        const updated = { ...ui, contact: ct, contactType: ctype }
        if (userStore.setUserInfo) {
          userStore.setUserInfo(updated)
        }
      }
    } catch {}

    // 创建订单（携带联系方式）
    const orderId = await orderApi.createOrder(product.value.id, quantity.value, ct, ctype)
    
    // 获取订单详情
    const orderDetail = await orderApi.getOrderDetail(orderId)
    
    // 设置当前订单信息
    currentOrder.value = orderDetail
    
    // 打开订单确认弹窗
    orderDialogVisible.value = true
    
  } catch (error) {
    console.error('创建订单失败:', error)
    ElMessage.error('创建订单失败，请重试')
  }
}

// 订单操作成功
const handleOrderSuccess = (orderData) => {
  console.log('订单操作成功:', orderData)
  
  if (orderData.action === 'cancelled') {
    // 订单被取消，重置当前订单
    currentOrder.value = null
  } else if (orderData.payUrl) {
    // 如果返回了支付URL，说明已经跳转到支付页面了
    ElMessage.success('获取支付链接成功，正在跳转，若没有跳转请关闭浏览器拦截弹窗')
  } else {
    ElMessage.success('支付发起成功')
    // 如果没有支付URL，跳转到订单详情页面
    router.push(`/order/${orderData.id}`)
  }
}

// 跳转到其他商品
const goToProduct = (id) => {
  router.push(`/product/${id}`)
}

// 监听路由变化
watch(() => route.params.id, () => {
  if (route.params.id) {
    loadProduct()
  }
})

// 页面初始化
onMounted(() => {
  loadProduct()
  // 首次加载尝试从用户信息填充联系方式
  try {
    const c = userStore.userInfo?.contact
    if (!contact.value && c) contact.value = c
  } catch {}
})
</script>

<style scoped>
.product-detail-view {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.loading-container {
  background: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.breadcrumb {
  margin-bottom: 20px;
  background: white;
  padding: 15px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.product-detail {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.product-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  padding: 30px;
}

.product-image-section {
  position: relative;
}

.main-image {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  background: #f8f9fa;
}

.main-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.out-of-stock-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
}

.product-info-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.product-header h1 {
  font-size: 1.8rem;
  color: #333;
  margin: 0 0 10px 0;
  line-height: 1.4;
}

.product-subtitle {
  color: #666;
  font-size: 1rem;
  margin: 0 0 15px 0;
  line-height: 1.5;
}

.product-tags .el-tag {
  margin-right: 8px;
  margin-bottom: 8px;
}

.price-section {
  padding: 20px 0;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
}

.current-price {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.current-price .price {
  font-size: 2rem;
  font-weight: 600;
  color: #f56c6c;
}

.original-price {
  display: flex;
  align-items: center;
}

.original-price .price {
  font-size: 1.2rem;
  color: #999;
  text-decoration: line-through;
}

.price-label {
  font-size: 1rem;
  color: #666;
  margin-right: 10px;
}

.product-stats {
  display: flex;
  gap: 30px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
}

.stat-label {
  color: #666;
  margin-right: 8px;
}

.stat-value {
  font-weight: 500;
  color: #333;
}

.stat-value.low-stock {
  color: #f56c6c;
}

/* 新增：联系方式输入区域样式 */
.contact-input-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.contact-label {
  font-weight: 500;
  color: #333;
}

.quantity-section {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.quantity-label {
  font-weight: 500;
  color: #333;
}

.quantity-tip {
  font-size: 0.9rem;
  color: #999;
}

.action-buttons {
  display: flex;
  gap: 15px;
}

.buy-button {
  flex: 1;
  height: 50px;
  font-size: 1.1rem;
  font-weight: 600;
}

.delivery-info {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
  border-left: 4px solid #409EFF;
}

.delivery-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  color: #666;
}

.delivery-item:last-child {
  margin-bottom: 0;
}

.delivery-item .el-icon {
  margin-right: 8px;
  color: #409EFF;
}

.product-description {
  padding: 30px;
  border-top: 1px solid #eee;
}

.product-description h2 {
  font-size: 1.5rem;
  color: #333;
  margin: 0 0 20px 0;
}

.description-content {
  line-height: 1.8;
  color: #666;
  font-size: 1rem;
}

.recommend-section {
  padding: 30px;
  border-top: 1px solid #eee;
}

.recommend-section h2 {
  font-size: 1.5rem;
  color: #333;
  margin: 0 0 20px 0;
}

.recommend-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.recommend-card {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
}

.recommend-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.recommend-image {
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
}

.recommend-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.recommend-info {
  padding: 15px;
}

.recommend-info h4 {
  font-size: 1rem;
  color: #333;
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.recommend-price {
  font-size: 1.1rem;
  font-weight: 600;
  color: #f56c6c;
  margin: 0;
}

.not-found {
  background: white;
  padding: 60px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

/* 移动端适配 */
@media (max-width: 768px) {

::v-deep .el-dialog {
  /* 样式 */
  max-width: 90%;
}

  .container {
    padding: 0 15px;
  }
  
  .product-content {
    grid-template-columns: 1fr;
    gap: 20px;
    padding: 20px;
  }
  
  .product-header h1 {
    font-size: 1.5rem;
  }
  
  .current-price .price {
    font-size: 1.5rem;
  }
  
  .product-stats {
    gap: 20px;
  }
  
  .quantity-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .recommend-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 15px;
  }
  
  .product-description,
  .recommend-section {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .breadcrumb {
    padding: 10px 15px;
  }
  
  .recommend-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
