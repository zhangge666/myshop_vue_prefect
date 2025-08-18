<template>
  <div class="change-password-view">
    <div class="container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1>修改密码</h1>
        <p>更新您的账户密码</p>
      </div>

      <!-- 修改密码表单 -->
      <div class="password-form-card">
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="120px"
          class="password-form"
        >
          <el-form-item label="原密码" prop="oldPassword">
            <el-input
              v-model="form.oldPassword"
              type="password"
              placeholder="请输入原密码"
              show-password
              maxlength="50"
            />
          </el-form-item>
          
          <el-form-item label="新密码" prop="newPassword">
            <el-input
              v-model="form.newPassword"
              type="password"
              placeholder="请输入新密码"
              show-password
              maxlength="50"
            />
            <div class="password-tips">
              <p>密码要求：</p>
              <ul>
                <li>长度至少6位</li>
                <li>建议包含字母、数字和特殊字符</li>
                <li>不能与原密码相同</li>
              </ul>
            </div>
          </el-form-item>
          
          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input
              v-model="form.confirmPassword"
              type="password"
              placeholder="请再次输入新密码"
              show-password
              maxlength="50"
            />
          </el-form-item>

          <!-- 操作按钮 -->
          <div class="form-actions">
            <el-button @click="$router.back()">取消</el-button>
            <el-button type="primary" @click="handleSubmit" :loading="loading">
              确认修改
            </el-button>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'

const router = useRouter()
const userStore = useUserStore()

// 响应式数据
const formRef = ref()
const loading = ref(false)

// 表单数据
const form = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 表单验证规则
const rules = {
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 个字符', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 个字符', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value === form.oldPassword) {
          callback(new Error('新密码不能与原密码相同'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== form.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    loading.value = true
    
    const success = await userStore.changePassword({
      oldPassword: form.oldPassword,
      newPassword: form.newPassword
    })
    
    if (success) {
      ElMessage.success('密码修改成功')
      router.push('/profile')
    } else {
      ElMessage.error('密码修改失败，请检查原密码是否正确')
    }
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.change-password-view {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px 0;
}

.container {
  max-width: 500px;
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

.password-form-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 30px;
}

.password-form {
  max-width: 100%;
}

.password-tips {
  margin-top: 8px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 4px;
  border-left: 3px solid #409eff;
}

.password-tips p {
  margin: 0 0 8px 0;
  font-size: 0.9rem;
  color: #333;
  font-weight: 500;
}

.password-tips ul {
  margin: 0;
  padding-left: 20px;
  color: #666;
  font-size: 0.85rem;
}

.password-tips li {
  margin-bottom: 4px;
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
  
  .password-form-card {
    padding: 20px;
  }
  
  .form-actions {
    flex-direction: column;
    gap: 15px;
  }
  
  .form-actions .el-button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .page-header {
    padding: 15px;
  }
  
  .page-header h1 {
    font-size: 1.3rem;
  }
  
  .password-form-card {
    padding: 15px;
  }
}
</style>
