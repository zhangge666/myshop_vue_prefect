<template>
  <div class="order-list-view">
    <div class="container">
      
      <!-- 筛选区 -->
      <div class="filter-section">
        <el-form :inline="true" class="filter-form" label-width="80px">
          <el-form-item label="联系方式">
            <el-input v-model="filters.contact" placeholder="请输入联系方式" clearable />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="statusValue" placeholder="Select" style="width: 240px">
    <el-option
      v-for="item in statusOptions"
      :key="item.value"
      :label="item.label"
      :value="item.value"
    />
  </el-select>

          </el-form-item>
          <el-form-item label="开始时间">
            <el-date-picker
              v-model="filters.startTime"
              type="datetime"
              placeholder="选择开始时间"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              clearable
            />
          </el-form-item>
          <el-form-item label="结束时间">
            <el-date-picker
              v-model="filters.endTime"
              type="datetime"
              placeholder="选择结束时间"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              clearable
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="searchOrders" :loading="loading">
              <el-icon><Search /></el-icon>
              查询
            </el-button>
            <el-button @click="resetFilters">
              <el-icon><Refresh /></el-icon>
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 订单列表 -->
      <div class="order-list">
        <el-row :gutter="16">
          <el-col
            v-for="order in orders"
            :key="order.id"
            :xs="24"
            :sm="12"
            :md="8"
          >
            <el-card shadow="hover" class="order-card">
              <div class="order-card-header">
                <span class="order-no">订单号：{{ getOrderNo(order) }}</span>
                <el-tag
                  :type="getStatusType(order.status)"
                  size="small"
                >
                  {{ getStatusText(order.status) }}
                </el-tag>
              </div>
              <div class="order-card-body">
                <p><strong>商品：</strong>{{ order.productName }}</p>
                <p><strong>数量：</strong>{{ order.quantity }}</p>
                <p><strong>金额：</strong>￥{{ order.totalAmount }}</p>
                <p><strong>下单时间：</strong>{{ formatTime(order.createTime) }}</p>
              </div>
              <div class="order-card-footer">
                <el-button size="small" type="primary" @click="viewOrderDetail(order)">查看详情</el-button>
                <el-button 
                  v-if="order.status === 0 || order.status === 1" 
                  size="small" 
                  type="success" 
                  @click="handlePayOrder(order)"
                >
                  去支付
                </el-button>
                <el-button 
                  v-if="order.status === 2 || order.status === 3" 
                  size="small" 
                  type="warning" 
                  @click="viewCardPassword(order)"
                >
                  查看卡密
                </el-button>
                <el-button 
                  v-if="order.status === 0 || order.status === 1" 
                  size="small" 
                  type="danger" 
                  @click="handleCancelOrder(order)"
                >
                  取消订单
                </el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <!-- 空状态 -->
        <div v-if="orders.length === 0 && !loading" class="empty-state">
          <el-empty description="暂无订单" />
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination-section">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[9, 18, 36, 98]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          :hide-on-single-page="false"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 订单详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="订单详情"
      :close-on-click-modal="false"
      :lock-scroll="false"
      class="detail-dialog"
    >
      <div v-if="currentOrderDetail" class="order-detail">
        <!-- 订单基本信息 -->
        <div class="detail-section">
          <h3>订单信息</h3>
          <div class="detail-content">
            <div class="detail-row">
              <span class="label">订单号：</span>
              <span class="value">{{ getOrderNo(currentOrderDetail) }}</span>
            </div>
            <div class="detail-row">
              <span class="label">创建时间：</span>
              <span class="value">{{ formatTime(currentOrderDetail.createTime) }}</span>
            </div>
            <div class="detail-row">
              <span class="label">支付时间：</span>
              <span class="value">{{ currentOrderDetail.updateTime ? formatTime(currentOrderDetail.updateTime) : '未支付' }}</span>
            </div>
            <div class="detail-row">
              <span class="label">订单状态：</span>
              <span class="value">
                <el-tag :type="getStatusType(currentOrderDetail.status)">
                  {{ getStatusText(currentOrderDetail.status) }}
                </el-tag>
              </span>
            </div>
          </div>
        </div>

        <!-- 商品信息 -->
        <div class="detail-section">
          <h3>商品信息</h3>
          <div class="detail-content">
            <div class="product-detail">
              <div class="product-image">
                <img :src="getProductImageUrl(currentOrderDetail.productImage)" :alt="currentOrderDetail.productName" class="dialog-img"/>
              </div>
              <div class="product-info">
                <h4>{{ currentOrderDetail.productName }}</h4>
                <div class="product-meta">
                  <span class="price">¥{{ currentOrderDetail.unitPrice }}</span>
                  <span class="quantity">x{{ currentOrderDetail.quantity }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 联系信息 -->
        <div class="detail-section">
          <h3>联系信息</h3>
          <div class="detail-content">
            <div class="detail-row">
              <span class="label">联系方式：</span>
              <span class="value">{{ currentOrderDetail.contact || '未填写' }}</span>
            </div>
            <div class="detail-row">
              <span class="label">联系类型：</span>
              <span class="value">{{ getContactTypeText(currentOrderDetail.contactType) }}</span>
            </div>
          </div>
        </div>

        <!-- 金额信息 -->
        <div class="detail-section">
          <h3>金额信息</h3>
          <div class="detail-content">
            <div class="detail-row">
              <span class="label">商品总价：</span>
              <span class="value">¥{{ currentOrderDetail.totalAmount }}</span>
            </div>
            <div class="detail-row">
              <span class="label">应付金额：</span>
              <span class="value total-amount">¥{{ currentOrderDetail.payAmount }}</span>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 查看卡密弹窗 -->
    <el-dialog
      v-model="cardDialogVisible"
      width="700px"
      :close-on-click-modal="false"
      :lock-scroll="false"
      class="card-dialog"
    >
      <template #header>
        <div class="card-dialog-header">
          <span>卡密信息（订单号：{{ currentOrderNo }}）</span>
          <div class="actions">
            <template v-if="viewingMode === 'text'">
              <el-button size="small" type="success" @click="handleConvertToImages" :loading="converting">转化为图片</el-button>
              <el-button
                v-if="cardTexts.length > 0"
                size="small"
                type="primary"
                plain
                @click="handleCopyAll"
              >一键复制</el-button>
            </template>
            <template v-else>
              <el-button size="small" type="warning" @click="viewingMode = 'text'">转化为文本</el-button>
              <el-button
                v-if="cardTexts.length > 0"
                size="small"
                type="primary"
                plain
                @click="handleCopyAll"
              >一键复制</el-button>
            </template>
          </div>
        </div>
      </template>

      <div v-loading="cardLoading">
        <div v-if="viewingMode === 'text'">
          <div v-if="cardTexts.length > 0" class="card-texts">
            <div v-for="(line, idx) in cardTexts" :key="idx" class="card-line">
              <span class="line-text">{{ line }}</span>
              <el-button class="copy-btn" size="small" type="primary" link @click="handleCopy(line)">复制</el-button>
            </div>
          </div>
          <el-empty v-else description="暂无卡密数据" />
        </div>
        <div v-else class="card-images">
          <div v-if="cardImageUrls.length > 0" class="image-grid">
            <div v-for="(img, idx) in cardImageUrls" :key="idx" class="image-item">
              <img :src="img && img.startsWith('data:') ? img : getImageUrl(img)" alt="卡密二维码" />
            </div>
          </div>
          <el-empty v-else description="暂无图片" />
        </div>
      </div>
    </el-dialog>

    <!-- 订单支付弹窗 -->
    <OrderDialog
      v-model:visible="orderDialogVisible"
      :order="currentOrder"
      @success="handleOrderSuccess"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import { orderApi, paymentApi, cardApi } from '@/api'
import { getProductImageUrl, getImageUrl } from '@/utils/image'
import { formatTime } from '@/utils/time'
import OrderDialog from '@/views/front/OrderDialog.vue'
import QRCode from 'qrcode'




// 用于 Select 的字符串值，避免与 filters.status 类型不一致
const statusValue = ref('')


// 将后端返回的状态标准化为数字（0-6），非法值为 undefined
const normalizeStatusToNumber = (val) => {
  if (val === null || val === undefined || val === '') return undefined
  const num = Number(val)
  return Number.isFinite(num) ? num : undefined
}

// 订单列表响应式数据
const loading = ref(false)
const orders = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(9)
const detailDialogVisible = ref(false)
const orderDialogVisible = ref(false)
const currentOrderDetail = ref(null)
const currentOrder = ref(null)

// 查看卡密对话框
const cardDialogVisible = ref(false)
const cardLoading = ref(false)
const converting = ref(false)
const viewingMode = ref('text') // 'text' | 'image'
const cardTexts = ref([])
const cardImageUrls = ref([])
const currentOrderNo = ref('')

// 状态选项（前端使用字符串值，便于 v-model 匹配）
const statusOptions = [
  { label: '全部', value: 'all' },
  { label: '创建', value: '0' },
  { label: '待支付', value: '1' },
  { label: '已支付', value: '2' },
  { label: '已发货', value: '3' },
  { label: '已取消', value: '4' },
  { label: '已过期', value: '5' },
  { label: '已退款', value: '6' }
]

// 筛选条件
const filters = reactive({
  contact: '',
  status: 'all',
  startTime: '',
  endTime: ''
})

// 获取订单号
const getOrderNo = (order) => {
  return order.orderNo || order.order_no || order.id || '未知'
}

// 获取状态文本（容错：将字符串或数字转换）
const getStatusText = (status) => {
  const s = normalizeStatusToNumber(status)
  const statusMap = {
    0: '创建',
    1: '待支付',
    2: '已支付',
    3: '已发货',
    4: '已取消',
    5: '已过期',
    6: '已退款'
  }
  return s !== undefined ? (statusMap[s] || '未知状态') : '未知状态'
}

// 获取状态类型（容错）
const getStatusType = (status) => {
  const s = normalizeStatusToNumber(status)
  const typeMap = {
    0: 'info',
    1: 'warning',
    2: 'success',
    3: 'primary',
    4: 'info',
    5: 'danger',
    6: 'warning'
  }
  return s !== undefined ? (typeMap[s] || 'info') : 'info'
}

// 获取联系方式类型文本
const getContactTypeText = (type) => {
  const t = normalizeStatusToNumber(type)
  const typeMap = {
    0: '未知',
    1: '邮箱',
    2: '手机号'
  }
  return t !== undefined ? (typeMap[t] || '未知') : '未知'
}

// 加载订单列表
const loadOrders = async () => {
  try {
    loading.value = true

    // 同步下拉的字符串值到筛选条件
    filters.status = statusValue.value
    
    const params = {
      page: currentPage.value,
      size: pageSize.value,
      contact: filters.contact,
      status: filters.status === 'all' ? '' : filters.status,
      startTime: filters.startTime,
      endTime: filters.endTime
    }
    
    const response = await orderApi.getOrders(params)

    // 统一将后端返回的 status 归一化为数字，避免展示异常
    const normalizeOrder = (o) => ({
      ...o,
      status: normalizeStatusToNumber(o?.status)
    })

    // 全局拦截器已经处理了错误，这里直接处理成功的数据
    if (response && typeof response === 'object') {
      if (response.records) {
        orders.value = (response.records || []).map(normalizeOrder)
        total.value = Number(response.total) || 0
      } else if (Array.isArray(response)) {
        orders.value = response.map(normalizeOrder)
        total.value = response.length
      } else if (response.data && response.data.records) {
        orders.value = (response.data.records || []).map(normalizeOrder)
        total.value = Number(response.data.total) || 0
      } else if (response.data && Array.isArray(response.data)) {
        orders.value = (response.data || []).map(normalizeOrder)
        total.value = Number(response.total ?? response.data.length) || 0
      } else {
        orders.value = (response || []).map?.(normalizeOrder) || []
        total.value = Number(response.total ?? response.length) || 0
      }
      total.value = Number(total.value) || 0
    } else {
      orders.value = []
      total.value = 0
    }
  } catch (error) {
    // 全局拦截器已经处理了错误提示，这里不需要再显示
    orders.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 搜索订单
const searchOrders = () => {
  currentPage.value = 1
  loadOrders()
}

// 重置筛选
const resetFilters = () => {
  Object.assign(filters, {
    contact: '',
    status: 'all',
    startTime: '',
    endTime: ''
  })
  statusValue.value = 'all'
  currentPage.value = 1
  loadOrders()
}

// 分页处理
const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  loadOrders()
}

const handleCurrentChange = (page) => {
  currentPage.value = page
  loadOrders()
}

// 查看订单详情
const viewOrderDetail = async (order) => {
  try {
    const response = await orderApi.getOrderDetail(order.id)
    if (response && typeof response === 'object') {
      currentOrderDetail.value = {
        ...response,
        status: normalizeStatusToNumber(response?.status)
      }
      detailDialogVisible.value = true
    }
  } catch (error) {
    // 全局拦截器已经处理了错误提示
  }
}

// 处理支付订单
const handlePayOrder = (order) => {
  currentOrder.value = order
  orderDialogVisible.value = true
}

// 查看卡密
const viewCardPassword = async (order) => {
  try {
    cardDialogVisible.value = true
    cardLoading.value = true
    converting.value = false
    viewingMode.value = 'text'
    cardTexts.value = []
    cardImageUrls.value = []
    currentOrderNo.value = getOrderNo(order)
    
    const res = await cardApi.getCardTextsByOrderNo(currentOrderNo.value)
    // 兼容不同返回格式：数组/字符串/对象
    let lines = []
    if (Array.isArray(res)) {
      lines = res
    } else if (typeof res === 'string') {
      lines = res.split(/\r?\n/).filter(Boolean)
    } else if (res && Array.isArray(res.list)) {
      lines = res.list
    } else if (res && typeof res.data === 'string') {
      lines = res.data.split(/\r?\n/).filter(Boolean)
    } else if (res && Array.isArray(res.data)) {
      lines = res.data
    }
    cardTexts.value = lines
  } catch (error) {
    console.error('获取卡密失败:', error)
    ElMessage.error('获取卡密失败，请重试')
  } finally {
    cardLoading.value = false
  }
}

// 转换为图片（前端本地生成二维码）
const handleConvertToImages = async () => {
  if (!cardTexts.value || cardTexts.value.length === 0) {
    ElMessage.warning('暂无可转换的卡密')
    return
  }
  if (cardTexts.value.length > 30) {
    ElMessage.warning('最多只能转换前30条卡密为图片')
    return
  }
  try {
    converting.value = true
    const opts = { errorCorrectionLevel: 'M', margin: 1, width: 260 }
    const result = []
    for (const line of cardTexts.value) {
      const text = String(line ?? '').trim()
      if (!text) continue
      const dataUrl = await QRCode.toDataURL(text, opts)
      result.push(dataUrl)
    }
    if (result.length === 0) {
      ElMessage.warning('没有可转换的有效卡密')
      return
    }
    cardImageUrls.value = result
    viewingMode.value = 'image'
  } catch (error) {
    console.error('生成二维码失败:', error)
    ElMessage.error('生成二维码失败，请重试')
  } finally {
    converting.value = false
  }
}

// 复制单条
const handleCopy = async (text) => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
    } else {
      // 非安全上下文降级方案
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.left = '-9999px'
      document.body.appendChild(textarea)
      textarea.focus()
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    ElMessage.success('复制成功')
  } catch (e) {
    console.error('复制失败:', e)
    ElMessage.error('复制失败，请手动复制')
  }
}

