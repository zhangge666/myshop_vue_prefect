<template>
  <footer class="footer-container">
    <div class="footer-content">
      <!-- 桌面端显示完整列 -->
      <div class="footer-desktop">
        <div class="footer-columns">
          <!-- 关于我们 -->
          <div class="footer-column">
            <h3 class="column-title">关于我们</h3>
            <ul class="column-links">
              <li><a href="#">平台介绍</a></li>
              <li><a href="#">联系方式</a></li>
              <li><a href="#">加入我们</a></li>
              <li><a href="#">隐私政策</a></li>
            </ul>
          </div>

          <!-- 帮助中心 -->
          <div class="footer-column">
            <h3 class="column-title">帮助中心</h3>
            <ul class="column-links">
              <li><a href="#">购物指南</a></li>
              <li><a href="#">支付方式</a></li>
              <li><a href="#">常见问题</a></li>
              <li><a href="#">用户协议</a></li>
            </ul>
          </div>

          <!-- 支付方式 -->
          <div class="footer-column">
            <h3 class="column-title">支付方式</h3>
            <ul class="payment-methods">
              <li><el-icon><CreditCard /></el-icon> <span>微信支付</span></li>
              <li><el-icon><CreditCard /></el-icon> <span>支付宝</span></li>
              <li><el-icon><CreditCard /></el-icon> <span>银行卡</span></li>
            </ul>
          </div>

          <!-- 关注我们 -->
          <div class="footer-column">
            <h3 class="column-title">关注我们</h3>
            <div class="social-links">
              <a href="#" class="social-icon"><el-icon><ChatDotRound /></el-icon></a>
              <a href="#" class="social-icon"><el-icon><Share /></el-icon></a>
              <a href="#" class="social-icon"><el-icon><Star /></el-icon></a>
            </div>
          </div>
        </div>
      </div>

      <!-- 移动端简化显示 -->
      <div class="footer-mobile">
        <div class="mobile-essential-links">
          <a href="#">帮助中心</a>
          <a href="#">联系我们</a>
          <a href="#">隐私政策</a>
        </div>
        <div class="mobile-payment-info">
          <span>支持支付：微信、支付宝、银行卡</span>
        </div>
      </div>

      <!-- 版权信息（通用） -->
      <div class="copyright">
        © 2023 MyShop发卡商城 版权所有 | 备案号：XXICP备XXXX号
      </div>
    </div>
  </footer>
</template>

<script setup>
import { CreditCard, ChatDotRound, Share, Star } from '@element-plus/icons-vue'
</script>

<style scoped>
.footer-container {
  background-color: #f8f9fa;
  border-top: 1px solid #e9ecef;
  margin-top: 2rem;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem 1rem;
}

/* 桌面端样式 */
.footer-desktop {
  display: block;
}

.footer-columns {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.footer-column .column-title {
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 0.8rem;
  color: #333;
  padding-bottom: 6px;
  border-bottom: 2px solid #165DFF;
  display: inline-block;
}

.column-links, .payment-methods {
  list-style: none;
  padding: 0;
  margin: 0;
}

.column-links li, .payment-methods li {
  margin-bottom: 6px;
  font-size: 13px;
}

.column-links a {
  color: #666;
  text-decoration: none;
  transition: color 0.2s;
}

.column-links a:hover {
  color: #165DFF;
}

.payment-methods li {
  display: flex;
  align-items: center;
  color: #666;
}

.payment-methods el-icon {
  margin-right: 6px;
  color: #165DFF;
}

.social-links {
  display: flex;
  gap: 10px;
  margin-top: 0.5rem;
}

.social-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #e8f3ff;
  color: #165DFF;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.social-icon:hover {
  background-color: #165DFF;
  color: white;
}

/* 移动端样式 */
.footer-mobile {
  display: none;
  margin-bottom: 1rem;
}

.mobile-essential-links {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 0.8rem;
}

.mobile-essential-links a {
  color: #165DFF;
  text-decoration: none;
  font-size: 13px;
}

.mobile-payment-info {
  text-align: center;
  color: #666;
  font-size: 12px;
}

/* 版权信息 */
.copyright {
  text-align: center;
  color: #999;
  font-size: 12px;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

/* 响应式控制 */
@media (max-width: 768px) {
  /* 移动端隐藏多列布局，显示简化版本 */
  .footer-desktop {
    display: none;
  }
  
  .footer-mobile {
    display: block;
  }
}
</style>
