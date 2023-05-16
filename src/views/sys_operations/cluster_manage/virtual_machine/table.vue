<template>
  <div>
    <icr-table
      ref="table"
      class="fixed_table"
      :loading="loading"
      :columns="table.columns"
      :data="records"
    />
  </div>
</template>

<script>
import { clusterManageStackinstanceinfo } from '@/api/cluster_manage'
import IcrTable from '@/components/table'
import dayjs from 'dayjs'
export default {
  components: {
    IcrTable
  },
  props: {
    vitureId: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      InterfaceTable: {
        columns: [
          { prop: 'port', label: '名称' },
          { prop: 'network', label: '网络' },
          { prop: 'ip_address', label: 'IP地址',
            render: (scope) => {
              return (
                scope.row.ip_address.map(ele => {
                  return <div>{ele}</div>
                })
              )
            } },
          { prop: 'mac_address', label: 'Mac地址' },
          { prop: 'port_state', label: '状态',
            render: (scope) => {
              if (scope.row.port_state === 'ACTIVE') {
                return (
                  <div>运行</div>
                )
              } else if (scope.row.port_state === 'PAUSED') {
                return (
                  <div>暂停</div>
                )
              } else {
                return (
                  <div>{ scope.row.port_state }</div>
                )
              }
            } }
        ]
      },
      logTable: {
        columns: [
          { prop: 'request_id', label: '请求ID' },
          { prop: 'action', label: '行为',
            render: (scope) => {
              if (scope.row.action === 'create') {
                return (
                  <div>已创建</div>
                )
              } else if (scope.row.action === 'pause') {
                return (
                  <div>暂停</div>
                )
              } else {
                return (
                  <div>{ scope.row.action }</div>
                )
              }
            } },
          { prop: 'start_time', label: '开始时间',
            render: (scope) => {
              const start_time = scope.row.start_time.substr(-1) === 'z' ? scope.row.start_time : scope.row.start_time + 'z'
              return (
                <div>{dayjs(start_time).format('YYYY-MM-DD HH:mm:ss')}</div>
              )
            } },
          { prop: 'user_id', label: '用户ID' },
          { prop: 'message', label: '消息', formatter: this.formatter }
        ]
      },
      records: [],
      loading: false
    }
  },
  computed: {
    table() {
      return this.type === 'interface' ? this.InterfaceTable : this.logTable
    }
  },
  mounted() {
    this.getRecords()
  },
  methods: {
    getRecords() {
      this.loading = true
      return clusterManageStackinstanceinfo({
        instance_id: this.vitureId,
        search_item: this.type
      }).then(({ data }) => {
        this.records = data.data
      }).finally(() => {
        this.loading = false
      })
    },
    formatter(row) {
      return row.message ? row.message : '-'
    }
  }
}
</script>

<style scoped lang="scss"></style>
