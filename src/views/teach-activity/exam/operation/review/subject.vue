<template>
  <div>
    <icr-table ref="table" class="fixed_table" :columns="table.columns" :data="records" :loading="loading" />
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
          <el-input v-model="model.maxScore" readonly />
        </el-form-item>
        <el-form-item label="打分" prop="score">
          <el-input-number v-model="model.score" size="small" :min="0" />
        </el-form-item>
      </icr-form>
    </el-dialog>
    <el-dialog
      title="答案详情"
      width="600px"
      :visible.sync="detailVisible"
      class="icr-dialog"
    >
      <pre style="white-space: pre-wrap;"><span>{{ answerDetail }}</span></pre>
      <div slot="footer" class="dialog-footer">
        <el-button @click="detailVisible = false">取 消</el-button>
        <el-button type="primary" @click="detailVisible = false">确 定</el-button>
      </div>
    </el-dialog>
    <!-- pagination -->
    <pagination :total.sync="total" :page.sync="page" :limit.sync="limit" />
  </div>
</template>

<script>
import IcrTable from '@/components/table'
import IcrForm from '@/components/form'
import { markPaperList, markPaperScore, markPaperOperationscore, markPaperDownload } from '@/api/exam'
import { cloneDeep } from 'lodash-es'
import { usePagination } from '@/hooks'
import { reactive } from '@vue/composition-api'
import Pagination from '@/components/Pagination'

