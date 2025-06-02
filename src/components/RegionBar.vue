<template>
  <div class="region-bar-container">
    <div ref="chartRef" class="chart-container"></div>
    
    <!-- 当前筛选状态显示 -->
    <div class="filter-status" v-if="currentFilter.region || currentFilter.category">
      <el-tag v-if="currentFilter.region" type="success" closable @close="clearRegionFilter">
        地区: {{ currentFilter.region }}
      </el-tag>
      <el-tag v-if="currentFilter.category" type="info" closable @close="clearCategoryFilter">
        类别: {{ categoryLabels[currentFilter.category] }}
      </el-tag>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed, nextTick } from 'vue';
import * as echarts from 'echarts';

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  filter: {
    type: Object,
    default: () => ({})
  }
});


const emit = defineEmits(['filterUpdate']);

const chartRef = ref(null);
let chartInstance = null;

// 地区列表
const regions = [
  'Africa',
  'Arab States',
  'Asia and the Pacific',
  'Europe and North America',
  'Latin America and the Caribbean'
];

// 类别标签
const categoryLabels = {
  'C': '文化遗产',
  'N': '自然遗产',
  'C/N': '混合遗产'
};

// 当前筛选状态
const currentFilter = ref({
  region: null,
  category: null
});

// 计算每个地区的遗产数量分布
const regionData = computed(() => {
  // 初始化数据
  const result = {
    cultural: Array(regions.length).fill(0),
    natural: Array(regions.length).fill(0),
    mixed: Array(regions.length).fill(0)
  };
  
  // 统计每个地区的遗产类别数量
  props.data.forEach(item => {
    const regionIndex = regions.indexOf(item.region_en);
    if (regionIndex === -1) return;
    
    switch(item.category_short) {
      case 'C':
        result.cultural[regionIndex]++;
        break;
      case 'N':
        result.natural[regionIndex]++;
        break;
      case 'C/N':
        result.mixed[regionIndex]++;
        break;
    }
  });
  
  return result;
});

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return;
  
  if (chartInstance) {
    chartInstance.dispose();
  }
  
  chartInstance = echarts.init(chartRef.value);
  
  updateChart();
  
  chartInstance.on('click', handleChartClick);
  chartInstance.on('mouseover', handleMouseOver);
  chartInstance.on('mouseout', handleMouseOut);
};

// 更新图表
const updateChart = () => {
  if (!chartInstance || !regionData.value) return;
  
  // 高亮状态
  const highlightSeriesIndex = currentFilter.value.category 
    ? { 
        'C': 0, 
        'N': 1, 
        'C/N': 2 
      }[currentFilter.value.category] 
    : null;
  
  const highlightDataIndex = currentFilter.value.region 
    ? regions.indexOf(currentFilter.value.region) 
    : null;
  
  // 图表配置
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      backgroundColor: 'rgba(20, 25, 50, 0.8)',
      borderColor: '#5d9cec',
      borderWidth: 1,
      textStyle: {
        color: '#e0e0ff'
      },
      formatter: (params) => {
        const region = params[0].name;
        let content = `<div><strong>${region}</strong></div>`;
        
        params.forEach(param => {
          const category = param.seriesName;
          const count = param.value;
          const percent = (count / params.reduce((sum, p) => sum + p.value, 0) * 100).toFixed(1);
          
          content += `<div style="margin-top: 5px">
            <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${param.color};margin-right:5px"></span>
            ${category}: <b>${count}</b> (${percent}%)
          </div>`;
        });
        
        return content;
      }
    },
    legend: {
      data: ['文化遗产', '自然遗产', '混合遗产'],
      textStyle: {
        color: '#a0a0d0'
      },
      selectedMode: false 
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: regions.map(r => r.replace(' and ', ' & ')),
      axisLine: {
        lineStyle: {
          color: '#5d9cec'
        }
      },
      axisLabel: {
        color: '#a0a0d0',
        interval: 0,
        rotate: 30
      },
      name: '地区',
      nameTextStyle: {
        color: '#a0a0d0'
      },
      axisPointer: {
        type: 'shadow'
      }
    },
    yAxis: {
      type: 'value',
      name: '遗产数量',
      axisLine: {
        lineStyle: {
          color: '#5d9cec'
        }
      },
      axisLabel: {
        color: '#a0a0d0'
      },
      nameTextStyle: {
        color: '#a0a0d0'
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(100, 100, 255, 0.1)'
        }
      }
    },
    series: [
      {
        name: '文化遗产',
        type: 'bar',
        stack: 'total',
        emphasis: {
          focus: 'series'
        },
        itemStyle: {
          color: '#5470c6'
        },
        data: regionData.value.cultural
      },
      {
        name: '自然遗产',
        type: 'bar',
        stack: 'total',
        emphasis: {
          focus: 'series'
        },
        itemStyle: {
          color: '#91cc75'
        },
        data: regionData.value.natural
      },
      {
        name: '混合遗产',
        type: 'bar',
        stack: 'total',
        emphasis: {
          focus: 'series'
        },
        itemStyle: {
          color: '#fac858'
        },
        data: regionData.value.mixed
      }
    ]
  };
  
  // 应用配置
  chartInstance.setOption(option, true);
  
  // 应用高亮状态
  if (highlightSeriesIndex !== null && highlightDataIndex !== null) {
    chartInstance.dispatchAction({
      type: 'highlight',
      seriesIndex: highlightSeriesIndex,
      dataIndex: highlightDataIndex
    });
  }
};

