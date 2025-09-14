<!--<template>
  <div>
    <h1>Main Module</h1>
    <p>This is the main module content.</p>
  </div>
</template>-->


<template>
  <div ref="chartEl" style="width: 100%; height: 500px;"></div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import * as echarts from 'echarts'

export default {
  props: {
    data: Array,
    selectedYear: Number
  },
  emits: ['point-click'],
  setup(props, { emit }) {
    const chartEl = ref(null)
    let chartInstance = null

    const initChart = () => {
      chartInstance = echarts.init(chartEl.value)
      
      const option = {
        xAxis: { type: 'value', name: '经度' },
        yAxis: { type: 'value', name: '纬度' },
        series: [{
          type: 'scatter',
          data: [],
          itemStyle: {
            color: '#2196F3'
          },
          emphasis: {
            itemStyle: {
              color: '#ff4757'
            }
          }
        }],
        tooltip: {
          formatter: params => `
            ${params.data.region}<br/>
            经度: ${params.value[0]}<br/>
            纬度: ${params.value[1]}<br/>
            年份: ${params.data.year}
          `
        }
      }

      chartInstance.setOption(option)
      chartInstance.on('click', handleChartClick)
    }

    const updateChart = () => {
      const seriesData = props.data.map(item => ({
        value: [item.lng, item.lat],
        region: item.region,
        year: item.year
      }))

      chartInstance.setOption({
        series: [{
          data: seriesData,
          itemStyle: {
            color: params => 
              props.selectedRegions?.includes(params.data.region) ? '#ff4757' : '#2196F3'
          }
        }]
      })
    }

    const handleChartClick = params => {
      emit('point-click', {
        year: params.data.year,
        region: params.data.region,
        lng: params.value[0],
        lat: params.value[1]
      })
    }

    onMounted(initChart)
    watch(() => props.data, updateChart, { deep: true })

    return { chartEl }
  }
}
</script>