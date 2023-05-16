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
      <!-- 实操table -->
      <el-table
        v-loading="loading"
        :data="operationlist"
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
              <span class="flag">{{ item.flag }}</span>
              <span class="score">
                <el-input-number
                  v-model="item.score"
                  size="mini"
                  :min="0"
                  :precision="0"
                  :disabled="getAccess()"
                  @change="
                    peroperationscoreChange(
                      scope.row.exam_question_id,
                      item.rule_id,
                      item.score,
                      item.enable
                    )
                  "
                />
              </span>
              <span class="enable">
                <el-switch
                  v-model="item.enable"
                  :disabled="getAccess()"
                  @input="
                    peroperationscoreChange(
                      scope.row.exam_question_id,
                      item.rule_id,
                      item.score,
                      item.enable
                    )
                  "
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
              :disabled="getAccess()"
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
      <el-button type="primary" :disabled="getAccess()" @click="submitQuestionInfo">保存</el-button>
      <el-button @click="goBack">取消</el-button>
    </div>
  </div>
</template>

<script>
import questionDialog from './dialog.vue'
import IcrConfirmDelete from '@/components/confirm-delete.vue'
import {
  examQuestionAdd,
  examQuestionDel,
  examQuestionOperationlist,
  examQuestionPeroperationscore
} from '@/api/exam'

export default {
  components: {
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
      operationlist: [], // 实操题table数据
      score: '', // 每题分数（总控制）
      total_question: 0, // 总题数
      total_score: '0', // 总分数
      loading: false,
      showTableDialog: false,
      cachePerscore: [] // 修改的小题分数
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
        examQuestionOperationlist({
          search_info: { exam_id: this.getExamId() }
        })
          .then((res) => {
            if (res.data) {
              this.operationlist = res.data.data
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
    deleteOperation(scope) {
      this._delete([scope.row.exam_question_id], scope.$index)
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
          this.operationlist.splice(index, 1)
          this.getTotalScore()
          this.total_question = this.operationlist.length
          const cacheIndex = this.cachePerscore.findIndex(val => val.exam_question_id === ids[0])
          if (cacheIndex !== -1) {
            this.cachePerscore.splice(cacheIndex, 1)
          }
        })
      })
    },
    // 分数总控制change
    totalScoreChange() {
      this.cachePerscore = []
      let num = 0
      this.operationlist.forEach((item, index) => {
        this.cachePerscore.push({
          exam_question_id: item.exam_question_id,
          rules: []
        })
        item.rules.forEach(ele => {
          if (ele.enable) {
            ele.score = this.score
            this.cachePerscore[index].rules.push({ rule_id: ele.rule_id, score: ele.score, enable: ele.enable })
            num += ele.score
          } else {
            this.cachePerscore[index].rules.push({ rule_id: ele.rule_id, score: ele.score, enable: ele.enable })
          }
        })
      })
      this.total_score = num
    },
    findOperation(questionId, ruleId, score, enable) {
      const index = this.cachePerscore.findIndex(ele => { return ele.exam_question_id === questionId })
      if (index !== -1) {
        const index2 = this.cachePerscore[index].rules.findIndex(ele => { return ele.rule_id === ruleId })
        if (index2 !== -1) {
          this.cachePerscore[index].rules[index2] = { rule_id: ruleId, score: score, enable: enable }
        } else {
          this.cachePerscore[index].rules.push({ rule_id: ruleId, score: score, enable: enable })
        }
      } else {
        this.cachePerscore.push({
          exam_question_id: questionId,
          rules: [{
            rule_id: ruleId,
            score: score,
            enable: enable
          }]
        })
      }
    },
    // 实操题分数与是否启用控制
    peroperationscoreChange(questionId, ruleId, score, enable) {
      this.findOperation(questionId, ruleId, score, enable)
      this.getTotalScore()
    },
    // 计算总分
    getTotalScore() {
      let num = 0
      this.operationlist.forEach(item => {
        item.rules.forEach(ele => {
          if (ele.enable) {
            num += ele.score
          }
        })
      })
      this.total_score = num
    },
    // 题目保存
    submitQuestionInfo() {
      if (this.cachePerscore.length) {
        examQuestionPeroperationscore({
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
