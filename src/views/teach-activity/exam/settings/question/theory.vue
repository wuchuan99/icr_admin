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
          @click="AddQuestion"
        >
          新增
        </el-button>
      </div>
      <div class="query-conditions">
        <span>每题
          <el-input-number
            v-model="score"
            :min="0"
            :precision="0"
            size="mini"
            :disabled="getAccess()"
            @change="totalScoreChange"
          />
          分
        </span>
        <span
          style="margin-left: 15px"
        >
          共{{ total_question }}题，{{ total_score }}分
        </span>
      </div>
    </div>
    <div>
      <!-- 选择判断table -->
      <icr-table
        v-if="itemActive !== 3"
        ref="table"
        :loading="loading"
        :columns="columns"
        :data="questionList"
        height="calc(100vh - 328px)"
      />
    </div>
    <!-- dialog -->
    <el-dialog :visible.sync="showTableDialog" title="添加" @close="closeDialog">
      <question-dialog
        v-if="showTableDialog"
        ref="questionDialog"
        :item-active="itemActive"
        @closeDialog="closeDialog"
        @confirm="confirm"
      />
    </el-dialog>
    <!-- 删除弹框 -->
    <icr-confirm-delete
      ref="confirmDelete"
      title="删除题目"
      desc="您即将删除该题目, 确定删除?"
    />
    <div class="submit-btn">
      <el-button type="primary" :disabled="getAccess()" @click="submitQuestionInfo">保存</el-button>
      <el-button @click="goBack">取消</el-button>
    </div>
  </div>
</template>

<script>
import IcrTable from '@/components/table'
import questionDialog from './dialog.vue'
import IcrConfirmDelete from '@/components/confirm-delete.vue'
import {
  examQuestionList,
  examQuestionAdd,
  examQuestionDel,
  examQuestionPerscore
} from '@/api/exam'

