<template>
  <div class="time-axis-container">
    <!-- 折线图容器 -->
    <div ref="chartRef" class="time-chart"></div>
    
    <!-- 时间轴滑块 -->
    <div class="slider-container">
      <el-slider
        v-model="localTimeRange"
        range
        :min="minYear"
        :max="maxYear"
        :step="1"
        @change="handleTimeRangeChange"
        style="width: 100%"
      />
      <div class="year-markers">
        <span class="year-marker">{{ localTimeRange[0] }}</span>
        <span class="year-marker">{{ localTimeRange[1] }}</span>
      </div>
      
      <!-- 当前时间点标记 -->
      <div 
        v-if="filter.time" 
        class="time-indicator"
        :style="timeIndicatorPosition"
      >
        {{ filter.time }}
      </div>
    </div>
    
    <!-- 数据缩放提示 -->
    <div v-if="zoomRange" class="zoom-hint">
      当前查看: {{ zoomRange[0] }} - {{ zoomRange[1] }}
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed, nextTick } from 'vue';
import * as echarts from 'echarts';

// 定义组件属性
const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  filter: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update:filter']);

const chartRef = ref(null);
let chartInstance = null;


const minYear = 1976;
const maxYear = 2025;
const localTimeRange = ref([minYear, maxYear]);
const zoomRange = ref(null);


const detailFields = [
  'C1', 'C2', 'C3', 'C4', 'C5', 'C6',
  'N7', 'N8', 'N9', 'N10'
];


const categoryLabels = {
  'C': '文化遗产',
  'N': '自然遗产',
  'C/N': '混合遗产'
};


// 处理时间范围变化
const handleTimeRangeChange = (newRange) => {
  // 更新timeRange
  const newFilter = {
    ...props.filter,
    timeRange: [...newRange]
  };

  emit('update:filter', newFilter);

  updateChart();
};

// 计算当前时间点的位置
const timeIndicatorPosition = computed(() => {
  if (!props.filter.time) return {};
  
  const [start, end] = localTimeRange.value;
  const position = ((props.filter.time - start) / (end - start)) * 100;
  
  return {
    left: `${position}%`,
    transform: `translateX(-${position}%)`
  };
});

// 应用筛选条件
const applyFilters = (items) => {
  const f = props.filter;
  
  return items.filter(item => {
    // 添加国家筛选
    if (f.states_name_en) {
      if (item.states_name_en !== f.states_name_en) {
        return false;
      }
    }

    // 1. 地区筛选
    if (Array.isArray(f.region) && f.region.length > 0) {
      if (!f.region.includes(item.region_en)) {
        return false;
      }
    }
    
    // 2. 类别筛选
    if (f.category) {
      if (item.category_short !== f.category) {
        return false;
      }
    }
    
    // 3. 详细类别筛选
    if (Array.isArray(f.detail_category) && f.detail_category.length === 10) {
      for (let i = 0; i < 10; i++) {
        if (f.detail_category[i] === 1) {
          const fieldName = detailFields[i];
          if (item[fieldName] !== 1) {
            return false;
          }
        }
      }
    }
    
    return true;
  });
};

// 提取年份数据并计算每年的遗产数量
const getYearlyCounts = () => {
  const counts = {};
  
  // 应用筛选条件
  const filteredData = applyFilters(props.data);
  
  filteredData.forEach(item => {
    // 处理年份数据
    let year = item.date_inscribed;
    
    // 处理不同年份格式
    if (typeof year === 'string') {
      // 字符串
      const yearMatch = year.match(/\d{4}/);
      if (yearMatch) {
        year = parseInt(yearMatch[0]);
      }
    }
    // 数字
    if (typeof year === 'number' && !isNaN(year) && year >= minYear && year <= maxYear) {
      counts[year] = (counts[year] || 0) + 1;
    }
  });
  
  return counts;
};

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return;
  if (chartInstance) {
    chartInstance.dispose();
  }
  
  chartInstance = echarts.init(chartRef.value);
  updateChart();
  
  // 监听图表缩放事件
  chartInstance.on('datazoom', (params) => {
    if (params.batch && params.batch[0]) {
      const { start, end } = params.batch[0];
      
      // 计算实际的年份范围
      const allYears = Object.keys(getYearlyCounts()).map(Number).sort();
      const totalYears = allYears.length;
      
      if (totalYears > 0) {
        const startIndex = Math.floor(start / 100 * totalYears);
        const endIndex = Math.ceil(end / 100 * totalYears) - 1;
        
        zoomRange.value = [
          allYears[Math.max(0, startIndex)],
          allYears[Math.min(totalYears - 1, endIndex)]
        ];
      }
    }
  });
  
  // 监听图表缩放结束事件
  chartInstance.on('datazoomend', () => {
    setTimeout(() => {
      zoomRange.value = null;
    }, 2000);
  });
};

