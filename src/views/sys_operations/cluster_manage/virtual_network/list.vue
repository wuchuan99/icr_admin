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
      source_type: 'network'
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
          { prop: 'name', label: '网络名称' },
          { prop: 'subnets', label: '子网网段',
            render: (scope) => {
              return (
                scope.row.subnets.map(ele => {
                  return <div>{ele}</div>
                })
              )
            } },
          { prop: 'shared', label: '共享状态',
            render: (scope) => {
              return (
                <div>{scope.row.shared ? '是' : '否'}</div>
              )
            } },
          { prop: 'external_net', label: '外部网络',
            render: (scope) => {
              return (
                <div>{scope.row.external_net ? '是' : '否'}</div>
              )
            } },
          { prop: 'status', label: '状态',
            render: (scope) => {
              return (
                <div>{scope.row.status === 'ACTIVE' ? '运行中' : scope.row.status}</div>
              )
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
