<template>
  <div class="app-container">
    <div class="operation-box">
      <!-- search -->
      <div class="query-conditions">
        <div class="search">
          <el-input
            v-model="query.name"
            placeholder="请输入内容"
            size="medium"
            @keyup.enter.native="getRecords"
          >
            <i
              slot="suffix"
              class="el-input__icon iconfont icon-sousuo"
              @click="getRecords"
            />
          </el-input>
        </div>
      </div>
    </div>
    <!-- table -->
    <icr-table
      ref="table"
      class="fixed_table"
      :loading="loading"
      :columns="table.columns"
      :data="records"
    />
    <!-- pagination -->
    <pagination :total.sync="total" :page.sync="page" :limit.sync="limit" />
  </div>
</template>

<script>
import { reactive } from '@vue/composition-api'
import { usePagination } from '@/hooks'
import { clusterManageStacksource } from '@/api/cluster_manage'
import IcrTable from '@/components/table'
import Pagination from '@/components/Pagination'
export default {
  setup() {
    const query = reactive({
      source_type: 'instance'
    })
    return {
      query,
      ...usePagination(clusterManageStacksource, query)
    }
  },
  components: {
    IcrTable,
    Pagination
  },
  props: {},
  data() {
    return {
      id: null,
      table: {
        columns: [
          { prop: 'name', label: '实例名称', className: 'answer',
            render: (scope) => {
              return (
                <a
                  onclick={() => {
                    this.linkToDetail(scope.row)
                  }}>
                  { scope.row.name }
                </a>
              )
            }
          },
          { prop: 'image', label: '镜像名称' },
          { prop: 'ip_addr', label: 'IP地址',
            render: (scope) => {
              return (
                scope.row.ip_addr && scope.row.ip_addr.map(ele => {
                  return <div>{ele}</div>
                })
              )
            } },
          { prop: 'flavor', label: '实例类型', className: 'answer', width: 300,
            render: (scope) => {
              return (
                <el-popover
                  placement='right'
                  width='400'
                  trigger='hover'
                  title={'实例类型详情：' + scope.row.flavor.name}
                  popper-class='table-popover'
                  onclick={() => { this.show(scope) }}
                >
                  <div class='popover-row'>
                    <div class='popover-title'>ID</div>
                    <div class='popover-value'>{scope.row.flavor.flavor_id}</div>
                  </div>
                  <div class='popover-row'>
                    <div class='popover-title'>vcpu数量</div>
                    <div class='popover-value'>{scope.row.flavor.vcpus}</div>
                  </div>
                  <div class='popover-row'>
                    <div class='popover-title'>内存</div>
                    <div class='popover-value'>{scope.row.flavor.ram / 1024 > 1 ? (scope.row.flavor.ram / 1024) + ' GB' : scope.row.flavor.ram + ' MB'}</div>
                  </div>
                  <div class='popover-row'>
                    <div class='popover-title'>大小</div>
                    <div class='popover-value'>{scope.row.flavor.disk} GB</div>
                  </div>
                  <a slot='reference'>{ scope.row.flavor.name }</a>
                </el-popover>
              )
            }
          },
          { prop: 'status', label: '状态',
            render: (scope) => {
              if (scope.row.status === 'ACTIVE') {
                return (
                  <div>运行</div>
                )
              } else if (scope.row.status === 'PAUSED') {
                return (
                  <div>暂停</div>
                )
              } else {
                return (
                  <div>{ scope.row.status }</div>
                )
              }
            } },
          { prop: 'task_state', label: '任务',
            render: (scope) => {
              return (
                <div>{scope.row.task_state ? scope.row.task_state : '无'}</div>
              )
            } },
          { prop: 'power_state', label: '电源状态',
            render: (scope) => {
              if (scope.row.power_state === 1) {
                return (
                  <div>运行中</div>
                )
              } else if (scope.row.power_state === 3) {
                return (
                  <div>已暂停</div>
                )
              } else {
                return (
                  <div>{ scope.row.power_state }</div>
                )
              }
            } },
          { prop: 'running_time', label: '运行时间',
            render: (scope) => {
              const text = this.resolveTime(scope.row.running_time)
              return (
                <div>{text}</div>
              )
            } }
        ]
      }
    }
  },
  mounted() {
    this.getRecords()
  },
  methods: {
    linkToDetail(row) {
      this.id = row.instance_id
      this.$router.push(`/sys_operations/cluster_manage/virtual_machine/${this.id}`)
    },
    resolveTime(second) {
      const days = parseInt((second / 60 / 60) / 24)
      const hours = parseInt((second / 60 / 60) % 24)
      const minutes = parseInt((second / 60) % 60)
      return `${days ? days + '天' : ''}${hours ? hours + '小时' : ''}${minutes ? minutes + '分钟' : ''}`
    }
  }
}
</script>

<style scoped lang="scss">
.popover-row {
  display: flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.1);
  padding: 12px 19px;
  line-height: 23px;
  .popover-title {
    width: 50%;
  }
  .popover-value {
    flex: 1;
  }
  &:nth-child(2n) {
    background-color: rgba(255, 255, 255, 0.07);
  }
}

::v-deep {
  td.answer .cell > div {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: #00CDA8;
  }
}
</style>
