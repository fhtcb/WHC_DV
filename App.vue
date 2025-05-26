<script>
import { ref, computed } from 'vue'
import MainModule from './components/MainModule.vue'
import SmallModule1 from './components/SmallModule1.vue'
import SmallModule2 from './components/SmallModule2.vue'
import SmallModule3 from './components/SmallModule3.vue'
import SmallModule4 from './components/SmallModule4.vue'
import SmallModule5 from './components/SmallModule5.vue'
import RegionSelector from './components/RegionSelector.vue'
import TimeAxis from './components/TimeAxis.vue'
import sampleData from './components/data.json'

export default {
  components: { TimeAxis, RegionSelector, MainModule },
  setup() {
    const rawData = ref(sampleData)
    const selectedYear = ref(null)
    
    const filter = ref({
      yearRange: [1976, 2025],
      selectedRegions: []
    })

    const filteredData = computed(() => {
      return rawData.value.filter(item => 
        item.year >= filter.value.yearRange[0] &&
        item.year <= filter.value.yearRange[1] &&
        (filter.value.selectedRegions.length === 0 || 
         filter.value.selectedRegions.includes(item.region)))
    })

    const handleYearRangeChange = (newRange) => {
      filter.value.yearRange = newRange
    }

    const handleRegionChange = (regions) => {
      filter.value.selectedRegions = regions
    }

    const handleDataPointClick = (point) => {
      selectedYear.value = point.year
      if (!filter.value.selectedRegions.includes(point.region)) {
        filter.value.selectedRegions = [point.region]
      }
    }

    return {
      filter,
      filteredData,
      selectedYear,
      handleYearRangeChange,
      handleRegionChange,
      handleDataPointClick
    }
  }
}
</script>

<template>
  <div class="container">
    <!-- 上方区域 -->
    <div class="top-section">
      <!-- 左侧大模块 -->
      <div class="main-module">
        <MainModule 
            :data="filteredData"
            :selected-year="selectedYear"
            @point-click="handleDataPointClick"
        />
      </div>
      <!-- 右侧两个小模块 -->
      <div class="side-modules">
        <SmallModule1 title="Small Module 1" />
        <SmallModule2 title="Small Module 2" />
      </div>
    </div>

    <!-- 下方区域 -->
    <div class="bottom-section">
      <TimeAxis 
          v-model:year-range="filter.yearRange" 
          :selected-year="selectedYear"
          @update:year-range="handleYearRangeChange"
      />
      <RegionSelector 
          v-model:selected-regions="filter.selectedRegions"
          @update:selected-regions="handleRegionChange"
      />
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