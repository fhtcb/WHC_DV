<template>
  <div id="main" style="width: 100%; height: 400px;"></div>
</template>

<script>




export default {
  name: 'MainModule',
  mounted() {
    const ROOT_PATH = '/';

    // 获取容器并初始化 ECharts 实例
    const chartDom = document.getElementById('main');
    const myChart = echarts.init(chartDom);

    // 使用 fetch 替代 $.getJSON 加载数据
    fetch(ROOT_PATH + 'data/data.json')
      .then((response) => response.json())
      .then((rawData) => {
        // 处理数据
        const data = rawData
          .map((dataItem) => [dataItem['longitude'], dataItem['latitude'], dataItem['name_en'],
          Math.sqrt(dataItem['area_hectares']), dataItem['category_short'],
          dataItem['danger'], dataItem['name_en']]);
        const maxRadius = rawData.reduce(
          (max, item) => Math.max(max, Math.sqrt(item.area_hectares) || 0), 0);
        // 设置图表选项
        myChart.setOption({
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
            heightTexture: ROOT_PATH + 'bathymetry_bw_composite_4k.jpg',
            displacementScale: 0.05,
            displacementQuality: 'high',
            globeOuterRadius: 100,
            baseColor: '#000',
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
              return `Position: (${params.value[0]}, ${params.value[1]})<br> name: ${params.value[2] || 'none'}`;
            }
          },
          series: {
            label: {
              show: false // 完全关闭标签显示
            },
            emphasis: {
              label: {
                show: false // 确保高亮状态也不显示标签
              },
              itemStyle: {
                opacity: 0.8 // 与普通状态透明度一致
              }
            },
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
              opacity: 0.45
            },
            data: data
          }
        });
      })
      .catch((error) => {
        console.error('Error loading data:', error);
      });
  }
};
</script>

<style>
/* 可选：为容器设置样式 */
#main {
  width: 100%;
  height: 400px;
}
</style>