<template>
  <div class="time-axis-container">
    <!-- 第一条时间轴 - 带双滑块和红色指示线 -->
    <div class="main-time-axis">
      <!-- 红色指示线 -->
      <div 
        v-if="selectedPoint" 
        class="pointer" 
        :style="{ left: pointerPosition + '%' }"
      ></div>
      
      <!-- 时间轴滑轨 -->
      <div class="track"></div>
      <input 
        type="range" 
        :min="minYear" 
        :max="maxYear" 
        :value="selectedRange[0]"
        @input="updateLeftSlider($event)"
        class="slider left-slider"
      >
      <input 
        type="range" 
        :min="minYear" 
        :max="maxYear" 
        :value="selectedRange[1]"
        @input="updateRightSlider($event)"
        class="slider right-slider"
      >
      <div class="range-highlight" :style="rangeStyle"></div>
    </div>
    
    <!-- 第二条时间轴 - 显示年份范围首尾 -->
    <div class="label-time-axis">
      <span class="year-label">{{ selectedRange[0] }}</span>
      <span class="year-label">{{ selectedRange[1] }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TimeAxis',
  
  props: {
    minYear: {
      type: Number,
      default: 1976
    },
    maxYear: {
      type: Number,
      default: 2025
    },
    selectedRange: {
      type: Array,
      default: () => [1976, 2025]
    },
    selectedPoint: {
      type: Number,
      default: null
    }
  },
  
  computed: {
    rangeStyle() {
      const left = ((this.selectedRange[0] - this.minYear) / (this.maxYear - this.minYear)) * 100;
      const right = ((this.selectedRange[1] - this.minYear) / (this.maxYear - this.minYear)) * 100;
      return {
        left: left + '%',
        width: (right - left) + '%'
      };
    },
    
    pointerPosition() {
      if (!this.selectedPoint) return 0;
      return ((this.selectedPoint - this.minYear) / (this.maxYear - this.minYear)) * 100;
    }
  },
  
  methods: {
    // 更新左滑块位置
    updateLeftSlider(event) {
      const newLeft = parseInt(event.target.value);
      if (newLeft > this.selectedRange[1]) return;
      this.$emit('update:selectedRange', [newLeft, this.selectedRange[1]]);
    },
    
    // 更新右滑块位置
    updateRightSlider(event) {
      const newRight = parseInt(event.target.value);
      if (newRight < this.selectedRange[0]) return;
      this.$emit('update:selectedRange', [this.selectedRange[0], newRight]);
    }
  }
}
</script>

<style scoped>
.time-axis-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* 第一条时间轴样式 */
.main-time-axis {
  position: relative;
  height: 60px;
  background: #f0f0f0;
  border-radius: 10px;
  padding: 0 10px;
  margin-bottom: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.track {
  position: absolute;
  top: 50%;
  left: 10px;
  right: 10px;
  height: 4px;
  background: #ccc;
  transform: translateY(-50%);
  border-radius: 2px;
}

.range-highlight {
  position: absolute;
  top: 50%;
  height: 6px;
  background: #4a90e2;
  transform: translateY(-50%);
  border-radius: 3px;
  z-index: 1;
}

.slider {
  position: absolute;
  top: 50%;
  width: calc(100% - 20px);
  margin: 0;
  transform: translateY(-50%);
  z-index: 2;
  background: transparent;
  pointer-events: none;
}

.slider::-webkit-slider-thumb {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #ffffff;
  border: 2px solid #4a90e2;
  cursor: pointer;
  pointer-events: auto;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease;
}

.slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  background: #f0f8ff;
}

.slider::-moz-range-thumb {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #ffffff;
  border: 2px solid #4a90e2;
  cursor: pointer;
  pointer-events: auto;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease;
}

.slider::-moz-range-thumb:hover {
  transform: scale(1.1);
  background: #f0f8ff;
}

/* 红色指示线样式 */
.pointer {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 3px;
  background: #ff4757;
  z-index: 3;
  transform: translateX(-50%);
  box-shadow: 0 0 5px rgba(255, 71, 87, 0.7);
}

.pointer::after {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 8px solid #ff4757;
  transform: translateX(-50%);
}

/* 第二条时间轴样式 */
.label-time-axis {
  display: flex;
  justify-content: space-between;
  padding: 0 10px;
  font-size: 16px;
  color: #333;
  font-weight: 500;
}

.year-label {
  background: #e3f2fd;
  padding: 5px 15px;
  border-radius: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  font-weight: bold;
  color: #1976d2;
}
</style>