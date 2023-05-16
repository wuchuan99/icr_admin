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
      title="删除竞赛"
      desc="您即将删除该竞赛, 确定删除?"
    />
  </div>
</template>

<script>
import { reactive } from '@vue/composition-api'
import { usePagination, useTableSelection } from '@/hooks'
import { competitionPaging, competitionDel, competitionEnable } from '@/api/competition'
import IcrTable from '@/components/table'
import Pagination from '@/components/Pagination'
import IcrConfirmDelete from '@/components/confirm-delete.vue'
import { CompetitionModelMap, CompetitionTypeMap } from './index.vue'

export default {
  setup() {
    const query = reactive({
      name: null
    })
    const { selection } = useTableSelection()
    return {
      query,
      selection,
      ...usePagination(competitionPaging, query)
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
          { type: 'selection' },
          { prop: 'name', label: '竞赛名称' },
          { prop: 'total_q', label: '题目数量' },
          { prop: 'score', label: '竞赛总分' },
          { prop: 'desc', label: '竞赛描述' },
          { prop: 'status', label: '状态', formatter: this.formatter },
          { prop: 'competition_model', label: '竞赛模式', render: (scope) => {
            return (<div>{ CompetitionModelMap.get(scope.row.competition_model) }</div>)
          } },
          { prop: 'competition_type', label: '参赛方式', render: (scope) => {
            return (<div>{ CompetitionTypeMap.get(scope.row.competition_type) }</div>)
          } },
          {
            prop: 'enable',
            label: '是否启用',
            minWidth: 110,
            render: (scope) => {
              return (
                <div>
                  <el-switch
                    value={scope.row.enable}
                    oninput={ (val) => {
                      competitionEnable({
                        data: {
                          id: scope.row.id,
                          enable: val
                        }
                      }).then((res) => {
                        if (res.status === 0) {
                          // scope.row.enable = val
                          this.getRecords()
                          // this.$message({
                          //   type: 'success',
                          //   message: '更新成功'
                          // })
                        }
                      })
                    }}
                    active-value={1}
                    inactive-value={0}
                    style='margin-right: 8px;'
                  />
                  {scope.row.enable ? '启用' : '不启用'}
                </div>
              )
            }
          },
          {
            label: '操作',
            width: '200',
            fixed: 'right',
            render: (scope) => {
              return (
                <div>
                  <el-button
                    type='text'
                    disabled={ scope.row.status === '即将开始' }
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
                    disabled={ scope.row.enable === 1 }
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
      this.$router.push('/competition-manage/competitions/add')
    },
    delete(scope) {
      this._delete([scope.row.id])
    },
    deleteBatch() {
      const ids = this.$refs.table.getSelection().reduce((acc, val) => {
        acc.push(val.id)
        return acc
      }, [])
      this._delete(ids)
    },
    _delete(ids) {
      this.$refs.confirmDelete.prompt().then(() => {
        competitionDel({
          data: {
            ids: ids
          }
        }).then(() => {
          this.getRecords()
        })
      })
    },
    edit(scope) {
      this.$router.push(`/competition-manage/competitions/${scope.row.id}`)
    },
    operation(scope) {
      this.$router.push(`/competition-manage/competitions/operation/${scope.row.id}`)
    },
    formatter(row) {
      return row.enable ? row.status : '--'
    }
  }
}
</script>

<style scoped lang="scss">
// ::v-deep {
//   .el-table__row td:last-child .el-button:last-child {
//     color: #33bd9d;
//   }
// }
</style>
