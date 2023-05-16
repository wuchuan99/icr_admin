<template>
  <div class="app-container">
    <!-- 图表 -->
    <div class="chart-container">
      <icr-card title="资源统计" class="resource-stat">
        <div class="pie-container">
          <div class="pie-stat">
            <icr-chart ref="cpuChart" class="stat-item" :option="cpuStat" />
          </div>
          <div class="pie-stat">
            <icr-chart ref="memoryChart" class="stat-item" :option="memoryStat" />
          </div>
          <div class="pie-stat">
            <icr-chart ref="diskChart" class="stat-item" :option="diskStat" />
          </div>
        </div>
      </icr-card>
      <div class="cards">
        <div v-for="item in cardList" :key="item.name" class="card-item" @click="clickCardList(item.type)">
          <i class="iconfont" :class="item.icon" />
          <div>
            <div class="top">{{ item.name }}</div>
            <div class="bottom">{{ item.num | toLocaleString }}</div>
          </div>
        </div>
      </div>
    </div>
    <!-- 节点管理表格 -->
    <div class="table-container">
      <div class="title">节点管理</div>
      <div v-loading="nodeLoading" class="control-box">
        <div class="name">
          <div class="top">控制节点</div>
          <div class="bottom">{{ controlInfo.hypervisor_hostname }}</div>
        </div>
        <div class="info">
          <el-descriptions :column="3">
            <el-descriptions-item label="节点IP">{{ controlInfo.host_ip }}</el-descriptions-item>
            <el-descriptions-item label="内存状态（总大小/使用率）">{{ ((controlInfo.memory_mb / 1024).toFixed(2)) }}GB / {{ ((controlInfo.memory_mb_used / controlInfo.memory_mb) * 100).toFixed(2) }}%</el-descriptions-item>
            <el-descriptions-item label="虚拟机数量">{{ controlInfo.running_vms }}</el-descriptions-item>
            <el-descriptions-item label="服务状态" :content-class-name="controlInfo.status === 'enabled' ? 'greenText' : 'redText'">{{ controlInfo.status === 'enabled' ? '运行' : '关闭' }}</el-descriptions-item>
            <el-descriptions-item label="CPU状态（总数量/使用率）">{{ controlInfo.vcpus }}核心 / {{ ((controlInfo.vcpus_used / controlInfo.vcpus / 16) * 100).toFixed(2) }}%</el-descriptions-item>
            <!-- <el-descriptions-item label="虚拟机数量限制">{{ controlInfo.vms_quotas }}</el-descriptions-item> -->
            <el-descriptions-item label-class-name="no-colon" />
            <el-descriptions-item label="节点管理" :content-class-name="controlInfo.state === 'up' ? 'greenText' : 'redText'">{{ controlInfo.state === 'up' ? '运行' : '关闭' }}</el-descriptions-item>
            <el-descriptions-item label="硬盘（总大小/使用率）">{{ (controlInfo.local_gb / 1024).toFixed(2) }}TB / {{ ((controlInfo.local_gb_used / controlInfo.local_gb) * 100).toFixed(2) }}%</el-descriptions-item>
          </el-descriptions>
        </div>
        <div class="buttons">
          <el-button
            type="text"
            :disabled="controlInfo.state !== 'up' || controlInfo.status !== 'enabled'"
            :loading="controlInfo.loadingShutdown"
            @click="shutdown(controlInfo)"
          >
            关机
          </el-button>
        </div>
      </div>
      <icr-table
        ref="table"
        :loading="nodeLoading"
        :columns="nodeTable.columns"
        :data="nodeList"
        max-height="395"
      />
    </div>
    <!-- 计算服务、块存储服务、网络代理 -->
    <div class="table-container">
      <AsideTabs v-model="activeIndex" @tab-click="handleClick">
        <el-tab-pane v-for="item in leftOption" :key="item.value" :label="item.label" :name="item.value">
          <icr-table
            ref="table"
            :loading="tabLoading"
            :columns="columns"
            :data="tabRecords"
            :row-click="rowClick"
            max-height="395"
          />
        </el-tab-pane>
      </AsideTabs>
    </div>
    <!-- 确认弹框 -->
    <cluster-confirm
      ref="confirmDelete"
      :title="delTitle"
      :desc="delDesc"
    />
  </div>
