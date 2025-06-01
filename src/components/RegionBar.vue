<template>
  <div class="region-bar-container">
    <div class="mode-toggle">
    <button 
        :class="{ active: currentMode === 'type' }" 
        @click="changeMode('type')"
    >
    遗产类型
    </button>
    <button 
        :class="{ active: currentMode === 'endangered' }" 
        @click="changeMode('endangered')"
    >
        濒危状态
    </button>
    </div>
    
    <div class="legend">
      <div v-if="currentMode === 'type'" class="legend-items">
        <div class="legend-item" v-for="item in typeLegend" :key="item.name">
          <div class="color-box" :style="{ backgroundColor: item.color }"></div>
          <span>{{ item.name }}</span>
        </div>
      </div>
      <div v-else class="legend-items">
        <div class="legend-item" v-for="item in endangeredLegend" :key="item.name">
          <div class="color-box" :style="{ backgroundColor: item.color }"></div>
          <span>{{ item.name }}</span>
        </div>
      </div>
    </div>
    
    <div ref="chart" class="chart-container"></div>
  </div>
</template>

<script>
import * as echarts from 'echarts';

export default {
  name: 'RegionBar',
  
  props: {
    // 从父组件传入的数据
    heritageData: {
      type: Array,
      default: () => [],
      required: true
    },
    // 父组件选中的数据点
    selectedItem: {
      type: Object,
      default: null
    }
  },
  
  data() {
    return {
      currentMode: 'type', // 'type' 或 'endangered'
      chartInstance: null,
      typeLegend: [
        { name: '文化遗产', color: '#5470C6' },
        { name: '自然遗产', color: '#91CC75' },
        { name: '混合遗产', color: '#FAC858' }
      ],
      endangeredLegend: [
        { name: '濒危遗产', color: '#EE6666' },
        { name: '非濒危遗产', color: '#73C0DE' }
      ],
      regions: [
        'Africa', 
        'Asia and the Pacific', 
        'Europe and North America', 
        'Arab States', 
        'Latin America and the Caribbean', 
        'Asia and the Pacific,Europe and North America',
        'Asia and the Pacific,Europe and North America,Latin America and the Caribbean'
      ]
    };
  },
  
  computed: {
    chartData() {
      if (!this.heritageData.length) return null;
      
      const data = { series: [], categories: this.regions };
      
      if (this.currentMode === 'type') {
        // 按遗产类型统计
        const cultural = new Array(this.regions.length).fill(0);
        const natural = new Array(this.regions.length).fill(0);
        const mixed = new Array(this.regions.length).fill(0);
        
        this.heritageData.forEach(item => {
          const regionIndex = this.regions.indexOf(item.region);
          if (regionIndex !== -1) {
            if (item.type === 'Cultural') cultural[regionIndex]++;
            else if (item.type === 'Natural') natural[regionIndex]++;
            else if (item.type === 'Mixed') mixed[regionIndex]++;
          }
        });
        
        data.series = [
          { name: '文化遗产', type: 'bar', stack: 'total', data: cultural, color: '#5470C6' },
          { name: '自然遗产', type: 'bar', stack: 'total', data: natural, color: '#91CC75' },
          { name: '混合遗产', type: 'bar', stack: 'total', data: mixed, color: '#FAC858' }
        ];
      } else {
        // 按濒危状态统计
        const endangered = new Array(this.regions.length).fill(0);
        const notEndangered = new Array(this.regions.length).fill(0);
        
        this.heritageData.forEach(item => {
          const regionIndex = this.regions.indexOf(item.region);
          if (regionIndex !== -1) {
            if (item.endangered) endangered[regionIndex]++;
            else notEndangered[regionIndex]++;
          }
        });
        
        data.series = [
          { name: '濒危遗产', type: 'bar', stack: 'total', data: endangered, color: '#EE6666' },
          { name: '非濒危遗产', type: 'bar', stack: 'total', data: notEndangered, color: '#73C0DE' }
        ];
      }
      
      return data;
    }
  },
  
  watch: {
    heritageData: {
      deep: true,
      handler() {
        this.updateChart();
      }
    },
    // 当选中的数据点变化时更新高亮
    selectedItem(newVal) {
      this.highlightRegion(newVal ? newVal.region : null);
    },
    // 当模式变化时更新图表
    currentMode() {
      this.updateChart();
    }
  },
  
  mounted() {
    this.initChart();
    window.addEventListener('resize', this.handleResize);
  },
  
  beforeDestroy() {
    if (this.chartInstance) {
      this.chartInstance.dispose();
    }
    window.removeEventListener('resize', this.handleResize);
  },
  
  methods: {
    // 初始化图表
    initChart() {
      this.chartInstance = echarts.init(this.$refs.chart);
      this.updateChart();
      
      // 监听图表点击事件
      this.chartInstance.on('click', (params) => {
        if (params.componentType === 'series' && params.seriesType === 'bar') {
          const region = this.regions[params.dataIndex];
          this.$emit('region-selected', region);
        }
      });
    },
    
    // 更新图表数据
    updateChart() {
      if (!this.chartInstance || !this.chartData) return;
      
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: (params) => {
            const region = this.regions[params[0].dataIndex];
            let result = `<div style="margin-bottom:5px;font-weight:bold">${region}</div>`;
            let total = 0;
            
            params.forEach(param => {
              result += `<div>
                <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${param.color};margin-right:5px"></span>
                ${param.seriesName}: ${param.value}
              </div>`;
              total += param.value;
            });
            
            result += `<div style="margin-top:5px;font-weight:bold">总计: ${total}</div>`;
            return result;
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          top: '5%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: this.chartData.categories,
          axisLabel: {
            interval: 0,
            rotate: 25,
            margin: 15,
            fontSize: 12
          }
        },
        yAxis: {
          type: 'value',
          name: '遗产数量',
          nameTextStyle: {
            padding: [0, 0, 0, 30]
          }
        },
        series: this.chartData.series
      };
      
      this.chartInstance.setOption(option, true);
      this.highlightRegion(this.selectedItem ? this.selectedItem.region : null);
    },
    
    // 高亮特定地区
    highlightRegion(region) {
      if (!this.chartInstance) return;
      
      if (region) {
        const regionIndex = this.regions.indexOf(region);
        if (regionIndex !== -1) {
          // 高亮对应的柱子
          this.chartInstance.dispatchAction({
            type: 'highlight',
            seriesIndex: [0, 1, 2],
            dataIndex: regionIndex
          });
          
          this.chartInstance.setOption({
            series: this.chartData.series.map(series => {
              return {
                ...series,
                itemStyle: {
                  emphasis: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                  }
                }
              };
            })
          });
          
          this.chartInstance.dispatchAction({
            type: 'showTip',
            seriesIndex: 0,
            dataIndex: regionIndex
          });
          
          return;
        }
      }
      
      this.chartInstance.dispatchAction({
        type: 'downplay',
        seriesIndex: [0, 1, 2]
      });
    },
    
    // 切换显示模式
    changeMode(mode) {
      this.currentMode = mode;
    },
    
    handleResize() {
      if (this.chartInstance) {
        this.chartInstance.resize();
      }
    }
  }
};
</script>

<style scoped>
.region-bar-container {
  width: 100%;
  height: 100%;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h2 {
  margin: 0;
  font-size: 1.4rem;
  color: #2c3e50;
  font-weight: 600;
}

.mode-toggle {
  display: flex;
  background: #f5f7fa;
  border-radius: 30px;
  padding: 4px;
}

.mode-toggle button {
  padding: 8px 16px;
  border: none;
  background: transparent;
  border-radius: 30px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.mode-toggle button.active {
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  color: #3498db;
  font-weight: 600;
}

.mode-toggle button:not(.active):hover {
  background: rgba(255, 255, 255, 0.6);
}

.legend {
  margin-bottom: 15px;
}

.legend-items {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.legend-item {
  display: flex;
  align-items: center;
  font-size: 0.85rem;
}

.color-box {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  margin-right: 6px;
}

.chart-container {
  width: 100%;
  height: 400px;
  flex-grow: 1;
}
</style>