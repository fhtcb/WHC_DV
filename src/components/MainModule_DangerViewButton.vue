<template>
    <button @click="toggle">
    {{ dangerMode ? 'View heritages types' : 'View Danger heritages' }}
  </button>
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