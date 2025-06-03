<template>
  <div id="mainchart" style="width: 100%; height: 100%;"></div>
</template>

<script>
import { toRaw } from 'vue';

export default {
  name: 'MainModule',
  props: {
    filter: {
      type: Object,
      required: true
    },
    dangerMode: Boolean,
    data: {
      type: Array,
      default: () => []
    }
  },
  emits: [
    'update:filter'
  ],
  data() {
    return {
      chartData: [],
      maxRadius: 0,
      selectedIndex: -1,
      sel_idx: -1
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
        dataItem['name_en'],
        dataItem['id_no']
      ]);
      this.chartData = data;
      this.maxRadius = data.reduce((max, item) => Math.max(max, item[3] || 0), 0);
      if (this.chart) {
        this.chart.setOption({
          series: [{ 
            data: this.chartData,
            symbolSize: 2,  // 确保基础大小不为0
            itemStyle: {
              opacity: 1  // 确保点始终可见
            }
          }],
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
    },
    filter: {
      handler(newF) {
        // 每次 filter 变化时重新筛一遍，并重绘
        this.prepareChartData();
        console.log('Filter changed:', newF);
        console.log('Prepared chart data:', this.chartData);
        if (this.chart) {
          this.chart.setOption({
            series: [{
              data: this.chartData,
              symbolSize: 2,  // 确保基础大小不为0
              itemStyle: {
                opacity: 1  // 确保点始终可见
              }
            }]
          });
        }
      },
      deep: true
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
          'C': 'rgba(250,200,88, 0.3)',
          'N': 'rgba(145,204,117, 0.3)',
          'C/N': 'rgba(102, 204, 255,0.3)'
        };
        return (params) =>
          colorMap[params.value[4]];
      }
    },
    prepareChartData() {
      const raw = this.data;               // 父组件传来的所有点数据数组
      const f = toRaw(this.filter);        // 拿到一个普通 JS 对象，避免修改响应式 props

      // 预先定义索引到字段名的映射关系
      const detailFields = [
        'C1', 'C2', 'C3', 'C4', 'C5', 'C6',
        'N7', 'N8', 'N9', 'N10'
      ];

      this.chartData = raw
        .filter(item => {
          // ——————————————————————————————
          // 2. 按 region（地区）多选筛选
          if (Array.isArray(f.region) && f.region.length > 0) {
            if (!f.region.includes(item.region_en)) {
              return false;
            }
          }

          // ——————————————————————————————
          // 3. 按 category（大类）单选筛选
          if (f.category) {
            console.log('筛选 category:', f.category, item.category_short);
            if (item.category_short !== f.category) {
              return false;
            }
          }
          
          // ——————————————————————————————
          // 4. 按 detail_category（细分类）筛选
          if (Array.isArray(f.detail_category) && f.detail_category.length === 10) {
            let hasSelectedCategory = false;
            let matchesSelected = true;
            
            for (let i = 0; i < 10; i++) {
              if (f.detail_category[i] === 1) {
                hasSelectedCategory = true;
                const fieldName = detailFields[i];
                if (item[fieldName] !== 1) {
                  matchesSelected = false;
                  break;
                }
              }
            }
            
            if (hasSelectedCategory && !matchesSelected) {
              return false;
            }
          }
          
          // ——————————————————————————————
          // 5. 按 timeRange（时间区间）筛选
          if (Array.isArray(f.timeRange) && f.timeRange.length === 2) {
            const [startYear, endYear] = f.timeRange;
            let y = item.date_inscribed;
            // 处理各种可能的年份格式
            if (typeof y === 'string') {
              const yearMatch = y.match(/\d{4}/);
              if (yearMatch) {
                y = parseInt(yearMatch[0]);
              }
            }
            if (typeof y === 'number' && !isNaN(y)) {
              if (y < startYear || y > endYear) {
                return false;
              }
            } else {
              return false;
            }
          }

          // ——————————————————————————————
          // 如果都没被排除，就保留该条数据
          return true;
        })
        .map(dataItem => {
          return [
              dataItem['longitude'],
              dataItem['latitude'],
              dataItem['name_en'],
              Math.sqrt(dataItem['area_hectares']),
              dataItem['category_short'],
              dataItem['danger'],
              dataItem['region_en'],
              dataItem['short_description_en'],
              dataItem['name_en'],
              dataItem['id_no']
          ];
        });
    },
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
        dataItem['short_description_en'], dataItem['name_en'], dataItem['id_no']]);
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
          symbolSize: function(data) {
            return Math.max(2, data[3] / 50); // 确保最小尺寸为2
          },
          itemStyle: {
            color: (params) => {
              // 根据 category_short 动态设置颜色
              const category = params.value[4]; // category_short 的值
              switch (category) {
                case 'C':
                  return 'rgba(250,200,88, 0.3)'; // Cultural
                case 'N':
                  return 'rgba(145,204,117, 0.3)'; // Natural
                case 'C/N':
                  return 'rgba(102, 204, 255,0.3)'; // C/N
              }

            },
            opacity: 1
          },
          emphasis: {
              label: {
                show: false 
              },
              itemStyle: {
                color: 'rgba(255, 255, 0, 1)', // 高亮后变成红色
                borderWidth: 2,
                opacity: 1
              },
          },
          data: data
        }]
      });

      this.chart.on('click', (params) => {
        console.log('Clicked on:', params.value[4]);
        const clickedId = params.value[9];
        const iidx = this.chartData.findIndex(arr => arr[9] === clickedId);
        if (iidx === -1) return; // 找不到直接退出

        if (this.selectedIndex === clickedId) {
          console.log('取消高亮');
          // 取消高亮
          this.chart.dispatchAction({
            type: 'downplay',
            seriesIndex: 0,
            dataIndex: iidx
          });
          this.selectedIndex = -1;

          const emptyFilter = {
            id_no: '',
            region: [],
            category: '',
            detail_category: Array(10).fill(0),
            timeRange: [],
            time: ''
          };
          this.$emit('update:filter', emptyFilter);
          return;
        }

      if (this.selectedIndex !== -1) {
        this.chart.dispatchAction({
          type: 'highlight',
          seriesIndex: 0,
          dataIndex: this.sel_idx
        });
      }
      
      this.chart.dispatchAction({
        type: 'highlight',
        seriesIndex: 0,
        dataIndex: iidx
      });
      this.selectedIndex = clickedId;
      this.sel_idx = iidx;

      const clickedItem = this.data.find(d => d.id_no === clickedId);
      if (!clickedItem) return;

      const newFilter = {
        id_no: clickedItem.id_no,                  
        region: [clickedItem.region_en],             
        category: clickedItem.category_short,        
        detail_category: [
          clickedItem.C1,
          clickedItem.C2,
          clickedItem.C3,
          clickedItem.C4,
          clickedItem.C5,
          clickedItem.C6,
          clickedItem.N7,
          clickedItem.N8,
          clickedItem.N9,
          clickedItem.N10
        ],
        timeRange: this.filter.timeRange,
        time: clickedItem.date_inscribed
      };
      this.$emit('update:filter', newFilter);
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
