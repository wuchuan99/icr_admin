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
      source_type: 'image'
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
          { prop: 'name', label: '镜像名称' },
          { prop: 'owner_user_name', label: '所有者' },
          { prop: 'image_type', label: '类型' },
          { prop: 'visibility', label: '可见性',
            render: (scope) => {
              return (
                <div>{scope.row.visibility === 'public' ? '公有' : '私有'}</div>
              )
            } },
          { prop: 'protected', label: '受保护的',
            render: (scope) => {
              return (
                <div>{scope.row.protected ? '是' : '否'}</div>
              )
            } },
          { prop: 'disk_format', label: '格式' },
          { prop: 'size', label: '大小', formatter: this.sizeFormatter },
          { prop: 'status', label: '状态',
            render: (scope) => {
              return (
                <div>{scope.row.status === 'active' ? '运行中' : scope.row.status}</div>
              )
            }
          }
        ]
      }
    }
  },
  mounted() {
    this.getRecords()
  },
  methods: {
    sizeFormatter(row) {
      return (row.size / 1024 / 1024) > 1024 ? `${(row.size / 1024 / 1024 / 1024).toFixed(2)} GB` : `${(row.size / 1024 / 1024).toFixed(2)} MB`
    }
  }
}
</script>

<style scoped lang="scss">
</style>
