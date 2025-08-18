<template>
  <div class="categories-view">
    <div class="container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1>商品分类</h1>
        <p>选择您需要的商品分类</p>
      </div>

      <!-- 分类树形结构 -->
      <div class="categories-section">
        <div class="categories-tree">
          <el-tree
            :data="categories"
            :props="treeProps"
            node-key="id"
            :expand-on-click-node="false"
            :default-expand-all="true"
            class="category-tree"
          >
            <template #default="{ node, data }">
              <div class="tree-node" @click="selectCategory(data)">
                <el-icon class="category-icon">
                  <component :is="getCategoryIcon(data.name)" />
                </el-icon>
                <span class="category-name">{{ data.name }}</span>
                <span v-if="!data.children || data.children.length === 0" class="category-badge">
                  点击查看商品
                </span>
              </div>
            </template>
          </el-tree>
        </div>
      </div>

      <!-- 当前选中分类的商品列表 -->
      <div v-if="selectedCategory" class="products-section">
        <div class="section-header">
          <h2>{{ selectedCategory.name }} - 商品列表</h2>
          <div class="filters">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索商品..."
              clearable
              @input="handleSearch"
              style="width: 200px; margin-right: 10px;"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-select v-model="sortBy" @change="handleSort" style="width: 120px;">
              <el-option label="默认排序" value="default" />
              <el-option label="价格升序" value="price_asc" />
              <el-option label="价格降序" value="price_desc" />
              <el-option label="销量排序" value="sales" />
            </el-select>
          </div>
        </div>

        <!-- 商品网格 -->
        <div v-if="loading" class="loading-container">
          <el-skeleton :rows="3" animated />
        </div>
        <div v-else-if="products.length === 0" class="empty-container">
          <el-empty description="该分类下暂无商品" />
        </div>
        <div v-else class="products-grid">
          <div
            v-for="product in products"
            :key="product.id"
            class="product-card"
            @click="goToProductDetail(product.id)"
          >
            <div class="product-image">
              <img :src="getProductImageUrl(product.coverImage)" :alt="product.name" />
              <div v-if="product.stock <= 0" class="out-of-stock-overlay">
                <span>缺货</span>
              </div>
            </div>
            <div class="product-info">
              <h3 class="product-name">{{ product.name }}</h3>
              <p class="product-subtitle">{{ product.subtitle }}</p>
              <div class="product-tags" v-if="product.tags">
                <el-tag
                  v-for="tag in product.tags.split(',')"
                  :key="tag"
                  size="small"
                  type="info"
                >
                  {{ tag.trim() }}
                </el-tag>
              </div>
              <div class="product-stats">
                <span class="sales">已售 {{ product.sales }}</span>
                <span class="stock">库存 {{ product.stock }}</span>
              </div>
              <div class="product-price">
                <span class="price">¥{{ product.price }}</span>
                <el-button
                  type="primary"
                  size="small"
                  :disabled="product.stock <= 0"
                  @click.stop="buyNow(product)"
                >
                  {{ product.stock <= 0 ? '缺货' : '立即购买' }}
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div v-if="total > 0" class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[12, 24, 48]"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>

      <!-- 未选择分类时的提示 -->
      <div v-else class="no-selection">
        <el-empty description="请选择一个分类查看商品" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/store/app'
// import { useOrderStore } from '@/store/order'
import { productApi } from '@/api'
import { getProductImageUrl } from '@/utils/image'
import {
  Search,
  ShoppingBag,
  Document,
  Star,
  Folder,
  FolderOpened
} from '@element-plus/icons-vue'

const router = useRouter()
const appStore = useAppStore()
// const orderStore = useOrderStore()

// 树形组件配置
const treeProps = {
  children: 'children',
  label: 'name'
}

// 响应式数据
const selectedCategory = ref(null)
const products = ref([])
const loading = ref(false)
const searchKeyword = ref('')
const sortBy = ref('default')
const currentPage = ref(1)
const pageSize = ref(12)
const total = ref(0)

// 计算属性
const categories = computed(() => appStore.categories)

