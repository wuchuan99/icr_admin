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
      source_type: 'port'
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
      table: {
        columns: [
          { prop: 'name', label: '端口名称' },
          { prop: 'ip_address', label: '固定IP地址',
            render: (scope) => {
              return (
                scope.row.ip_address.map(ele => {
                  return <div>{ele}</div>
                })
              )
            }
          },
          { prop: 'subnet_id', label: '所属子网', width: 300,
            render: (scope) => {
              return (
                scope.row.subnet_id.map(ele => {
                  return <div>{ele}</div>
                })
              )
            }
          },
          { prop: 'mac_address', label: 'Mac地址' },
          { prop: 'device_owner', label: '挂载状态' },
          { prop: 'status', label: '状态',
            render: (scope) => {
              if (scope.row.status === 'ACTIVE') {
                return (
                  <div>运行</div>
                )
              } else if (scope.row.status === 'DOWN') {
                return (
                  <div>关闭</div>
                )
              } else {
                return (
                  <div>{ scope.row.status }</div>
                )
              }
            } }
        ]
      }
    }
  },
  mounted() {
    this.getRecords()
  },
  methods: {}
}
</script>

<style scoped lang="scss"></style>