// 一键复制全部
const handleCopyAll = async () => {
  if (!cardTexts.value || cardTexts.value.length === 0) {
    ElMessage.warning('暂无可复制内容')
    return
  }
  const allText = cardTexts.value.join('\n')
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(allText)
    } else {
      const textarea = document.createElement('textarea')
      textarea.value = allText
      textarea.style.position = 'fixed'
      textarea.style.left = '-9999px'
      document.body.appendChild(textarea)
      textarea.focus()
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    ElMessage.success('全部卡密已复制')
  } catch (e) {
    console.error('一键复制失败:', e)
    ElMessage.error('复制失败，请手动复制')
  }
}

// 取消订单
const handleCancelOrder = async (order) => {
  try {
    await ElMessageBox.confirm(
      '确定要取消这个订单吗？取消后无法恢复。',
      '确认取消',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        lockScroll: false
      }
    )

    await orderApi.cancelOrder(order.id)
    ElMessage.success('订单已取消')
    loadOrders() // 重新加载订单列表
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消订单失败:', error)
      // 全局拦截器已经处理了错误提示
    }
  }
}

// 处理订单操作成功
const handleOrderSuccess = (result) => {
  console.log('订单操作结果:', result)
  
  if (result.action === 'cancelled') {
    ElMessage.success('订单已取消')
  } else if (result.payUrl) {
    // 支付URL已在新窗口打开，这里只需要提示
    ElMessage.success('已跳转支付页面')
  }
  
  orderDialogVisible.value = false
  loadOrders() // 重新加载订单列表
}

