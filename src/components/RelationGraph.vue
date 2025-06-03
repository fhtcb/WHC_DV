<template>
  <div class="graph-container">
    <div id="smallModule3" ref="chartContainer"></div>
    <button class="clear-btn" @click="clearSelection">清空选择</button>
  </div>
</template>

<script>
import * as echarts from 'echarts';
import { onMounted, ref, watch } from 'vue';

export default {
  name: 'RelationGraph',
  props: {
    filter: Object,
    dangerMode: Boolean,
    data: Array
  },
  emits: ['update:filter'],
  setup(props, { emit }) {
    const chartContainer = ref(null);
    const myChart = ref(null);  
    const index = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'N7', 'N8', 'N9', 'N10']
    var relationMat = Array(10).fill().map(() => Array(10).fill(0));
    var graphData = {}

    function generateData(){
  console.log('generateData from props.data')
  
  // 重置关系矩阵
  relationMat = Array(10).fill().map(() => Array(10).fill(0));
  
  // 处理props.data中的每条数据
  props.data.forEach(item => {
    // 检查region筛选
    const regionMatch = props.filter.region.length === 0 || 
                      (item.region_en && props.filter.region[0] === item.region_en);
    
    // 检查category筛选
    const categoryMatch = !props.filter.category || 
                        item.category_short === props.filter.category;
    
    // 检查timeRange筛选
    let timeMatch = true;
    if (props.filter.timeRange && props.filter.timeRange.length === 2) {
      const [startYear, endYear] = props.filter.timeRange;
      const inscribedYear = parseInt(item.date_inscribed) || 0;
      
      // 检查主要日期是否在范围内
      const mainDateInRange = inscribedYear >= startYear && inscribedYear <= endYear;
      
      timeMatch = mainDateInRange;
    }
    
    // 检查detail_category筛选
    const detailCategoryMatch = props.filter.detail_category.every(
      (filterVal, idx) => filterVal !== 1 || item[index[idx]] === 1
    );
    
    // 所有筛选条件都满足才计入统计
    if (regionMatch && categoryMatch && timeMatch && detailCategoryMatch) {
      for (let i = 0; i < 10; i++) {
        if (item[index[i]] === 1) {
          relationMat[i][i] += 1;  // 节点自身出现次数
          for (let j = i + 1; j < 10; j++) {
            if (item[index[j]] === 1) {
              relationMat[i][j] += 1;  // 共同出现次数
              relationMat[j][i] += 1;
            }
          }
        }
      }
    }
  });
  
  console.log('relationMat', relationMat)
  
  // 找出非零节点的最大出现次数，用于计算相对大小
  const maxCount = Math.max(...relationMat.map(row => row[row.indexOf(Math.max(...row))]));
  
  // 过滤掉数量为0的节点
  const validNodes = index.map((id, i) => ({
    id: id,
    category: index.indexOf(id),  // 使用节点在 index 数组中的位置作为类别
    symbolSize: relationMat[i][i] > 0 ? 20 + (relationMat[i][i] / maxCount) * 30 : 0,
    name: id,
    value: relationMat[i][i]  // 添加原始值用于显示
  })).filter(node => node.symbolSize > 0);
  
  // 生成有效节点之间的连接
  const validLinks = [];
  for (let i = 0; i < 10; i++) {
    if (relationMat[i][i] === 0) continue;  // 跳过数量为0的节点
    for (let j = i + 1; j < 10; j++) {
      if (relationMat[j][j] === 0) continue;  // 跳过数量为0的节点
      if (relationMat[i][j] > 0) {
        validLinks.push({
          source: index[i],
          target: index[j],
          value: relationMat[i][j],
          lineStyle: {
            width: 2 + (relationMat[i][j] / maxCount) * 8,
            opacity: 0.6 + (relationMat[i][j] / maxCount) * 0.4,
            curveness: 0.1,
            shadowColor: 'rgba(0, 0, 0, 0.3)',
            shadowBlur: 2
          }
        });
      }
    }
  }
  
  graphData = {
    nodes: validNodes,
    links: validLinks,
    categories: index.map((id, i) => ({
      name: id
    }))
  };
  
  console.log('graphData', graphData)
  initChart();
}

    function generateLinks() {
      const links = [];
      for (let i = 0; i < 10; i++) {
        for (let j = i + 1; j < 10; j++) {
          if (relationMat[i][j] > 0) {  // 只添加有共同出现的链接
            links.push({
              source: index[i],
              target: index[j],
              value: relationMat[i][j] + 1,
              lineStyle: {
                width: relationMat[i][j] / 100 + 1
              }
            });
          }
        }
      }
      return links;
    }

    // 初始化或更新图表
    function initChart() {
      console.log('initChart')
      if (!myChart.value) {
        myChart.value = echarts.init(chartContainer.value);
        setupChartEvents();
      }
      updateChart();
    }
    
    // 更新图表选项
    function updateChart() {
      console.log('updateChart')
      myChart.value.showLoading();
      const option = {
        tooltip: {
          padding: 12,
          textStyle: {
            fontSize: 20
          },
          formatter: function(params) {
            if (params.dataType === 'node') {
              return `<div style="font-weight:bold;color:#5470c6;font-size:16px;margin-bottom:8px;">
                        ${params.data.name}类别
                      </div>
                      <div style="display:flex;justify-content:space-between;margin:5px 0;">
                        <span>出现次数:</span>
                        <span style="font-weight:bold;color:#91cc75;">${params.data.value}</span>
                      </div>`;
            } else if (params.dataType === 'edge') {
              return `<div style="font-weight:bold;color:#5470c6;font-size:16px;margin-bottom:8px;">
                        共同出现关系
                      </div>
                      <div style="margin:5px 0;">
                        ${params.data.source} ↔ ${params.data.target}
                      </div>
                      <div style="display:flex;justify-content:space-between;margin:5px 0;">
                        <span>共同出现次数:</span>
                        <span style="font-weight:bold;color:#91cc75;">${params.data.value}</span>
                      </div>`;
            }
          }
        },
        color: [
          '#5470c6',  // 蓝色
          '#91cc75',  // 绿色
          '#fac858',  // 黄色
          '#ee6666',  // 红色
          '#73c0de',  // 浅蓝
          '#3ba272',  // 深绿
          '#fc8452',  // 橙色
          '#9a60b4',  // 紫色
          '#ea7ccc',  // 粉色
          '#c23531'   // 深红
        ],
        series: [
          {
            name: '',
            type: 'graph',
            layout: 'force',
            force: {
              repulsion: 100,
              gravity: 1,
              edgeLength: 200,
              friction: 0.1,
              layoutAnimation: true
            },
            draggable: true,
            data: graphData.nodes,
            links: graphData.links,
            categories: graphData.categories,
            roam: true,
            label: {
              show: true,
              position: 'right',
              fontSize: 10,
              formatter: '{b}'
            },
            labelLayout: {
              hideOverlap: true
            },
            scaleLimit: {
              min: 0.8,
              max: 2
            },
            lineStyle: {
              color: 'source',
              curveness: 0.1,
              opacity: 0.6,
              shadowBlur: 2
            },
            emphasis: {
              focus: 'adjacency',
              scale: true,
              itemStyle: {
                borderWidth: 3,
                borderColor: '#fff',
                shadowBlur: 10,
                shadowColor: 'rgba(255, 255, 255, 0.5)'
              },
              label: {
                show: true,
                fontWeight: 'bold',
                fontSize: 16,
                formatter: '{b}'
              },
              lineStyle: {
                width: 4,
                opacity: 1,
                shadowBlur: 4,
                shadowColor: 'rgba(255, 255, 255, 0.5)'
              }
            },
            blur: {
              itemStyle: {
                opacity: 0.3
              },
              lineStyle: {
                opacity: 0.1
              }
            }
          }
        ]
      };
      myChart.value.setOption(option, true);
      myChart.value.hideLoading();
      myChart.value.resize();
    }

    // 设置图表事件
    function setupChartEvents() {
      myChart.value.on('click', (params) => {
        if (!params || params.dataType !== 'node') return;

        const nodeName = params.data.name;
        const nodeIndex = index.indexOf(nodeName);
        
        if (nodeIndex === -1) return;
        
        const newDetailCategory = [...props.filter.detail_category];
        newDetailCategory[nodeIndex] = newDetailCategory[nodeIndex] === 1 ? 0 : 1;
        
        emit('update:filter', {
          ...props.filter,
          detail_category: newDetailCategory
        });
      });
    }

    // 清空选择
    const clearSelection = () => {
      const newFilter = {
        ...props.filter,
        detail_category: Array(10).fill(0)  // 重置为全0数组
      };
      emit('update:filter', newFilter);
    };

    // 监听筛选条件变化
    watch(() => props.filter, () => {
      console.log('props.filter changed',props.filter)
      generateData()
    }, { deep: true });

    // 监听数据变化
    watch(() => props.data, () => {
      console.log('props.data changed')
      generateData()
    }, { deep: true });

    // 组件挂载时初始化
    onMounted(() => {
      generateData();
      window.addEventListener('resize', () => {
        myChart.value?.resize();
      });
    });

    return {
      chartContainer,
      clearSelection
    };
  }
};
</script>

<style scoped>
.graph-container {
  position: relative;
  width: 100%;
  height: 100%;
}

#smallModule3 {
  width: 100%;
  height: 100%;
  margin: 0 auto;
}

.clear-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 5px 10px;
  background-color: #090909;
  color: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  z-index: 10;
}

.clear-btn:hover {
  background-color: #333;
}
</style>