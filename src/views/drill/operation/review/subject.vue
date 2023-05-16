<template>
  <div class="drill_review_subject">
    <icr-table ref="table" class="fixed_table" :columns="table.columns" :data="records" :loading="loading" />
    <!-- pagination -->
    <pagination :total.sync="total" :page.sync="page" :limit.sync="limit" />
    <!-- 完成弹框 -->
    <icr-dialog
      title="裁定"
      width="400px"
      :visible.sync="visible"
      @confirm="judge"
      @close="curJudgeInfo = {}"
    >
      <span>{{ `确定判定为'${finalMap.get(curJudgeInfo.final) || ''}'吗?` }}</span>
    </icr-dialog>
  </div>
</template>

<script>
import IcrTable from '@/components/table'
import { drillTaskLogPaging, drillTaskLogUpdate } from '@/api/drill'
import IcrDialog from '@/components/dialog.vue'
import { downloadFile } from '@/utils/file'
import { reactive } from '@vue/composition-api'
import Pagination from '@/components/Pagination'
import { usePagination } from '@/hooks'
const resultMap = {
  0: '待人工判定',
  1: '验证通过',
  2: '验证不通过'
}
export default {
  components: {
    IcrTable,
    IcrDialog,
    Pagination
  },
  inject: ['drillId'],
  props: {
    userId: {
      type: Number,
      default: 0
    },
    publishStatus: {
      type: Boolean,
      default: false
    },
    status: {
      type: Number,
      default: 0
    }
  },
  setup() {
    const query = reactive({ drill_id: '', complex_id: '' })
    return {
      query,
      ...usePagination(drillTaskLogPaging, query)
    }
  },
  data() {
    return {
      // records: [],
      table: {
        columns: [
          { prop: 'name', label: '任务名称' },
          {
            prop: 'commit',
            label: '提交解析',
            className: 'answer',
            render: (scope) => {
              return (
                <div>
                  <span
                    type='text'
                    onclick={() => { this.downLoadFile(scope.row.commit) }}
                  >
                    {scope.row.commit.name}
                  </span>
                </div>
              )
            }
          },
          {
            prop: 'writeup',
            label: '标准解析',
            className: 'answer',
            render: (scope) => {
              return (
                <div>
                  <span
                    type='text'
                    onclick={() => { this.downLoadFile(scope.row.writeup) }}
                  >
                    {scope.row.writeup.name}
                  </span>
                </div>
              )
            }
          },
          {
            prop: 'result',
            label: '系统判定',
            render: (scope) => {
              let color = ''
              if (scope.row.result === 0) {
                color = 'warn'
              }
              return (
                <div class={color}>{ resultMap[scope.row.result] }</div>
              )
            }
          },
          {
            prop: 'final',
            label: '最终结果',
            render: (scope) => {
              return (
                <div>{ this.finalMap.get(scope.row.final) }</div>
              )
            }
          },
          {
            label: '人工判定',
            width: 150,
            fixed: 'right',
            render: (scope) => {
              return (
                <div>
                  <el-button
                    type='text'
                    disabled={ this.status === 0 || this.publishStatus }
                    onclick={() => {
                      this.openJudgeDialog(scope, 1)
                    }}
                  >
                  完成
                  </el-button>
                  <el-button
                    type='text'
                    disabled={ this.status === 0 || this.publishStatus }
                    onclick={() => {
                      this.openJudgeDialog(scope, 0)
                    }}
                  >
                  未完成
                  </el-button>
                </div>
              )
            }
          }
        ]
      },
      finalMap: new Map([
        [-1, '待人工判定'],
        [0, '未完成'],
        [1, '完成']
      ]),
      // loading: false,
      visible: false,
      curJudgeInfo: {}
    }
  },
  mounted() {
    if (!this.drillId) return
    this.query.drill_id = this.drillId
    this.query.complex_id = this.userId
    this.getRecords()
  },
  methods: {
    // getRecords() {
    //   if (!this.drillId) return
    //   return new Promise((resolve, reject) => {
    //     this.loading = true
    //     drillTaskLogPaging({
    //       page_info: { page_num: 1, page_size: 10000 },
    //       search_info: { drill_id: this.drillId, complex_id: this.userId }
    //     })
    //       .then((res) => {
    //         if (res.data) {
    //           this.records = res.data.data
    //         }
    //         resolve(res)
    //       })
    //       .catch((err) => {
    //         console.error(err)
    //         reject(err)
    //       })
    //       .finally(() => {
    //         this.loading = false
    //       })
    //   })
    // },
    openJudgeDialog(scope, final) {
      this.visible = true
      this.curJudgeInfo = { scope, final }
    },
    judge() {
      this.update(this.curJudgeInfo)
    },
    update({ scope, final }) {
      drillTaskLogUpdate({
        data: {
          drill_id: this.drillId,
          ids: [scope.row.id],
          final
        }
      }).then(() => {
        this.visible = false
        this.getRecords()
      })
    },
    downLoadFile(file) {
      file.url && downloadFile(`/resource/${file.url}`, file.name)
    }
  }
}
</script>
<style lang="scss" scoped>
.drill_review_subject {
  .warn {
    color: #F6BF53;
  }
  ::v-deep {
    .el-input-number .el-input-number__increase,
    .el-input-number .el-input-number__decrease {
      line-height: 32px;
    }
    .el-table__row td:last-child .el-button:last-child {
      color: #00AD84 !important;
    }
    td.answer .cell span {
      color: #00CDA8;
      display: inline-block;
      width: 100%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}
</style>
