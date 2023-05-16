<template>
  <div style="height:100%" />
</template>

<script>
import resize from './mixins/resize'
import echarts from '@/vendors/echarts'

export default {
  name: 'IcrChart',
  mixins: [resize],
  props: {
    option: Object
  },
  data() {
    return {
      chart: null,
      theme: 'chalk'
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initChart()
    })
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$el, this.theme)
      this.chart.setOption(this.option)
    }
  }
}
</script>
