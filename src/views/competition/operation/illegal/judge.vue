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
          @click="initModel(), (judgeDislogVisible = true)"
        >添加处罚</el-button>
      </div>
    </div>
    <icr-table ref="table" :columns="table.columns" :data="records" :loading="loading" />
    <el-dialog
      :title="(model.id ? '编辑' : '添加') + '处罚'"
      :visible.sync="judgeDislogVisible"
      @close="closeDialog"
    >
      <icr-form
        ref="form"
        :model="model"
        :rules="formRules"
        class="question-form"
        @cancel="judgeDislogVisible = false"
        @confirm="submit"
      >
        <div class="inline">
          <el-form-item v-if="competition.competition_type === CompetitionTeamType" label="组织" prop="org">
            <el-select v-model="model.org" :disabled="isEdit">
              <el-option
                v-for="item in orgs"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="姓名" prop="user">
            <el-select v-model="model.user" :disabled="isEdit">
              <el-option
                v-for="item in userList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </div>
        <el-form-item label="处罚" prop="cancel_score">
          <el-radio v-model="model.cancel_score" :label="false">扣分</el-radio>
          <el-input-number v-model="model.score" size="small" :min="0" :max="totalScore" />
          <div>
            <el-radio v-model="model.cancel_score" :label="true">取消竞赛资格</el-radio>
          </div>
        </el-form-item>
        <el-form-item label="违规描述">
          <el-input v-model="model.desc" type="textarea" :autosize="{ minRows: 6 }" />
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
import { competitionViolationList, competitionViolationAdd, competitionViolationUpdate, competitionViolationDel, competitionOperationUserList, competitionQuestionList } from '@/api/competition'
import {
  accountPaging
} from '@/api/account'
import { getorg as getOrgs } from '@/api/account'
import IcrConfirmDelete from '@/components/confirm-delete.vue'
import { cloneDeep } from 'lodash-es'
import { CompetitionTeamType } from '@/views/competition/index.vue'
import { required } from '@/utils/validate-helper'
import { usePagination } from '@/hooks'
import { reactive } from '@vue/composition-api'
import Pagination from '@/components/Pagination'

