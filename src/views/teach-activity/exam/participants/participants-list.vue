<template>
  <div>
    <!-- buttons -->
    <div class="operation-box">
      <!-- buttons -->
      <div class="operation">
        <el-button
          class="filter-item"
          type="primary"
          size="medium"
          :disabled="getAccess()"
          @click="AddExamUser"
        >
          新增
        </el-button>
      </div>
    </div>
    <icr-table ref="table" class="fixed_table" :loading="loading" :columns="columns" :data="records" />
    <el-dialog :visible.sync="showTableDialog" title="添加" @close="closeDialog">
      <examuser-dialog
        v-if="showTableDialog"
        ref="examUserDialog"
        :item-active="itemActive"
        @closeDialog="closeDialog"
        @confirm="confirm"
      />
    </el-dialog>
    <!-- pagination -->
    <pagination :total.sync="total" :page.sync="page" :limit.sync="limit" />
    <!-- 删除弹框 -->
    <icr-confirm-delete
      ref="confirmDelete"
      title="删除参与人员"
      desc="您即将删除该参与人员, 确定删除?"
    />
  </div>
</template>

<script>
import IcrTable from '@/components/table'
import examuserDialog from './dialog.vue'
import IcrConfirmDelete from '@/components/confirm-delete.vue'
import { examUserList, examUserAdd, examUserDel } from '@/api/exam'
import { usePagination, useTableSelection } from '@/hooks'
import { reactive } from '@vue/composition-api'
import Pagination from '@/components/Pagination'
export default {
  setup() {
    const query = reactive({
    })
    const { selection } = useTableSelection()
    return {
      selection,
      query,
      ...usePagination(examUserList, query)
    }
  },
  components: {
    IcrTable,
    examuserDialog,
    IcrConfirmDelete,
    Pagination
  },
  inject: ['getExamId', 'getAccess'],
  props: {
    itemActive: {
      type: String,
      default: 'teacher'
    }
  },
  data() {
    return {
      ExamUserList: [],
      columns: [
        { type: 'selection', selectable: () => {
          return !this.getAccess()
        } },
        { prop: 'username', label: '账号' },
        { prop: 'name', label: '昵称' },
        { prop: 'real_name', label: '姓名' },
        { prop: 'org_name', label: '组织',
          render: (scope) => {
            const nameList = scope.row.org_ls.map(val => { return val.name })
            return <div class='table-tag'>{nameList.join(',')}</div>
          }
        },
        {
          label: '操作',
          width: 100,
          fixed: 'right',
          render: (scope) => {
            return (
              <div>
                <el-button
                  type='text'
                  disabled={this.getAccess()}
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
      ],
      showTableDialog: false
      // loading: false
    }
  },
  watch: {
    itemActive() {
      this.getRecords()
    }
  },
  mounted() {
    this.query.exam_id = this.getExamId()
    this.query.category = this.itemActive
    this.getRecords()
  },
  methods: {
    getExamUserList() {
      if (!this.getExamId()) return
      return new Promise((resolve, reject) => {
        this.loading = true
        examUserList({
          search_info: { exam_id: this.getExamId(), category: this.itemActive }
        })
          .then((res) => {
            if (res.data) {
              this.ExamUserList = res.data.data
            }
            resolve(res)
          })
          .catch((err) => {
            console.error(err)
            reject(err)
          })
          .finally(() => {
            this.loading = false
          })
      })
    },
    AddExamUser() {
      this.showTableDialog = true
    },
    closeDialog() {
      this.$refs.examUserDialog.initData()
      this.showTableDialog = false
    },
    confirm(ids) {
      if (!ids) return
      examUserAdd({
        data: {
          exam_id: this.getExamId(),
          account_ids: ids,
          category: this.itemActive
        }
      }).then(() => {
        this.showTableDialog = false
        this.getRecords()
      })
    },
    // 单项删除
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
    // 删除项目
    _delete(ids) {
      this.$refs.confirmDelete.prompt().then(() => {
        examUserDel({
          data: {
            type: 1,
            ids: ids
          }
        }).then(() => {
          this.getRecords()
        })
      })
    }
  }
}
</script>

<style scoped lang="scss">
.table-tag {
  overflow:hidden;
  text-overflow:ellipsis;
}
::v-deep {
  .el-dialog {
    width: 80%;
    max-width: 80%;
    padding-top: 20px;
    padding-bottom: 30px;
    margin-top: 50px !important;
    max-height: calc(100% - 100px);
    .el-dialog__body {
      padding-top: 25px;
      padding-bottom: 0;
    }
  }
}
</style>
