<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <div>
    <h2>{{ title }}</h2>
    <p>Content for {{ title }}</p>
  </div>
</template>