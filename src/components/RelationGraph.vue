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
    data: Object
  },
  emits: ['update:filter'],
  setup(props, { emit }) {
    const chartContainer = ref(null);
    const myChart = ref(null);  
    const nodeOrder = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'N7', 'N8', 'N9', 'N10'];
    const index = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'N7', 'N8', 'N9', 'N10']
    var relationMat = Array(10).fill().map(() => Array(10).fill(0));
    var csvData = ''
    var graphData = {}

    function generateData(){
      console.log('generateData')
      
      csvData = ''
      graphData = ''
      relationMat = Array(10).fill().map(() => Array(10).fill(0));
      const ROOT_PATH = '/';
      fetch(ROOT_PATH + 'data/whc.csv')
        .then((response) => response.text())
        .then((rawData) => {
          csvData = rawData;
          console.log('csvData')
          /*console.log(csvData)*/
          const rows = csvData.split('\n');
          rows.forEach(row => {
            const dataArr = row.split(',');
            const shouldInclude = props.filter.detail_category.every(
              (filterVal, idx) => filterVal !== 1 || dataArr[idx+1] === '1'
            );
            if (shouldInclude) {
              for (let i = 1; i <= 10; i++) {
                if (dataArr[i] === '1') {
                  relationMat[i-1][i-1] += 1;
                }
                for (let j = i + 1; j <= 10; j++) {
                  if (dataArr[i] === '1' && dataArr[j] === '1') {
                    relationMat[i-1][j-1] += 1;
                    relationMat[j-1][i-1] += 1;
                  }
                }
            }
            }
          });
          console.log(relationMat)
        
          graphData = {
            nodes: index.map((id, i) => ({
              id: id,
              category: i,
              symbolSize: relationMat[i][i] / 50,
              name: id
            })),
            links: generateLinks(),
            categories: index.map(name => ({
              name: name === 'N10' ? 'N10' : name
            }))
          };
          console.log('graphData')
          console.log(graphData)
          initChart();
        });
    }

    function generateLinks() {
      const links = [];
      for (let i = 0; i < 10; i++) {
        for (let j = i + 1; j < 10; j++) {
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
              return `类别: ${params.data.name}<br/>` + 
                     `出现次数: ${params.data.symbolSize*50}<br/>`;
            } else if (params.dataType === 'edge') {
              return `共同出现: ${params.data.source} - ${params.data.target}<br/>` +
                     `共同出现次数: ${params.data.value || 1}`;
            }
          }
        },
        legend: [],
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
              curveness: 0
            },
            emphasis: {
              focus: 'self',
              itemStyle: {
                color: '#FF6B6B',
                borderWidth: 2,
                borderColor: '#333',
                shadowBlur: 10,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              },
              label: {
                show: true,
                fontWeight: 'bold',
                fontSize: 16,
                formatter: '{b}'
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
        const nodeIndex = nodeOrder.indexOf(nodeName);
        
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
        detail_category: []
      };
      emit('update:filter', newFilter);
    };

    // 监听筛选条件变化
    watch(() => props.filter.detail_category, () => {
      console.log('props.filter.detail_category')
      console.log(props.filter.detail_category)
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