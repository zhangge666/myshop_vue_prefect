/**
 * 获取图片完整URL
 * @param {string} imagePath 图片路径（相对或绝对）
 * @returns {string} 完整的图片URL
 */
export function getImageUrl(imagePath) {
  if (!imagePath || imagePath.trim() === '') {
    return ''
  }
  
  // 如果已经是完整的URL，直接返回
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }
  
  // 如果是相对路径，拼接基础URL
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
  return `${baseUrl}${imagePath}`
}

/**
 * 获取头像URL
 * @param {string} avatarPath 头像路径
 * @returns {string} 头像URL或默认头像
 */
export function getAvatarUrl(avatarPath) {
  if (!avatarPath || avatarPath === '/images/avatar.png') {
    return '/images/avatar.png'
  }
  return getImageUrl(avatarPath)
}

/**
 * 获取商品图片URL
 * @param {string} productImage 商品图片路径
 * @returns {string} 商品图片URL或默认商品图片
 */
export function getProductImageUrl(productImage) {
  // 如果商品图片为空或空字符串，返回默认图片
  if (!productImage || productImage.trim() === '') {
    return '/images/default-product.png'
  }
  
  // 如果商品图片是默认图片路径，直接返回
  if (productImage === '/images/default-product.png') {
    return '/images/default-product.png'
  }
  
  // 强制处理图片路径 - 临时修复
  let processedImage = productImage;
  
  // 如果路径不以斜杠开头，添加斜杠
  if (!processedImage.startsWith('/')) {
    processedImage = '/' + processedImage;
  }
  
  // 如果路径不是uploads开头，强制添加uploads
  if (!processedImage.startsWith('/uploads/')) {
    processedImage = '/uploads/' + processedImage.replace(/^\/+/, '');
  }
  
  // 调用getImageUrl处理
  return getImageUrl(processedImage);
}
