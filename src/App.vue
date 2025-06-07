<template>
  <div class="dashboard-grid">
    <div class="area big-side left">
      <el-card shadow="hover" class="area-card">
        <RegionBar :data="mainData" v-model:filter="filter" :dangerMode="dangerMode" />
      </el-card>
    </div>
    <div class="area main">
      <el-card shadow="hover" class="area-card">
        <MainModule_DangerViewButton v-model:dangerMode="dangerMode" style="margin-left: 16px" />
        <MainModule v-model:filter="filter" :dangerMode="dangerMode" :data="mainData" />
      </el-card>
    </div>
    <div class="area right-panel">
      <el-card shadow="hover" class="area-card">
        <Discription :data="mainData" v-model:filter="filter" />
      </el-card>
    </div>
    <div class="area small left">
      <el-card shadow="hover" class="area-card">
        <RelationGraph :dangerMode="dangerMode" :data="mainData" v-model:filter="filter" />
      </el-card>
    </div>
    <div class="area bottom">
      <el-card shadow="hover" class="area-card">
        <TimeAxis :data="mainData" v-model:filter="filter"/>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import MainModule from './components/MainModule.vue'
import MainModule_DangerViewButton from './components/MainModule_DangerViewButton.vue'
import RegionBar from './components/RegionBar.vue'
import RelationGraph from './components/RelationGraph.vue'
import Discription from './components/Discription.vue'
import TimeAxis from './components/TimeAxis.vue'
import { ref, onMounted } from 'vue'

const dangerMode = ref(false)
const mainData = ref([])
const filter = ref({//筛选器，会更改其他组件内容
    id_no: '', //选中点的id，只与主图和详细信息有关，mainData中的id_no字段
    region: [],//包括：Africa, Arab States，Asia and the Pacific，Europe and North America，Latin America and the Caribbean。其中只有4个遗产是地区的组合，所以是数组，支持多选。mainData中的region_en字段
    category: '',//包括：C, N, C/N。单选。mainData中的category_short字段
    detail_category: Array(10).fill(0),//数组，C1~N10，1为有，0为无。长度固定为10，对应C1-C6和N7-N10
    timeRange: [],//数组，包括起始时间与终止时间
    time: '',//时间点，只与主图和时间轴有关
    states_name_en: '', // 添加国家筛选字段
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
    "bigsideleft main rightpanel"
    "smallleft bottom rightpanel";
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
  box-shadow: 0 2px 12px 0 rgba(255, 255, 255, 0.5);
  overflow: hidden;
}

::v-deep(.el-card__body) {
  height: 100%;
  padding: 0;
  display: flex;
  flex-direction: column;
}

/* 确保所有子组件都能完全填充容器 */
::v-deep(.time-axis-container),
::v-deep(#mainchart),
::v-deep(.time-chart) {
  width: 100%;
  height: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 确保图表容器能够完全填充 */
::v-deep(.echarts-container) {
  width: 100%;
  height: 100%;
  flex: 1;
}

/* 确保滑块容器正确显示 */
::v-deep(.slider-container) {
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}

/* 确保所有区域都能正确填充 */
.area {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.area.big-side.left { grid-area: bigsideleft; }
.area.main { grid-area: main; }
.area.right-panel { grid-area: rightpanel; }
.area.small.left { grid-area: smallleft; }
.area.bottom { grid-area: bottom; }
</style>
