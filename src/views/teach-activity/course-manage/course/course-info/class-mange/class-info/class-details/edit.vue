<template>
  <classDetail :is-edit="true" />
</template>

<script>
import classDetail from './index.vue'

export default {
  name: 'ClassEdit',
  components: { classDetail }
}
</script>
