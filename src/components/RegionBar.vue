<template>
  <div class="region-bar-container">
    <div ref="chartRef" class="chart-container"></div>
    
    <!-- 当前筛选状态显示 -->
    <div class="filter-status" v-if="currentFilter.region || currentFilter.category">
      <el-tag v-if="currentFilter.region" type="success" closable @close="clearRegionFilter">
        地区: {{ currentFilter.region }}
      </el-tag>
      <el-tag v-if="currentFilter.category && !props.dangerMode" type="info" closable @close="clearCategoryFilter">
        类别: {{ categoryLabels[currentFilter.category] }}
      </el-tag>
      <el-tag v-if="props.dangerMode" :type="currentFilter.category === 'danger' ? 'danger' : 'info'" closable @close="clearCategoryFilter">
        {{ currentFilter.category === 'danger' ? '濒危遗产' : '非濒危遗产' }}
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
  },
  dangerMode: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:filter']);

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

// 详细类别字段
const detailFields = [
  'C1', 'C2', 'C3', 'C4', 'C5', 'C6',
  'N7', 'N8', 'N9', 'N10'
];

// 当前筛选状态
const currentFilter = ref({
  region: null,
  category: null
});

// 计算是否应用了筛选条件
const filterApplied = computed(() => {
  return props.filter.timeRange && props.filter.timeRange.length === 2;
});

// 计算是否应用了详细类别筛选
const detailCategoryApplied = computed(() => {
  return props.filter.detail_category && 
         props.filter.detail_category.length === 10 &&
         props.filter.detail_category.some(v => v === 1);
});

// 计算每个地区的遗产数量分布（增加时间范围和详细类别筛选）
const regionData = computed(() => {
  // 初始化数据
  const result = {
    cultural: Array(regions.length).fill(0),
    natural: Array(regions.length).fill(0),
    mixed: Array(regions.length).fill(0),
    danger: Array(regions.length).fill(0),
    nonDanger: Array(regions.length).fill(0)
  };
  
  // 获取筛选条件
  const f = props.filter;
  
  // 统计每个地区的遗产类别数量（应用筛选条件）
  props.data.forEach(item => {
    // 添加国家筛选
    if (f.states_name_en) {
      if (item.states_name_en !== f.states_name_en) {
        return;
      }
    }
    
    // 1. 检查时间范围筛选
    if (Array.isArray(f.timeRange) && f.timeRange.length === 2) {
      const [startYear, endYear] = f.timeRange;
      const year = parseYear(item.date_inscribed);
      
      if (year === null || year < startYear || year > endYear) {
        return; // 跳过不符合时间范围的数据
      }
    }
    
    // 2. 检查详细类别筛选
    if (Array.isArray(f.detail_category) && f.detail_category.length === 10) {
      for (let i = 0; i < 10; i++) {
        if (f.detail_category[i] === 1) {
          const fieldName = detailFields[i];
          if (item[fieldName] !== 1) {
            return; // 跳过不符合详细类别筛选的数据
          }
        }
      }
    }
    
    // 3. 应用其他筛选条件（如果有）
    // 这里可以添加其他筛选条件
    
    // 通过所有筛选，进行计数
    const regionIndex = regions.indexOf(item.region_en);
    if (regionIndex === -1) return;
    
    // 标准模式：按类别计数
    if (!props.dangerMode) {
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
    } 
    // 危险模式：按危险状态计数
    else {
      if (item.danger === 1) {
        result.danger[regionIndex]++;
      } else {
        result.nonDanger[regionIndex]++;
      }
    }
  });
  
  return result;
});

// 辅助函数：解析年份
function parseYear(dateInscribed) {
  if (!dateInscribed) return null;
  
  // 尝试解析年份
  let year = dateInscribed;
  
  if (typeof year === 'string') {
    // 尝试从字符串中提取年份
    const yearMatch = year.match(/\d{4}/);
    if (yearMatch) {
      year = parseInt(yearMatch[0]);
    }
  }
  
  // 确保年份是有效的数字
  if (typeof year === 'number' && !isNaN(year)) {
    return year;
  }
  
  return null;
}

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
  if (!chartInstance) return;
  
  // 如果没有筛选条件，取消所有高亮
  if (!currentFilter.value.region && !currentFilter.value.category) {
    chartInstance.dispatchAction({
      type: 'downplay',
      seriesIndex: props.dangerMode ? [0, 1] : [0, 1, 2]
    });
  }
  
  // 高亮状态
  const highlightSeriesIndex = currentFilter.value.category 
    ? { 
        'C': 0, 
        'N': 1, 
        'C/N': 2,
        'danger': 0,
        'nonDanger': 1
      }[currentFilter.value.category] 
    : null;
  
  const highlightDataIndex = currentFilter.value.region 
    ? regions.indexOf(currentFilter.value.region) 
    : null;
  
  // 根据模式确定图表配置
  const option = props.dangerMode ? getDangerModeOption() : getStandardModeOption();
  
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

