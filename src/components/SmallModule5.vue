<template>
  <div v-if="data.length > 0">
    <p>{{ data[filter.id_no].name_en }}</p>
    <p>{{ data[filter.id_no].short_description_en }}</p>
    <p>{{ data[filter.id_no].justification_en }}</p>
  </div>
</template>

<script>
export default {
  name: 'RelationGraph',
  props: {
    filter: Object,
    dangerMode: Boolean,
    data: Object
  }
}
</script>