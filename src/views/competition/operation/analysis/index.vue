<template>
  <div class="analysis-container">
    <icr-card title="题目正确数量" class="question-stat">
      <icr-chart ref="questionWrongCountChart" class="stat-item" :option="questionStat" />
    </icr-card>
    <!-- <icr-card title="成绩分布" class="score-stat">
      <icr-chart ref="scoreDistributionChart" class="stat-item" :option="scoreStat" />
    </icr-card> -->
  </div>
</template>

<script>
import IcrCard from './components/card.vue'
import IcrChart from './components/chart.vue'
import { competitionOperationAnalysis } from '@/api/competition'

export default {
  components: {
    IcrCard,
    IcrChart
  },
  inject: ['competitionId'],
  data() {
    return {
      // questionStat: {
      //   color: ['#b5e4ca'],
      //   xAxis: {
      //     type: 'category',
      //     data: []
      //   },
      //   yAxis: {
      //     type: 'value',
      //     axisLabel: {
      //       color: '#fff',
      //       margin: 15
      //     },
      //     splitLine: {
      //       lineStyle: {
      //         color: 'rgba(255,255,255,0.07)',
      //         width: 2
      //       }
      //     }
      //   },
      //   series: [
      //     {
      //       data: [],
      //       type: 'bar',
      //       barWidth: 20,
      //       label: {
      //         show: true,
      //         position: 'top',
      //         color: '#ffffff',
      //         fontSize: 16
      //       }
      //     }
      //   ]
      // },
      // scoreStat: {
      //   tooltip: {
      //     show: false
      //   },
      //   color: ['#ffbc99', '#f1d899', '#b1e5fc', '#cabdff', '#cabdff'],
      //   legend: {
      //     top: '30%',
      //     right: 30,
      //     itemGap: 10,
      //     align: 'auto',
      //     orient: 'vertical',
      //     icon: 'circle'
      //   },
      //   series: [
      //     {
      //       name: 'Access From',
      //       type: 'pie',
      //       radius: ['50%', '70%'],
      //       avoidLabelOverlap: false,
      //       label: {
      //         show: false,
      //         position: 'inner',
      //         formatter: (data) => {
      //           return data.percent.toFixed(0) + '%'
      //         },
      //         color: '#000'
      //       },
      //       center: ['30%', '55%'],
      //       emphasis: {
      //         label: {
      //           show: true,
      //           fontSize: '20'
      //         }
      //       },
      //       labelLine: {
      //         show: false
      //       },
      //       data: []
      //     }
      //   ]
      // }
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
          name: '人数',
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
            radius: ['50%', '70%'],
            avoidLabelOverlap: false,
            label: {
              color: '#fff'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '20'
              }
            },
            labelLine: {
              length: 20,
              length2: 70,
              lineStyle: {
                color: '#fff'
              }
            },
            data: []
          }
        ]
      }
    }
  },
  mounted() {
    this.getAnalysisData()

    const sidebarEl = document.getElementsByClassName('sidebar-container')[0]
    sidebarEl && sidebarEl.addEventListener('transitionend', () => {
      window.dispatchEvent(new Event('resize'))
    })
  },
  methods: {
    getAnalysisData() {
      competitionOperationAnalysis({
        data: { id: this.competitionId }
      }).then(res => {
        console.log('analysis data ', res)
        const data = res.data?.data
        if (data) {
          const errList = data.correct_total
          const scoreList = data.score_list
          // question right data
          errList.forEach(item => {
            const questId = String(item[0])
            const questWrongCount = item[1]

            const xIndex = this.questionStat.xAxis.data.indexOf(questId)
            if (xIndex < 0) {
              this.questionStat.xAxis.data.push(questId)
              this.questionStat.series[0].data.push(questWrongCount)
            } else {
              this.questionStat.series[0].data[xIndex] += questWrongCount
            }
          })
          this.$refs.questionWrongCountChart?.initChart()

          // score distribution data
          const goodScoreKey = '>=60'
          // const normalScoreKey = '60-79'
          const badScoreKey = '<60'
          const cases = {
            [goodScoreKey]: 0,
            // [normalScoreKey]: 0,
            [badScoreKey]: 0
          }

          scoreList.forEach(score => {
            if (score >= 60) {
              cases[goodScoreKey]++
            } else if (score < 60 && score >= 0) {
              cases[badScoreKey]++
            }
          })

          console.log(cases)
          this.scoreStat.series[0].data.push(...Object.entries(cases).map(item => {
            return {
              name: `${item[0]} (${item[1]}人)`,
              value: item[1]
            }
          }))
          this.$refs.scoreDistributionChart?.initChart()
        }
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
    width: 100%;
  }
  // .score-stat {
  //   width: 42%;
  // }
  .stat-item {
    min-height: 345px;
    position: relative;
    z-index: 10;
  }
}
</style>
