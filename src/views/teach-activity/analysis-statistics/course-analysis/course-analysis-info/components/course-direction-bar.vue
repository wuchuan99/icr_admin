<template>
  <icr-card title="课程方向学习人次排名" class="course-direction-bar">
    <div class="chart">
      <icr-chart ref="chart" :option="option" />
    </div>
  </icr-card>
</template>

<script>
import IcrCard from '../common/card.vue'
import IcrChart from '../common/chart.vue'
import { directionrank } from '@/api/education_manage'
export default {
  components: {
    IcrCard,
    IcrChart
  },
  data() {
    return {
      option: {
        grid: {
          left: '1%',
          right: '1%',
          top: '10%',
          bottom: '5%',
          containLabel: true
        },
        tooltip: {
          show: true
        },
        xAxis: {
          type: 'category',
          data: [],
          axisLabel: {
            show: true,
            color: '#a7aaaf',
            fontSize: 14
          }
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            show: true,
            color: '#a7aaaf',
            fontSize: 14
          },
          splitLine: {
            lineStyle: {
              show: true,
              color: '#76797e'
            }
          },
          minInterval: 1
        },
        series: [
          {
            data: [],
            type: 'bar',
            barWidth: 20,
            itemStyle: {
              // color: '#49a1fc'
              color: '#37D6B0'
            }
          }
        ]
      }
    }
  },
  mounted() {
    this.initData()
  },
  methods: {
    initData() {
      directionrank().then((res) => {
        if (!res?.data?.rank) return
        this.option.xAxis.data = res.data.rank.map(item => item.name)
        this.option.series[0].data = res.data.rank.map(item => item.num)
        this.$refs.chart.initChart()
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.course-direction-bar {
  .chart {
    height: 300px;
  }
}
</style>
