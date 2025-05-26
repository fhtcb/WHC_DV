<template>
  <div class="region-filter">
    <button 
      v-for="region in regions" 
      :key="region"
      :class="{ active: selectedRegions.includes(region) }"
      @click="toggleRegion(region)"
    >
      {{ region }}
    </button>
  </div>
</template>

<script>
import { ref, watch } from 'vue'

export default {
  props: {
    selectedRegions: Array
  },
  emits: ['update:selectedRegions'],
  setup(props, { emit }) {
    const regions = ref(['Africa', 'Europe and North America', 'Latin America', 'Arab States', 'Asia and the Pacific'])
    const localSelected = ref([...props.selectedRegions])

    watch(() => props.selectedRegions, (newVal) => {
      localSelected.value = [...newVal]
    })

    const toggleRegion = (region) => {
      const index = localSelected.value.indexOf(region)
      if (index > -1) {
        localSelected.value.splice(index, 1)
      } else {
        localSelected.value.push(region)
      }
      emit('update:selectedRegions', [...localSelected.value])
    }

    return { regions, toggleRegion }
  }
}
</script>

<style>
.region-filter {
  display: flex;
  gap: 10px;
  padding: 10px;
}

button {
  padding: 8px 16px;
  border: 1px solid #ccc;
  cursor: pointer;
}

button.active {
  background: #2196F3;
  color: white;
}
</style>