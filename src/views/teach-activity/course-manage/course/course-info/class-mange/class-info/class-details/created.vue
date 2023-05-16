<template>
  <classDetail :is-edit="false" />
</template>

<script>
import classDetail from './index.vue'

export default {
  name: 'ClassCreated',
  components: { classDetail }
}
</script>
