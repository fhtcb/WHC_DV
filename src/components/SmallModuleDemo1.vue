<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <div>
    <h2>{{ title }}</h2>
    <p>Content for {{ title }}</p>
  </div>
</template>

<template>
  <div id="main" ref="chartContainer"></div>
</template>

<script>
import * as echarts from 'echarts';
import { onMounted, ref } from 'vue';

export default {
  name: 'RelationGraph',
  setup() {
    const chartContainer = ref(null);
    const myChart = ref(null);
    const data = {
      nodes: [
        {"id": "i", "category": 0, "symbolSize": 52.2, "name": "i"},
        {"id": "ii", "category": 1, "symbolSize": 95.8, "name": "ii"},
        {"id": "iii", "category": 2, "symbolSize": 102.6, "name": "iii"},
        {"id": "iv", "category": 3, "symbolSize": 128.2, "name": "iv"},
        {"id": "v", "category": 4, "symbolSize": 34.4, "name": "v"},
        {"id": "vi", "category": 5, "symbolSize": 51.2, "name": "vi"},
        {"id": "vii", "category": 6, "symbolSize": 30.2, "name": "vii"},
        {"id": "viii", "category": 7, "symbolSize": 19.6, "name": "viii"},
        {"id": "ix", "category": 8, "symbolSize": 27.4, "name": "ix"},
        {"id": "x", "category": 9, "symbolSize": 27.4, "name": "ix"}
      ],
      links: [
        {"source": "i", "target": "ii", "value": 147, "lineStyle": {"width": 15.6}},
        {"source": "i", "target": "iii", "value": 134, "lineStyle": {"width": 14.3}},
        // 其他链接数据...
        {"source": "ix", "target": "x", "value": 107, "lineStyle": {"width": 10.6}}
      ],
      categories: [
        {"name": "i"},
        {"name": "ii"},
        {"name": "iii"},
        {"name": "iv"},
        {"name": "v"},
        {"name": "vi"},
        {"name": "vii"},
        {"name": "viii"},
        {"name": "ix"},
        {"name": "x"}
      ]
    };

    const initChart = () => {
      myChart.value = echarts.init(chartContainer.value);
      myChart.value.showLoading();

      const option = {
        tooltip: {
          padding: 12,
          textStyle: {
            fontSize: 100
          },
          formatter: function(params) {
            if (params.dataType === 'node') {
              return `类别: ${params.data.name}<br/>` + 
                     `出现次数: ${params.data.symbolSize*5}<br/>`;
            } else if (params.dataType === 'edge') {
              return `共同出现: ${params.data.source} - ${params.data.target}<br/>` +
                     `共同出现次数: ${params.data.value || 1}`;
            }
          }
        },
        legend: [
          {
            width: '100%',
            height: '30%',
            itemWidth: 100,
            itemHeight: 70,
            itemGap: 20,
            textStyle: {
              fontSize: 50,
              color: '#333'
            },
            data: data.categories.map(function(a) {
              return a.name;
            })
          }
        ],
        series: [
          {
            name: '',
            type: 'graph',
            layout: 'force',
            force: {
              repulsion: 100,
              gravity: 1,
              edgeLength: 800,
              friction: 0.1,
              initLayout: null,
              layoutAnimation: true
            },
            draggable: true,
            data: data.nodes,
            links: data.links,
            categories: data.categories,
            roam: true,
            label: {
              show: true,
              position: 'right',
              fontSize: 50,
              formatter: '{b}'
            },
            labelLayout: {
              hideOverlap: true
            },
            scaleLimit: {
              min: 0.5,
              max: 2
            },
            lineStyle: {
              color: 'source',
              curveness: 0.3
            }
          }
        ]
      };

      myChart.value.setOption(option);
      myChart.value.hideLoading();
    };

    onMounted(() => {
      initChart();
      
      // 窗口大小变化时重新调整图表大小
      window.addEventListener('resize', () => {
        myChart.value?.resize();
      });
    });

    return {
      chartContainer
    };
  }
};
</script>

<style scoped>
#main {
  width: 100%;
  height: 2000px;
  margin: 0 auto;
}
</style>