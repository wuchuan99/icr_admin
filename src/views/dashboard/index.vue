<template>
  <div class="dashboard-container">
    <!-- <div class="dashboard-text">首页</div> -->
    <icr-card title="资源统计" class="res-stat">
      <div class="stat-list">
        <icr-chart
          v-for="(option, index) in resStatList"
          :key="index"
          class="stat-list__item"
          :option="option"
        />
      </div>
    </icr-card>

    <icr-card title="数据统计" class="data-stat">
      <div class="data-stat-list">
        <div
          v-for="(item, index) in dataStateList"
          :key="index"
          class="data-stat-list__item"
        >
          <div class="icon" :style="{ background: item.color }">
            <i :class="'iconfont icon-' + item.icon" />
          </div>
          <div class="desc">
            <p style="font-size: 18px;font-weight: bold;">{{ item.title }}</p>
            <p style="font-size: 32px;margin:10px 0;">{{ item.value }}</p>
          </div>
        </div>
      </div>
    </icr-card>

    <icr-card title="日活跃度统计图" class="pv-stat">
      <icr-chart class="stat-item" :option="pvStat" />
    </icr-card>

    <icr-card title="用户统计图" class="user-stat">
      <icr-chart class="stat-item" :option="userStat" />
      <div style="width: 60%; height: 100%; position: absolute; top: 0; background: #1B1D20; border-radius: 6px;" />
    </icr-card>

    <icr-card title="日活跃统计图" class="a-stat">
      <icr-chart class="stat-item" :option="aStat" />
      <div style="width: 70%; height: 100%; position: absolute; top: 0; background: #1B1D20; border-radius: 6px;" />
    </icr-card>

    <icr-card title="日活跃统计图" class="b-stat">
      <icr-chart class="stat-item" :option="pvStat" />
    </icr-card>

    <icr-card title="动态" class="actives">
      <div class="actives-wrapper">
        <div class="users-stat">
          <div class="users-stat__item">
            <div class="icon" style="background: #3c72ff">
              <i class="iconfont icon-zaixianyonghushu" />
            </div>
            <p>在线用户数</p>
            <p>120</p>
          </div>
          <div class="users-stat__item">
            <div class="icon" style="background: #e35156">
              <i class="iconfont icon-xunlianshu" />
            </div>
            <p>在线用户数</p>
            <p>120</p>
          </div>
        </div>
        <div class="message-list">
          <div
            v-for="(item, index) in messages"
            :key="index"
            class="message-list__item"
          >
            <div class="msg" v-html="item.message" />
            <div class="time">
              <i class="el-icon-time" style="font-size: 17px;margin-right: 5px;" />
              <span>{{ item.time }}</span>
            </div>
          </div>
        </div>
      </div>
    </icr-card>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import IcrCard from './components/card.vue'
import IcrChart from './components/chart.vue'
import dayjs from 'dayjs'

const chartLabel = {
  show: false,
  textBorderColor: '#fff',
  color: '#fff',
  overflow: 'break'
}

const userStatData = [
  {
    value: 335,
    name: '普通用户'
  },
  {
    value: 234,
    name: '管理员'
  },
  {
    value: 1548,
    name: '教员'
  },
  {
    value: 200,
    name: '其他'
  }
]

const pvUserStatData = Array.apply(null, Array(20)).map((_, index) => {
  const y = '2021'
  const m = '10'
  const d = '26'

  const initDate = dayjs(`${y}-${m}-${d}`)
  const time = initDate.add(index * 8, 'h').format('YYYY-MM-DDTHH:mm:ssZ')

  const val = (Math.random() * 4).toFixed(2)
  return [time, val]
})

const pvSceneStatData = Array.apply(null, Array(20)).map((_, index) => {
  const y = '2021'
  const m = '10'
  const d = '26'

  const initDate = dayjs(`${y}-${m}-${d}`)
  const time = initDate.add(index * 8, 'h').format('YYYY-MM-DDTHH:mm:ssZ')

  const val = (Math.random() * 4).toFixed(2)
  return [time, val]
})

