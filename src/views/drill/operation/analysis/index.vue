<template>
  <div class="analysis-container">
    <icr-card v-if="mode === 2" title="红蓝对抗" class="against-stat">
      <icr-chart ref="pieChart" class="stat-item" :option="againstStat" />
      <span class="tips blue" :class="{ show: isLoadAgainstChart }">蓝队任务完成率：{{ blueData[0].value }}%</span>
      <span class="tips red" :class="{ show: isLoadAgainstChart }">红队任务完成率：{{ redData[0].value }}%</span>
    </icr-card>
    <icr-card v-else title="完成任务人数" class="question-stat">
      <icr-chart ref="finaledChart" class="stat-item" :option="questionStat" />
    </icr-card>
  </div>
</template>

<script>
import IcrCard from './components/card.vue'
import IcrChart from './components/chart.vue'
import { drillFruitAnalyse } from '@/api/drill'

const blueData = [{ name: '蓝方任务完成率', value: 0 }, { name: '蓝方任务未完成率', value: 100 }]
const redData = [{ name: '红方任务完成率', value: 0 }, { name: '红方任务未完成率', value: 100 }]
export default {
  components: {
    IcrCard,
    IcrChart
  },
  inject: ['drillId', 'mode'],
  data() {
    return {
      questionStat: {
        color: ['#b5e4ca'],
        xAxis: {
          type: 'category',
          data: []
        },
        yAxis: {
          type: 'value',
          minInterval: 1,
          axisLabel: {
            color: '#fff',
            margin: 15
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(255,255,255,0.07)',
              width: 2
            }
          }
        },
        series: [
          {
            data: [],
            type: 'bar',
            barWidth: 20,
            label: {
              show: true,
              position: 'top',
              color: '#ffffff',
              fontSize: 16
            }
          }
        ]
      },
      againstStat: {
        series: [
          {
            name: '蓝方',
            type: 'pie',
            radius: ['50%', '70%'],
            avoidLabelOverlap: false,
            center: ['50%', '50%'],
            label: {
              show: false
            },
            itemStyle: {
              borderWidth: 0,
              color: ({ dataIndex }) => {
                const colorMap = {
                  0: '#6494F3',
                  1: '#46484A'
                }
                return colorMap[dataIndex]
              }
            },
            cursor: 'default',
            emphasis: {
              disabled: true
            },
            data: blueData
          },
          {
            name: '红方',
            type: 'pie',
            radius: ['25%', '45%'],
            avoidLabelOverlap: false,
            center: ['50%', '50%'],
            label: {
              show: false
            },
            itemStyle: {
              borderWidth: 0,
              color: ({ dataIndex }) => {
                const colorMap = {
                  0: '#FF6E75',
                  1: '#46484A'
                }
                return colorMap[dataIndex]
              }
            },
            cursor: 'default',
            emphasis: {
              disabled: true
            },
            data: redData
          }
        ]
      },
      isLoadAgainstChart: false,
      blueData,
      redData
    }
  },
  mounted() {
    this.getData()
    const sidebarEl = document.getElementsByClassName('sidebar-container')[0]
    sidebarEl && sidebarEl.addEventListener('transitionend', () => {
      window.dispatchEvent(new Event('resize'))
    })
  },
  methods: {
    getData() {
      drillFruitAnalyse({ drill_id: this.drillId }).then((res) => {
        this.initfinaled(res.data.data.task_complete_count || [])
        if (this.mode === 2) {
          this.initPiechart(res.data.data.color_complete_percent || [])
        }
      })
    },
    initfinaled(data) {
      const xAxisData = []
      const seriesData = []
      data.forEach(val => {
        xAxisData.push(val.name)
        seriesData.push(Number(val.count))
      })
      this.questionStat.xAxis.data = xAxisData
      this.questionStat.series[0].data = seriesData
      this.$refs?.finaledChart?.initChart()
    },
    initPiechart(data) {
      data.forEach(item => {
        if (item.color === 0) {
          this.redData[0].value = item.percent
          this.redData[1].value = 100 - item.percent
        } else if (item.color === 1) {
          this.blueData[0].value = item.percent
          this.blueData[1].value = 100 - item.percent
        }
      })
      this.$refs?.pieChart?.initChart()
      this.isLoadAgainstChart = true
    }
  }
}
</script>
<style lang="scss" scoped>
.analysis-container {
  width: 100%;
  height: 410px !important;
  .against-stat {
    width: 30%;
    min-width: 410px;
    margin-left: 10px;
    position: relative;
    .tips {
      position: absolute;
      left: 50%;
      transform: translateX(-105%);
      color: #fff;
      font-size: 16px;
      z-index: 10;
      white-space: nowrap;
      opacity: 0;
      transition: opacity 1s ease-in;
      &.blue {
        top: 18%;
        cursor: default;
      }
      &.red {
        top: 30%;
        cursor: default;
      }
      &.show {
        opacity: 1;
      }
    }
  }
  .stat-item {
    min-height: 345px;
    position: relative;
    z-index: 10;
  }
}
</style>
