<script setup>
import MainModule from './components/MainModule.vue'
import SmallModule1 from './components/SmallModule1.vue'
import SmallModule2 from './components/SmallModule2.vue'
import SmallModule3 from './components/SmallModule3.vue'
import SmallModule4 from './components/SmallModule4.vue'
import SmallModule5 from './components/SmallModule5.vue'
</script>

<template>
  <div class="container">
    <!-- 上方区域 -->
    <div class="top-section">
      <!-- 左侧大模块 -->
      <div class="main-module">
        <MainModule />
      </div>
      <!-- 右侧两个小模块 -->
      <div class="side-modules">
        <SmallModule1 title="Small Module 1" />
        <SmallModule2 title="Small Module 2" />
      </div>
    </div>

    <!-- 下方区域 -->
    <div class="bottom-section">
      <SmallModule3 title="Small Module 3" />
      <SmallModule4 title="Small Module 4" />
      <SmallModule5 title="Small Module 5" />
    </div>
  </div>
</template>

<style scoped>
/* 主容器占满整个屏幕 */
.container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 100vh; /* 占据整个视口高度 */
  width: 100vw; /* 占据整个视口宽度 */
  box-sizing: border-box; /* 包括内边距和边框在内的宽高计算 */
  padding: 0;
  margin: 0;
}

/* 上方区域 */
.top-section {
  display: flex;
  flex: 2; /* 占据较大比例的高度 */
  gap: 1rem;
}

/* 左侧大模块 */
.main-module {
  flex: 2; 
  background-color: #f0f0f0;
  padding: 1rem;
  border: 1px solid #ccc;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 右侧两个小模块 */
.side-modules {
  flex: 1; 
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.side-modules > * {
  flex: 1; 
  background-color: #f9f9f9;
  padding: 1rem;
  border: 1px solid #ccc;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 下方区域 */
.bottom-section {
  display: flex;
  flex: 1; 
  gap: 1rem;
}

.bottom-section > * {
  flex: 1; 
  background-color: #f9f9f9;
  padding: 1rem;
  border: 1px solid #ccc;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>