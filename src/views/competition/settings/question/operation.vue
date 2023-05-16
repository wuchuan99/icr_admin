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
            :disabled="competition.going"
            :min="0"
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
      <!-- 实操table -->
      <el-table
        v-loading="loading"
        :data="questionList"
        stripe
        element-loading-text="加载中…"
        height="calc(100vh - 328px)"
      >
        <el-table-column label="题目描述" prop="desc" />
        <el-table-column>
          <template slot="header">
            <div class="operation-header">
              <span class="flag">判定点</span>
              <span class="score">分值</span>
              <span class="enable">是否开启</span>
            </div>
          </template>
          <template slot-scope="scope">
            <div
              v-for="item in scope.row.rules"
              :key="item.rule_id"
              class="operation-body"
            >
              <span class="flag">{{ item.name }}</span>
              <span class="score">
                <el-input-number
                  v-model="item.score"
                  :disabled="competition.going"
                  size="mini"
                  :min="0"
                />
              </span>
              <span class="enable">
                <el-switch
                  v-model="item.enable"
                  :active-value="1"
                  :inactive-value="0"
                  :disabled="competition.going"
                >
                  {{ item.enable ? ' 启用' : ' 不启用' }}
                </el-switch>
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template slot-scope="scope">
            <el-button
              type="text"
              size="small"
              :disabled="competition.going"
              @click="deleteOperation(scope)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
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
      <el-button type="primary" :disabled="competition.going" @click="update">保存</el-button>
      <el-button :disabled="competition.going" @click="goBack">取消</el-button>
    </div>
  </div>
</template>

<script>
import questionDialog from './dialog.vue'
import IcrConfirmDelete from '@/components/confirm-delete.vue'
import {
  competitionQuestionAdd,
  competitionQuestionDel,
  competitionQuestionUpdate,
  competitionQuestionList
} from '@/api/competition'
import { debounce } from 'lodash-es'

export default {
  components: {
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
      questionList: [], // 实操题table数据
      scorePerQuestion: 0,
      score: '', // 每题分数（总控制）
      total_question: 0, // 总题数
      total_score: '0', // 总分数
      loading: false,
      showTableDialog: false,
      cachePerscore: [] // 修改的小题分数
    }
  },
  computed: {
    totalScore() {
      return this.questionList.reduce((acc, item) => {
        item.rules?.forEach(rule => {
          if (rule.enable) {
            acc += rule.score
          }
        })
        return acc
      }, 0)
    }
  },
  watch: {
    scorePerQuestion: {
      handler(newVal, oldVal) {
        if (newVal < 0) return
        this.questionList.forEach(item => {
          item.rules?.forEach(rule => {
            rule.score = newVal
          })
        })
      },
      immediate: false
    }
  },
  mounted() {
    this.getQuestionList()
  },
  methods: {
    // 获取题目列表
    getQuestionList() {
      if (!this.getCompetitionId()) return
      if (this.itemActive === 3) {
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
    // 单项删除
    deleteOperation(scope) {
      this._delete([scope.row.id])
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
    // 实操题分数与是否启用控制
    update: debounce(function() {
      if (!this.questionList.length) return

      const ruleList = this.questionList.reduce((acc, item) => {
        acc.push(...item.rules.map(rule => {
          return {
            id: item.id,
            ...rule
          }
        }))
        return acc
      }, [])

      return competitionQuestionUpdate({
        data: ruleList
      })
    }, 0),
    // 题目保存
    submitQuestionInfo() {
    },
    goBack() {
      this.$router.go(-1)
    }
  }
}
</script>

<style scoped lang="scss">
.operation-header {
  display: flex;
  .flag {
    flex: 1;
    }
    .score {
      width: 150px;
    }
  }
.operation-body {
  display: flex;
  background: rgba(255,255,255,0.05);
  padding: 11px 15px;
  &:nth-child(n+2) {
    margin-top: 4px;
  }
  .flag {
    flex: 1;
  }
  .score {
    width: 150px;
  }
  .score,
  .enable {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
}
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
  .el-loading-mask {
    background: rgba(50, 52, 54, 0.8);
  }
}
</style>