// 获取标准模式配置
const getStandardModeOption = () => {
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      backgroundColor: 'rgba(20, 25, 50, 0.9)',
      borderColor: '#5d9cec',
      borderWidth: 1,
      textStyle: {
        color: '#e0e0ff'
      },
      formatter: (params) => {
        const region = params[0].name;
        let content = `<div style="font-weight:bold;margin-bottom:10px;font-size:16px;">${region}</div>`;
        
        let total = 0;
        params.forEach(param => {
          total += param.value;
        });
        
        params.forEach(param => {
          const category = param.seriesName;
          const count = param.value;
          const percent = total > 0 ? (count / total * 100).toFixed(1) : 0;
          
          content += `<div style="display:flex;align-items:center;margin-bottom:5px;">
            <div style="width:12px;height:12px;border-radius:50%;background:${param.color};margin-right:8px;"></div>
            <div style="flex:1;">${category}:</div>
            <div style="font-weight:bold;width:40px;text-align:right;">${count}</div>
            <div style="width:50px;text-align:right;color:#a0a0ff;">(${percent}%)</div>
          </div>`;
        });
        
        // 添加筛选状态提示
        if (filterApplied.value || detailCategoryApplied.value) {
          content += `<div style="margin-top:10px;padding-top:8px;border-top:1px dashed rgba(100,120,255,0.3);color:#a0a0d0;font-size:12px;">`;
          
          if (filterApplied.value) {
            content += `时间范围: ${props.filter.timeRange[0]} - ${props.filter.timeRange[1]}<br>`;
          }
          
          if (detailCategoryApplied.value) {
            content += `已应用详细类别筛选`;
          }
          
          content += `</div>`;
        }
        
        return content;
      }
    },
    legend: {
      data: ['文化遗产', '自然遗产', '混合遗产'],
      textStyle: {
        color: '#a0a0d0'
      },
      selectedMode: false,
      itemGap: 20
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
        rotate: 30,
        fontSize: 12
      },
      name: '地区',
      nameTextStyle: {
        color: '#a0a0d0',
        fontSize: 12
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
        color: '#a0a0d0',
        fontSize: 12
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
          focus: 'series',
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(250, 200, 88, 0.8)'
          }
        },
        itemStyle: {
          color: '#fac858',
          borderRadius: [3, 3, 0, 0]
        },
        data: regionData.value.cultural
      },
      {
        name: '自然遗产',
        type: 'bar',
        stack: 'total',
        emphasis: {
          focus: 'series',
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(145, 204, 117, 0.8)'
          }
        },
        itemStyle: {
          color: '#91cc75',
          borderRadius: [3, 3, 0, 0]
        },
        data: regionData.value.natural
      },
      {
        name: '混合遗产',
        type: 'bar',
        stack: 'total',
        emphasis: {
          focus: 'series',
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(84, 112, 198, 0.8)'
          }
        },
        itemStyle: {
          color: '#66ccff',
          borderRadius: [3, 3, 0, 0]
        },
        data: regionData.value.mixed
      }
    ]
  };
};

