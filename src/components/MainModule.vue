<template>
  <div id="mainchart" style="width: 100%; height: 100%;"></div>
  <el-dialog v-model="dialogVisible" title="Description" width="40%">
    <div v-html="dialogContent"></div>
  </el-dialog>
</template>

<script>



export default {
  name: 'MainModule',
  props: {
    dangerMode: Boolean,
    data: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {

      chartData: [],
      maxRadius: 0,
      dialogVisible: false,
      dialogContent: ''
    };
  },

  watch: {
    data: {
    handler(newData) {
      // 这里重新处理数据并刷新图表
      const data = newData.map(dataItem => [
        dataItem['longitude'],
        dataItem['latitude'],
        dataItem['name_en'],
        Math.sqrt(dataItem['area_hectares']),
        dataItem['category_short'],
        dataItem['danger'],
        dataItem['region_en'],
        dataItem['short_description_en'],
        dataItem['name_en']
      ]);
      this.chartData = data;
      this.maxRadius = data.reduce((max, item) => Math.max(max, item[3] || 0), 0);
      if (this.chart) {
        this.chart.setOption({
          series: [{ data: this.chartData }],
          visualMap: { max: this.maxRadius }
        });
      }
    },
    immediate: true // 初始化时也执行一次
  },
    dangerMode(newVal) {
      console.log('dangerMode changed:', newVal); // 加个日志
      if (this.chart) {
        this.chart.setOption({
          series: [{
            type: 'scatter3D',
            coordinateSystem: 'globe',
            blendMode: 'lighter',
            symbolSize: 2,
            itemStyle: {
              color: this.getColorFunction(),
              opacity: 1
            },
            data: this.chartData
          }]
        });
      }
    }
  },
  methods: {
    getColorFunction() {
      if (this.dangerMode) {
        return (params) =>
          params.value[5] === 1
            ? 'rgba(255,0,0,0.7)'  // 危险点
            : 'rgba(128,128,128,0.7)'; // 非危险点
      } else {
        const colorMap = {
          C: 'rgba(0, 0, 255, 0.3)',
          N: 'rgba(0, 255, 0, 0.3)'
        };
        return (params) =>
          colorMap[params.value[4]] || 'rgba(0, 255, 255, 0.3)';
      }
    }
  },
  mounted() {
    setTimeout(() => {

      const ROOT_PATH = '/';

      // 获取容器并初始化 ECharts 实例
      const chartDom = document.getElementById('mainchart');
      console.log(chartDom.offsetWidth, chartDom.offsetHeight);
      this.chart = echarts.init(chartDom);
      this.chart.resize();
      
      // 处理数据
      const data = this.data
        .map((dataItem) => [dataItem['longitude'], dataItem['latitude'], dataItem['name_en'],
        Math.sqrt(dataItem['area_hectares']), dataItem['category_short'],
        dataItem['danger'], dataItem['region_en'],
        dataItem['short_description_en'], dataItem['name_en']]);
      const maxRadius = this.data.reduce(
        (max, item) => Math.max(max, Math.sqrt(item.area_hectares) || 0), 0);
      // 设置图表选项

      this.chartData = data;
      this.maxRadius = maxRadius;

      this.chart.setOption({
        visualMap: {
          show: false,
          dimension: 3,
          min: 0,
          max: maxRadius,
          inRange: {
            symbolSize: [5.0, 100.0]
          }
        },
        globe: {
          environment: ROOT_PATH + 'starfield.jpg',
          baseTexture: ROOT_PATH + 'world.topo.bathy.200401.jpg',
          heightTexture: ROOT_PATH + 'world.topo.bathy.200401.jpg',
          displacementScale: 0.04,
          displacementQuality: 'high',
          globeOuterRadius: 100,
          // baseColor: '#000',
          shading: 'realistic',
          realisticMaterial: {
            roughness: 0.2,
            metalness: 0
          },
          postEffect: {
            enable: true,
            depthOfField: {
              focalRange: 15,
              enable: true,
              focalDistance: 100
            }
          },
          temporalSuperSampling: {
            enable: true
          },
          light: {
            ambient: {
              intensity: 0
            },
            main: {
              intensity: 0.1,
              shadow: false
            },
            ambientCubemap: {
              texture: ROOT_PATH + 'lake.hdr',
              exposure: 1,
              diffuseIntensity: 0.5,
              specularIntensity: 2
            }
          },
          viewControl: {
            autoRotate: false,
            beta: 180,
            alpha: 20,
            distance: 100
          }

        },
        tooltip: {
          trigger: 'item',
          formatter: function (params) {
            return `Position: (${params.value[0]}, ${params.value[1]})<br> name: ${params.value[2] || 'none'}
          <br> region: ${params.value[6] || 'none'}<br> area: ${params.value[3] || 'none'}<br> category: ${params.value[4] || 'none'}<br> danger: ${params.value[5] === 1 ? 'yes' : 'no'}`;
          }
        },
        series: [{
          type: 'scatter3D',
          coordinateSystem: 'globe',
          blendMode: 'lighter',
          symbolSize: 2,
          itemStyle: {
            color: (params) => {
              // 根据 category_short 动态设置颜色
              const category = params.value[4]; // category_short 的值
              switch (category) {
                case 'C':
                  return 'rgba(0, 0, 255, 0.3)'; // Cultural
                case 'N':
                  return 'rgba(0, 255, 0, 0.3)'; // Natural
                default:
                  return 'rgba(0, 255, 255,0.3)'; // C/N
              }
            },
            opacity: 1
          },
          data: data
        }]
      });

      this.chart.on('click', (params) => {
        if (params.value && params.value[7]) {
          this.dialogContent = params.value[7];
          this.dialogVisible = true;
        } else {
          this.dialogContent = 'No description.';
          this.dialogVisible = true;
        }
      });
    }, 100)
  }
};
</script>

<style>
/* 可选：为容器设置样式 */
#mainchart {
  width: 100%;
  height: 100%;
}
</style>