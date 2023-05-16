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
          :disabled="competition.going"
          @click="AddQuestion"
        >
          新增
        </el-button>
      </div>
      <div class="query-conditions">
        <span>每题
          <el-input-number
            v-model="scorePerQuestion"
            :min="0"
            :disabled="competition.going"
            size="mini"
          />
          分
        </span>
        <span
          style="margin-left: 15px"
        >
          共 {{ (questionList && questionList.length) || 0 }} 题，{{ totalScore }}分
        </span>
      </div>
    </div>
    <div>
      <!-- 选择判断table -->
      <icr-table
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
      <el-button type="primary" :disabled="competition.going" @click="() => { update(questionList) }">保存</el-button>
      <el-button :disabled="competition.going" @click="goBack">取消</el-button>
    </div>
  </div>
</template>

<script>
import IcrTable from '@/components/table'
import questionDialog from './dialog.vue'
import IcrConfirmDelete from '@/components/confirm-delete.vue'
import {
  competitionQuestionList,
  competitionQuestionAdd,
  competitionQuestionUpdate,
  competitionQuestionDel
} from '@/api/competition'
import { debounce } from 'lodash-es'

export default {
  components: {
    IcrTable,
    questionDialog,
    IcrConfirmDelete
  },
  inject: ['getCompetitionId', 'getCompetition'],
  props: {
    itemActive: {
      type: Number,
      default: 1
    }
  },
  data() {
    return {
      competition: this.getCompetition(),
      questionList: [], // 选择判断题table数据
      scorePerQuestion: 0,
      score: 0, // 每题分数（总控制）
      total_question: 0, // 总题数
      total_score: '0', // 总分数
      loading: false, // 选择判断loading
      columnsOption: [
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
                  disabled={ this.competition.going }
                  size='mini'
                  min={0}
                  value = { this.questionList[scope.$index].score}
                  oninput={val => { this.questionList[scope.$index].score = val }}
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
      showTableDialog: false,
      cachePerscore: [] // 修改的小题分数
    }
  },
  computed: {
    columns() {
      if (this.itemActive !== 0) {
        return this.columnsOption
      } else {
        return [
          ...this.columnsOption.slice(0, 1),
          ...this.columnsOption.slice(2)
        ]
      }
    },
    totalScore() {
      return this.questionList.reduce((acc, item) => {
        acc += item.score
        return acc
      }, 0)
    }
  },
  watch: {
    itemActive() {
      this.getQuestionList()
    },
    scorePerQuestion: {
      handler: function(newVal, oldVal) {
        if (newVal < 0) return
        this.questionList.forEach(item => {
          item.score = newVal
        })
      }
    }
  },
  mounted() {
    this.getQuestionList()
  },
  methods: {
    // 获取题目列表
    getQuestionList() {
      if (!this.getCompetitionId()) return
      if (this.itemActive !== 3) {
        return new Promise((resolve, reject) => {
          this.loading = true
          competitionQuestionList({
            data: { id: this.getCompetitionId(), category: this.itemActive }
          })
            .then((res) => {
              if (res.data) {
                this.questionList = res.data.data
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
      }
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
      if (!ids || !ids?.length) {
        this.$message({
          type: 'error',
          message: '请先勾选题目'
        })
        return
      }
      competitionQuestionAdd({
        data: {
          c_id: this.getCompetitionId(),
          q_ids: ids,
          category: this.itemActive
        }
      }).then(() => {
        this.showTableDialog = false
        this.scorePerQuestion = 0
        this.getQuestionList()
      })
    },
    update: debounce(function(questions) {
      if (!this.questionList.length) return
      return competitionQuestionUpdate({
        data: questions
      })
    }, 0),
    // 单项删除
    delete(scope) {
      this._delete([scope.row.id])
    },
    // 单项删除
    deleteOperation(scope) {
      this._delete([scope.row.competition_question_id])
    },
    // 删除项目
    _delete(ids) {
      this.$refs.confirmDelete.prompt().then(() => {
        competitionQuestionDel({
          data: {
            type: 1,
            ids: ids
          }
        }).then(() => {
          this.getQuestionList()
        })
      })
    },
    submitQuestionInfo() {
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
