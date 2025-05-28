<template>
  <button @click="toggle">切换危险点着色</button>
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