</template>

<script>
import IcrCard from '@/components/chars/card.vue'
import IcrChart from '@/components/chars/chart.vue'
import IcrTable from '@/components/table'
import clusterConfirm from './components/confirm.vue'
import { clusterManagePaging, clusterManageReboot, clusterManageShutdown, clusterManageStackserviceinfo, clusterManageShutdownall } from '@/api/cluster_manage'
import AsideTabs from '@/views/common/aside-tabs.vue'
export default {
  components: {
    IcrCard,
    IcrChart,
    IcrTable,
    clusterConfirm,
    AsideTabs
  },
  filters: {
    toLocaleString(num) {
      return num.toLocaleString()
    }
  },
  data() {
    const TabList = {
      '0': 'compute',
      '1': 'block',
      '2': 'network'
    }
    return {
      cpuStat: {
        tooltip: {
          show: false
        },
        legend: {
          icon: 'none',
          orient: 'vertical',
          itemGap: 20,
          top: 'center',
          right: '10',
          data: [
            {
              name: '已使用',
              textStyle: {
                color: '#B5E3CA',
                lineHeight: 18
              }
            },
            {
              name: '未使用',
              textStyle: {
                color: 'rgba(181,227,202,0.5)',
                lineHeight: 18
              }
            }
          ],
          formatter: (name) => {
            let total = 0
            let target = 0
            const data = this.cpuStat.series[0].data
            for (var i = 0; i < data.length; i++) {
              total += data[i].value
              if (data[i].name === name) {
                target = data[i].value
              }
            }
            const v = ((target / total) * 100).toFixed(2)
            return `${name}\n${target}核 / 占比${v}%`
          }
        },
        title: {
          text: 'VCPU',
          left: '23%',
          top: '50%',
          textStyle: {
            fontSize: 16
          }
        },
        color: ['#B5E3CA', 'rgba(181,227,202,0.5)'],
        series: [
          {
            type: 'pie',
            label: {
              show: false,
              textBorderColor: '#fff',
              color: '#fff',
              overflow: 'break'
            },
            itemStyle: {
              borderWidth: 0
            },
            data: [],
            center: ['30%', '55%'],
            radius: ['40%', '60%']
          }
        ]
      },
      memoryStat: {
        tooltip: {
          show: false
        },
        legend: {
          icon: 'none',
          orient: 'vertical',
          itemGap: 20,
          top: 'center',
          right: '10',
          data: [
            {
              name: '已使用',
              textStyle: {
                color: '#FFBB99',
                lineHeight: 18
              }
            },
            {
              name: '未使用',
              textStyle: {
                color: 'rgba(255,187,153,0.5)',
                lineHeight: 18
              }
            }
          ],
          formatter: (name) => {
            let total = 0
            let target = 0
            const data = this.memoryStat.series[0].data
            for (var i = 0; i < data.length; i++) {
              total += data[i].value
              if (data[i].name === name) {
                target = data[i].value
              }
            }
            const v = ((target / total) * 100).toFixed(2)
            return `${name}\n${target}GB / 占比${v}%`
          }
        },
        title: {
          text: '内存',
          left: '24%',
          top: '50%',
          textStyle: {
            fontSize: 16
          }
        },
        color: ['#FFBB99', 'rgba(255,187,153,0.5)'],
        series: [
          {
            type: 'pie',
            label: {
              show: false,
              textBorderColor: '#fff',
              color: '#fff',
              overflow: 'break'
            },
            itemStyle: {
              borderWidth: 0
            },
            data: [],
            center: ['30%', '55%'],
            radius: ['40%', '60%']
          }
        ]
      },
      diskStat: {
        tooltip: {
          show: false
        },
        legend: {
          icon: 'none',
          orient: 'vertical',
          itemGap: 20,
          top: 'center',
          right: '10',
          data: [
            {
              name: '已使用',
              textStyle: {
                color: '#CABCFD',
                lineHeight: 18
              }
            },
            {
              name: '未使用',
              textStyle: {
                color: 'rgba(202,188,253,0.5)',
                lineHeight: 18
              }
            }
          ],
          formatter: (name) => {
            let total = 0
            let target = 0
            const data = this.diskStat.series[0].data
            for (var i = 0; i < data.length; i++) {
              total += data[i].value
              if (data[i].name === name) {
                target = data[i].value
              }
            }
            const v = ((target / total) * 100).toFixed(2)
            return `${name}\n${target}TB / 占比${v}%`
          }
        },
        title: {
          text: '磁盘存储',
          left: '20%',
          top: '50%',
          textStyle: {
            fontSize: 16
          }
        },
        color: ['#CABCFD', 'rgba(202,188,253,0.5)'],
        series: [
          {
            type: 'pie',
            label: {
              show: false,
              textBorderColor: '#fff',
              color: '#fff',
              overflow: 'break'
            },
            itemStyle: {
              borderWidth: 0
            },
            data: [],
            center: ['30%', '55%'],
            radius: ['40%', '60%']
          }
        ]
      },
      cardList: [
        {
          name: '虚拟机数量（台）',
          icon: 'icon-xuniji',
          num: 0,
          type: 1
        },
        {
          name: '虚拟端口数量（个）',
          icon: 'icon-xuniduankou',
          num: 0,
          type: 2
        },
        {
          name: '镜像数量（个）',
          icon: 'icon-jingxiang',
          num: 0,
          type: 3
        },
        {
          name: '虚拟网络数量（个）',
          icon: 'icon-monihulianwang',
          num: 0,
          type: 4
        }
      ],
      nodeTable: {
        columns: [
          { prop: 'hypervisor_hostname', label: '节点名称' },
          { prop: 'host_ip', label: '节点IP' },
          { prop: 'status', label: '服务状态',
            render: (scope) => {
              return (
                <div class={scope.row.status === 'enabled' ? 'greenText' : 'redText'}>
                  {scope.row.status === 'enabled' ? '运行' : '关闭'}
                </div>
              )
            }
          },
          { prop: 'state', label: '节点管理',
            render: (scope) => {
              return (
                <div class={scope.row.state === 'up' ? 'greenText' : 'redText'}>
                  {scope.row.state === 'up' ? '运行' : '关闭'}
                </div>
              )
            }
          },
          { label: '内存状态（总大小/使用率）', width: 200,
            render: (scope) => {
              const memory_gb = (scope.row.memory_mb / 1024).toFixed(2)
              return (
                <div>
                  {memory_gb}GB / { ((scope.row.memory_mb_used / scope.row.memory_mb) * 100).toFixed(2)}%
                </div>
              )
            }
          },
          { label: 'CPU状态（总数量/使用率）', width: 200,
            render: (scope) => {
              return (
                <div>
                  {scope.row.vcpus}核心 / { ((scope.row.vcpus_used / scope.row.vcpus / 16) * 100).toFixed(2)}%
                </div>
              )
            } },
          { label: '硬盘（总大小/使用率）', width: 180,
            render: (scope) => {
              const local_tb = (scope.row.local_gb / 1024).toFixed(2)
              return (
                <div>
                  {local_tb}TB / { ((scope.row.local_gb_used / scope.row.local_gb) * 100).toFixed(2)}%
                </div>
              )
            }
          },
          { prop: 'running_vms', label: '虚拟机数量', width: 120 },
          // { prop: 'vms_quotas', label: '虚拟机数量限制', width: 150 },
          {
            label: '操作',
            width: 150,
            render: (scope) => {
              return (
                <div> { scope.row.hypervisor_hostname !== 'control' &&
                  <div>
                    <el-button
                      type='text'
                      disabled={ scope.row.state !== 'up' || scope.row.status !== 'enabled' || scope.row.loadingReboot }
                      loading={ scope.row.loadingShutdown }
                      onclick={() => {
                        this.shutdown(scope.row)
                      }}
                    >
                      关机
                    </el-button>
                    <el-button
                      type='text'
                      disabled={ scope.row.state !== 'up' || scope.row.status !== 'enabled' || scope.row.loadingShutdown }
                      loading={ scope.row.loadingReboot }
                      onclick={() => {
                        this.reboot(scope.row)
                      }}
                    >
                      重启
                    </el-button>
                  </div> }
                </div>
              )
            }
          }
        ]
      },
      nodeList: [],
      nodeRecords: [],
      nodeLoading: false,
      controlInfo: {},
      vcpusUsed: 0, // cpu已使用
      vcpusToUse: 0, // cpu未使用
      memoryUsed: 0, // 内存已使用
      memoryToUse: 0, // 内存未使用
      localUsed: 0, // 硬盘未使用
      localToUse: 0, // 硬盘未使用
      delTitle: '关机',
      delDesc: '关机会导致部分服务不可用，确定关闭此节点？',
      resource_statistics: [],
      leftOption: [
        {
          label: '计算服务',
          value: '0'
        },
        {
          label: '存储服务',
          value: '1'
        },
        {
          label: '网络代理服务',
          value: '2'
        }
      ],
      activeIndex: '0',
      columnsOptions: [
        { prop: 'type', label: '类型' },
        { prop: 'name', label: '服务名称' },
        { prop: 'host', label: '节点' },
        { prop: 'zone', label: '区域' },
        { prop: 'status', label: '注册状态',
          render: (scope) => {
            const enabled = scope.row.status === 'True' || scope.row.status === 'enabled'
            return (
              <div class={enabled ? 'greenText' : 'redText'} style='height:26px;'>
                {enabled ? '激活' : '未激活'}
              </div>
            )
          }
        },
        { prop: 'state', label: '运行状态',
          render: (scope) => {
            const enabled = scope.row.state === 'True' || scope.row.state === 'up'
            return (
              <div class={enabled ? 'greenText' : 'redText'}>
                {enabled ? '启动' : '关闭'}
              </div>
            )
          } }
      ],
      tabRecords: [],
      tabLoading: false,
      poll_timer: null, // 轮询计时器
      TabList
    }
  },
  computed: {
    columns() {
      return this.activeIndex === '2' ? this.columnsOptions : this.columnsOptions.slice(1)
    }
  },
  mounted() {
    this.getNodeRecord()
    this.getTabRecords('compute')
    this.timerInterval()
  },
  beforeDestroy() {
    if (this.poll_timer) {
      clearInterval(this.poll_timer)
    }
  },
  methods: {
    // 获取图表数据
    getEcharsData() {
      this.vcpusUsed = this.resource_statistics.vcpus.in_use
      this.vcpusToUse = this.resource_statistics.vcpus.limit - this.vcpusUsed
      this.memoryUsed = this.resource_statistics.ram.in_use
      this.memoryToUse = this.resource_statistics.ram.limit - this.memoryUsed
      this.localUsed = this.getUsed(this.nodeRecords, 'local_gb_used')
      this.localToUse = this.nodeRecords[0].local_gb - this.localUsed
    },
    // 初始化图表
    setPieData(flag = true) {
      this.cpuStat.series[0].data = [{
        value: this.vcpusUsed,
        name: '已使用'
      },
      {
        value: this.vcpusToUse,
        name: '未使用'
      }]
      this.memoryStat.series[0].data = [{
        value: Number((this.memoryUsed / 1024).toFixed(2)),
        name: '已使用'
      },
      {
        value: Number((this.memoryToUse / 1024).toFixed(2)),
        name: '未使用'
      }]
      this.diskStat.series[0].data = [{
        value: Number((this.localUsed / 1024).toFixed(2)),
        name: '已使用'
      },
      {
        value: Number((this.localToUse / 1024).toFixed(2)),
        name: '未使用'
      }]
      if (flag) {
        this.$refs.cpuChart && this.$refs.cpuChart.initChart()
        this.$refs.memoryChart && this.$refs.memoryChart.initChart()
        this.$refs.diskChart && this.$refs.diskChart.initChart()
      } else {
        this.$refs.cpuChart.setOption(this.cpuStat)
        this.$refs.memoryChart.setOption(this.memoryStat)
        this.$refs.diskChart.setOption(this.diskStat)
      }
    },
    // 获取表格信息
    getNodeRecord(flag = true) {
      if (flag) this.nodeLoading = true
      return new Promise((resolve, reject) => {
        clusterManagePaging({
          page_info: {
            page_num: 1,
            page_size: 9999
          },
          search_info: {}
        })
          .then((res) => {
            if (res.data) {
              this.resource_statistics = res.data.resource_statistics
              this.nodeRecords = res.data.data
              this.cardList[0].num = this.getUsed(this.nodeRecords, 'running_vms')
              this.cardList[1].num = res.data.net_info.ports
              this.cardList[2].num = res.data.image_info.image + res.data.image_info.snapshot
              this.cardList[3].num = res.data.net_info.networks
              this.nodeRecords.map(item => {
                this.$set(item, 'loadingShutdown', false)
                this.$set(item, 'loadingReboot', false)
                return item
              })
              const index = this.nodeRecords.findIndex(ele => ele.hypervisor_hostname === 'control')
              this.controlInfo = this.nodeRecords[index]
              this.nodeList = [...this.nodeRecords.slice(0, index), ...this.nodeRecords.slice(index + 1)]
              this.getEcharsData()
              this.setPieData(flag)
            }
            resolve(res)
          })
          .catch((err) => {
            console.error(err)
            reject(err)
          })
          .finally(() => {
            this.nodeLoading = false
          })
      })
    },
    // 关机
    shutdown(row) {
      this.delTitle = '关机'
      this.delDesc = row.hypervisor_hostname === 'control' ? '关闭此节点，将关闭所有节点，平台服务也将不可用。确定关闭？' : '关机会导致部分服务不可用，确定关闭此节点？'
      if (this.poll_timer) {
        clearInterval(this.poll_timer)
      }
      this.$refs.confirmDelete.prompt().then(() => {
        this.$set(row, 'loadingShutdown', true)
        if (row.hypervisor_hostname === 'control') {
          clusterManageShutdownall().then(() => {
            this.$message.success('关机成功')
            this.getNodeRecord()
          }).finally(() => {
            this.$set(row, 'loadingShutdown', false)
          })
        } else {
          clusterManageShutdown({
            host_ip: row.host_ip
          }).then(() => {
            this.$message.success('关机成功')
            this.getNodeRecord()
          }).finally(() => {
            this.$set(row, 'loadingShutdown', false)
          })
        }
        this.timerInterval()
      }).catch(() => {
        this.timerInterval()
      })
    },
    // 重启
    reboot(row) {
      this.delTitle = '重启'
      this.delDesc = '确定重启此节点？'
      if (this.poll_timer) {
        clearInterval(this.poll_timer)
      }
      this.$refs.confirmDelete.prompt().then(() => {
        this.$set(row, 'loadingReboot', true)
        clusterManageReboot({
          host_ip: row.host_ip
        }).then(() => {
          this.$message.success('重启成功')
          this.getNodeRecord()
        }).finally(() => {
          this.$set(row, 'loadingReboot', false)
        })
        this.timerInterval()
      }).catch(() => {
        this.timerInterval()
      })
    },
    // 统计总数
    getUsed(data, type) {
      return data.reduce((p, e) => {
        if (e.state === 'up' && e.status === 'enabled') return p + e[type]
        return p
      }, 0)
    },
    clickCardList(type) {
      const routerList = {
        1: '/sys_operations/cluster_manage/virtual_machine',
        2: '/sys_operations/cluster_manage/virtual_port',
        3: '/sys_operations/cluster_manage/image',
        4: '/sys_operations/cluster_manage/virtual_network'
      }
      this.$router.push(routerList[type])
    },
    // 点击tab中表格
    rowClick(row) {
      const statusPass = row.status === 'True' || row.status === 'enabled'
      const statePass = row.state === 'True' || row.state === 'up'
      const pass = statusPass && statePass
      if (!pass) {
        this.delTitle = '错误'
        if (!statusPass && statePass) { // 未激活但运行
          this.delDesc = '请激活该服务'
        } else if (statusPass && !statePass) { // 激活但关闭
          this.delDesc = '请启用该服务'
        } else { // 未激活且关闭
          this.delDesc = '请激活并启用该服务'
        }
        this.$refs.confirmDelete.prompt().then(() => {
        })
      }
    },
    // tab切换
    handleClick(tab) {
      if (this.poll_timer) clearInterval(this.poll_timer)
      this.activeIndex = tab.index.toString()
      this.getTabRecords(this.TabList[this.activeIndex])
      this.timerInterval()
    },
    // 获取tab表格数据
    getTabRecords(type, flag = true) {
      if (flag) this.tabLoading = true
      return new Promise((resolve, reject) => {
        clusterManageStackserviceinfo({
          page_info: {
            page_num: 1,
            page_size: 9999
          },
          search_info: { services_name: type }
        })
          .then((res) => {
            if (res.data && type === this.TabList[this.activeIndex]) {
              const typeList = {
                'compute': 'compute_services',
                'block': 'block_storage_services',
                'network': 'network_agents'
              }
              this.tabRecords = res.data.data[typeList[type]]
            }
            resolve(res)
          })
          .catch((err) => {
            console.error(err)
            reject(err)
          })
          .finally(() => {
            if (type === this.TabList[this.activeIndex]) {
              this.tabLoading = false
            }
          })
      })
    },
    // 实时更新轮询
    timerInterval() {
      this.poll_timer = setInterval(() => {
        this.getNodeRecord(false)
        this.getTabRecords(this.TabList[this.activeIndex], false)
      }, 30000)
    }
  }
}
</script>