const getTotalScore = function(questions) {
  let totalScore = 0
  questions.forEach(ele => {
    if (ele.category === '实操题') {
      ele.score = ele.rules.reduce((acc, item) => {
        if (item.enable) {
          acc += item.score
        }
        return acc
      }, 0)
    }
    totalScore += ele.score
  })

  return totalScore
}
export default {
  setup() {
    const query = reactive({
      id: null
    })
    return {
      query,
      ...usePagination(competitionViolationList, query)
    }
  },
  components: { IcrTable, IcrForm, IcrConfirmDelete, Pagination },
  inject: ['competitionId', 'getCompetition'],
  props: {
    publishStatus: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      CompetitionTeamType,
      judgeDislogVisible: false,
      competition: this.getCompetition(),
      model: {
        org: '',
        user: '',
        score: 1,
        cancel_score: '',
        desc: ''
      },
      table: {
        columns: [
          { prop: 'account', label: '考生姓名' },
          { prop: 'org_name', label: '所在组织' },
          { prop: 'content', label: '处罚决定' },
          { prop: 'desc', label: '违规行为' },
          // { label: '是否公布',
          //   render: (scope) => {
          //     return (
          //       <div>
          //         <el-switch
          //           value={scope.row.publish}
          //           disabled={this.publishStatus}
          //           oninput={ (val) => {
          //             const cancelScore = scope.row?.content.slice(0, 2) === '取消'
          //             const score = cancelScore ? 0 : parseInt(scope.row.content.slice(1))
          //             console.log(score, scope)

          //             competitionViolationUpdate({
          //               data: {
          //                 ...scope.row,
          //                 score,
          //                 cancel_score: cancelScore,
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
                      this.edit(scope)
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
      formRules: {
        org: [required('组织')],
        user: [required('姓名')],
        cancel_score: [required('处罚')]
      },
      org_id: '',
      orgs: [],
      accounts: [],
      isEdit: false,
      accountList: [],
      totalScore: Infinity
    }
  },
  computed: {
    userList: function() {
      return this.accounts
    }
  },
  watch: {
    'model.org': {
      handler: function(newVal) {
        if (!newVal) return
        this.accounts = []
        this.model.user = ''
        accountPaging({
          search_info: { org_id: newVal, info: '' },
          page_info: { page_num: 1, page_size: 9999 }
        }).then(({ data }) => {
          this.accounts = data.data || []
          if (this.competition.competition_type === CompetitionTeamType && this.isEdit) {
            this.getUserId()
          }
        })
      }
    }
  },
  mounted() {
    this.query.id = this.competitionId
    this.getPreviewpaper()
    this.getRecords()
    this.getUserList()
    if (this.competition.competition_type === CompetitionTeamType) {
      this.getOrgs()
    }
  },
  methods: {
    getPreviewpaper() {
      if (!this.competitionId) return
      return new Promise((resolve, reject) => {
        competitionQuestionList({
          data: { id: this.competitionId }
        })
          .then((res) => {
            if (res.data) {
              this.totalScore = getTotalScore(res.data?.data)
            }
            resolve(res)
          })
          .catch((err) => {
            console.error(err)
            reject(err)
          })
      })
    },
    // getViolationList() {
    //   if (!this.competitionId) return
    //   return new Promise((resolve, reject) => {
    //     this.loading = true
    //     competitionViolationList({
    //       data: {
    //         id: this.competitionId
    //       },
    //       page_info: {
    //         page_num: 1,
    //         page_size: 100000
    //       }
    //     })
    //       .then((res) => {
    //         if (res.data) {
    //           this.violationList = res.data.data
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
      return this.getUserList()
        .then(getOrgs)
        .then(({ data }) => {
          const orgs = data?.data.reduce((acc, item) => {
            acc.push(...item.org_ls)
            return acc
          }, [])

          this.orgs = orgs.filter(item => this.accountList.some(user => user.o_id === item.id))
          this.accounts = []
        })
    },
    changeOrgs() {
      this.model.account_id = ''
      this.getUserList()
    },
    getUserList() {
      return competitionOperationUserList({
        data: { id: this.competitionId }
      }).then((res) => {
        if (res.data) {
          this.accounts = res.data.data
          if (this.competition.competition_type === CompetitionTeamType) {
            this.accountList = res.data.data
          }
        }
      })
    },
    // 初始化表单数据
    initModel() {
      if (this.competition.competition_type === CompetitionTeamType) {
        this.accounts = []
      }
      this.isEdit = false
      this.model = {
        org: '',
        user: '',
        score: 1,
        cancel_score: false,
        desc: ''
      }
    },
    closeDialog() {
      this.initModel()
    },
    submit() {
      this.model.id ? this.update() : this.create()
    },
    create() {
      competitionViolationAdd({
        data: { id: this.competitionId, ...this.model }
      }).then(() => {
        this.judgeDislogVisible = false
        this.getRecords()
      })
    },
    update() {
      competitionViolationUpdate({
        data: { competition_id: this.competitionId, ...this.model }
      }).then(() => {
        this.judgeDislogVisible = false
        this.getRecords()
      })
    },
    publishViolation(scope, val) {
      competitionViolationUpdate({
        data: { ...scope }
      }).then(() => {
        this.$message.closeAll()
        this.getRecords()
      })
    },
    edit(scope) {
      this.isEdit = true
      this.model = {
        org: '',
        user: '',
        cancel_score: '',
        score: '',
        ...cloneDeep(scope.row)
      }
      this.model.org = this.orgs.find(item => item.name === scope.row.org_name)?.['id']
      this.model.user = this.accounts.find(item => item.name === scope.row.account)?.['id']
      this.model.cancel_score = scope.row?.content.slice(0, 2) === '取消'
      this.model.score = this.model.cancel_score ? 0 : parseInt(scope.row.content.slice(1))
      this.judgeDislogVisible = true
    },
    getUserId() {
      this.model.user = this.accounts.find(item => item.name === this.model.account)?.['id']
    },
    // 单项删除
    delete(scope) {
      this._delete([scope.row.id])
    },
    // 删除项目
    _delete(ids) {
      this.$refs.confirmDelete.prompt().then(() => {
        competitionViolationDel({
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
