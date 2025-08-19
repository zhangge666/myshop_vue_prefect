<template>
  <div class="edit-profile-view">
    <div class="container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1>修改个人信息</h1>
        <p>更新您的个人资料信息</p>
      </div>

      <!-- 修改表单 -->
      <div class="edit-form-card">
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="120px"
          class="edit-form"
        >
          <!-- 头像上传 -->
          <div class="form-section">
            <h3>头像设置</h3>
            <el-form-item>
              <div class="avatar-upload">
                <div class="avatar-preview">
                  <el-avatar 
                    :size="100" 
                    :src="getImageUrl(avatarUrl)" 
                    icon="UserFilled"
                    class="avatar-image"
                  />
                  <div class="avatar-overlay" @click="triggerUpload">
                    <el-icon><Camera /></el-icon>
                    <span>点击更换</span>
                  </div>
                </div>
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  style="display: none"
                  @change="handleAvatarChange"
                />
                <div class="avatar-tips">
                  <p>支持 JPG、PNG 格式，文件大小不超过 2MB</p>
                </div>
              </div>
            </el-form-item>
          </div>

          <!-- 基本信息 -->
          <div class="form-section">
            <h3>基本信息</h3>
            <el-form-item label="用户名" prop="username">
              <el-input 
                v-model="form.username" 
                placeholder="请输入用户名"
                maxlength="128"
                show-word-limit
              />
            </el-form-item>
          </div>

          <!-- 联系信息 -->
          <div class="form-section">
            <h3>联系信息</h3>
            <el-form-item label="联系类型" prop="contactType">
              <el-radio-group v-model="form.contactType" @change="handleContactTypeChange">
                <el-radio :label="1">邮箱</el-radio>
                <el-radio :label="2">手机号</el-radio>
              </el-radio-group>
            </el-form-item>
            
            <el-form-item label="联系方式" prop="contact">
              <el-input 
                v-model="form.contact" 
                :placeholder="getContactPlaceholder()"
                :type="form.contactType === 1 ? 'email' : 'text'"
                maxlength="128"
              />
            </el-form-item>
          </div>

          <!-- 操作按钮 -->
          <div class="form-actions">
            <el-button @click="$router.back()">取消</el-button>
            <el-button type="primary" @click="handleSubmit" :loading="loading">
              保存修改
            </el-button>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Camera } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'
import { uploadApi } from '@/api'
import { getImageUrl } from '@/utils/image'

const router = useRouter()
const userStore = useUserStore()

// 响应式数据
const formRef = ref()
const fileInput = ref()
const loading = ref(false)
const avatarUploading = ref(false)

// 表单数据
const form = reactive({
  username: '',
  contact: '',
  contactType: null,
  avatar: ''
})

// 头像URL计算属性
const avatarUrl = computed(() => {
  if (form.avatar) {
    return form.avatar
  }
  return userStore.userInfo?.avatar || '/images/avatar.png'
})

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 128, message: '用户名长度在 3 到 128 个字符', trigger: 'blur' }
  ],
  contact: [
    { required: true, message: '请输入联系方式', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (!form.contactType) {
          callback(new Error('请先选择联系类型'))
          return
        }
        
        if (form.contactType === 1) {
          // 邮箱验证
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(value)) {
            callback(new Error('请输入正确的邮箱地址'))
          } else {
            callback()
          }
        } else if (form.contactType === 2) {
          // 手机号验证
          const phoneRegex = /^1[3-9]\d{9}$/
          if (!phoneRegex.test(value)) {
            callback(new Error('请输入正确的手机号'))
          } else {
            callback()
          }
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  contactType: [
    { required: true, message: '请选择联系类型', trigger: 'change' }
  ]
}

// 初始化表单数据
const initForm = () => {
  if (userStore.userInfo) {
    form.username = userStore.userInfo.username || ''
    form.contact = userStore.userInfo.contact || ''
    form.contactType = userStore.userInfo.contactType || null
    form.avatar = userStore.userInfo.avatar || ''
  }
}

// 触发文件上传
const triggerUpload = () => {
  fileInput.value?.click()
}

// 处理头像文件选择
const handleAvatarChange = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  // 验证文件类型
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
  if (!allowedTypes.includes(file.type)) {
    ElMessage.error('只支持 JPG、PNG 格式的图片')
    return
  }

  // 验证文件大小（2MB）
  const maxSize = 2 * 1024 * 1024
  if (file.size > maxSize) {
    ElMessage.error('图片大小不能超过 2MB')
    return
  }

  try {
    avatarUploading.value = true
    ElMessage.info('正在上传头像...')

    // 上传头像
    const response = await uploadApi.uploadImage(file)
    
    // 更新头像URL
    form.avatar = response.url || response
    ElMessage.success('头像上传成功')
  } catch (error) {
    console.error('头像上传失败:', error)
    ElMessage.error('头像上传失败，请重试')
  } finally {
    avatarUploading.value = false
    // 清空文件输入框
    event.target.value = ''
  }
}

// 获取联系方式占位符
const getContactPlaceholder = () => {
  if (form.contactType === 1) {
    return '请输入邮箱地址'
  } else if (form.contactType === 2) {
    return '请输入手机号'
  }
  return '请先选择联系类型'
}

