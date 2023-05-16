<template>
  <div>
    <div class="card-container">
      <icr-card title="个人信息" class="info-stat">
        <div class="info-container">
          <img :src="ResourcePrefix + user.avatar" class="user-avatar">
          <div class="info">
            <div class="info-item">账号：{{ user.username }}</div>
            <div class="info-item">姓名：{{ user.real_name }}</div>
            <div class="info-item">组织：{{ user.org_ls | filterOrg }}</div>
            <div class="info-item">角色：{{ user.role }}</div>
          </div>
        </div>
      </icr-card>
      <icr-card title="学习数据" class="progress-stat">
        <div class="progress">
          <div v-for="item in progressArr" :key="item.type" class="progress-item">
            <span>{{ item.label }}：</span>
            <el-progress :percentage="(item.done / item.total) * 100" />
            <div class="number">{{ item.done }}</div>
          </div>
        </div>
      </icr-card>
    </div>
    <icr-card title="学习记录" class="log-stat">
      <div class="line-stat">
        <icr-chart ref="lineChart" class="stat-item" :option="lineStat" />
      </div>
    </icr-card>
    <icr-card title="课程学习统计" class="class-stat">
      <icr-table
        ref="table"
        :loading="loading"
        :columns="table.columns"
        :data="records"
      />
      <pagination :total.sync="total" :page.sync="page" :limit.sync="limit" />
    </icr-card>
  </div>
</template>

<script>
import { drillPaging } from '@/api/drill'