// 分类图标映射
const getCategoryIcon = (categoryName) => {
  const iconMap = {
    '游戏': ShoppingBag,
    '音乐': ShoppingBag,
    '视频': ShoppingBag,
    '软件': Document,
    '教育': Document,
    '其他': Star
  }
  return iconMap[categoryName] || Folder
}

// 选择分类
const selectCategory = (category) => {
  // 只有叶子节点才能选择
  if (!category.children || category.children.length === 0) {
    selectedCategory.value = category
    currentPage.value = 1
    loadProducts()
  }
}

// 加载商品列表
const loadProducts = async () => {
  if (!selectedCategory.value) return
  
  try {
    loading.value = true
    const params = {
      categoryId: selectedCategory.value.id,
      page: currentPage.value,
      size: pageSize.value
    }
    
    if (searchKeyword.value) {
      params.keyword = searchKeyword.value
    }
    
    if (sortBy.value !== 'default') {
      params.sort = sortBy.value
    }
    
    const result = await productApi.getProducts(params)
    products.value = result.records || []
    total.value = result.total || 0
  } catch (error) {
    console.error('加载商品失败:', error)
    products.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  currentPage.value = 1
  loadProducts()
}

// 排序处理
const handleSort = () => {
  currentPage.value = 1
  loadProducts()
}

// 分页处理
const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  loadProducts()
}

const handleCurrentChange = (page) => {
  currentPage.value = page
  loadProducts()
}

// 页面跳转
const goToProductDetail = (productId) => {
  router.push(`/product/${productId}`)
}

const buyNow = (product) => {
  // 直接跳转到商品详情页面
  router.push(`/product/${product.id}`)
}

// 监听分类变化
watch(selectedCategory, () => {
  if (selectedCategory.value) {
    loadProducts()
  }
})

// 页面初始化
onMounted(async () => {
  console.log("尝试加载")
  // 确保分类数据已加载
  if (categories.value.length === 0) {
    await appStore.loadCategories()
  }
})
</script>

<style scoped>
.categories-view {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.page-header h1 {
  font-size: 2rem;
  color: #333;
  margin-bottom: 10px;
}

.page-header p {
  color: #666;
  font-size: 1.1rem;
}

.categories-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.category-tree {
  max-height: 400px;
  overflow-y: auto;
}

.tree-node {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s;
  width: 100%;
}

.tree-node:hover {
  background-color: #f0f9ff;
}

.category-icon {
  margin-right: 8px;
  color: #409EFF;
}

.category-name {
  flex: 1;
  font-weight: 500;
}

.category-badge {
  font-size: 12px;
  color: #409EFF;
  background: #ecf5ff;
  padding: 2px 8px;
  border-radius: 12px;
}

.products-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.section-header h2 {
  color: #333;
  margin: 0;
}

.filters {
  display: flex;
  align-items: center;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.product-card {
  background: white;
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.product-image {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.product-image img {
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
  font-weight: bold;
}

.product-info {
  padding: 15px;
}

.product-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.product-subtitle {
  color: #666;
  font-size: 0.9rem;
  margin: 0 0 10px 0;
  line-height: 1.4;
}

.product-tags {
  margin-bottom: 10px;
}

.product-tags .el-tag {
  margin-right: 5px;
  margin-bottom: 5px;
}

.product-stats {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: #999;
  margin-bottom: 15px;
}

.product-price {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  font-size: 1.2rem;
  font-weight: 600;
  color: #f56c6c;
}

.loading-container,
.empty-container,
.no-selection {
  text-align: center;
  padding: 60px 20px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .container {
    padding: 0 15px;
  }
  
  .page-header {
    padding: 20px;
  }
  
  .page-header h1 {
    font-size: 1.5rem;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .filters {
    width: 100%;
    justify-content: space-between;
  }
  
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 15px;
  }
  
  .category-tree {
    max-height: 300px;
  }
}

@media (max-width: 480px) {
  .products-grid {
    grid-template-columns: 1fr;
  }
  
  .filters {
    flex-direction: column;
    gap: 10px;
  }
  
  .filters .el-input,
  .filters .el-select {
    width: 100% !important;
  }
}
</style>