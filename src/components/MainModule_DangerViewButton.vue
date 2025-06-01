<template>

    <el-switch
    v-model="localDangerMode"
    style="--el-switch-on-color: #ff4949; --el-switch-off-color: #13ce66"
    active-text="查看濒危遗址"
    inactive-text=""
    @change="toggle"
  />
</template>

<script>
export default {
    name: 'MainModule_DangerViewButton',
  props: {
    dangerMode: Boolean
  },
  emits: ['update:dangerMode'],
  methods: {
    toggle() {
      this.$emit('update:dangerMode', !this.dangerMode);
    }
  }
};
</script>