export default {
  components: {
    IcrTable,
    questionDialog,
    IcrConfirmDelete
  },
  inject: ['getExamId', 'getAccess'],
  props: {
    itemActive: {
      type: Number,
      default: 1
    }
  },
  data() {
    return {
      questionList: [], // 选择判断题table数据
      score: '', // 每题分数（总控制）
      total_question: 0, // 总题数
      total_score: '0', // 总分数
      loading: false, // 选择判断loading
      columnsOption: [
        [
          { prop: 'desc', showOverflowTooltip: false, label: '题目描述' },
          {
            prop: 'choice_detail',
            label: '选项',
            showOverflowTooltip: false,
            render: (scope) => {
              if (scope.row.choice_detail) {
                const choice_detail = []
                for (const key in scope.row.choice_detail) {
                  choice_detail.push(key + ':' + scope.row.choice_detail[key])
                }
                return (
                  <div>
                    {choice_detail.map((item) => {
                      return <div>{item}</div>
                    })}
                  </div>
                )
              }
            }
          },
          { label: '本题分值', width: 150,
            render: (scope) => {
              return (
                <div>
                  <el-input-number
                    size='mini'
                    min={0}
                    precision={0}
                    disabled={this.getAccess()}
                    value = { this.questionList[scope.$index].score}
                    oninput={val => { this.questionList[scope.$index].score = val }}
                    onchange={() => {
                      this.perscoreChange(scope)
                    }}
                  />
                </div>
              )
            }
          },
          {
            label: '操作',
            width: 100,
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
        [
          { prop: 'desc', showOverflowTooltip: false, label: '题目描述' },
          { label: '本题分值', width: 150,
            render: (scope) => {
              return (
                <div>
                  <el-input-number
                    size='mini'
                    min={0}
                    precision={0}
                    disabled={this.getAccess()}
                    value = { this.questionList[scope.$index].score}
                    oninput={val => { this.questionList[scope.$index].score = val }}
                    onchange={() => {
                      this.perscoreChange(scope)
                    }}
                  />
                </div>
              )
            }
          },
          {
            label: '操作',
            width: 100,
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
        ]
      ],
      showTableDialog: false,
      cachePerscore: [] // 修改的小题分数
    }
  },
  computed: {
    columns() {
      if (this.itemActive !== 0 && this.itemActive !== 4) {
        return this.columnsOption[0]
      } else {
        return this.columnsOption[1]
      }
    }
  },
  mounted() {
    this.getQuestionList()
  },
  methods: {
    // 获取题目列表
    getQuestionList() {
      if (!this.getExamId()) return
      return new Promise((resolve, reject) => {
        this.loading = true
        examQuestionList({
          search_info: { exam_id: this.getExamId(), category: this.itemActive }
        })
          .then((res) => {
            if (res.data) {
              this.questionList = res.data.data
              this.score = 0
              this.total_question = res.data.total_question
              this.total_score = res.data.total_score
            }
            resolve(res)
          })
          .catch((err) => {
            console.error(err)
            reject(err)
          })
          .finally(() => {
            this.cachePerscore = []
            this.loading = false
          })
      })
    },
    // 打开题目添加弹框
    AddQuestion() {
      this.showTableDialog = true
    },
    // 关闭弹窗
    closeDialog() {
      this.$refs.questionDialog.initData()
      this.showTableDialog = false
    },
    // 保存弹窗内容
    confirm(ids) {
      if (!ids) return
      examQuestionAdd({
        data: {
          exam_id: this.getExamId(),
          question_ids: ids,
          category: this.itemActive
        }
      }).then(() => {
        this.showTableDialog = false
        this.getQuestionList()
      })
    },
    // 单项删除
    delete(scope) {
      this._delete([scope.row.id], scope.$index)
    },
    // 删除项目
    _delete(ids, index) {
      this.$refs.confirmDelete.prompt().then(() => {
        examQuestionDel({
          data: {
            type: 1,
            ids: ids
          }
        }).then(() => {
          this.questionList.splice(index, 1)
          this.getTotalScore()
          this.total_question = this.questionList.length
          const cacheIndex = this.cachePerscore.findIndex(val => val.exam_question_id === ids[0])
          if (cacheIndex !== -1) {
            this.cachePerscore.splice(cacheIndex, 1)
          }
        })
      })
    },
    // 计算分数
    getTotalScore() {
      this.total_score = this.questionList.reduce((total, currentValue) => {
        return currentValue['score'] ? (total + currentValue['score']) : total
      }, 0)
    },
    // 分数总控制change
    totalScoreChange() {
      this.cachePerscore = []
      this.questionList.forEach(element => {
        element.score = this.score
        this.cachePerscore.push({ exam_question_id: element.id, score: this.score })
      })
      this.getTotalScore()
    },
    // 分数每题控制change--选择判断
    perscoreChange(scope) {
      const index = this.cachePerscore.findIndex(ele => { return ele.exam_question_id === scope.row.id })
      if (index === -1) {
        this.cachePerscore.push({ exam_question_id: scope.row.id, score: scope.row.score })
      } else {
        this.cachePerscore[index].score = scope.row.score
      }
      this.getTotalScore()
    },
    // 题目保存
    submitQuestionInfo() {
      if (this.cachePerscore.length) {
        examQuestionPerscore({
          data: this.cachePerscore
        }).then(() => {
          this.$message.success('保存成功')
          this.cachePerscore = []
          this.getQuestionList()
        })
      }
    },
    goBack() {
      this.$router.go(-1)
    }
  }
}
</script>

<style scoped lang="scss">
.submit-btn {
  margin-top: 16px;
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
  .el-input-number--mini {
    width: 96px;
    .el-input--mini {
      .el-input__inner {
        background-color: rgba(255, 255, 255, 0.1);
        height: 26px;
      }
    }
  }
  .el-input-number {
    .el-input-number__increase {
      line-height: 26px !important;
    }
    .el-input-number__decrease {
      line-height: 26px !important;
    }
  }
  .el-table tr.el-table__row td {
    padding: 10px 0;
  }
}
</style>
