<template>
  <div class="dashboard-grid">
    <div class="area big-side left">
      <el-card shadow="hover" class="area-card">
        <RegionBar :data="mainData" :filter="filter" />
      </el-card>
    </div>
    <div class="area main">
      <el-card shadow="hover" class="area-card">
        <MainModule_DangerViewButton v-model:dangerMode="dangerMode" style=" margin-left: 16px" />
        <MainModule v-model:filter="filter":dangerMode="dangerMode " :data="mainData"  />
      </el-card>
    </div>
    <div class="area big-side right">
      <el-card shadow="hover" class="area-card">
        <SmallModule2 :data="mainData" :filter="filter" />
      </el-card>
    </div>
    <div class="area small left">
      <el-card shadow="hover" class="area-card">
        <RelationGraph :data="mainData" :filter="filter" />
      </el-card>
    </div>
    <div class="area bottom">
      <el-card shadow="hover" class="area-card">
        <TimeAxis :data="mainData" :filter="filter"/>
      </el-card>
    </div>
    <div class="area small right">
      <el-card shadow="hover" class="area-card">
        <SmallModule5 :data="mainData" :filter="filter" />
      </el-card>
    </div>
  </div>
</template>

<script setup>
import MainModule from './components/MainModule.vue'
import MainModule_DangerViewButton from './components/MainModule_DangerViewButton.vue'
import RegionBar from './components/RegionBar.vue'
import SmallModule2 from './components/SmallModule2.vue'
import RelationGraph from './components/RelationGraph.vue'
import SmallModule5 from './components/SmallModule5.vue'
import TimeAxis from './components/TimeAxis.vue'
import { ref, onMounted } from 'vue'

const dangerMode = ref(false)
const mainData = ref([])

const filter = ref({//筛选器，会更改其他组件内容
    id_no: '', //选中点的id，只与主图和详细信息有关，mainData中的id_no字段
    region: [],//包括：Africa, Arab States，Asia and the Pacific，Europe and North America，Latin America and the Caribbean。其中只有4个遗产是地区的组合，所以是数组，支持多选。mainData中的region_en字段
    category: '',//包括：C, N, C/N。单选。mainData中的category_short字段
    detail_category: [],//数组，C1~N10，1为有，0为无。
    timeRange: [],//数组，包括起始时间与终止时间
    time: '',//时间点，只与主图和时间轴有关
})



onMounted(async () => {
  const ROOT_PATH = '/';

  fetch(ROOT_PATH + 'data/data.json')
        .then((response) => response.json())
        .then((rawData) => {
          mainData.value = rawData;
          console.log('Main data loaded:', mainData.value);
        });
})

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
  box-shadow: 0 2px 12px 0 rgba(255, 255, 255)
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