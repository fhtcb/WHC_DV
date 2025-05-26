<template>
  <div class="time-axis-container">
    <div class="dual-range-container">
      <input 
        type="range" 
        v-model="localRange[0]" 
        :min="minYear" 
        :max="maxYear"
        class="slider"
        @input="handleInput(0)"
      >
      <input 
        type="range" 
        v-model="localRange[1]" 
        :min="minYear" 
        :max="maxYear"
        class="slider"
        @input="handleInput(1)"
      >
      <div class="track">
        <div class="track-inner" :style="trackStyle"></div>
      </div>
      <div class="years">{{ localRange[0] }} - {{ localRange[1] }}</div>
    </div>




    <div class="marker-axis" :style="{ backgroundPosition: markerPosition }">
      <div class="marker" v-if="selectedYear"></div>
    </div>
  </div>
</template>

<script>
import { ref, watch, computed } from 'vue'

export default {
  props: {
    yearRange: Array,
    selectedYear: Number
  },
  setup(props, { emit }) {
    const minYear = 1976
    const maxYear = 2025
    const localRange = ref([...props.yearRange])

    watch(() => props.yearRange, (newVal) => {
      localRange.value = [...newVal]
    })

    const trackStyle = computed(() => {
      const start = ((localRange.value[0] - minYear) / (maxYear - minYear)) * 100
      const end = ((localRange.value[1] - minYear) / (maxYear - minYear)) * 100
      return {
        left: `${start}%`,
        width: `${end - start}%`
      }
    })

    const handleInput = (index) => {
      // 确保左侧滑块不超过右侧
      if (index === 0 && localRange.value[0] > localRange.value[1]) {
        localRange.value = [localRange.value[1], localRange.value[1]]
      }
      // 确保右侧滑块不低于左侧
      if (index === 1 && localRange.value[1] < localRange.value[0]) {
        localRange.value = [localRange.value[0], localRange.value[0]]
      }
      emit('update:yearRange', [...localRange.value])
    }

    const markerPosition = computed(() => {
      if (!props.selectedYear) return '0%'
      const percentage = ((props.selectedYear - minYear) / (maxYear - minYear)) * 100
      return `${percentage}%`
    })

    return { minYear, maxYear, localRange, trackStyle, handleInput, markerPosition }
  }
}
</script>

<style>
.time-axis-container {
  grid-column: 1 / -1;
  padding: 20px 0;
}

.range-axis {
  position: relative;
  height: 40px;
}

.marker-axis {
  height: 20px;
  background: linear-gradient(to right, #ccc, #666);
  position: relative;
}

.marker {
  position: absolute;
  width: 2px;
  height: 100%;
  background: red;
  transform: translateX(-50%);
}
</style>

<!--<template>
    <div class="a_slider">
        <div
            class="a_slider_bar"
            ref="sliderBarRef"
            @mousedown="handleMouseDown"
            @mousemove="handleMouseMove"
            @mouseup="clickBar"
        ></div>
        <div
            class="a_min_bar"
            :style="{
                left: props.modelValue.left + '%',
                width: props.modelValue.width + '%',
            }"
            @mousedown="handleMouseDown"
            @mousemove="handleMouseMove"
            @mouseup="clickBar"
        ></div>
        <div
            class="a_slider__button"
            v-diy-drag
            :style="{ left: props.modelValue.left + '%' }"
            id="dragButtonLeft"
            ref="dragButtonLeftRef"
        ></div>
        <div
            class="a_slider__button"
            v-diy-drag
            :style="{
                left: props.modelValue.left + props.modelValue.width + '%',
            }"
            id="dragButtonRight"
            ref="dragButtonRightRef"
        ></div>
    </div>
</template>
 
<script setup>
import { reactive, onMounted, onBeforeUnmount, ref } from "vue";
const emits = defineEmits(["update:modelValue", "change"]);
const sliderBarRef = ref();
const dragButtonLeftRef = ref();
const dragButtonRightRef = ref();
let drag = ref(false);
 
const handleMouseDown = () => (drag.value = false);
const handleMouseMove = () => (drag.value = true);
 
