<template>
  <div id="smallModule3" ref="chartContainer"></div>
</template>

<script>
import * as echarts from 'echarts';
import { onMounted, ref } from 'vue';

export default {
  name: 'RelationGraph',
  props: {
    data: {
      type: Array,
      default: () => []
    },
    filter: Object
  },
  setup() {
    const chartContainer = ref(null);
    const myChart = ref(null);
    const whcData= {
"nodes":[
{"id": "C1", "category": 0, "symbolSize": 5.22,"name": "C1"},
{"id": "C2", "category": 1, "symbolSize": 9.58,"name": "C2"},
{"id": "C3", "category": 2, "symbolSize": 10.26,"name": "C3"},
{"id": "C4", "category": 3, "symbolSize": 12.82,"name": "C4"},
{"id": "C5", "category": 4, "symbolSize": 3.44,"name": "C5"},
{"id": "C6", "category": 5, "symbolSize": 5.12,"name": "C6"},
{"id": "N7", "category": 6, "symbolSize": 3.02,"name": "N7"},
{"id": "N8", "category": 7, "symbolSize": 1.96,"name": "N8"},
{"id": "N9", "category": 8, "symbolSize": 2.74,"name": "N9"},
{"id": "N10", "category": 9, "symbolSize": 2.74,"name": "N9"}
],
"links":[
{"source": "C1", "target": "C2", "value": 147,"lineStyle": { "width": 2.46}},
{"source": "C1", "target": "C3", "value": 134,"lineStyle": { "width": 2.33}},
{"source": "C1", "target": "C4", "value": 173,"lineStyle": { "width": 2.7199999999999998}},
{"source": "C1", "target": "C5", "value": 18,"lineStyle": { "width": 1.17}},
{"source": "C1", "target": "C6", "value": 83,"lineStyle": { "width": 1.8199999999999998}},
{"source": "C1", "target": "N7", "value": 10,"lineStyle": { "width": 1.09}},
{"source": "C1", "target": "N8", "value": 2,"lineStyle": { "width": 1.01}},
{"source": "C1", "target": "N9", "value": 5,"lineStyle": { "width": 1.04}},
{"source": "C1", "target": "N10", "value": 5,"lineStyle": { "width": 1.04}},
{"source": "C2", "target": "C3", "value": 205,"lineStyle": { "width": 3.04}},
{"source": "C2", "target": "C4", "value": 344,"lineStyle": { "width": 4.43}},
{"source": "C2", "target": "C5", "value": 56,"lineStyle": { "width": 1.55}},
{"source": "C2", "target": "C6", "value": 123,"lineStyle": { "width": 2.2199999999999998}},
{"source": "C2", "target": "N7", "value": 5,"lineStyle": { "width": 1.04}},
{"source": "C2", "target": "N8", "value": 1,"lineStyle": { "width": 1.0}},
{"source": "C2", "target": "N9", "value": 3,"lineStyle": { "width": 1.02}},
{"source": "C2", "target": "N10", "value": 4,"lineStyle": { "width": 1.03}},
{"source": "C3", "target": "C4", "value": 265,"lineStyle": { "width": 3.64}},
{"source": "C3", "target": "C5", "value": 85,"lineStyle": { "width": 1.8399999999999999}},
{"source": "C3", "target": "C6", "value": 137,"lineStyle": { "width": 2.3600000000000003}},
{"source": "C3", "target": "N7", "value": 19,"lineStyle": { "width": 1.18}},
{"source": "C3", "target": "N8", "value": 7,"lineStyle": { "width": 1.06}},
{"source": "C3", "target": "N9", "value": 17,"lineStyle": { "width": 1.16}},
{"source": "C3", "target": "N10", "value": 17,"lineStyle": { "width": 1.16}},
{"source": "C4", "target": "C5", "value": 85,"lineStyle": { "width": 1.8399999999999999}},
{"source": "C4", "target": "C6", "value": 142,"lineStyle": { "width": 2.41}},
{"source": "C4", "target": "N7", "value": 9,"lineStyle": { "width": 1.08}},
{"source": "C4", "target": "N8", "value": 4,"lineStyle": { "width": 1.03}},
{"source": "C4", "target": "N9", "value": 7,"lineStyle": { "width": 1.06}},
{"source": "C4", "target": "N10", "value": 9,"lineStyle": { "width": 1.08}},
{"source": "C5", "target": "C6", "value": 27,"lineStyle": { "width": 1.26}},
{"source": "C5", "target": "N7", "value": 13,"lineStyle": { "width": 1.12}},
{"source": "C5", "target": "N8", "value": 5,"lineStyle": { "width": 1.04}},
{"source": "C5", "target": "N9", "value": 5,"lineStyle": { "width": 1.04}},
{"source": "C5", "target": "N10", "value": 5,"lineStyle": { "width": 1.04}},
{"source": "C6", "target": "N7", "value": 10,"lineStyle": { "width": 1.09}},
{"source": "C6", "target": "N8", "value": 5,"lineStyle": { "width": 1.04}},
{"source": "C6", "target": "N9", "value": 6,"lineStyle": { "width": 1.05}},
{"source": "C6", "target": "N10", "value": 9,"lineStyle": { "width": 1.08}},
{"source": "N7", "target": "N8", "value": 64,"lineStyle": { "width": 1.63}},
{"source": "N7", "target": "N9", "value": 72,"lineStyle": { "width": 1.71}},
{"source": "N7", "target": "N10", "value": 84,"lineStyle": { "width": 1.83}},
{"source": "N8", "target": "N9", "value": 35,"lineStyle": { "width": 1.34}},
{"source": "N8", "target": "N10", "value": 36,"lineStyle": { "width": 1.35}},
{"source": "N9", "target": "N10", "value": 107,"lineStyle": { "width": 2.06}}
],
"categories":[
{"name": "C1"},
{"name": "C2"},
{"name": "C3"},
{"name": "C4"},
{"name": "C5"},
{"name": "C6"},
{"name": "N7"},
{"name": "N8"},
{"name": "N9"},
{"name": "N10"}
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
            data: whcData.nodes,
            links: whcData.links,
            categories: whcData.categories,
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