<style scoped lang="scss">
.chart-container {
  display: flex;
  justify-content: space-between;
  width: 100%;
  height: 278px !important;
  .resource-stat {
    width: 69%;
  }
  .pie-container {
    display: flex;
    justify-content: space-between;
  }
  .pie-stat {
    width: 33.33%;
    min-height: 210px;
  }
  .stat-item {
    height: 100%;
    position: relative;
    z-index: 10;
  }

  .cards {
    display: flex;
    flex-wrap: wrap;
    flex: 1;
    .card-item {
      display: flex;
      align-items: center;
      width: calc(50% - 10px);
      margin-left: 10px;
      margin-bottom: 10px;
      background-color: rgba(255,255,255,0.1);
      border-radius: 2px;
      padding: 0 25px;
      cursor: pointer;
      &:nth-last-child(-n+2) {
        margin-bottom: 0;
      }
      .iconfont {
        margin-right: 25px;
        font-size: 32px;
        color: rgba(255,255,255, 0.5);
      }
      .bottom {
        font-size: 30px;
      }
    }
  }
}
.table-container {
  margin-top: 18px;
  .title {
      position: relative;
      padding-left: 15px;
      margin-bottom: 6px;
      &::before {
      content: "";
      position: absolute;
      left: 0;
      top: 0;
      width: 8px;
      height: 17px;
      background: #37D6B0;
      border-radius: 2px;
    }
  }
  .control-box {
    height: 131px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
    margin-bottom: 10px;
    display: flex;
    justify-content: space-between;
    padding: 20px 30px;
    align-items: center;
    overflow: hidden;
    .name {
      .bottom {
        font-size: 36px;
      }
    }
    .info {
      width: 70%;
      min-width: 875px;
    }
  }
}

::v-deep {
  .el-table--scrollable-x .el-table__body-wrapper {
    &::-webkit-scrollbar {
      height: 8px;
    }
    &::-webkit-scrollbar-corner {
      width: 0;
      height: 0;
    }
    @import '@/styles/themes/black/customScroll.scss';
  }
  .el-table__row td:last-child .el-button:last-child,
  .el-table__row td:last-child .el-button:last-child:hover {
    color: #00AD84;
  }
  .el-table__row td .el-button.is-loading:before {
    background: transparent;
  }
  .el-table__row td:last-child .el-button:last-child.is-loading:before {
    background: #fff;
  }
  .el-descriptions {
    background: transparent;
    .el-descriptions__body {
      background: transparent;
      .el-descriptions-item__label {
        color: rgba(255, 255, 255, 0.5);
      }
      .el-descriptions-item__label.has-colon.no-colon::after {
        display: none;
      }
    }
  }
  .el-loading-mask {
    background-color: rgba(50, 52, 54, 0.8);
    .el-loading-spinner {
      margin-top: -40px;
    }
  }
  .greenText {
    color: #00AD84;
  }
  .redText {
    color: #ff6067;
  }
}
</style>
