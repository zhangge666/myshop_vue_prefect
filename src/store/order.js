import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useOrderStore = defineStore('order', () => {
  // 当前购买的商品
  const currentProduct = ref(null)
  
  // 购买数量
  const quantity = ref(1)
  
  // 当前选中的支付渠道
  const selectedChannel = ref(null)
  
  // 当前联系方式
  const contact = ref('')
  const contactType = ref(1) // 1=手机号, 2=邮箱

  // 设置当前购买商品
  const setCurrentProduct = (product) => {
    currentProduct.value = product
    quantity.value = 1
  }

  // 设置购买数量
  const setQuantity = (qty) => {
    quantity.value = qty
  }

  // 设置支付渠道
  const setPaymentChannel = (channel) => {
    selectedChannel.value = channel
  }

  // 设置联系方式
  const setContact = (contactInfo, type) => {
    contact.value = contactInfo
    contactType.value = type
  }

  // 计算总价
  const getTotalAmount = () => {
    if (!currentProduct.value) return 0
    return currentProduct.value.price * quantity.value
  }

  // 重置订单信息
  const resetOrder = () => {
    currentProduct.value = null
    quantity.value = 1
    selectedChannel.value = null
    contact.value = ''
    contactType.value = 1
  }

  return {
    currentProduct,
    quantity,
    selectedChannel,
    contact,
    contactType,
    setCurrentProduct,
    setQuantity,
    setPaymentChannel,
    setContact,
    getTotalAmount,
    resetOrder
  }
})


