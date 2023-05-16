<template>
  <courseDetail :is-edit="true" />
</template>

<script>
import courseDetail from './index.vue'

export default {
  name: 'CourseEdit',
  components: { courseDetail }
}
</script>