import { reactive } from '@vue/composition-api'
import IcrCard from '@/components/chars/card.vue'
import IcrChart from '@/components/chars/chart.vue'
import IcrTable from '@/components/table'
import Pagination from '@/components/Pagination'
import { usePagination } from '@/hooks'
import { getUserInfo } from '@/utils/auth'
import { ResourcePrefix } from '@/const/common'
import echarts from '@/vendors/echarts'
export default {
  components: {
    IcrCard,
    IcrChart,
    IcrTable,
    Pagination
  },
  setup() {
    const query = reactive({})
    return {
      // 假数据待修改
      ...usePagination(drillPaging, query)
    }
  },
  filters: {
    filterOrg(arr) {
      return arr.length ? arr.reduce((acc, item) => {
        acc.push(item.name)
        return acc
      }, []).join(',')
        : ''
    }
  },
  data() {
    return {
      ResourcePrefix,
      progressArr: [
        { type: 1, label: '完成课程', done: 0, total: 1 },
        { type: 2, label: '完成理论课时', done: 0, total: 1 },
        { type: 3, label: '完成实验课时', done: 0, total: 1 },
        { type: 4, label: '完成课后练习', done: 0, total: 1 }
      ],
      lineStat: {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            label: {
              backgroundColor: 'rgba(255,255,255, 0.3)'
            }
          }
        },
        legend: {
          data: ['课程', '实验报告', '平均分'],
          right: '8%'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: [],
          axisLine: {
            lineStyle: {
              color: 'rgba(255,255,255,0.2)'
            }
          },
          axisLabel: {
            color: '#fff'
          }
        },
        yAxis: [
          {
            name: '课程/实验报告',
            type: 'value',
            nameTextStyle: {
              color: 'rgba(255,255,255,0.5)'
            },
            axisLine: {
              show: true,
              lineStyle: {
                color: 'rgba(255,255,255,0.2)'
              }
            },
            splitLine: {
              show: false
            },
            axisLabel: {
              color: '#fff'
            }
          },
          {
            name: '平均分',
            type: 'value',
            nameTextStyle: {
              color: 'rgba(255,255,255,0.5)'
            },
            axisLine: {
              show: true,
              lineStyle: {
                color: 'rgba(255,255,255,0.2)'
              }
            },
            splitLine: {
              show: false
            },
            axisLabel: {
              color: '#fff'
            }
          }
        ],
        series: [
          {
            name: '课程',
            type: 'line',
            showSymbol: false,
            color: 'rgba(255,188,153)',
            lineStyle: {
              width: 2
            },
            areaStyle: {
              opacity: 0.8,
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: 'rgba(255,188,153,.37)'
                },
                {
                  offset: 1,
                  color: 'rgba(255,188,153,0)'
                }
              ])
            },
            emphasis: {
              focus: 'series'
            },
            smooth: true,
            data: []
          },
          {
            name: '实验报告',
            type: 'line',
            smooth: true,
            color: 'rgba(140,180,255)',
            lineStyle: {
              width: 2
            },
            areaStyle: {
              opacity: 0.8,
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: 'rgba(140,180,255)'
                },
                {
                  offset: 1,
                  color: 'rgba(96,85,81,0)'
                }
              ])
            },
            emphasis: {
              focus: 'series'
            },
            data: []
          },
          {
            name: '平均分',
            type: 'line',
            smooth: true,
            color: 'rgb(142,89,255)',
            yAxisIndex: 1,
            lineStyle: {
              width: 2
            },
            areaStyle: {
              opacity: 0.8,
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: 'rgba(142,89,255,.8)'
                },
                {
                  offset: 1,
                  color: 'rgba(142,89,255,0)'
                }
              ])
            },
            emphasis: {
              focus: 'series'
            },
            data: []
          }
        ]
      },
      table: {
        columns: [
          { prop: 'name', label: '名称' },
          { prop: 'direction', label: '方向' },
          { prop: 'level', label: '难度', render: (scope) => {
            return (
              <div class={this.getColor(scope.row.difficulty)}>{ scope.row.difficulty }</div>
            )
          } },
          { prop: 'item_num', label: '总课时' },
          { prop: 'theory', label: '已学习理论课时' },
          { prop: 'operation', label: '已学习实验课时' },
          { prop: 'practice', label: '已完成课后练习' },
          { prop: 'report', label: '已提交实验报告数' }
        ]
      }
    }
  },
  computed: {
    user() {
      return getUserInfo()
    }
  },
  mounted() {
    this.getProgress()
    this.getData()
    window.addEventListener('resize', this.handleResizeChart)
    this.$once('hook:beforeDestroy', () => {
      window.removeEventListener('resize', this.handleResizeChart)
    })
  },
  methods: {
    // 图表
    handleResizeChart() {
      this.$refs.lineChart.chart.resize()
    },
    // 学习数据
    getProgress() {
      const list = [
        { type: 1, done: 28, total: 100 },
        { type: 2, done: 99, total: 300 },
        { type: 3, done: 890, total: 1000 },
        { type: 4, done: 2, total: 10 }
      ]
      this.progressArr.map(val => {
        const ele = list.find(item => item.type === val.type)
        val.done = ele.done
        val.total = ele.total
      })
    },
    // 学习记录
    getData() {
      const xAxisData = ['03-21', '03-22', '03-23', '03-24', '03-25', '03-26', '03-27', '03-28', '03-29', '03-30', '03-31', '04-01', '04-02', '04-03', '04-04', '04-05', '04-06', '04-07', '04-08', '04-09']
      const lessonSeries = [220, 182, 191, 234, 290, 330, 310, 323, 442, 321, 90, 149, 210, 122, 133, 334, 198, 123, 125, 220]
      const reportSeries = [116, 127, 119, 97, 142, 110, 120, 116, 125, 109, 115, 120, 104, 97, 103, 123, 96, 113, 122, 103, 121]
      const averageSeries = [10, 12, 13, 88, 10, 11, 12, 13, 14, 15, 16, 17, 18, 17, 16, 15, 14, 13, 12, 11]
      this.lineStat.xAxis.data = xAxisData
      this.lineStat.series[0].data = lessonSeries
      this.lineStat.series[1].data = reportSeries
      this.lineStat.series[2].data = averageSeries
      this.$refs.lineChart.initChart()
    },
    // table难度
    getColor(difficulty) {
      if (difficulty === '初级') return 'green'
      else if (difficulty === '初级') return 'orange'
      else return 'red'
    }
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/themes/black/vars.scss';
.card-container {
  display: flex;
  justify-content: space-between;
  width: 100%;
  height: 250px !important;
  .info-stat,
  .progress-stat {
    display: flex;
    flex-direction: column;
    margin-bottom: 10px;
    width: 50%;
  }
  .progress-stat {
    margin-left: 10px;
  }
  .info-container {
    display: flex;
    height: 100%;
    align-items: center;
    img {
      width: 120px;
      height: 120px;
      margin: 0 50px;
    }
    .info {
      height: 120px;
      display: flex;
      flex-direction: column;
      justify-content: space-around;
    }
  }
  .progress {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    .progress-item {
      display: flex;
      span {
        width: 120px;
      }
      .number {
        width: 50px;
      }
    }
  }
}
.log-stat {
  display: flex;
  flex-direction: column;
  height: 380px;
  margin-bottom: 10px;
  .line-stat {
    height: 100%;
  }
}
.green {
  color: $--color-primary;
}
.orange {
  color: $--color-warning;
}
.red {
  color: $--color-danger;
}
::v-deep {
  .card__body {
    flex: 1;
  }
  .el-progress {
    flex: 1;
    .el-progress-bar {
      padding-right: 20px;
    }
    .el-progress__text {
      display: none;
    }
    .el-progress-bar__outer {
      background-color: rgba(255, 255, 255, 0.2);
    }
  }
}
</style>