const vDiyDrag = {
    beforeMount(el) {
        const onMouseDown = (e) => {
            const id = e.target.id;
            if (id !== "dragButtonLeft" && id !== "dragButtonRight") {
                return;
            }
            const initialMouseX = e.clientX;
            const initialDomX = el.offsetLeft;
            const clientWidth = sliderBarRef.value.clientWidth;
            let minX = 0,
                maxX = 0;
            // 按钮宽度占比
            const buttonWidth = (6 / clientWidth) * 100;
            const dragButtonLeft = {
                minX: 0,
                maxX:
                    parseFloat(dragButtonRightRef.value.style.left) -
                    buttonWidth,
            };
            const dragButtonRight = {
                minX:
                    parseFloat(dragButtonLeftRef.value.style.left) +
                    buttonWidth,
                maxX: 100,
            };
            if (id === "dragButtonLeft") {
                minX = dragButtonLeft.minX;
                maxX = dragButtonLeft.maxX;
            } else {
                minX = dragButtonRight.minX;
                maxX = dragButtonRight.maxX;
            }
 
            const onMouseMove = (e) => {
                const deltaX = e.clientX - initialMouseX;
                let newX = ((initialDomX + deltaX) / clientWidth) * 100;
                // 边界控制
                if (newX < minX) newX = minX;
                else if (newX > maxX) newX = maxX;
                el.style.left = newX + "%";
                change();
            };
 
            const onMouseUp = () => {
                document.removeEventListener("mousemove", onMouseMove);
                document.removeEventListener("mouseup", onMouseUp);
            };
 
            document.addEventListener("mousemove", onMouseMove);
            document.addEventListener("mouseup", onMouseUp);
            return false;
        };
 
        el.addEventListener("mousedown", onMouseDown);
 
        onBeforeUnmount(() => {
            el.removeEventListener("mousedown", onMouseDown);
        });
    },
};
 
const props = defineProps({
    modelValue: {
        type: Object,
        default: () => {
            return {
                left: 0,
                width: 100,
            };
        },
    },
});
 
const state = reactive({});
 
onMounted(() => {});
 
onBeforeUnmount(() => {});
 
function clickBar(e) {
    console.log(drag.value);
    const clientWidth = sliderBarRef.value.clientWidth;
    const offsetX = (e.offsetX / clientWidth) * 100;
    const rightButton = parseFloat(dragButtonRightRef.value.style.left);
    const leftButton = parseFloat(dragButtonLeftRef.value.style.left);
    const middle = (rightButton + leftButton) / 2;
 
    let diff = offsetX - middle;
    if (diff > 0) {
        if (rightButton + diff > 100) {
            diff = 100 - rightButton;
        }
        // 右边按钮
        dragButtonRightRef.value.style.left = rightButton + diff + "%";
        // 左边按钮
        dragButtonLeftRef.value.style.left = leftButton + diff + "%";
    } else if (diff < 0) {
        if (leftButton + diff < 0) {
            diff = 0 - leftButton;
        }
        // 左边按钮
        dragButtonLeftRef.value.style.left = leftButton + diff + "%";
        // 右边按钮
        dragButtonRightRef.value.style.left = rightButton + diff + "%";
    }
    change();
}
 
function change() {
    let newValue = {
        left: parseFloat(dragButtonLeftRef.value.style.left),
        width:
            parseFloat(dragButtonRightRef.value.style.left) -
            parseFloat(dragButtonLeftRef.value.style.left),
    };
    emits("update:modelValue", newValue);
    emits("change", newValue);
}
</script>
 
<style lang="less" scoped>
.a_slider {
    position: relative;
    width: 100%;
    .a_slider_bar {
        // position: absolute;
        width: 100%;
        height: 8px;
        background: rgba(255, 255, 255, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.4);
        cursor: crosshair;
    }
    .a_min_bar {
        pointer-events: none;
        position: absolute;
        top: 5px;
        width: 100%;
        height: 12px;
        background: rgba(16, 29, 47, 1);
        border: 1px solid rgba(255, 255, 255, 0.4);
        transform: translateY(-50%);
    }
    .a_slider__button {
        position: absolute;
        top: 5px;
        width: 6px;
        height: 18px;
        background: rgba(0, 38, 101, 1);
        border-radius: 2px;
        cursor: ew-resize;
        box-sizing: border-box;
        border: 1px solid rgba(255, 255, 255, 1);
        transform: translateY(-50%);
    }
    .a_slider__button:hover {
        background: rgba(54, 124, 232, 1);
    }
}
</style>-->