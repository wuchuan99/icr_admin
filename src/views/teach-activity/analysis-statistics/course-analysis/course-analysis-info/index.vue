<template>
  <div class="course-analysis">
    <div class="chart-box">
      <course-bar />
      <course-direction-bar />
    </div>
    <course-statistics />
  </div>
</template>

<script>
import courseBar from './components/course-bar.vue'
import courseDirectionBar from './components/course-direction-bar.vue'
import courseStatistics from './components/course-statistics.vue'
export default {
  components: {
    courseBar,
    courseDirectionBar,
    courseStatistics
  },
  data() {
    return {}
  }
}
</script>
<style lang="scss" scoped>
.course-analysis {
  .chart-box {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    >div {
      width: calc(50% - 10px);
    }
  }
}
</style>
