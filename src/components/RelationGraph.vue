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
    const whcData = ref({});
    const filteredData = ref({ nodes: [], links: [], categories: [] });

    // 初始化图表
    function init() {
      getData();
    }

    // 获取原始数据
    function getData() {
      console.log('getData')
      const ROOT_PATH = '/';
      fetch(ROOT_PATH + 'whc.json')
        .then((response) => response.json())
        .then((rawData) => {
          whcData.value = rawData;
          applyFilter(); // 获取数据后立即应用筛选
        });
    }

    // 根据筛选条件过滤数据
    function applyFilter() {
      console.log('applyFilter')
      if (!props.filter?.detail_category || !whcData.value.nodes) return;

      // 获取选中的节点名称
      const selectedNodes = props.filter.detail_category
        .map((val, index) => val === 1 ? nodeOrder[index] : null)
        .filter(Boolean);

      // 如果没有选中任何节点，则显示全部数据
      if (selectedNodes.length === 0) {
        filteredData.value = {
          nodes: [...whcData.value.nodes],
          links: [...whcData.value.links],
          categories: [...whcData.value.categories]
        };
        initChart();
        return;
      }

      // 筛选节点
      const filteredNodes = whcData.value.nodes.filter(node => 
        selectedNodes.includes(node.name)
      );

      // 筛选边 - 只保留两端都在选中节点中的边
      const filteredLinks = whcData.value.links.filter(link => 
        selectedNodes.includes(link.source) && 
        selectedNodes.includes(link.target)
      );

      // 筛选类别
      const filteredCategories = whcData.value.categories.filter(cat => 
        selectedNodes.some(node => node.startsWith(cat.name.replace(/[0-9]/g, '')))
      );

      filteredData.value = {
        nodes: filteredNodes,
        links: filteredLinks,
        categories: filteredCategories
      };

      initChart();
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
            data: filteredData.value.nodes,
            links: filteredData.value.links,
            categories: filteredData.value.categories,
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
        detail_category: Array(nodeOrder.length).fill(0)
      };
      emit('update:filter', newFilter);
    };

    // 监听筛选条件变化
    watch(() => props.filter?.detail_category, () => {
      applyFilter();
    }, { deep: true });

    // 组件挂载时初始化
    onMounted(() => {
      init();
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