// 处理联系类型变化
const handleContactTypeChange = () => {
  // 清空联系方式，让用户重新输入
  form.contact = ''
  // 重新验证表单
  formRef.value?.validateField('contact')
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    loading.value = true
    
    const success = await userStore.updateUser(form)
    if (success) {
      ElMessage.success('个人信息更新成功')
      router.push('/profile')
    } else {
      ElMessage.error('个人信息更新失败')
    }
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    loading.value = false
  }
}

// 页面初始化
onMounted(async () => {
  // 获取最新的用户信息
  await userStore.fetchUserInfo()
  initForm()
})
</script>

<style scoped>
.edit-profile-view {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px 0;
}

.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  text-align: center;
}

.page-header h1 {
  font-size: 2rem;
  color: #333;
  margin: 0 0 10px 0;
}

.page-header p {
  color: #666;
  margin: 0;
  font-size: 1rem;
}

.edit-form-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 30px;
}

.form-section {
  margin-bottom: 30px;
}

.form-section:last-child {
  margin-bottom: 0;
}

.form-section h3 {
  font-size: 1.2rem;
  color: #333;
  margin: 0 0 20px 0;
  font-weight: 600;
  border-bottom: 2px solid #409eff;
  padding-bottom: 8px;
}

.edit-form {
  max-width: 100%;
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 40px;
  padding-top: 30px;
  border-top: 1px solid #f0f0f0;
}

.form-actions .el-button {
  min-width: 120px;
}

/* 头像上传样式 */
.avatar-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.avatar-preview {
  position: relative;
  display: inline-flex;
  width: 100px;
  height: 100px;
  cursor: pointer;
  border-radius: 50%;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
}

/* 确保 el-avatar 完全填充且保持圆形 */
.avatar-preview :deep(.el-avatar) {
  width: 100% !important;
  height: 100% !important;
  border-radius: 50% !important;
  display: block;
}
.avatar-preview :deep(.el-avatar .el-avatar__img) {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  display: block;
}
/* 移除边框避免白边 */
.avatar-image {
  border: 0;
}

.avatar-preview:hover .avatar-overlay {
  opacity: 1;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 50%;
}

.avatar-overlay .el-icon {
  font-size: 24px;
  margin-bottom: 5px;
}

.avatar-overlay span {
  font-size: 12px;
  font-weight: 500;
}

.avatar-tips {
  text-align: center;
  color: #666;
  font-size: 0.85rem;
}

.avatar-tips p {
  margin: 0;
  line-height: 1.4;
}

/* 移动端适配 */
@media (max-width: 768px) {
  ::v-deep(.el-button + .el-button) {
    margin-left: 0px;
  }
  .edit-profile-view, .container, .page-header, .edit-form-card {
    text-align: center;
  }
  .container {
    padding: 0 15px;
    max-width: 100%;
  }
  .page-header {
    padding: 20px;
  }
  .page-header h1 {
    font-size: 1.5rem;
  }
  .edit-form-card {
    padding: 20px;
    border-radius: 12px;
  }
  .form-section h3 {
    font-size: 1.1rem;
    padding-bottom: 6px;
  }
  .form-actions {
    flex-direction: column;
    gap: 15px;
  }
  .form-actions .el-button {
    width: 100%;
    height: 44px;
    font-size: 1rem;
  }
  /* 让每个表单项上下堆叠，水平居中 */
  .edit-form :deep(.el-form-item) {
    flex-direction: column;
    align-items: center;
  }
  .edit-form :deep(.el-form-item__label) {
    width: auto !important;
    min-width: 0;
    font-size: 0.95rem;
    line-height: 1.2;
    padding-right: 0;
    margin-bottom: 6px;
    text-align: center;
  }
  .edit-form :deep(.el-form-item__content) {
    margin-left: 0 !important;
    width: 100%;
    display: flex;
    justify-content: center;
  }
  .edit-form :deep(.el-input__wrapper),
  .edit-form :deep(.el-textarea__inner) {
    min-height: 42px;
    font-size: 16px;
  }
  .edit-form :deep(.el-input__inner) {
    font-size: 16px;
  }
  .edit-form :deep(.el-radio-group) {
    display: flex;
    justify-content: center;
  }
  .edit-form :deep(.el-radio) {
    margin-right: 14px;
  }
  .edit-form :deep(.el-radio__label) {
    font-size: 0.95rem;
  }
  /* 移动端头像大小与居中 */
  .avatar-upload {
    gap: 12px;
  }
  .avatar-preview {
    width: 110px;
    height: 110px;
    transform: none;
    margin: 0 auto;
  }
  .avatar-overlay .el-icon {
    font-size: 20px;
  }
  .avatar-overlay span {
    font-size: 11px;
  }
  .avatar-tips {
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  ::v-deep(.el-button + .el-button) {
    margin-left: 0px;
  }
  .page-header {
    padding: 15px;
  }
  .page-header h1 {
    font-size: 1.3rem;
  }
  .edit-form-card {
    padding: 15px;
  }
  /* 极小屏幕下继续保持表单项居中堆叠 */
  .edit-form :deep(.el-form-item__label) {
    font-size: 0.9rem;
  }
  .form-actions .el-button {
    height: 44px;
    font-size: 1rem;
  }
}
</style>
