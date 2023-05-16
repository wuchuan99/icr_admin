<template>
  <div>
    <div class="operation-box">
      <div class="operation">
        <el-button
          class="filter-item"
          type="primary"
          size="medium"
          icon="el-icon-circle-plus-outline"
          :disabled="publishStatus"
          @click="judgeDislogVisible = true"
        >添加处罚</el-button>
      </div>
    </div>
    <icr-table ref="table" class="fixed_table" :columns="table.columns" :data="records" :loading="loading" />
    <el-dialog
      :title="(model.id ? '编辑' : '添加') + '处罚'"
      :visible.sync="judgeDislogVisible"
      @close="closeDialog"
    >
      <icr-form
        ref="form"
        :model="model"
        class="question-form"
        @cancel="judgeDislogVisible = false"
        @confirm="submit"
      >
        <div class="inline">
          <el-form-item label="组织">
            <el-select v-model="org_id" :disabled="model.id ? true:false" @change="changeOrgs">
              <el-option
                v-for="item in orgs"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="姓名">
            <el-select v-model="model.account_id" :disabled="model.id ? true:false">
              <el-option
                v-for="item in accounts"
                :key="item.account_id"
                :label="item.real_name"
                :value="item.account_id"
              />
            </el-select>
          </el-form-item>
        </div>
        <el-form-item label="处罚">
          <el-radio v-model="model.cancel_grades" :label="false">扣分</el-radio>
          <el-input-number v-model="model.points_deducted" size="small" :min="0" />
          <div>
            <el-radio v-model="model.cancel_grades" :label="true">取消考试成绩</el-radio>
          </div>
        </el-form-item>
        <el-form-item label="违规描述">
          <el-input v-model="model.description" type="textarea" :autosize="{ minRows: 6 }" />
        </el-form-item>
      </icr-form>
    </el-dialog>
    <!-- pagination -->
    <pagination :total.sync="total" :page.sync="page" :limit.sync="limit" />
    <!-- 删除弹框 -->
    <icr-confirm-delete
      ref="confirmDelete"
      title="删除处罚"
      desc="您即将删除该处罚, 确定删除?"
    />
  </div>
</template>

<script>
import IcrTable from '@/components/table'
import IcrForm from '@/components/form'
import { examViolationList, examViolationAdd, examViolationUpdate, examViolationDel, examViolationStudent } from '@/api/exam'
import { getorg as getOrgs } from '@/api/account'
import IcrConfirmDelete from '@/components/confirm-delete.vue'
import { usePagination } from '@/hooks'
import { reactive } from '@vue/composition-api'
import Pagination from '@/components/Pagination'

export default {
  setup() {
    const query = reactive({
      exam_id: null
    })
    return {
      query,
      ...usePagination(examViolationList, query)
    }
  },
  components: { IcrTable, IcrForm, IcrConfirmDelete, Pagination },
  inject: ['examId'],
  props: {
    publishStatus: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      judgeDislogVisible: false,
      model: {
        account_id: '',
        cancel_grades: null,
        points_deducted: '',
        description: ''
      },
      table: {
        columns: [
          { prop: 'real_name', label: '考生姓名' },
          { prop: 'org_name', label: '所在组织',
            render: (scope) => {
              const nameList = scope.row.org_ls.map(val => { return val.name })
              return <div class='table-tag'>{nameList.join(',')}</div>
            }
          },
          { prop: 'violation', label: '处罚决定' },
          { prop: 'description', label: '违规行为' },
          // { label: '是否公布',
          //   render: (scope) => {
          //     return (
          //       <div>
          //         <el-switch
          //           value={scope.row.publish}
          //           disabled={this.publishStatus}
          //           oninput={ (val) => {
          //             examViolationUpdate({
          //               data: {
          //                 exam_id: this.examId,
          //                 id: scope.row.id,
          //                 publish: val
          //               }
          //             }).then((res) => {
          //               if (res.status === 0) {
          //                 this.$message.closeAll()
          //                 scope.row.publish = val
          //               }
          //             })
          //           }}
          //           active-value={true}
          //           inactive-value={false}
          //           style='margin-right: 8px;'
          //         />
          //         {scope.row.publish ? '公布' : '不公布'}
          //       </div>
          //     )
          //   }
          // },
          { label: '操作',
            width: 150,
            fixed: 'right',
            render: (scope) => {
              return (
                <div>
                  <el-button
                    type='text'
                    disabled={this.publishStatus}
                    onclick={() => {
                      this.edit(scope.row)
                    }}
                  >
                    编辑
                  </el-button>
                  <el-button
                    type='text'
                    disabled={this.publishStatus}
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
      },
      org_id: '',
      orgs: [],
      accounts: []
    }
  },
  watch: {
    'model.cancel_grades'(val) {
      if (val) {
        this.model.points_deducted = 0
      }
    }
  },
  mounted() {
    this.query.exam_id = this.examId
    this.getRecords()
    this.getOrgs()
  },
  methods: {
    // getViolationList() {
    //   if (!this.examId) return
    //   return new Promise((resolve, reject) => {
    //     this.loading = true
    //     examViolationList({
    //       search_info: { exam_id: this.examId }
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
    getOrgs() {
      getOrgs().then(({ data }) => {
        this.orgs = data?.data?.reduce((acc, item) => {
          if (item.type === 2) {
            acc.push(...item.org_ls)
          }
          return acc
        }, [])
      })
    },
    changeOrgs() {
      this.model.account_id = ''
      this.getUserList()
    },
    getUserList() {
      examViolationStudent({
        search_info: { exam_id: this.examId, org_id: this.org_id }
      }).then((res) => {
        if (res.data) {
          this.accounts = res.data.data
        }
      })
    },
    // 初始化表单数据
    initModel() {
      this.org_id = ''
      this.model = {
        account_id: '',
        cancel_grades: null,
        points_deducted: '',
        description: ''
      }
      this.accounts = []
    },
    closeDialog() {
      this.initModel()
    },
    submit() {
      this.model.id ? this.update() : this.create()
    },
    create() {
      examViolationAdd({
        data: { exam_id: this.examId, ...this.model }
      }).then(() => {
        this.judgeDislogVisible = false
        this.getRecords()
      })
    },
    update() {
      examViolationUpdate({
        data: { exam_id: this.examId, ...this.model }
      }).then(() => {
        this.judgeDislogVisible = false
        this.getRecords()
      })
    },
    publishViolation(scope, val) {
      examViolationUpdate({
        data: { exam_id: this.examId, id: scope.id, publish: val }
      }).then(() => {
        this.$message.closeAll()
        this.getRecords()
      })
    },
    edit(scope) {
      const org_name = scope.org_ls.find(ele => { return ele.type === '2' })?.name
      const org_type = this.orgs.find(ele => { return ele.name === org_name })
      this.org_id = org_type?.id
      this.getUserList()
      const { id, points_deducted, cancel_grades, description, account_id } = scope
      this.model = { id, points_deducted, cancel_grades, description, account_id }
      this.judgeDislogVisible = true
    },
    // 单项删除
    delete(scope) {
      this._delete([scope.row.id])
    },
    // 删除项目
    _delete(ids) {
      this.$refs.confirmDelete.prompt().then(() => {
        examViolationDel({
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
<style lang="scss" scoped>
.inline {
  display: flex;
}
::v-deep {
  .el-input-number .el-input-number__increase,
  .el-input-number .el-input-number__decrease {
    line-height: 32px;
  }
}
</style>