export default {
  setup() {
    const query = reactive({
      exam_id: null,
      user_id: null,
      source: 'mark'
    })
    return {
      query,
      ...usePagination(markPaperList, query)
    }
  },
  components: { IcrTable, IcrForm, Pagination },
  inject: ['examId'],
  props: {
    userId: {
      type: Number,
      default: 0
    },
    publishStatus: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      scoreDislogVisible: false,
      detailVisible: false,
      model: {},
      table: {
        columns: [
          { prop: 'question_name', label: '题目' },
          { prop: 'flag', label: '判定点', formatter: this.formatter },
          { prop: 'student_answer', label: '提交答案',
            showOverflowTooltip: false,
            className: 'answer',
            render: (scope) => {
              if (scope.row.student_answer) {
                if (scope.row.category === 3) {
                  return (
                    <a
                      onclick={() => {
                        this.download(scope, 'student_answer')
                      }}>
                      答案链接
                    </a>
                  )
                } else if (scope.row.category === 4) {
                  return (
                    <a
                      onclick={() => {
                        this.openDetail(scope.row.student_answer[0])
                      }}>
                      {scope.row.student_answer}
                    </a>
                  )
                } else {
                  const clone = cloneDeep(scope.row.student_answer)
                  const isJudge = scope.row.category === 0
                  let judgeStr = ''
                  const judgeAns = clone[0] && clone[0].toLowerCase()
                  if (judgeAns) {
                    switch (judgeAns) {
                      case 'yes':
                        judgeStr = '正确'
                        break
                      case 'no':
                        judgeStr = '错误'
                        break
                    }
                  }
                  return <div class='colorWhite'>{isJudge ? judgeStr : clone.sort().join(',')}</div>
                }
              } else {
                return <div></div>
              }
            }
          },
          { prop: 'answer', label: '正确答案',
            showOverflowTooltip: false,
            className: 'answer',
            render: (scope) => {
              if (scope.row.answer) {
                if (scope.row.category === 3) {
                  return (
                    <a
                      onclick={() => {
                        this.download(scope, 'answer')
                      }}>
                      答案链接
                    </a>
                  )
                } else if (scope.row.category === 4) {
                  return (
                    <a
                      onclick={() => {
                        this.openDetail(scope.row.answer[0])
                      }}>
                      {scope.row.answer}
                    </a>
                  )
                } else {
                  const clone = cloneDeep(scope.row.answer)
                  const isJudge = scope.row.category === 0
                  let judgeStr = ''
                  const judgeAns = clone[0] && clone[0].toLowerCase()
                  if (judgeAns) {
                    switch (judgeAns) {
                      case 'yes':
                        judgeStr = '正确'
                        break
                      case 'no':
                        judgeStr = '错误'
                        break
                    }
                  }
                  return <div class='colorWhite'>{isJudge ? judgeStr : clone.sort().join(',')}</div>
                }
              } else {
                return <div></div>
              }
            }
          },
          { prop: 'system_judgment', label: '系统判定',
            render: (scope) => {
              let colorType = ''
              switch (scope.row.system_judgment) {
                case '待阅卷':
                  colorType = 'warn'
                  break
                case '错误':
                  colorType = 'wrong'
                  break
              }
              return (
                <div class={colorType}>{scope.row.system_judgment}</div>
              )
            }
          },
          { prop: 'student_score', label: '得分' },
          { label: '人工判定',
            width: 150,
            fixed: 'right',
            render: (scope) => {
              const needInput = (scope.row.category === 3 && scope.row.manual) || scope.row.category === 4
              if (!needInput) {
                return (
                  <div>
                    <el-button
                      type='text'
                      disabled={this.publishStatus}
                      onclick={() => {
                        this.edit(scope, true)
                      }}
                    >
                      正确
                    </el-button>
                    <el-button
                      type='text'
                      disabled={this.publishStatus}
                      onclick={() => {
                        this.edit(scope, false)
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
                        this.edit(scope)
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
        score: [{ required: true, message: '分数不能为空', trigger: 'blur' }]
      },
      loading: false,
      questionType: 0, // 区分实操题与主观题打分 3实操题 4主观题
      answerDetail: '' // 主观题答案详情
    }
  },
  mounted() {
    this.query.exam_id = this.examId
    this.query.user_id = this.userId
    this.getRecords()
  },
  methods: {
    // getRecords() {
    //   if (!this.examId) return
    //   return new Promise((resolve, reject) => {
    //     this.loading = true
    //     markPaperList({
    //       search_info: { exam_id: this.examId, user_id: this.userId, source: 'mark' }
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
    edit(scope, val) {
      if (scope.row.category !== 3) {
        if (scope.row.category !== 4) {
          const score = val ? Number(scope.row.score) : 0
          markPaperScore({
            data: {
              test_paper_question_id: scope.row.test_paper_question_id,
              student_score: score
            }
          }).then(() => {
            this.$message.success('更新成功')
            this.getRecords()
          })
        } else {
          this.questionType = 4
          const { test_paper_question_id, score: maxScore } = scope.row
          this.model = { test_paper_question_id, maxScore }
          this.scoreDislogVisible = true
        }
      } else {
        if (scope.row.manual) {
          this.questionType = 3
          const { test_paper_question_id, question_rule_id, rule_name, score: maxScore } = scope.row
          this.model = { test_paper_question_id, question_rule_id, rule_name, maxScore }
          this.scoreDislogVisible = true
        } else {
          const score = val ? Number(scope.row.score) : 0
          markPaperOperationscore({
            data: {
              test_paper_question_id: scope.row.test_paper_question_id,
              question_rule_id: scope.row.question_rule_id,
              score: score,
              rule_name: scope.row.rule_name
            }
          }).then(() => {
            this.$message.success('更新成功')
            this.getRecords()
          })
        }
      }
    },
    submit() {
      if (this.questionType === 3) {
        markPaperOperationscore({
          data: this.model
        }).then(() => {
          this.$message.success('更新成功')
          this.scoreDislogVisible = false
          this.getRecords()
        })
      } else {
        markPaperScore({
          data: {
            test_paper_question_id: this.model.test_paper_question_id,
            student_score: this.model.score
          }
        }).then(() => {
          this.$message.success('更新成功')
          this.scoreDislogVisible = false
          this.getRecords()
        })
      }
    },
    download(scope, type) {
      markPaperDownload({
        filename: scope.row[type]
      }).then(res => {
        const title = res.headers['content-disposition'].split(';')[1].split('=')[1].split('"')[1]
        const filename = this.decodeUnicode(title)
        const bb = new Blob([res.data], { type: 'application/octet-stream' })
        const a = document.createElement('a')
        a.download = filename
        a.href = window.URL.createObjectURL(bb)
        a.click()
      })
    },
    decodeUnicode(str) {
      str = str.replace(/\\u/gi, '%u')
      str = str.replace(/\\/gi, '')
      return unescape(str)
    },
    formatter(row) {
      return row.rule_name ? row.rule_name : '--'
    },
    closeDialog() {
      this.scoreDislogVisible = false
      this.model = {}
    },
    openDetail(msg) {
      if (msg) {
        this.detailVisible = true
        this.answerDetail = msg
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.wrong {
  color: #ff797f;
}
.warn {
  color: #F6BF53;
}
pre {
  margin: 0;
  font-family: Microsoft YaHei, Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB, Arial, sans-serif;
}
::v-deep {
  .el-input-number .el-input-number__increase,
  .el-input-number .el-input-number__decrease {
    line-height: 32px;
  }
  .el-table__row td:last-child .el-button:last-child {
    color: #00AD84;
    &.is-disabled {
      color: #ff6067;
    }
  }
  td.answer .cell > div {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: #00CDA8;
  }
  td.answer .cell .colorWhite {
    color: #fff;
  }
}
</style>