// 页面初始化
onMounted(async () => {
  if (!filters.status) {
    filters.status = 'all'
  }
  statusValue.value = filters.status
  await loadOrders()
})
</script>

<style scoped>
::v-deep .el-dialog {
  /* 样式 */
  width: 600px;
}
.dialog-img {
  max-width: 100%;
  height: 100px;
  display: block;
  margin: 0 auto; /* 居中 */
}


.order-list-view {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.filter-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.filter-form {
  margin-bottom: 15px;
}

.order-list {
  margin-bottom: 20px;
}

.order-card {
  margin-bottom: 16px;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.order-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.order-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  font-size: 14px;
}

.order-no {
  font-weight: 600;
  color: #409eff;
}

.order-card-body {
  font-size: 13px;
  color: #555;
  line-height: 1.6;
  margin-bottom: 15px;
}

.order-card-body p {
  margin: 8px 0;
}

.order-card-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: wrap;
}

.order-card-footer .el-button {
  font-size: 0.8rem;
  padding: 6px 12px;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
}

.pagination-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex !important;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
  border: 1px solid #e0e0e0;
}

/* 分页组件样式 */
.pagination-section :deep(.el-pagination) {
  display: flex !important;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  visibility: visible !important;
  opacity: 1 !important;
}

.pagination-section :deep(.el-pagination .el-pagination__total) {
  margin-right: 10px;
  display: inline-block !important;
}

