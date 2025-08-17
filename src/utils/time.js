import dayjs from 'dayjs'

/**
 * 格式化时间
 * @param {string|Date} time 时间
 * @param {string} format 格式，默认为 YYYY-MM-DD HH:mm:ss
 * @returns {string} 格式化后的时间字符串
 */
export function formatTime(time, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!time) return '-'
  try {
    return dayjs(time).format(format)
  } catch (error) {
    console.error('时间格式化失败:', error)
    return '-'
  }
}

/**
 * 格式化相对时间
 * @param {string|Date} time 时间
 * @returns {string} 相对时间字符串
 */
export function formatRelativeTime(time) {
  if (!time) return '-'
  try {
    const now = dayjs()
    const target = dayjs(time)
    const diff = now.diff(target, 'minute')
    
    if (diff < 1) return '刚刚'
    if (diff < 60) return `${diff}分钟前`
    if (diff < 1440) return `${Math.floor(diff / 60)}小时前`
    if (diff < 43200) return `${Math.floor(diff / 1440)}天前`
    return target.format('YYYY-MM-DD')
  } catch (error) {
    console.error('相对时间格式化失败:', error)
    return formatTime(time)
  }
}

/**
 * 格式化日期
 * @param {string|Date} time 时间
 * @returns {string} 日期字符串
 */
export function formatDate(time) {
  return formatTime(time, 'YYYY-MM-DD')
}

/**
 * 格式化时间（不包含日期）
 * @param {string|Date} time 时间
 * @returns {string} 时间字符串
 */
export function formatTimeOnly(time) {
  return formatTime(time, 'HH:mm:ss')
}


