/**
 * 订单状态枚举
 */
export const OrderStatus = {
  CREATED: 0,           // 创建
  PENDING_PAYMENT: 1,   // 待支付
  PAID: 2,              // 已支付
  SHIPPED: 3,           // 已发货
  CANCELED: 4,          // 已取消
  EXPIRED: 5,           // 已过期
  REFUNDED: 6           // 已退款
}

/**
 * 获取订单状态文本
 * @param {number} status 订单状态码
 * @returns {string} 状态文本
 */
export function getOrderStatusText(status) {
  const statusMap = {
    [OrderStatus.CREATED]: '已创建',
    [OrderStatus.PENDING_PAYMENT]: '待支付',
    [OrderStatus.PAID]: '已支付',
    [OrderStatus.SHIPPED]: '已发货',
    [OrderStatus.CANCELED]: '已取消',
    [OrderStatus.EXPIRED]: '已过期',
    [OrderStatus.REFUNDED]: '已退款'
  }
  return statusMap[status] || '未知状态'
}

/**
 * 获取订单状态类型（用于Element Plus的tag组件）
 * @param {number} status 订单状态码
 * @returns {string} 状态类型
 */
export function getOrderStatusType(status) {
  const typeMap = {
    [OrderStatus.CREATED]: 'info',
    [OrderStatus.PENDING_PAYMENT]: 'warning',
    [OrderStatus.PAID]: 'success',
    [OrderStatus.SHIPPED]: 'success',
    [OrderStatus.CANCELED]: 'danger',
    [OrderStatus.EXPIRED]: 'danger',
    [OrderStatus.REFUNDED]: 'info'
  }
  return typeMap[status] || 'info'
}

/**
 * 检查订单是否可以支付
 * @param {number} status 订单状态码
 * @returns {boolean} 是否可以支付
 */
export function canPay(status) {
  return status === OrderStatus.CREATED || status === OrderStatus.PENDING_PAYMENT
}

/**
 * 检查订单是否可以查看卡密
 * @param {number} status 订单状态码
 * @returns {boolean} 是否可以查看卡密
 */
export function canViewCard(status) {
  return status === OrderStatus.SHIPPED
}

/**
 * 检查订单是否已过期
 * @param {number} status 订单状态码
 * @returns {boolean} 是否已过期
 */
export function isExpired(status) {
  return status === OrderStatus.EXPIRED
}


