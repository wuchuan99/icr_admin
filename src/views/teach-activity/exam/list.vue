<template>
  <div style="padding-bottom: 10px;">
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
            placeholder="搜索考试名称、试卷题目"
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
      title="删除考试"
      desc="您即将删除该考试, 确定删除?"
    />
  </div>
</template>

<script>
import { reactive } from '@vue/composition-api'
import { usePagination, useTableSelection } from '@/hooks'
import { examPaging, examDel, examAccess, examEnable } from '@/api/exam'
import IcrTable from '@/components/table'
import Pagination from '@/components/Pagination'
import IcrConfirmDelete from '@/components/confirm-delete.vue'
export default {
  setup() {
    const query = reactive({
      name: null
    })
    const { selection } = useTableSelection()
    return {
      query,
      selection,
      ...usePagination(examPaging, query)
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
              return !row.enable
            }
          },
          { prop: 'name', label: '考试名称' },
          { prop: 'number', label: '题目数量' },
          { prop: 'score', label: '试卷总分' },
          { prop: 'description', label: '考试描述' },
          { prop: 'status', label: '状态', formatter: this.formatter },
          {
            prop: 'enable',
            label: '是否启用',
            minWidth: 110,
            render: (scope) => {
              return (
                <div>
                  <el-switch
                    value={scope.row.enable}
                    oninput={ (val) => { this.examEnable(scope, val) }}
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
                    onclick={() => {
                      this.operation(scope)
                    }}
                    disabled={ scope.row.status === '即将开始' }
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
                    disabled={ scope.row.enable }
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
      this.$router.push('/teach-activity/exam/add?new=1')
    },
    delete(scope) {
      this._delete([scope.row.id])
    },
    // 批量删除
    deleteBatch() {
      const ids = this.$refs.table.getSelection().reduce((acc, val) => {
        acc.push(val.id)
        return acc
      }, [])
      this._delete(ids)
    },
    _delete(ids) {
      this.$refs.confirmDelete.prompt().then(() => {
        examDel({
          data: {
            type: 1,
            ids: ids
          }
        }).then(() => {
          this.getRecords()
        })
      })
    },
    edit(scope) {
      this.$router.push(`/teach-activity/exam/${scope.row.id}`)
    },
    operation(scope) {
      examAccess({
        data: { exam_id: scope.row.id, type: 'maintain' }
      }).then(({ data }) => {
        if (data.access) {
          this.$router.push(`/teach-activity/exam/operation/${scope.row.id}`)
        } else {
          this.$message.error(' 考试还未开始，不可运维 ')
        }
      })
    },
    examEnable(scope, val) {
      examEnable({
        data: { exam_id: scope.row.id, enable: val }
      }).then((res) => {
        if (res.status === 0) {
          // scope.row.enable = val
          this.getRecords()
        }
      })
    },
    formatter(row) {
      return row.enable ? row.status : '--'
    }
  }
}
</script>
