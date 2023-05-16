<template>
  <courseDetail :is-edit="false" />
</template>

<script>
import courseDetail from './index.vue'

export default {
  name: 'CourseCreated',
  components: { courseDetail }
}
</script>
