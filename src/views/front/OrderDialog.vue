<template>
  <el-dialog
    v-model="dialogVisible"
    title="确认订单"
    width="600px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    class="order-dialog"
  >
         <div v-if="order" class="order-content">

      <!-- 订单信息 -->
      <div class="order-section">
        <h3>订单信息</h3>
        <div class="order-info">
                     <div class="order-header">
             <h4 class="order-title">订单号：{{ getOrderNo() }}</h4>
             <p class="order-time">创建时间：{{ formatTime(order.createTime) }}</p>
           </div>
          
          <!-- 商品信息 -->
          <div class="product-info">
            <div class="product-image">
              <img :src="getProductImageUrl(order.productImage)" :alt="order.productName" />
            </div>
                         <div class="product-details">
               <h4 class="product-name">{{ getProductName() }}</h4>
               <div class="product-price">
                 <span class="price-label">单价：</span>
                 <span class="price">¥{{ getUnitPrice() }}</span>
               </div>
               <div class="product-quantity">
                 <span class="quantity-label">数量：</span>
                 <span class="quantity">{{ order.quantity }}</span>
               </div>
             </div>
          </div>
        </div>
      </div>

      <!-- 联系方式 -->
      <div class="contact-section">
        <h3>联系方式</h3>
        <el-form :model="orderForm" :rules="formRules" ref="orderFormRef" label-width="80px" class="order-form">
          <el-form-item label="联系方式" prop="contactType" required>
            <el-radio-group v-model="orderForm.contactType">
              <el-radio :label="1">邮箱</el-radio>
              <el-radio :label="2">手机号</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item :label="getContactLabel()" prop="contact" required>
            <el-input
              v-model="orderForm.contact"
              :placeholder="getContactPlaceholder()"
              clearable
            />
          </el-form-item>
        </el-form>
      </div>

      <!-- 支付方式 -->
      <div class="payment-section">
        <h3>支付方式</h3>
        <div v-if="loadingChannels" class="loading-channels">
          <el-skeleton :rows="2" animated />
        </div>
        <div v-else-if="paymentChannels.length === 0" class="no-channels">
          <el-empty description="暂无可用支付方式" />
        </div>
        <div v-else class="payment-channels">
          <el-radio-group v-model="orderForm.channelId" class="channel-group">
            <div
              v-for="channel in paymentChannels"
              :key="channel.id"
              class="channel-item"
              :class="{ 'selected': orderForm.channelId === channel.id }"
              @click="orderForm.channelId = channel.id"
            >
              <el-radio :label="channel.id" class="channel-radio">
                <div class="channel-info">
                  <span class="channel-name">{{ channel.channelName }}</span>
                </div>
              </el-radio>
            </div>
          </el-radio-group>
        </div>
      </div>

             <!-- 订单总计 -->
       <div class="total-section">
         <div class="total-row">
           <span class="total-label">商品总价：</span>
           <span class="total-value">¥{{ getTotalAmount() }}</span>
         </div>
         <div class="total-row final-total">
           <span class="total-label">应付金额：</span>
           <span class="total-value">¥{{ getPayAmount() }}</span>
         </div>
       </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel" :disabled="submitting">取消</el-button>
        <el-button
          type="primary"
          @click="handleConfirm"
          :loading="submitting"
          :disabled="!isFormValid"
        >
          {{ submitting ? '跳转支付中...' : '确认支付' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { orderApi, paymentApi } from '@/api'
import { getProductImageUrl } from '@/utils/image'
import { useUserStore } from '@/store/user'
import { formatTime } from '@/utils/time'

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  order: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits(['update:visible', 'success'])

// 响应式数据
const dialogVisible = ref(false)
const orderFormRef = ref(null)
const submitting = ref(false)
const loadingChannels = ref(false)
const paymentChannels = ref([])
const userStore = useUserStore()
const isInitializing = ref(false) // 添加初始化标志

// 订单表单
const orderForm = ref({
  contactType: 1, // 1:邮箱, 2:手机号
  contact: '',
  channelId: null
})

// 表单验证规则
const formRules = {
  contactType: [
    { required: true, message: '请选择联系方式', trigger: 'change' }
  ],
  contact: [
    { required: true, message: '请输入联系方式', trigger: 'blur' },
    { validator: validateContact, trigger: 'blur' }
  ]
}

// 计算属性
const isFormValid = computed(() => {
  return orderForm.value.contact && 
         orderForm.value.contactType && 
         orderForm.value.channelId &&
         !submitting.value
})

// 联系方式验证
function validateContact(rule, value, callback) {
  if (!value) {
    callback(new Error('请输入联系方式'))
    return
  }
  
  const contactType = orderForm.value.contactType
  let pattern
  let message
  
  switch (contactType) {
    case 1: // 邮箱
      pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      message = '请输入正确的邮箱地址'
      break
    case 2: // 手机号
      pattern = /^1[3-9]\d{9}$/
      message = '请输入正确的手机号'
      break
    default:
      callback()
      return
  }
  
  if (!pattern.test(value)) {
    callback(new Error(message))
  } else {
    callback()
  }
}

// 获取联系方式标签
const getContactLabel = () => {
  const labels = {
    1: '邮箱',
    2: '手机号'
  }
  console.log(orderForm.value)
  return labels[orderForm.value.contactType] || '联系方式'
}

// 获取联系方式占位符
const getContactPlaceholder = () => {
  const placeholders = {
    1: '请输入邮箱地址',
    2: '请输入手机号'
  }
  return placeholders[orderForm.value.contactType] || '请输入联系方式'
}

// 获取订单号
const getOrderNo = () => {
  if (!props.order) return ''
  return props.order.orderNo || props.order.order_no || props.order.id || '未知'
}

// 获取商品名称
const getProductName = () => {
  if (!props.order) return ''
  return props.order.productName || props.order.product_name || '未知商品'
}

// 获取单价
const getUnitPrice = () => {
  if (!props.order) return 0
  return props.order.unitPrice || props.order.unit_price || props.order.price || 0
}

// 获取总金额
const getTotalAmount = () => {
  if (!props.order) return 0
  return props.order.totalAmount || props.order.total_amount || 0
}

// 获取支付金额
const getPayAmount = () => {
  if (!props.order) return 0
  return props.order.payAmount || props.order.pay_amount || props.order.totalAmount || props.order.total_amount || 0
}



// 加载支付渠道
const loadPaymentChannels = async () => {
  try {
    loadingChannels.value = true
    const channels = await paymentApi.getChannels()
    paymentChannels.value = channels || []
    
    // 默认选择第一个支付渠道
    if (paymentChannels.value.length > 0) {
      orderForm.value.channelId = paymentChannels.value[0].id
    }
  } catch (error) {
    console.error('加载支付渠道失败:', error)
    ElMessage.error('加载支付渠道失败')
    paymentChannels.value = []
  } finally {
    loadingChannels.value = false
  }
}

// 处理取消
const handleCancel = async () => {
  if (props.order && props.order.status === 0) {
    try {
      await ElMessageBox.confirm(
        '确定要取消这个订单吗？取消后无法恢复。',
        '确认取消',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )

      await orderApi.cancelOrder(props.order.id)
      ElMessage.success('订单已取消')
      dialogVisible.value = false
      
      // 触发成功事件，通知父组件订单已取消
      emit('success', { 
        id: props.order.id, 
        action: 'cancelled',
        order: props.order
      })
    } catch (error) {
      if (error !== 'cancel') {
        console.error('取消订单失败:', error)
        ElMessage.error('取消订单失败，请重试')
      }
    }
  } else {
    dialogVisible.value = false
  }
}

// 处理确认支付
const handleConfirm = async () => {
  if (!orderFormRef.value) return
  
  try {
    // 验证表单
    await orderFormRef.value.validate()
    
    submitting.value = true
    
    ElMessage.success('正在跳转支付...')
    
    // 发起支付
    const response = await paymentApi.createPayment(
      orderForm.value.contact,
      orderForm.value.contactType,
      props.order.id,
      orderForm.value.channelId,
      getProductName()
    )
    
    console.log('支付响应:', response)
    
    // 关闭弹窗
    dialogVisible.value = false
    
    // 处理支付URL跳转
    let payUrl = null
    if (response && typeof response === 'string') {
      // 直接返回URL字符串
      payUrl = response
    } else if (response && response.payUrl) {
      // 返回对象包含payUrl字段
      payUrl = response.payUrl
    } else if (response && response.url) {
      // 返回对象包含url字段
      payUrl = response.url
    }
    
    // 跳转到支付页面
    if (payUrl) {
      window.open(payUrl, '_blank')
    }
    
    // 触发成功事件
    emit('success', { 
      id: props.order.id, 
      payUrl: payUrl,
      order: props.order
    })
    
  } catch (error) {
    console.error('支付失败:', error)
    if (error.message) {
      ElMessage.error(error.message)
    } else {
      ElMessage.error('支付失败，请重试')
    }
  } finally {
    submitting.value = false
  }
}

// 重置表单
const resetForm = async () => {
  isInitializing.value = true // 设置初始化标志
  
  // 先尝试刷新用户信息
  try {
    await userStore.fetchUserInfo()
  } catch (error) {
    console.log('刷新用户信息失败，使用本地缓存:', error)
  }
  
  // 尝试从用户信息中获取联系方式
  let defaultContactType = 1
  let defaultContact = ''
  
  if (userStore.userInfo) {
    // 获取联系类型，支持多种字段名
    if (userStore.userInfo.contactType !== undefined && userStore.userInfo.contactType !== null) {
      defaultContactType = userStore.userInfo.contactType
      console.log('使用contactType字段:', defaultContactType)
    }
    // 获取联系方式
    if (userStore.userInfo.contact) {
      defaultContact = userStore.userInfo.contact
      console.log('获取到联系方式:', defaultContact)
    }
    
    console.log('最终设置 - 联系类型:', defaultContactType, '联系方式:', defaultContact)
  } else {
    console.log('用户信息不存在，使用默认值')
  }
  
  // 使用nextTick确保DOM更新完成后再设置表单值
  await nextTick()
  
  orderForm.value = {
    contactType: defaultContactType,
    contact: defaultContact,
    channelId: paymentChannels.value.length > 0 ? paymentChannels.value[0].id : null
  }
  
  console.log('表单重置后的值:', orderForm.value)
  
  // 再次使用nextTick确保表单值设置完成后再清除验证
  await nextTick()
  
  if (orderFormRef.value) {
    orderFormRef.value.clearValidate()
  }
  
  // 延迟清除初始化标志，确保监听器不会在初始化时触发
  setTimeout(() => {
    isInitializing.value = false
  }, 100)
}

// 监听弹窗显示状态
watch(() => props.visible, async (newVal) => {
  dialogVisible.value = newVal
  if (newVal) {
    await resetForm()
    if (paymentChannels.value.length === 0) {
      loadPaymentChannels()
    }
  }
})

watch(dialogVisible, (newVal) => {
  emit('update:visible', newVal)
})

// 监听联系方式类型变化，清空联系方式输入
watch(() => orderForm.value.contactType, (newType, oldType) => {
  // 在初始化时不执行清空操作
  if (isInitializing.value) {
    return
  }
  
  // 只有在联系类型真正改变时才清空联系方式
  if (oldType !== undefined && newType !== oldType) {
    orderForm.value.contact = ''
    if (orderFormRef.value) {
      orderFormRef.value.clearValidate('contact')
    }
  }
})

// 组件挂载时加载支付渠道
onMounted(() => {
  loadPaymentChannels()
})
</script>

<style scoped>
.order-dialog :deep(.el-dialog__body) {
  padding: 20px;
}

.order-content {
  max-height: 70vh;
  overflow-y: auto;
}

.order-section,
.contact-section,
.payment-section,
.total-section {
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.total-section {
  border-bottom: none;
  margin-bottom: 0;
}

.order-section h3,
.contact-section h3,
.payment-section h3 {
  font-size: 1.1rem;
  color: #333;
  margin: 0 0 15px 0;
  font-weight: 600;
}

.order-info {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 15px;
}

.order-header {
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.order-title {
  font-size: 1rem;
  color: #333;
  margin: 0 0 5px 0;
  font-weight: 600;
}

.order-time {
  font-size: 0.9rem;
  color: #666;
  margin: 0;
}

.product-info {
  display: flex;
  gap: 15px;
  align-items: flex-start;
}

.product-image {
  flex: 0 0 80px;
  width: 80px;
  height: 80px;
  border-radius: 6px;
  overflow: hidden;
  background: #f5f5f5;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 限制订单支付弹窗中的商品图片尺寸 */
.order-dialog :deep(.product-image img) {
  max-width: 100%;
  max-height: 240px;
  object-fit: contain;
}

.product-details {
  flex: 1;
}

.product-name {
  font-size: 1rem;
  color: #333;
  margin: 0 0 5px 0;
  font-weight: 500;
  line-height: 1.4;
}

.product-subtitle {
  font-size: 0.9rem;
  color: #666;
  margin: 0 0 10px 0;
  line-height: 1.4;
}

.product-price,
.product-quantity {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}

.price-label,
.quantity-label {
  color: #666;
  margin-right: 8px;
  font-size: 0.9rem;
}

.price {
  color: #f56c6c;
  font-weight: 600;
  font-size: 1rem;
}

.quantity {
  color: #333;
  font-weight: 500;
}

.loading-channels,
.no-channels {
  padding: 20px;
  text-align: center;
}

.payment-channels {
  margin-top: 10px;
}

.channel-group {
  width: 100%;
}

.channel-item {
  border: 1px solid #ddd;
  border-radius: 6px;
  margin-bottom: 10px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s;
}

.channel-item:hover {
  border-color: #409EFF;
  background-color: #f0f9ff;
}

.channel-item.selected {
  border-color: #409EFF;
  background-color: #f0f9ff;
}

.channel-radio {
  width: 100%;
}

.channel-radio :deep(.el-radio__label) {
  width: 100%;
  padding-left: 10px;
}

.channel-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.channel-name {
  font-weight: 500;
  color: #333;
}

.channel-type {
  font-size: 0.9rem;
  color: #666;
}

.total-section {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
  margin-top: 20px;
}

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.total-row:last-child {
  margin-bottom: 0;
}

.total-row.final-total {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  padding-top: 8px;
  border-top: 1px solid #ddd;
}

.total-label {
  color: #666;
}

.total-value {
  color: #f56c6c;
  font-weight: 600;
}

.final-total .total-value {
  font-size: 1.2rem;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 移动端适配 */
@media (max-width: 768px) {
  /* 确保弹窗内容不会溢出 */
  .order-dialog {
    overflow: hidden;
  }
  
  .order-dialog :deep(.el-dialog) {
    width: 90% !important;
    margin: 5vh auto;
    max-width: none;
    overflow: hidden;
  }
  
  .order-dialog :deep(.el-dialog__header) {
    padding: 15px 20px 10px;
  }
  
  .order-dialog :deep(.el-dialog__body) {
    padding: 15px;
  }
  
  .order-dialog :deep(.el-dialog__footer) {
    padding: 15px 20px 20px;
  }
  
  .order-content {
    max-height: 60vh;
    overflow-y: auto;
    padding-right: 5px;
  }
  
  /* 确保所有内容都在容器内 */
  .order-content > div {
    width: 100%;
    box-sizing: border-box;
  }
  
  .order-section,
  .contact-section,
  .payment-section,
  .total-section {
    margin-bottom: 20px;
    padding-bottom: 15px;
  }
  
  .order-section h3,
  .contact-section h3,
  .payment-section h3 {
    font-size: 1rem;
    margin: 0 0 12px 0;
  }
  
  /* 订单信息区域 */
  .order-info {
    padding: 12px;
    margin-bottom: 12px;
  }
  
  .order-header {
    margin-bottom: 12px;
    padding-bottom: 8px;
  }
  
  .order-title {
    font-size: 0.9rem;
    margin: 0 0 4px 0;
  }
  
  .order-time {
    font-size: 0.8rem;
  }
  
  .product-info {
    flex-direction: column;
    gap: 10px;
  }
  
  .product-image {
    flex: none;
    align-self: center;
    width: 60px;
    height: 60px;
  }
  
  .product-name {
    font-size: 0.9rem;
  }
  
  .product-subtitle {
    font-size: 0.8rem;
  }
  
  .product-price,
  .product-quantity {
    font-size: 0.85rem;
  }
  
  .price-label,
  .quantity-label {
    font-size: 0.8rem;
  }
  
  .price {
    font-size: 0.9rem;
  }
  
  .quantity {
    font-size: 0.85rem;
  }
  
  /* 表单样式优化 */
  .order-form {
    width: 100%;
  }
  
  .contact-section :deep(.el-form-item) {
    margin-bottom: 15px;
  }
  
  .contact-section :deep(.el-form-item__label) {
    font-size: 0.9rem;
    line-height: 1.4;
    width: 70px !important;
    min-width: 70px;
  }
  
  .contact-section :deep(.el-form-item__content) {
    margin-left: 70px !important;
    width: calc(100% - 70px);
  }
  
  .contact-section :deep(.el-input) {
    font-size: 0.9rem;
    width: 100%;
  }
  
  .contact-section :deep(.el-radio-group) {
    width: 100%;
  }
  
  .contact-section :deep(.el-radio) {
    margin-right: 15px;
    font-size: 0.9rem;
  }
  
  .contact-section :deep(.el-radio__label) {
    font-size: 0.9rem;
  }
  
  /* 支付渠道样式优化 */
  .payment-channels {
    margin-top: 8px;
  }
  
  .channel-item {
    margin-bottom: 8px;
    padding: 12px;
  }
  
  .channel-radio {
    width: 100%;
  }
  
  .channel-radio :deep(.el-radio__label) {
    width: 100%;
    padding-left: 8px;
    font-size: 0.9rem;
  }
  
  .channel-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
  
  .channel-name {
    font-size: 0.9rem;
  }
  
  /* 总计区域样式优化 */
  .total-section {
    padding: 12px;
    margin-top: 15px;
  }
  
  .total-row {
    margin-bottom: 6px;
    font-size: 0.9rem;
  }
  
  .total-row.final-total {
    font-size: 1rem;
    padding-top: 6px;
  }
  
  .total-label {
    font-size: 0.9rem;
  }
  
  .total-value {
    font-size: 0.9rem;
  }
  
  .final-total .total-value {
    font-size: 1.1rem;
  }
  
  /* 按钮区域样式优化 */
  .dialog-footer {
    flex-direction: column;
    gap: 10px;
  }
  
  .dialog-footer .el-button {
    width: 100%;
    margin: 0;
    height: 40px;
    font-size: 0.9rem;
  }
}

/* 超小屏幕优化 */
@media (max-width: 480px) {
  .order-dialog :deep(.el-dialog) {
    width: 98% !important;
    margin: 2vh auto;
  }
  
  .order-dialog :deep(.el-dialog__header) {
    padding: 12px 15px 8px;
  }
  
  .order-dialog :deep(.el-dialog__body) {
    padding: 12px;
  }
  
  .order-dialog :deep(.el-dialog__footer) {
    padding: 12px 15px 15px;
  }
  
  .order-info {
    padding: 10px;
    margin-bottom: 10px;
  }
  
  .order-header {
    margin-bottom: 10px;
    padding-bottom: 6px;
  }
  
  .order-title {
    font-size: 0.85rem;
    margin: 0 0 3px 0;
  }
  
  .order-time {
    font-size: 0.75rem;
  }
  
  .contact-section :deep(.el-form-item__label) {
    width: 60px !important;
    min-width: 60px;
    font-size: 0.8rem;
  }
  
  .contact-section :deep(.el-form-item__content) {
    margin-left: 60px !important;
    width: calc(100% - 60px);
  }
  
  .product-image {
    width: 50px;
    height: 50px;
  }
  
  .product-name {
    font-size: 0.85rem;
  }
  
  .product-subtitle {
    font-size: 0.75rem;
  }
  
  .product-price,
  .product-quantity {
    font-size: 0.8rem;
  }
  
  .price-label,
  .quantity-label {
    font-size: 0.75rem;
  }
  
  .price {
    font-size: 0.85rem;
  }
  
  .quantity {
    font-size: 0.8rem;
  }
  
  .total-section {
    padding: 10px;
    margin-top: 12px;
  }
  
  .total-row {
    margin-bottom: 5px;
    font-size: 0.85rem;
  }
  
  .total-row.final-total {
    font-size: 0.9rem;
    padding-top: 5px;
  }
  
  .total-label {
    font-size: 0.85rem;
  }
  
  .total-value {
    font-size: 0.85rem;
  }
  
  .final-total .total-value {
    font-size: 1rem;
  }
  
  .channel-item {
    margin-bottom: 6px;
    padding: 10px;
  }
  
  .channel-radio :deep(.el-radio__label) {
    padding-left: 6px;
    font-size: 0.85rem;
  }
  
  .channel-name {
    font-size: 0.85rem;
  }
}
</style>