// 获取危险模式配置
const getDangerModeOption = () => {
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      backgroundColor: 'rgba(20, 25, 50, 0.9)',
      borderColor: '#5d9cec',
      borderWidth: 1,
      textStyle: {
        color: '#e0e0ff'
      },
      formatter: (params) => {
        const region = params[0].name;
        let content = `<div style="font-weight:bold;margin-bottom:10px;font-size:16px;">${region}</div>`;
        
        let total = 0;
        params.forEach(param => {
          total += param.value;
        });
        
        params.forEach(param => {
          const category = param.seriesName;
          const count = param.value;
          const percent = total > 0 ? (count / total * 100).toFixed(1) : 0;
          
          content += `<div style="display:flex;align-items:center;margin-bottom:5px;">
            <div style="width:12px;height:12px;border-radius:50%;background:${param.color};margin-right:8px;"></div>
            <div style="flex:1;">${category}:</div>
            <div style="font-weight:bold;width:40px;text-align:right;">${count}</div>
            <div style="width:50px;text-align:right;color:#a0a0ff;">(${percent}%)</div>
          </div>`;
        });
        
        // 添加筛选状态提示
        if (filterApplied.value || detailCategoryApplied.value) {
          content += `<div style="margin-top:10px;padding-top:8px;border-top:1px dashed rgba(100,120,255,0.3);color:#a0a0d0;font-size:12px;">`;
          
          if (filterApplied.value) {
            content += `时间范围: ${props.filter.timeRange[0]} - ${props.filter.timeRange[1]}<br>`;
          }
          
          if (detailCategoryApplied.value) {
            content += `已应用详细类别筛选`;
          }
          
          content += `</div>`;
        }
        
        return content;
      }
    },
    legend: {
      data: ['濒危遗产', '非濒危遗产'],
      textStyle: {
        color: '#a0a0d0'
      },
      selectedMode: false,
      itemGap: 20
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
        rotate: 30,
        fontSize: 12
      },
      name: '地区',
      nameTextStyle: {
        color: '#a0a0d0',
        fontSize: 12
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
        color: '#a0a0d0',
        fontSize: 12
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(100, 100, 255, 0.1)'
        }
      }
    },
    series: [
      {
        name: '濒危遗产',
        type: 'bar',
        stack: 'total',
        emphasis: {
          focus: 'series',
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(235, 64, 52, 0.8)'
          }
        },
        itemStyle: {
          color: '#ee6666',
          borderRadius: [3, 3, 0, 0]
        },
        data: regionData.value.danger
      },
      {
        name: '非濒危遗产',
        type: 'bar',
        stack: 'total',
        emphasis: {
          focus: 'series',
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(150, 150, 150, 0.8)'
          }
        },
        itemStyle: {
          color: '#9da5b3',
          borderRadius: [3, 3, 0, 0]
        },
        data: regionData.value.nonDanger
      }
    ]
  };
};

// 处理图表点击事件
const handleChartClick = (params) => {
  if (params.componentType === 'series') {
    const region = regions[params.dataIndex];
    
    // 在危险模式下，仅设置地区筛选
    if (props.dangerMode) {
      // 如果点击的是已选中的地区，则取消选择
      if (currentFilter.value.region === region) {
        currentFilter.value.region = null;
      } else {
        currentFilter.value.region = region;
      }
      
      // 更新父组件的筛选器（只更新地区）
      emit('update:filter', { 
        ...props.filter,
        region: currentFilter.value.region ? [currentFilter.value.region] : []
      });
    } 
    // 在标准模式下，设置地区和类别
    else {
      const category = { 
        '文化遗产': 'C', 
        '自然遗产': 'N', 
        '混合遗产': 'C/N',
        '濒危遗产': 'danger',
        '非濒危遗产': 'nonDanger'
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
      emit('update:filter', { 
        ...props.filter,
        region: currentFilter.value.region ? [currentFilter.value.region] : [],
        category: currentFilter.value.category || ''
      });
    }
    
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
      seriesIndex: props.dangerMode ? [0, 1] : [0, 1, 2],
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
      seriesIndex: props.dangerMode ? [0, 1] : [0, 1, 2],
      dataIndex: params.dataIndex
    });
  }
};

// 清除地区筛选
const clearRegionFilter = () => {
  currentFilter.value.region = null;
  emit('update:filter', { 
    ...props.filter,
    region: []
  });
  updateChart();
};

// 清除类别筛选
const clearCategoryFilter = () => {
  currentFilter.value.category = null;
  emit('update:filter', { 
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
  
  // 如果筛选条件被清空，确保取消高亮
  if (!newFilter.region.length && !newFilter.category && chartInstance) {
    chartInstance.dispatchAction({
      type: 'downplay',
      seriesIndex: props.dangerMode ? [0, 1] : [0, 1, 2]
    });
  }
  
  // 更新图表高亮
  updateChart();
}, { deep: true });

// 监听危险模式变化
watch(() => props.dangerMode, () => {
  // 当模式切换时，重置类别筛选
  currentFilter.value.category = null;
  
  // 更新图表
  updateChart();
});

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
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.chart-container {
  flex: 1;
  min-height: 0;
  width: 100%;
  position: relative;
  padding-bottom: 40px;
}

.filter-status {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 8px;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  z-index: 10;
  max-height: 30%;
  overflow-y: auto;
}

.filter-status .el-tag {
  margin: 0;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 自定义滚动条样式 */
.filter-status::-webkit-scrollbar {
  width: 6px;
}

.filter-status::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

.filter-status::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.filter-status::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

.mode-indicator {
  position: absolute;
  top: 15px;
  right: 15px;
  z-index: 10;
}

.mode-indicator .el-tag {
  font-weight: bold;
  padding: 6px 12px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  background: rgba(235, 158, 52, 0.9);
  border: none;
}

.mode-indicator .el-tag.el-tag--danger {
  background: rgba(238, 102, 102, 0.9);
}
</style>