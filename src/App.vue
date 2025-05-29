<template>
  <div class="dashboard-grid">
    <div class="area big-side left">
      <el-card shadow="hover" class="area-card">
        <SmallModule1 title="左大副图" />
      </el-card>
    </div>
    <div class="area main">
      <el-card shadow="hover" class="area-card">
        <MainModule_DangerViewButton v-model:dangerMode="dangerMode" style=" margin-left: 16px" />
        <MainModule :dangerMode="dangerMode " />
      </el-card>
    </div>
    <div class="area big-side right">
      <el-card shadow="hover" class="area-card">
        <SmallModule2 title="右大副图" />
      </el-card>
    </div>
    <div class="area small left">
      <el-card shadow="hover" class="area-card">
        <SmallModule3 title="左下小副图" />
      </el-card>
    </div>
    <div class="area bottom">
      <el-card shadow="hover" class="area-card">
        <SmallModule4 title="底副图" />
      </el-card>
    </div>
    <div class="area small right">
      <el-card shadow="hover" class="area-card">
        <SmallModule5 title="右下小副图" />
      </el-card>
    </div>
  </div>
</template>

<script setup>
import MainModule from './components/MainModule.vue'
import MainModule_DangerViewButton from './components/MainModule_DangerViewButton.vue'
import SmallModule1 from './components/SmallModule1.vue'
import SmallModule2 from './components/SmallModule2.vue'
import SmallModule3 from './components/SmallModule3.vue'
import SmallModule4 from './components/SmallModule4.vue'
import SmallModule5 from './components/SmallModule5.vue'
import { ref } from 'vue'

const dangerMode = ref(false)
</script>

<style scoped>
html, body, #app {
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
.dashboard-grid {
  display: grid;
  grid-template-columns: 1.2fr 2fr 1.2fr;
  grid-template-rows: 2fr 1.2fr;
  grid-template-areas:
    "bigsideleft main bigsideright"
    "smallleft bottom smallright";
  height: 100vh;
  width: 100vw;
  gap: 1rem;
  background: #040414e0;
  box-sizing: border-box;
  padding: 1rem;
}
.area-card {
  width: 100%;
  height: 100%;
  border: 1px solid #ccc;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.08);
  border-radius: 8px;
  background: #0a0a0a;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  position: relative;
}
::v-deep(.el-card__body) {
  height: 100%;
  padding: 0; /* 可选，去除内边距让内容更满 */
}

.area.big-side.left      { grid-area: bigsideleft; }
.area.main               { grid-area: main; }
.area.big-side.right     { grid-area: bigsideright; }
.area.small.left         { grid-area: smallleft; }
.area.bottom             { grid-area: bottom; }
.area.small.right        { grid-area: smallright; }
</style>