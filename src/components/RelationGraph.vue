<script setup>

</script>

<template>
  <div id="smallModule3" ref="chartContainer"></div>
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
"nodes":[
{"id": "i", "category": 0, "symbolSize": 5.22,"name": "i"},
{"id": "ii", "category": 1, "symbolSize": 9.58,"name": "ii"},
{"id": "iii", "category": 2, "symbolSize": 10.26,"name": "iii"},
{"id": "iv", "category": 3, "symbolSize": 12.82,"name": "iv"},
{"id": "v", "category": 4, "symbolSize": 3.44,"name": "v"},
{"id": "vi", "category": 5, "symbolSize": 5.12,"name": "vi"},
{"id": "vii", "category": 6, "symbolSize": 3.02,"name": "vii"},
{"id": "viii", "category": 7, "symbolSize": 1.96,"name": "viii"},
{"id": "ix", "category": 8, "symbolSize": 2.74,"name": "ix"},
{"id": "x", "category": 9, "symbolSize": 2.74,"name": "ix"}
],
"links":[
{"source": "i", "target": "ii", "value": 147,"lineStyle": { "width": 2.46}},
{"source": "i", "target": "iii", "value": 134,"lineStyle": { "width": 2.33}},
{"source": "i", "target": "iv", "value": 173,"lineStyle": { "width": 2.7199999999999998}},
{"source": "i", "target": "v", "value": 18,"lineStyle": { "width": 1.17}},
{"source": "i", "target": "vi", "value": 83,"lineStyle": { "width": 1.8199999999999998}},
{"source": "i", "target": "vii", "value": 10,"lineStyle": { "width": 1.09}},
{"source": "i", "target": "viii", "value": 2,"lineStyle": { "width": 1.01}},
{"source": "i", "target": "ix", "value": 5,"lineStyle": { "width": 1.04}},
{"source": "i", "target": "x", "value": 5,"lineStyle": { "width": 1.04}},
{"source": "ii", "target": "iii", "value": 205,"lineStyle": { "width": 3.04}},
{"source": "ii", "target": "iv", "value": 344,"lineStyle": { "width": 4.43}},
{"source": "ii", "target": "v", "value": 56,"lineStyle": { "width": 1.55}},
{"source": "ii", "target": "vi", "value": 123,"lineStyle": { "width": 2.2199999999999998}},
{"source": "ii", "target": "vii", "value": 5,"lineStyle": { "width": 1.04}},
{"source": "ii", "target": "viii", "value": 1,"lineStyle": { "width": 1.0}},
{"source": "ii", "target": "ix", "value": 3,"lineStyle": { "width": 1.02}},
{"source": "ii", "target": "x", "value": 4,"lineStyle": { "width": 1.03}},
{"source": "iii", "target": "iv", "value": 265,"lineStyle": { "width": 3.64}},
{"source": "iii", "target": "v", "value": 85,"lineStyle": { "width": 1.8399999999999999}},
{"source": "iii", "target": "vi", "value": 137,"lineStyle": { "width": 2.3600000000000003}},
{"source": "iii", "target": "vii", "value": 19,"lineStyle": { "width": 1.18}},
{"source": "iii", "target": "viii", "value": 7,"lineStyle": { "width": 1.06}},
{"source": "iii", "target": "ix", "value": 17,"lineStyle": { "width": 1.16}},
{"source": "iii", "target": "x", "value": 17,"lineStyle": { "width": 1.16}},
{"source": "iv", "target": "v", "value": 85,"lineStyle": { "width": 1.8399999999999999}},
{"source": "iv", "target": "vi", "value": 142,"lineStyle": { "width": 2.41}},
{"source": "iv", "target": "vii", "value": 9,"lineStyle": { "width": 1.08}},
{"source": "iv", "target": "viii", "value": 4,"lineStyle": { "width": 1.03}},
{"source": "iv", "target": "ix", "value": 7,"lineStyle": { "width": 1.06}},
{"source": "iv", "target": "x", "value": 9,"lineStyle": { "width": 1.08}},
{"source": "v", "target": "vi", "value": 27,"lineStyle": { "width": 1.26}},
{"source": "v", "target": "vii", "value": 13,"lineStyle": { "width": 1.12}},
{"source": "v", "target": "viii", "value": 5,"lineStyle": { "width": 1.04}},
{"source": "v", "target": "ix", "value": 5,"lineStyle": { "width": 1.04}},
{"source": "v", "target": "x", "value": 5,"lineStyle": { "width": 1.04}},
{"source": "vi", "target": "vii", "value": 10,"lineStyle": { "width": 1.09}},
{"source": "vi", "target": "viii", "value": 5,"lineStyle": { "width": 1.04}},
{"source": "vi", "target": "ix", "value": 6,"lineStyle": { "width": 1.05}},
{"source": "vi", "target": "x", "value": 9,"lineStyle": { "width": 1.08}},
{"source": "vii", "target": "viii", "value": 64,"lineStyle": { "width": 1.63}},
{"source": "vii", "target": "ix", "value": 72,"lineStyle": { "width": 1.71}},
{"source": "vii", "target": "x", "value": 84,"lineStyle": { "width": 1.83}},
{"source": "viii", "target": "ix", "value": 35,"lineStyle": { "width": 1.34}},
{"source": "viii", "target": "x", "value": 36,"lineStyle": { "width": 1.35}},
{"source": "ix", "target": "x", "value": 107,"lineStyle": { "width": 2.06}}
],
"categories":[
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
]}

    const initChart = () => {
      myChart.value = echarts.init(chartContainer.value);
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
        legend: [
          /*{
            width: '100%',
            height: '30%',
            itemWidth: 20,
            itemHeight: 10,
            itemGap: 5,
            textStyle: {
              fontSize: 10,
              color: '#333'
            },
            data: data.categories.map(function(a) {
              return a.name;
            })
          }*/
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
              fontSize: 10,
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
              curveness: 0
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
#smallModule3 {
  width: 100%;
  height: 100%;
  margin: 0 auto;
}
</style>