.pagination-section :deep(.el-pagination .el-pagination__sizes) {
  margin-right: 10px;
  display: inline-block !important;
}

.pagination-section :deep(.el-pagination .el-pager) {
  display: flex !important;
  gap: 5px;
  list-style: none !important;
  margin: 0 !important;
  padding: 0 !important;
}

.pagination-section :deep(.el-pagination .el-pager li) {
  min-width: 32px;
  height: 32px;
  line-height: 32px;
  text-align: center;
  border-radius: 4px;
  border: 1px solid #d9d9d9;
  background: white;
  color: #606266;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-block !important;
  margin: 0 2px !important;
}

.pagination-section :deep(.el-pagination .el-pager li:hover) {
  color: #409eff;
  border-color: #409eff;
}

.pagination-section :deep(.el-pagination .el-pager li.is-active) {
  background: #409eff;
  color: white;
  border-color: #409eff;
}

.pagination-section :deep(.el-pagination .btn-prev),
.pagination-section :deep(.el-pagination .btn-next) {
  min-width: 32px;
  height: 32px;
  line-height: 32px;
  text-align: center;
  border-radius: 4px;
  border: 1px solid #d9d9d9;
  background: white;
  color: #606266;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-block !important;
}

.pagination-section :deep(.el-pagination .btn-prev:hover),
.pagination-section :deep(.el-pagination .btn-next:hover) {
  color: #409eff;
  border-color: #409eff;
}

