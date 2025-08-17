<template>
  <div class="home-page">
    <!-- 首页轮播图 -->
    <el-carousel height="400px" class="home-carousel">
      <el-carousel-item v-for="item in 3" :key="item">
        <div class="carousel-item">
          <img 
            :src="`https://picsum.photos/id/${30 + item}/1400/400`" 
            alt="促销活动图片" 
            class="carousel-img"
          >
          <div class="carousel-overlay">
            <h2>限时优惠活动 {{ item }}</h2>
            <p>全场商品 {{ 9 - item }} 折起，立即抢购！</p>
            <el-button type="primary" size="large">立即查看</el-button>
          </div>
        </div>
      </el-carousel-item>
    </el-carousel>
    
    <!-- 热门商品区域 -->
    <div class="hot-products">
      <h2 class="section-title">热门商品</h2>
      <div class="products-grid">
        <!-- 商品卡片示例 -->
        <el-card class="product-card" v-for="i in 6" :key="i">
          <div class="product-image">
            <img :src="`https://picsum.photos/id/${50 + i}/300/200`" alt="商品图片" class="product-img">
          </div>
          <div class="product-info">
            <h3 class="product-name">虚拟商品 {{ i }}</h3>
            <p class="product-desc">高品质数字商品，自动发货</p>
            <div class="product-price">
              <span class="price">¥{{ (Math.random() * 100 + 10).toFixed(2) }}</span>
              <el-button type="primary" size="small" class="buy-btn">立即购买</el-button>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
// 首页逻辑
</script>

<style scoped>
.home-carousel {
  margin-bottom: 40px;
  border-radius: 8px;
  overflow: hidden;
}

.carousel-item {
  position: relative;
  height: 100%;
}

.carousel-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.carousel-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.3);
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 20px;
}

.carousel-overlay h2 {
  font-size: 32px;
  margin-bottom: 15px;
}

.carousel-overlay p {
  font-size: 18px;
  margin-bottom: 20px;
}

.section-title {
  font-size: 24px;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #165DFF;
  display: inline-block;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
}

.product-card {
  transition: transform 0.3s, box-shadow 0.3s;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.product-image {
  height: 160px;
  overflow: hidden;
}

.product-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.product-card:hover .product-img {
  transform: scale(1.05);
}

.product-info {
  padding: 15px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.product-name {
  font-size: 16px;
  margin-bottom: 8px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-desc {
  font-size: 13px;
  color: #666;
  margin-bottom: 15px;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-price {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  font-size: 18px;
  color: #F56C6C;
  font-weight: 600;
}

.buy-btn {
  min-width: 80px;
}
</style>
    