export default {
  name: 'Dashboard',
  components: {
    IcrCard,
    IcrChart
  },
  computed: {
    ...mapGetters(['name'])
  },
  data() {
    return {
      resStatList: [
        {
          legend: {
            orient: 'horizontal',
            padding: [10, 30, 10, 30],
            itemGap: 20,
            bottom: '10',
            icon: 'circle',
            data: ['应用系统', '开发系统', '网络设备']
          },
          title: {
            text: '靶场统计',
            left: 'center',
            top: '31%'
          },
          tooltip: {
            show: false
          },
          series: [
            {
              type: 'pie',
              label: chartLabel,
              clockwise: false,
              startAngle: 120,
              data: [
                {
                  value: 250,
                  name: '应用系统',
                  itemStyle: {
                    color: '#489ff8'
                  }
                },
                {
                  value: 600,
                  name: '开发系统',
                  itemStyle: {
                    color: '#4971f6'
                  }
                },
                {
                  value: 100,
                  name: '网络设备',
                  itemStyle: {
                    color: '#ea4c33'
                  }
                }
              ],
              center: ['50%', '36%'],
              radius: ['37%', '56%']
            }
          ]
        },
        {
          legend: {
            orient: 'horizontal',
            padding: [10, 30, 10, 30],
            itemGap: 20,
            bottom: '10',
            icon: 'circle',
            data: ['背景流量', '攻击流量', '流量合集']
          },
          title: {
            text: '流量统计',
            left: 'center',
            top: '31%'
          },
          tooltip: {
            show: false
          },
          series: [
            {
              type: 'pie',
              label: chartLabel,
              clockwise: false,
              startAngle: 120,
              data: [
                {
                  value: 250,
                  name: '背景流量',
                  itemStyle: {
                    color: '#4971f6'
                  }
                },
                {
                  value: 600,
                  name: '攻击流量',
                  itemStyle: {
                    color: '#5cc496'
                  }
                },
                {
                  value: 100,
                  name: '流量合集',
                  itemStyle: {
                    color: '#f4b944'
                  }
                }
              ],
              center: ['50%', '36%'],
              radius: ['37%', '56%']
            }
          ]
        },
        {
          legend: {
            orient: 'horizontal',
            padding: [10, 30, 10, 30],
            itemGap: 20,
            bottom: '10',
            icon: 'circle',
            data: ['单兵训练', '漏洞还原', '团队训练', '红蓝对抗']
          },
          title: {
            text: '场景统计',
            left: 'center',
            top: '31%'
          },
          tooltip: {
            show: false
          },
          series: [
            {
              type: 'pie',
              label: chartLabel,
              clockwise: false,
              startAngle: 150,
              data: [
                {
                  value: 200,
                  name: '单兵训练',
                  itemStyle: {
                    color: '#4971f6'
                  }
                },
                {
                  value: 600,
                  name: '漏洞还原',
                  itemStyle: {
                    color: '#489ff8'
                  }
                },
                {
                  value: 100,
                  name: '团队训练',
                  itemStyle: {
                    color: '#ea4c33'
                  }
                },
                {
                  value: 100,
                  name: '红蓝对抗',
                  itemStyle: {
                    color: '#f4b944'
                  }
                }
              ],
              center: ['50%', '36%'],
              radius: ['37%', '56%']
            }
          ]
        }
      ],
      pvStat: {
        legend: { bottom: 10, itemGap: 60 },
        grid: { left: 30, right: 10, top: 20 },
        tooltip: { trigger: 'axis' },
        xAxis: {
          type: 'time',
          axisLabel: {
            formatter: function(value) {
              return dayjs(value).format('MM.DD')
            },
            align: 'left'
          },
          minInterval: 3600 * 24 * 1000,
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          }
        },
        yAxis: {
          type: 'value',
          splitNumber: 4,
          offset: 10,
          splitLine: {
            lineStyle: {
              color: 'rgba(104,128,177, .7)'
            }
          }
        },
        series: [
          {
            name: '用户',
            type: 'line',
            showSymbol: false,
            data: pvUserStatData,
            smooth: true
          },
          {
            name: '场景',
            type: 'line',
            showSymbol: false,
            data: pvSceneStatData,
            smooth: true
          }
        ]
      },
      userStat: {
        legend: {
          orient: 'vertical',
          align: 'auto',
          top: 20,
          right: 10,
          itemGap: 30,
          icon: 'circle',
          itemStyle: {
            borderWidth: 0
          },
          data: ['普通用户', '管理员', '教员', '其他'],
          formatter: (name) => {
            const total = userStatData.reduce((acc, cur) => {
              return acc + cur.value
            }, 0)

            const currentItem = userStatData.find(item => item.name === name)

            const percent = parseInt(currentItem.value / total * 100)
            const arr = [
              `{em| ${percent}% }`,
              name
            ]
            return arr.join(' ')
          }
        },
        series: [
          {
            type: 'pie',
            label: chartLabel,
            data: userStatData,
            center: ['30%', '50%']
          }
        ]
      },
      aStat: {
        legend: {
          orient: 'vertical',
          align: 'auto',
          top: 20,
          right: 0,
          itemGap: 30,
          icon: 'circle',
          data: ['总流量', '工业流量'],
          itemStyle: {
            borderWidth: 0
          },
          formatter: (name) => {
            const percent = name.indexOf('总') >= 0 ? '66%' : '33%'

            const arr = [
              `{reg|${name}}`,
              `{em2|${percent}}`
            ]
            return arr.join('\n')
          },
          textStyle: {
            rich: {
              reg: {
                align: 'left',
                verticalAlign: 'bottom',
                padding: [25, 0, 0, 0]
              },
              em2: {
                fontSize: 24,
                fontWeight: 'bold',
                color: '#D6EAFF',
                padding: [40, 0, 0, 0],
                lineHeight: 26
              }
            }
          }
        },
        series: [
          {
            type: 'pie',
            label: chartLabel,
            startAngle: -90,
            data: [
              {
                value: 500,
                name: '工业流量',
                itemStyle: {
                  borderWidth: 0
                }
              },
              {
                value: 500,
                itemStyle: {
                  color: '#fff',
                  borderWidth: 0
                }
              }
            ],
            radius: ['40', '55'],
            center: ['35%', '50%']
          },
          {
            type: 'pie',
            label: chartLabel,
            startAngle: -90,
            data: [
              {
                value: 500,
                name: '总流量',
                itemStyle: {
                  borderWidth: 0
                }
              },
              {
                value: 450,
                itemStyle: {
                  color: '#fff',
                  borderWidth: 0
                }
              }
            ],
            radius: ['65', '80'],
            center: ['35%', '50%']
            // roseType: 'area'
          }
        ]
      },
      dataStateList: [
        { icon: 'loudongku', color: '#3c72ff', title: '漏洞库', value: '377383' },
        { icon: 'gongjuku', color: '#34c792', title: '工具库', value: '345' },
        { icon: 'tanzhen', color: '#2da1ff', title: '探针', value: '53478' },
        { icon: 'renwu', color: '#e35156', title: '任务', value: '7465' }
      ],
      messages: Array.apply(null, Array(3)).map(() => {
        return {
          message: '<p style="font-size:18px">用户<span style="color:#489FF8;font-weight:bold;">超级管理员</span>创建了<span style="color:#489FF8;font-weight:bold;">单兵训练</span>lab3</p>',
          time: '6点前'
        }
      })
    }
  },
  mounted() {
    const sidebarEl = document.getElementsByClassName('sidebar-container')[0]
    sidebarEl && sidebarEl.addEventListener('transitionend', () => {
      window.dispatchEvent(new Event('resize'))
    })
  }
}
</script>
