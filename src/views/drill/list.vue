<template>
  <div>
    <div class="operation-box">
      <!-- buttons -->
      <div class="operation">
        <el-button
          class="filter-item"
          type="primary"
          size="medium"
          @click="linkToAdd"
        >新增</el-button>
      </div>
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
    <!-- 删除弹框 -->
    <icr-confirm-delete
      ref="confirmDelete"
      title="删除攻防演练"
      desc="您即将删除该攻防演练, 确定删除?"
    />
  </div>
</template>

<script>
import { reactive } from '@vue/composition-api'
import { usePagination, useTableSelection } from '@/hooks'
import { drillPaging, drillDel, drillUpdate } from '@/api/drill'
import IcrTable from '@/components/table'
import Pagination from '@/components/Pagination'
import IcrConfirmDelete from '@/components/confirm-delete.vue'
const statusMap = {
  0: '即将开始',
  1: '进行中',
  2: '已结束'
}
const modesMap = {
  0: '个人演练',
  1: '组队演练',
  2: '红蓝对抗',
  3: '混战'
}
const enableStatusMap = {
  0: '不启用',
  1: '启用'
}
export default {
  setup() {
    const query = reactive({
      name: null
    })
    const { selection } = useTableSelection()
    return {
      query,
      selection,
      ...usePagination(drillPaging, query)
    }
  },
  components: {
    IcrTable,
    Pagination,
    IcrConfirmDelete
  },
  data() {
    return {
      table: {
        columns: [
          {
            type: 'selection',
            selectable: (row) => {
              return row.status === 0 && row.enable_status === 0
            }
          },
          { prop: 'name', label: '演练名称' },
          { prop: 'nodes', label: '节点数量' },
          { prop: 'desc', label: '演练描述' },
          {
            prop: 'status',
            label: '状态',
            render: (scope) => {
              return (
                <div>{ scope.row.enable_status ? statusMap[scope.row.status] : '--' }</div>
              )
            }
          },
          {
            prop: 'mode',
            label: '演练方式',
            render: (scope) => {
              return (
                <div>{ modesMap[scope.row.mode] }</div>
              )
            }
          },
          {
            prop: 'enable',
            label: '是否启用',
            minWidth: 110,
            render: (scope) => {
              return (
                <div>
                  <el-switch
                    active-value={ 1 }
                    inactive-value={ 0 }
                    value={scope.row.enable_status }
                    oninput={ (val) => { this.drillEnable(scope, val) }}
                    style='margin-right: 8px;'
                  />
                  {enableStatusMap[scope.row.enable_status]}
                </div>
              )
            }
          },
          {
            label: '操作',
            width: 200,
            fixed: 'right',
            render: (scope) => {
              return (
                <div>
                  <el-button
                    type='text'
                    disabled={ scope.row.status === 0 }
                    onclick={() => {
                      this.operation(scope)
                    }}
                  >
                    运维
                  </el-button>
                  <el-button
                    type='text'
                    onclick={() => {
                      this.edit(scope)
                    }}
                  >
                    编辑
                  </el-button>
                  <el-button
                    type='text'
                    disabled={ [1, 2].includes(scope.row.status) || scope.row.enable_status === 1 }
                    onclick={() => {
                      this.delete(scope)
                    }}
                  >
                    删除
                  </el-button>
                </div>
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
    linkToAdd() {
      this.$router.push('/drill-manage/drill/add?new=1')
    },
    delete(scope) {
      this._delete([scope.row.id])
    },
    _delete(ids) {
      this.$refs.confirmDelete.prompt().then(() => {
        drillDel({
          data: {
            type: 1,
            ids: ids
          }
        }).then(() => {
          this.getRecords()
        })
      })
    },
    deleteBatch() {
      const ids = this.$refs.table.getSelection().reduce((acc, val) => {
        acc.push(val.id)
        return acc
      }, [])
      this._delete(ids)
    },
    edit(scope) {
      this.$router.push(`/drill-manage/drill/${scope.row.id}`)
    },
    drillEnable(scope, val) {
      drillUpdate({
        data: {
          id: scope.row.id,
          enable_status: val
        }
      }).then(() => {
        this.$message.closeAll()
        this.getRecords()
      })
    },
    operation(scope) {
      this.$router.push(
        `/drill-manage/drill/operation/${scope.row.id}?mode=${scope.row.mode}&scope=${scope.row.scope}&record=${scope.row.record}`
      )
    }
  }
}
</script>

<style scoped lang="scss">
</style>
