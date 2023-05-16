<template>
  <div class="analysis-container">
    <icr-card title="题目错误人数" class="question-stat">
      <icr-chart ref="histogramChart" class="stat-item" :option="questionStat" />
    </icr-card>
    <icr-card title="成绩分布" class="score-stat">
      <icr-chart ref="pieChart" class="stat-item" :option="scoreStat" />
    </icr-card>
  </div>
</template>

<script>
import IcrCard from '@/components/chars/card.vue'
import IcrChart from '@/components/chars/chart.vue'
import { examAnalysisHistogram, examAnalysisPiechart } from '@/api/exam'

export default {
  components: {
    IcrCard,
    IcrChart
  },
  inject: ['examId'],
  data() {
    return {
      questionStat: {
        color: ['#b5e4ca'],
        xAxis: {
          type: 'category',
          name: '题目序号',
          nameRotate: 270,
          nameTextStyle: {
            fontSize: 12,
            color: 'rgba(255, 255, 255, 0.5)'
          },
          data: []
        },
        yAxis: {
          type: 'value',
          name: '错题人数',
          nameTextStyle: {
            align: 'right',
            color: 'rgba(255, 255, 255, 0.5)'
          },
          axisLabel: {
            color: '#fff',
            margin: 15
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(255,255,255,0.07)',
              width: 2
            }
          },
          splitNumber: 5,
          minInterval: 1
        },
        dataZoom: {
          disabled: true,
          type: 'inside',
          start: 0
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
      scoreStat: {
        tooltip: {
          show: false
        },
        color: ['#B5E4CA', '#CABDFF', '#FF9FC8', '#F1D899', '#FFBC99'],
        series: [
          {
            name: 'Access From',
            type: 'pie',
            radius: ['40%', '60%'],
            avoidLabelOverlap: true,
            label: {
              alignTo: 'edge',
              color: '#fff',
              formatter: '{name|{b}}\n{number|{c}人，占比{d}%}',
              minMargin: 5,
              edgeDistance: 10,
              lineHeight: 15,
              rich: {
                number: {
                  fontSize: 12,
                  color: '#fff'
                }
              }
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '20'
              }
            },
            labelLine: {
              length: 20,
              length2: 0,
              maxSurfaceAngle: 80,
              lineStyle: {
                color: '#797f87'
              }
            },
            data: []
          }
        ]
      }
    }
  },
  mounted() {
    this.getHistogramData()
    this.getPiechartData()
    const sidebarEl = document.getElementsByClassName('sidebar-container')[0]
    sidebarEl && sidebarEl.addEventListener('transitionend', () => {
      window.dispatchEvent(new Event('resize'))
    })
  },
  methods: {
    getPiechartData() {
      examAnalysisPiechart({
        search_info: { exam_id: this.examId }
      }).then((res) => {
        const totalScore = res.data.info.total_score
        const scoreInterval = Math.round(totalScore / 10)
        const scoreList = res.data.info.scores
        const excellentScoreKey = `${totalScore - scoreInterval} ~ ${totalScore}分`
        const goodScoreKey = `${totalScore - 2 * scoreInterval} ~ ${totalScore - scoreInterval - 1}分`
        const mediumScoreKey = `${totalScore - 3 * scoreInterval} ~ ${totalScore - 2 * scoreInterval - 1}分`
        const passingScoreKey = `${totalScore - 4 * scoreInterval} ~ ${totalScore - 3 * scoreInterval - 1}分`
        const badScoreKey = `${totalScore - 4 * scoreInterval}分以下`
        const cases = {
          [excellentScoreKey]: 0,
          [goodScoreKey]: 0,
          [mediumScoreKey]: 0,
          [passingScoreKey]: 0,
          [badScoreKey]: 0
        }
        scoreList.forEach(score => {
          if (score >= totalScore - scoreInterval) {
            cases[excellentScoreKey]++
          } else if (score < totalScore - scoreInterval && score >= totalScore - 2 * scoreInterval) {
            cases[goodScoreKey]++
          } else if (score < totalScore - 2 * scoreInterval && score >= totalScore - 3 * scoreInterval) {
            cases[mediumScoreKey]++
          } else if (score < totalScore - 3 * scoreInterval && score >= totalScore - 4 * scoreInterval) {
            cases[passingScoreKey]++
          } else if (score < totalScore - 4 * scoreInterval && score >= 0) {
            cases[badScoreKey]++
          }
        })
        this.scoreStat.series[0].data.push(...Object.entries(cases).map(item => {
          return {
            name: item[0],
            value: item[1]
          }
        }))
        this.scoreStat.series[0].labelLayout = (params) => {
          const isLeft = params.labelRect.x < this.$refs.pieChart.chart.getWidth() / 2
          const points = params.labelLinePoints
          points[2][0] = isLeft
            ? params.labelRect.x
            : params.labelRect.x + params.labelRect.width
          return {
            labelLinePoints: points
          }
        }
        this.$refs.pieChart.initChart()
      })
    },
    getHistogramData() {
      examAnalysisHistogram({
        search_info: { exam_id: this.examId }
      }).then((res) => {
        const xAxisData = []
        const seriesData = []
        res.data.data.forEach(val => {
          xAxisData.push(val.sort)
          seriesData.push(Number(val.count))
        })
        this.questionStat.xAxis.data = xAxisData
        this.questionStat.series[0].data = seriesData
        if (seriesData.length > 25) {
          this.questionStat.dataZoom.disabled = false
          this.questionStat.dataZoom.end = Math.round(25 / seriesData.length * 100)
        }
        this.$refs.histogramChart.initChart()
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.analysis-container {
  display: flex;
  justify-content: space-between;
  width: 100%;
  height: 410px !important;
  .question-stat {
    width: 57.4%;
  }
  .score-stat {
    width: 42%;
  }
  .stat-item {
    min-height: 345px;
    position: relative;
    z-index: 10;
  }
}
</style>
