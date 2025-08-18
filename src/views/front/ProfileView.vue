<template>
  <div class="profile-view">
    <div class="container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1>个人信息</h1>
        <p>查看和管理您的个人信息</p>
      </div>

      <!-- 个人信息卡片 -->
      <div class="profile-card">
        <div class="profile-header">
          <div class="avatar-section">
            <div class="avatar">
              <el-avatar :size="80" :src="getImageUrl(userInfo?.avatar)" icon="UserFilled" />
            </div>
            <div class="user-basic">
              <h2>{{ userInfo?.username || '用户名' }}</h2>
              <p class="user-id">ID: {{ userInfo?.id || '未知' }}</p>
            </div>
          </div>
          <div class="action-buttons">
            <el-button type="primary" @click="$router.push('/profile/edit')">
              <el-icon><Edit /></el-icon>
              编辑信息
            </el-button>
            <el-button @click="$router.push('/profile/password')">
              <el-icon><Lock /></el-icon>
              修改密码
            </el-button>
          </div>
        </div>

        <!-- 信息详情 -->
        <div class="profile-details">
                     <div class="detail-section">
             <h3>基本信息</h3>
             <div class="detail-grid">
               <div class="detail-item">
                 <span class="label">用户名：</span>
                 <span class="value">{{ userInfo?.username || '未设置' }}</span>
               </div>
               <div class="detail-item">
                 <span class="label">联系方式：</span>
                 <span class="value">{{ userInfo?.contact || '未设置' }}</span>
               </div>
               <div class="detail-item">
                 <span class="label">联系类型：</span>
                 <span class="value">{{ getContactTypeText(userInfo?.contactType) }}</span>
               </div>
               <div class="detail-item">
                 <span class="label">账户余额：</span>
                 <span class="value">¥{{ userInfo?.balance || '0.00' }}</span>
               </div>
             </div>
           </div>

          <div class="detail-section">
            <h3>账户信息</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="label">注册时间：</span>
                <span class="value">{{ formatTime(userInfo?.createTime) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">最后登录：</span>
                <span class="value">{{ formatTime(userInfo?.lastLoginTime) }}</span>
              </div>
                             <div class="detail-item">
                 <span class="label">账户状态：</span>
                 <span class="value">
                   <el-tag :type="userInfo?.enabled === 1 ? 'success' : 'danger'">
                     {{ userInfo?.enabled === 1 ? '正常' : '禁用' }}
                   </el-tag>
                 </span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>




  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Edit, Lock } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'
import { formatTime } from '@/utils/time'
import { getImageUrl } from '@/utils/image'

const userStore = useUserStore()



// 计算属性
const userInfo = computed(() => userStore.userInfo)

// 获取联系方式类型文本
const getContactTypeText = (type) => {
  const typeMap = {
    0: '未知',
    1: '邮箱',
    2: '手机号'
  }
  return typeMap[type] || '未知'
}





// 页面初始化
onMounted(async () => {
  // 获取最新的用户信息
  await userStore.fetchUserInfo()
})
</script>

<style scoped>
.profile-view {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px 0;
}

.container {
  max-width: 800px;
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

.profile-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30px;
  border-bottom: 1px solid #f0f0f0;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 20px;
}

.avatar {
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-basic h2 {
  font-size: 1.5rem;
  color: #333;
  margin: 0 0 5px 0;
}

.user-id {
  color: #666;
  font-size: 0.9rem;
  margin: 0;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.profile-details {
  padding: 30px;
}

.detail-section {
  margin-bottom: 30px;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.detail-section h3 {
  font-size: 1.2rem;
  color: #333;
  margin: 0 0 20px 0;
  font-weight: 600;
  border-bottom: 2px solid #409eff;
  padding-bottom: 8px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.detail-item {
  display: flex;
  align-items: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #409eff;
}

.detail-item .label {
  font-weight: 600;
  color: #333;
  min-width: 100px;
  margin-right: 10px;
}

.detail-item .value {
  color: #666;
  flex: 1;
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
  
  .profile-header {
    flex-direction: column;
    gap: 20px;
    padding: 20px;
  }
  
  .avatar-section {
    flex-direction: column;
    text-align: center;
  }
  
  .action-buttons {
    width: 100%;
    justify-content: center;
  }
  
  .action-buttons .el-button {
    flex: 1;
  }
  
  .profile-details {
    padding: 20px;
  }
  
  .detail-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .detail-item .label {
    min-width: auto;
    margin-right: 0;
  }
}

@media (max-width: 480px) {
  .page-header {
    padding: 15px;
  }
  
  .page-header h1 {
    font-size: 1.3rem;
  }
  
  .profile-header {
    padding: 15px;
  }
  
  .profile-details {
    padding: 15px;
  }
  
  .detail-section h3 {
    font-size: 1.1rem;
  }
}
</style>