// 更新图表数据
const updateChart = () => {
  if (!chartInstance) return;
  
  const [startYear, endYear] = localTimeRange.value;
  
  // 计算每年的遗产数量
  const yearlyCounts = getYearlyCounts();
  
  // 生成折线图数据
  const years = [];
  const counts = [];
  for (let year = startYear; year <= endYear; year++) {
    years.push(year);
    counts.push(yearlyCounts[year] || 0);
  }
  
  // 高亮当前时间点的数据
  const highlightData = [];
  if (props.filter.time && years.includes(parseInt(props.filter.time))) {
    const highlightYear = parseInt(props.filter.time);
    highlightData.push({
      name: highlightYear.toString(),
      value: [highlightYear, yearlyCounts[highlightYear] || 0],
      symbolSize: 12,
      itemStyle: {
        color: '#ee6666'
      }
    });
  }
  
  // 图表配置
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        const year = params.value[0];
        const count = params.value[1];
        
        let content = `
          <div style="font-weight:bold;font-size:16px;color:#5470c6;margin-bottom:5px">
            ${year}年
          </div>
          <div style="display:flex;align-items:center;">
            <div style="width:10px;height:10px;background:#5470c6;border-radius:50%;margin-right:8px"></div>
            遗产数量: <b style="margin-left:5px;font-size:18px">${count}</b>
          </div>
        `;
        
        return content;
      },
      backgroundColor: 'rgba(10, 15, 35, 0.95)',
      borderColor: '#5470c6',
      borderWidth: 1,
      textStyle: {
        color: '#fff',
        fontSize: 14
      },
      extraCssText: `
        box-shadow: 0 0 15px rgba(80, 120, 255, 0.6);
        border-radius: 8px;
        padding: 15px;
      `
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '20%', // 增加底部空间用于dataZoom
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: years,
      name: '年份',
      nameLocation: 'middle',
      nameGap: 30,
      min: startYear, // 明确设置最小值
      max: endYear,   // 明确设置最大值
      axisLine: {
        lineStyle: {
          color: '#a0a0d0'
        }
      },
      axisLabel: {
        color: '#a0a0d0',
        interval: Math.ceil(years.length / 10), // 避免标签重叠
        rotate: years.length > 15 ? 45 : 0 // 年份多时旋转标签
      }
    },
    yAxis: {
      type: 'value',
      name: '遗产数量',
      minInterval: 1,
      axisLine: {
        lineStyle: {
          color: '#a0a0d0'
        }
      },
      axisLabel: {
        color: '#a0a0d0',
        formatter: '{value}'
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(200, 200, 255, 0.1)'
        }
      }
    },
    series: [
      {
        name: '遗产数量',
        type: 'line',
        data: years.map((year, index) => [year, counts[index]]),
        smooth: true,
        lineStyle: {
          width: 3,
          color: '#5470c6'
        },
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: {
          color: '#5470c6',
          borderColor: '#fff',
          borderWidth: 1
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(84, 112, 198, 0.5)' },
            { offset: 1, color: 'rgba(84, 112, 198, 0.1)' }
          ])
        },
        emphasis: {
          focus: 'series',
          itemStyle: {
            borderWidth: 2,
            borderColor: '#fff',
            shadowBlur: 10,
            shadowColor: 'rgba(84, 112, 198, 0.8)'
          }
        }
      },
      {
        name: '当前时间点',
        type: 'scatter',
        data: highlightData,
        symbol: 'circle',
        symbolSize: 14,
        zlevel: 10,
        itemStyle: {
          color: '#ee6666',
          borderColor: '#fff',
          borderWidth: 2
        }
      }
    ],
    // 数据缩放功能
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100,
        xAxisIndex: [0],
        zoomLock: false,
        zoomOnMouseWheel: true
      },
      {
        type: 'slider',
        show: true,
        xAxisIndex: [0],
        start: 0,
        end: 100,
        bottom: 10,
        height: 20,
        backgroundColor: 'rgba(30, 30, 50, 0.3)',
        borderColor: 'transparent',
        fillerColor: 'rgba(80, 120, 255, 0.3)',
        brushSelect: false,
        showDetail: true, // 显示缩放过程中的详情
        handleStyle: {
          color: '#5470c6',
          borderColor: '#fff',
          borderWidth: 1
        },
        textStyle: {
          color: '#a0a0d0'
        }
      }
    ]
  };
  
  chartInstance.setOption(option, true); // 使用true参数强制重新渲染
  chartInstance.resize(); // 确保图表正确调整大小
};