// 处理图表点击事件
const handleChartClick = (params) => {
  if (params.componentType === 'series') {
    const region = regions[params.dataIndex];
    const category = { 
      '文化遗产': 'C', 
      '自然遗产': 'N', 
      '混合遗产': 'C/N' 
    }[params.seriesName];
    
    // 如果点击的是已选中的部分，则取消选择
    if (currentFilter.value.region === region && currentFilter.value.category === category) {
      currentFilter.value.region = null;
      currentFilter.value.category = null;
    } else {
      currentFilter.value.region = region;
      currentFilter.value.category = category;
    }
    
    // 更新父组件的筛选器
    emit('filterUpdate', { 
      ...props.filter,
      region: currentFilter.value.region ? [currentFilter.value.region] : [],
      category: currentFilter.value.category || ''
    });
    
    // 更新图表
    updateChart();
  }
};

// 处理鼠标悬停事件
const handleMouseOver = (params) => {
  if (params.componentType === 'xAxis') {
    // 高亮整个柱子
    chartInstance.dispatchAction({
      type: 'highlight',
      seriesIndex: [0, 1, 2],
      dataIndex: params.dataIndex
    });
  } else if (params.componentType === 'series') {
    // 高亮单个堆叠部分（由echarts自动处理）
  }
};

// 处理鼠标移出事件
const handleMouseOut = (params) => {
  if (params.componentType === 'xAxis') {
    // 取消高亮
    chartInstance.dispatchAction({
      type: 'downplay',
      seriesIndex: [0, 1, 2],
      dataIndex: params.dataIndex
    });
  }
};

// 清除地区筛选
const clearRegionFilter = () => {
  currentFilter.value.region = null;
  emit('filterUpdate', { 
    ...props.filter,
    region: []
  });
  updateChart();
};

// 清除类别筛选
const clearCategoryFilter = () => {
  currentFilter.value.category = null;
  emit('filterUpdate', { 
    ...props.filter,
    category: ''
  });
  updateChart();
};

// 监听数据变化
watch(() => props.data, (newData) => {
  if (newData.length > 0) {
    nextTick(() => {
      updateChart();
    });
  }
}, { deep: true });

// 监听筛选器变化
watch(() => props.filter, (newFilter) => {
  // 更新当前筛选状态
  currentFilter.value.region = newFilter.region.length > 0 ? newFilter.region[0] : null;
  currentFilter.value.category = newFilter.category || null;
  
  // 更新图表高亮
  updateChart();
}, { deep: true });

// 组件挂载时初始化图表
onMounted(() => {
  nextTick(() => {
    initChart();
    
    // 处理窗口大小变化
    window.addEventListener('resize', () => {
      if (chartInstance) {
        chartInstance.resize();
      }
    });
  });
});
</script>

<style scoped>
.region-bar-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 10px;
}

.chart-container {
  flex: 1;
  width: 100%;
  min-height: 250px;
}

.filter-status {
  display: flex;
  gap: 10px;
  padding: 10px;
  justify-content: center;
}

.filter-status .el-tag {
  cursor: pointer;
}
</style>