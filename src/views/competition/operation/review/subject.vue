<template>
  <div>
    <icr-table ref="table" :columns="table.columns" :data="records" :loading="loading" height="calc(100vh - 215px)" />
    <el-dialog
      title="打分"
      :visible.sync="scoreDislogVisible"
      @close="closeDialog"
    >
      <icr-form
        ref="form"
        :model="model"
        :option="option"
        :rules="formRules"
        class="question-form"
        @cancel="scoreDislogVisible = false"
        @confirm="submit"
      >
        <el-form-item label="满分">
          <el-input v-model="model.score" readonly />
        </el-form-item>
        <el-form-item label="打分" prop="student_score">
          <el-input-number v-model="model.student_score" size="small" :min="0" :max="maxScore" />
        </el-form-item>
      </icr-form>
    </el-dialog>
  </div>
</template>

<script>
import IcrTable from '@/components/table'
import IcrForm from '@/components/form'
import { competitionOperationRecordList, competitionOperationMakingPaper } from '@/api/competition'
import { ResourcePrefix } from '@/const/common'
import { getQuestStateByScore, extractFilename } from '../index.vue'

export default {
  components: { IcrTable, IcrForm },
  inject: ['competitionId'],
  props: {
    user: {
      type: Object,
      default: () => {}
    },
    publishStatus: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      scoreDislogVisible: false,
      records: [],
      currentQuest: null,
      model: {
        id: null,
        score: 0,
        student_score: 0,
        name: ''
      },
      table: {
        columns: [
          { prop: 'q_title', label: '题目' },
          { prop: 'flag', label: '判定点', formatter: this.formatter },
          { prop: 'q_answer', label: '提交答案', className: 'answer', render: (scope) => {
            return (
              <div>
                { scope.row.q_category === 3
                  ? !Array.isArray(scope.row.q_answer)
                    ? <div>
                      <a href={ ResourcePrefix + scope.row.q_answer.file_url } target='_blank' >
                        { scope.row.q_answer.file_name }
                        { scope.row.q_answer.target_name && ' (' + scope.row.q_answer.target_name + ')' }
                      </a>
                    </div>
                    : scope.row.q_answer.map(ans => {
                      return (
                        <div>
                          <a href={ ResourcePrefix + ans.file_url } target='_blank' >
                            { ans.file_name }
                            { ans.target_name && ' (' + ans.target_name + ')' }
                          </a>
                        </div>
                      )
                    })
                  : JSON.stringify(scope.row.q_answer) }
              </div>
            )
          } },
          { prop: 'q_correct_answer', label: '正确答案', className: 'answer', render: (scope) => {
            return (
              <div style='white-space: normal;'>
                { scope.row.q_category === 3
                  ? !Array.isArray(scope.row.q_correct_answer)
                    ? <div>
                      <a href={ ResourcePrefix + scope.row.q_correct_answer.writeup } target='_blank'>
                        { scope.row.q_correct_answer.name }
                        { scope.row.q_correct_answer.writeup && ' (' + extractFilename(scope.row.q_correct_answer.writeup) + ')' }
                      </a>
                    </div>
                    : scope.row.q_correct_answer.map(ans => {
                      return (
                        <div>
                          <a href={ ResourcePrefix + ans.writeup } target='_blank'>
                            { ans.name }
                            { ans.writeup && ' (' + extractFilename(ans.writeup) + ')' }
                          </a>
                        </div>
                      )
                    })
                  : JSON.stringify(scope.row.q_correct_answer) }
              </div>
            )
          } },
          { prop: 'system_judgment', label: '判定结果', render: scope => {
            return (
              <div>{ getQuestStateByScore(scope.row.student_score) }</div>
            )
          } },
          { prop: 'student_score', label: '得分' },
          { label: '人工判定',
            width: 150,
            render: (scope) => {
              const needInput = scope.row.q_category === 3
              if (!needInput) {
                return (
                  <div>
                    <el-button
                      type='text'
                      disabled={this.publishStatus}
                      onclick={() => {
                        this.edit(scope, true, scope.row.score)
                      }}
                    >
                      正确
                    </el-button>
                    <el-button
                      type='text'
                      disabled={this.publishStatus}
                      onclick={() => {
                        this.edit(scope, false, 0)
                      }}
                    >
                      错误
                    </el-button>
                  </div>
                )
              } else {
                return (
                  <div>
                    <el-button
                      type='text'
                      disabled={this.publishStatus}
                      onclick={() => {
                        this.model.id = scope.row.id
                        this.model.score = scope.row.score
                        this.model.student_score = scope.row.student_score
                        this.model.name = scope.row.flag || ''
                        this.currentQuest = scope
                        this.scoreDislogVisible = true
                      }}
                    >
                    打分
                    </el-button>
                  </div>
                )
              }
            }
          }
        ]
      },
      option: {
        'label-width': '60px'
      },
      formRules: {
        student_score: [{ required: true, message: '分数不能为空', trigger: 'blur' }]
      },
      loading: false
    }
  },
  computed: {
    maxScore: function() {
      return this.currentQuest?.row?.q_correct_answer?.score || 100
    }
  },
  mounted() {
    this.getRecords()
  },
  methods: {
    getRecords() {
      if (!this.competitionId) return
      return new Promise((resolve, reject) => {
        this.loading = true
        const data = {
          id: this.competitionId
        }
        if (this.user.id) {
          data['u_id'] = this.user.id
        }

        if (this.user.o_id) {
          data['o_id'] = this.user.o_id
        }

        competitionOperationRecordList({
          data: data
        })
          .then((res) => {
            if (res.data) {
              const records = []
              res.data?.data?.forEach(item => {
                if (item.q_category < 3) {
                  records.push(item)
                } else if (item.q_category === 3) {
                  item.q_answer?.forEach((rule, index) => {
                    const correct_answer = item.q_correct_answer.find(answer => answer.name === rule.name)

                    records.push({
                      ...item,
                      score: correct_answer?.score,
                      student_score: rule.score,
                      flag: rule.name,
                      q_correct_answer: correct_answer,
                      q_answer: rule
                    })
                  })
                }
              })
              this.records = records
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
    edit(scope, val, score) {
      const data = {
        id: scope.row.id,
        judgment: val ? 1 : 0,
        score: score
      }
      if (scope.row.name) {
        data['name'] = scope.row.name
      }
      if (scope.row.target_name) {
        data['target_name'] = scope.row.target_name
      }

      return competitionOperationMakingPaper({
        data
      }).then(() => {
        this.$message.success('更新成功')
        this.getRecords()
      })
    },
    decodeUnicode(str) {
      str = str.replace(/\\u/gi, '%u')
      str = str.replace(/\\/gi, '')
      return unescape(str)
    },
    formatter(row) {
      return row.flag ? row.flag : '--'
    },
    closeDialog() {
      this.scoreDislogVisible = false
      this.model = {}
    },
    submit() {
      this.edit({
        row: {
          ...this.model,
          target_name: this.currentQuest.row?.q_answer?.target_name || ''
        }
      }, true, this.model.student_score)
        .then(() => {
          this.scoreDislogVisible = false
        })
    }
  }
}
</script>
<style lang="scss" scoped>
::v-deep {
  .el-input-number .el-input-number__increase,
  .el-input-number .el-input-number__decrease {
    line-height: 32px;
  }
  .el-table__row td:last-child .el-button:last-child {
    color: #00AD84;
    &.is-disabled {
      color: #00AD84;
    }
  }
  td.answer .cell a {
    display: inline-block;
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>
