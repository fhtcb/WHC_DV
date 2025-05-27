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
      .then((data) => {
        // 处理数据
        data = data
          .map((dataItem) => [dataItem['longitude'], dataItem['latitude'], 10]);

        // 设置图表选项
        myChart.setOption({
          visualMap: {
            show: false,
            min: 0,
            max: 60,
            inRange: {
              symbolSize: [1.0, 10.0]
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
          series: {
            type: 'scatter3D',
            coordinateSystem: 'globe',
            blendMode: 'lighter',
            symbolSize: 2,
            itemStyle: {
              color: 'rgb(50, 50, 150)',
              opacity: 1
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