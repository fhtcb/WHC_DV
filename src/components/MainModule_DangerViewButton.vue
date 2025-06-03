<template>
  <div class="danger-view-button">
    <el-switch
      v-model="localDangerMode"
      style="--el-switch-on-color: #ff4949; --el-switch-off-color: #13ce66"
      active-text="查看濒危遗址"
      inactive-text="查看遗产类别"
      @change="handleChange"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  dangerMode: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:dangerMode']);

const localDangerMode = ref(props.dangerMode);

// 监听外部 dangerMode 变化
watch(() => props.dangerMode, (newValue) => {
  localDangerMode.value = newValue;
});

// 处理切换事件
const handleChange = (value) => {
  emit('update:dangerMode', value);
};
</script>

<style scoped>
.danger-view-button {
  margin: 10px;
  display: flex;
  align-items: center;
}

:deep(.el-switch__label) {
  color: #a0a0d0;
}

:deep(.el-switch.is-checked .el-switch__label) {
  color: #ff4949;
}
</style>