.pagination-section :deep(.el-pagination .el-pagination__jump) {
  margin-left: 10px;
  display: inline-block !important;
}

/* 卡密弹窗样式 */
.card-dialog :deep(.el-dialog__body) {
  padding: 16px 20px;
}

/* 限制卡密弹窗内图片尺寸 */
.card-dialog :deep(.el-dialog__body) img {
  max-width: 100%;
  height: auto;
}

/* 订单详情弹窗图片限制 */
.detail-dialog :deep(.product-image img) {
  max-width: 100%;
  max-height: 240px;
  object-fit: contain;
}

.card-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.card-texts {
  max-height: 60vh;
  overflow-y: auto;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 12px;
  border: 1px solid #eee;
}

.card-line { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.card-line .line-text { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.card-line .copy-btn { flex-shrink: 0; }

.card-line:last-child { border-bottom: none; }

.line-text {
  flex-grow: 1;
  margin-right: 10px;
}

.copy-btn {
  flex-shrink: 0;
}

.card-images .image-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.card-images .image-item {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-images .image-item img {
  max-width: 100%;
  height: auto;
}

/* 订单详情弹窗样式 */
.detail-dialog :deep(.el-dialog__body) {
  padding: 16px 20px;
}

@media (max-width: 768px) {
::v-deep .el-dialog {
  /* 样式 */
  max-width: 90%;
}

  .detail-dialog :deep(.el-dialog) {
    width: 90% !important;
    max-width: none;
  }


  ::v-deep(.el-button + .el-button) {
    margin-left: 0px;
  }
  .container {
    padding: 0 15px;
  }
  .filter-section {
    padding: 15px;
  }
  .order-card {
    font-size: 14px;
  }
  .order-card-footer {
    flex-direction: column;
    align-items: stretch;
  }
  .order-card-footer .el-button {
    width: 100%;
    margin-bottom: 8px;
  }
  .pagination-section {
    padding: 15px;
  }
  .card-images .image-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
    .detail-dialog :deep(.el-dialog) {
    width: 90% !important;
    max-width: none;
  }

  .page-header {
    padding: 15px;
  }
  .page-header h1 {
    font-size: 1.3rem;
  }
  .filter-section {
    padding: 12px;
  }
  .order-card {
    font-size: 13px;
  }
  .order-card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  .pagination-section {
    padding: 12px;
  }
  .card-images .image-grid {
    grid-template-columns: 1fr;
  }
}
</style>