// 监听数据变化
watch(() => props.data, (newData) => {
  if (newData && newData.length > 0) {
    nextTick(() => {
      if (!chartInstance) {
        initChart();
      } else {
        updateChart();
      }
    });
  }
}, { deep: true });

// 监听filter.time变化
watch(() => props.filter.time, () => {
  if (chartInstance) {
    updateChart();
  }
});

// 监听filter.timeRange变化
watch(() => props.filter.timeRange, (newRange) => {
  if (newRange && newRange.length === 2) {
    // 确保新范围有效
    const validStart = Math.max(minYear, newRange[0]);
    const validEnd = Math.min(maxYear, newRange[1]);
    
    // 只有当范围确实变化时才更新
    if (validStart !== localTimeRange.value[0] || validEnd !== localTimeRange.value[1]) {
      localTimeRange.value = [validStart, validEnd];
      nextTick(updateChart);
    }
  }
}, { deep: true });

// 监听其他筛选条件变化
watch(() => [
  props.filter.region,
  props.filter.category,
  props.filter.detail_category
], () => {
  if (chartInstance) {
    updateChart();
  }
}, { deep: true });

// 组件挂载时初始化
onMounted(() => {
  // 如果filter中有初始时间范围，则使用它
  if (props.filter.timeRange && props.filter.timeRange.length === 2) {
    localTimeRange.value = [...props.filter.timeRange];
  }
  
  // 确保DOM完全渲染后初始化图表
  nextTick(() => {
    initChart();
    
    // 添加窗口大小变化监听
    window.addEventListener('resize', () => {
      if (chartInstance) {
        chartInstance.resize();
      }
    });
  });
});
</script>

<style scoped>
.time-axis-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 10px;
  box-sizing: border-box;
  background: rgba(15, 20, 40, 0.7);
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}

.time-chart {
  width: 100%;
  height: 70%;
  min-height: 200px;
}

.slider-container {
  position: relative;
  padding: 20px 30px 0;
  margin-top: 10px;
  background: rgba(30, 30, 50, 0.3);
  border-radius: 8px;
}

.year-markers {
  display: flex;
  justify-content: space-between;
  margin-top: 5px;
  font-size: 12px;
  color: #a0a0d0;
}

.time-indicator {
  position: absolute;
  top: -25px;
  background: #ee6666;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  transform: translateX(-50%);
  white-space: nowrap;
  z-index: 10;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.4);
  font-weight: bold;
}

.time-indicator::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-width: 6px;
  border-style: solid;
  border-color: #ee6666 transparent transparent transparent;
}

.zoom-hint {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(84, 112, 198, 0.8);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
  z-index: 10;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3);
  animation: fadeIn 0.3s;
}

.filter-hint {
  position: absolute;
  top: 20px;
  left: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 10;
}

.filter-hint .el-tag {
  font-weight: bold;
  padding: 6px 12px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  background: rgba(235, 158, 52, 0.9);
  border-color: #ffb347;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>