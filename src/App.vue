<script setup>
import MainModule from './components/MainModule.vue'
import MainModule_DangerViewButton from './components/MainModule_DangerViewButton.vue'
import SmallModule1 from './components/SmallModule1.vue' // 左上大副图
import SmallModule2 from './components/SmallModule2.vue' // 右上大副图
import SmallModule3 from './components/SmallModule3.vue' // 左下小副图
import SmallModule4 from './components/SmallModule4.vue' // 底副图
import SmallModule5 from './components/SmallModule5.vue' // 右下小副图


</script>

<script>
export default {
  components: {
    MainModule_DangerViewButton,
    MainModule
  },
  data() {
    return {
      dangerMode: false
    };
  }
};
</script>
<template>
  <div class="dashboard-grid">
    <div class="big-side left"><SmallModule1 title="左大副图" /></div>
    <div class="main"><MainModule :dangerMode="dangerMode" /></div>
    <MainModule_DangerViewButton v-model:dangerMode="dangerMode" />
    <div class="big-side right"><SmallModule2 title="右大副图" /></div>
    <div class="small left"><SmallModule3 title="左下小副图" /></div>
    <div class="bottom"><SmallModule4 title="底副图" /></div>
    <div class="small right"><SmallModule5 title="右下小副图" /></div>
  </div>
</template>

<style scoped>
.dashboard-grid {
  display: grid;
  grid-template-columns: 1.2fr 2fr 1.2fr;
  grid-template-rows: 2fr 1.2fr;
  grid-template-areas:
    "bigsideleft main bigsideright"
    "smallleft bottom smallright";
  height: 100vh;
  width: 80vw;
  gap: 1rem;
  box-sizing: border-box;
  padding: 1rem;
}

.big-side.left    { grid-area: bigsideleft; display: flex; }
.big-side.right   { grid-area: bigsideright; display: flex; }
.main             { grid-area: main; display: flex; }
.bottom           { grid-area: bottom; display: flex; }
.small.left       { grid-area: smallleft; display: flex; }
.small.right      { grid-area: smallright; display: flex; }

.big-side, .main, .bottom, .small {
  background: #f9f9f9;
  border: 1px solid #ccc;
  padding: 1rem;
  min-width: 0;
  min-height: 0;
  justify-content: center;
  align-items: center;
}
</style>