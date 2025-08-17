import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import { configApi, categoryApi } from '@/api'

export const useAppStore = defineStore('app', () => {
  // 站点配置
  const siteConfig = reactive({
    siteName: 'MyShop发卡网',
    siteDescription: '专业的虚拟卡密销售平台',
    logo: '',
    favicon: '',
    announcement: '',
    contact: {
      qq: '',
      wechat: '',
      email: '',
      phone: '',
      address: '',
      businessHours: '',
      customerService: ''
    },
    social: {
      qqGroup: '',
      wechatOfficial: '',
      weibo: ''
    },
    footer: {
      copyright: '',
      icp: '',
      police: ''
    }
  })

  // 分类数据
  const categories = ref([])
  
  // 加载状态
  const loading = ref(false)

  // 获取站点配置
  const loadSiteConfig = async () => {
    try {
      loading.value = true
      const configs = await configApi.getConfigs()
      
      // 解析配置
      configs.forEach(config => {
        switch (config.configKey) {
          case 'site_name':
            siteConfig.siteName = config.configValue
            break
          case 'site_description':
            siteConfig.siteDescription = config.configValue
            break
          case 'site_logo':
            siteConfig.logo = config.configValue
            break
          case 'site_favicon':
            siteConfig.favicon = config.configValue
            break
          case 'site_announcement':
            siteConfig.announcement = config.configValue
            break
          // 联系方式
          case 'contact_qq':
            siteConfig.contact.qq = config.configValue
            break
          case 'contact_wechat':
            siteConfig.contact.wechat = config.configValue
            break
          case 'contact_email':
            siteConfig.contact.email = config.configValue
            break
          case 'contact_phone':
            siteConfig.contact.phone = config.configValue
            break
          case 'contact_address':
            siteConfig.contact.address = config.configValue
            break
          case 'contact_business_hours':
            siteConfig.contact.businessHours = config.configValue
            break
          case 'contact_customer_service':
            siteConfig.contact.customerService = config.configValue
            break
          // 社交媒体
          case 'social_qq_group':
            siteConfig.social.qqGroup = config.configValue
            break
          case 'social_wechat_official':
            siteConfig.social.wechatOfficial = config.configValue
            break
          case 'social_weibo':
            siteConfig.social.weibo = config.configValue
            break
          // 页脚信息
          case 'footer_copyright':
            siteConfig.footer.copyright = config.configValue
            break
          case 'footer_icp':
            siteConfig.footer.icp = config.configValue
            break
          case 'footer_police':
            siteConfig.footer.police = config.configValue
            break
        }
      })
    } catch (error) {
      console.error('加载站点配置失败:', error)
    } finally {
      loading.value = false
    }
  }

  // 获取分类数据
  const loadCategories = async () => {
    try {
      const data = await categoryApi.getCategories()
      categories.value = data
    } catch (error) {
      console.error('加载分类失败:', error)
    }
  }

  // 初始化应用
  const initApp = async () => {
    await Promise.all([
      loadSiteConfig(),
      loadCategories()
    ])
  }

  return {
    siteConfig,
    categories,
    loading,
    loadSiteConfig,
    loadCategories,
    initApp
  }
})


