<template>
  <div>
    <div class="paper">
      <div class="exam-top">
        <div class="exam-title">{{ exam_name }}</div>
        <div class="check-box">
          <el-checkbox v-model="only_error" @change="getDiff()">仅显示错题</el-checkbox>
        </div>
      </div>
      <!-- 单选题 -->
      <div v-if="JSON.stringify(single) !== '{}' && single.questions.length" class="question-type">
        <div class="title">
          {{
            `${single.number}、${single.name}（本大题共${single.count}小题，${single.score}分）`
          }}</div>
        <div
          v-for="(item, index) in single.questions"
          :key="index"
          class="info"
        >
          <div class="item-title">
            {{ item.question_name }}
          </div>
          <el-table :data="item.user_answer" stripe>
            <el-table-column
              prop="real_name"
              label="考生"
              width="150"
              fixed
              show-overflow-tooltip
            />
            <el-table-column
              v-for="(val, key) in item.user_answer[0].choice_detail"
              :key="key"
              prop="choice_detail"
              label="选项"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                <div class="choice_detail" :class="scope.row.student_answer[0] === key ? 'choise' : ''">{{ `${key}:${scope.row.choice_detail[key]}` }}</div>
              </template>
            </el-table-column>
            <el-table-column
              prop="result"
              label="正误"
              fixed="right"
              width="50"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                <span :class="scope.row.result === '正确' ? 'right' : 'wrong'">{{ scope.row.result }}</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <!-- 多选题 -->
      <div v-if="JSON.stringify(multiple) !== '{}' && multiple.questions.length" class="question-type">
        <div class="title">
          {{
            `${multiple.number}、${multiple.name}（本大题共${multiple.count}小题，${multiple.score}分）`
          }}</div>
        <div
          v-for="(item, index) in multiple.questions"
          :key="index"
          class="info"
        >
          <div class="item-title">
            {{ item.question_name }}
          </div>
          <el-table :data="item.user_answer" stripe>
            <el-table-column
              prop="real_name"
              label="考生"
              width="150"
              fixed
              show-overflow-tooltip
            />
            <el-table-column
              v-for="(val, key) in item.user_answer[0].choice_detail"
              :key="key"
              prop="choice_detail"
              label="选项"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                <div class="choice_detail" :class="isChoise(scope.row.student_answer, key) ? 'choise' : ''">{{ `${key}:${scope.row.choice_detail[key]}` }}</div>
              </template>
            </el-table-column>
            <el-table-column
              prop="result"
              label="正误"
              fixed="right"
              width="50"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                <span :class="scope.row.result === '正确' ? 'right' : 'wrong'">{{ scope.row.result }}</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <!-- 判断题 -->
      <div v-if="JSON.stringify(judgement) !== '{}' && judgement.questions.length" class="question-type">
        <div class="title">
          {{
            `${judgement.number}、${judgement.name}（本大题共${judgement.count}小题，${judgement.score}分）`
          }}</div>
        <div
          v-for="(item, index) in judgement.questions"
          :key="index"
          class="info"
        >
          <div class="item-title">
            {{ item.question_name }}
          </div>
          <el-table :data="item.user_answer" stripe>
            <el-table-column
              prop="real_name"
              label="考生"
              width="150"
              fixed
              show-overflow-tooltip
            />
            <el-table-column
              prop="student_answer"
              label="选择"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                <span v-if="scope.row.student_answer[0] === 'YES'" class="choise">正确</span>
                <span v-if="scope.row.student_answer[0] === 'NO'" class="choise">错误</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="result"
              label="正误"
              fixed="right"
              width="50"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                <span :class="scope.row.result === '正确' ? 'right' : 'wrong'">{{ scope.row.result }}</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
    <div class="submit-btn">
      <el-button type="primary" @click="goBack()">返回</el-button>
    </div>
  </div>
</template>

<script>
import { examViolationDiff } from '@/api/exam'
export default {
  inject: ['examId'],
  props: {
    userId: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      records: [],
      exam_name: '',
      only_error: false,
      single: {},
      multiple: {},
      judgement: {}
    }
  },
  created() {
    this.getDiff()
  },
  methods: {
    getDiff() {
      examViolationDiff({
        data: {
          exam_id: this.examId,
          user_a_id: this.userId.user_a_id,
          user_b_id: this.userId.user_b_id,
          only_error: this.only_error
        }
      }).then(({ data }) => {
        this.exam_name = data.name
        this.records = data.data
        this.records.forEach(val => {
          switch (val.name) {
            case '单选题':
              this.single = val
              break
            case '多选题':
              this.multiple = val
              break
            case '判断题':
              this.judgement = val
              break
            default:
              break
          }
        })
      })
    },
    isChoise(answer, key) {
      return answer.some(val => val === key)
    },
    goBack() {
      this.$emit('goBack')
    }
  }
}
</script>

<style scoped lang="scss">
.paper {
  background: rgba(255,255,255,0.1);
  padding: 48px 140px 60px;
  .exam-top {
    display: flex;
    justify-content: space-between;
    padding-bottom: 37px;
    border-bottom: 2px solid rgba(255,255,255,0.10);
    .exam-title {
      font-size: 30px;
      font-weight: 600;
    }
    .check-box {
      position: relative;
      top: 18px;
    }
  }

  .question-type {
    padding-top: 37px;
    .title {
      font-size: 20px;
      font-weight: 700;
    }
    .info {
      margin-top: 18px;
      margin-bottom: 30px;
      .item-title {
        margin-bottom: 10px;
        line-height: 1.5;
      }
    }
  }
  .choise {
    color: #FFBC99;
  }
  .right {
    color:#68BF60;
  }
  .wrong {
    color: #ff797f;
  }
  .choice_detail {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
}
.submit-btn {
  margin-top: 16px;
}

::v-deep {
  .el-checkbox__label {
    color: #00AD84;
  }
  .el-checkbox__inner {
    border-color: #00AD84;
  }
  .el-table__header-wrapper {
    display: none;
  }
  .el-table__body-wrapper {
    z-index: 2;
  }
  .el-table__fixed-header-wrapper .el-table__header thead tr th:first-child,
  .el-table__fixed-header-wrapper .el-table__header thead tr th:last-child
  {
    background-color: #5A5C5C;
  }
  .el-table__fixed-body-wrapper .el-table__body tbody .el-table__row td:first-child,
  .el-table__fixed-body-wrapper .el-table__body tbody .el-table__row td:last-child
  {
    background-color:#545657;
  }
  .el-table__fixed-body-wrapper .el-table__body tbody .el-table__row.el-table__row--striped td:first-child,
  .el-table__fixed-body-wrapper .el-table__body tbody .el-table__row.el-table__row--striped td:last-child
  {
    background-color:  #5A5C5C;
  }
  .el-table--enable-row-transition .el-table__body .el-table__row.hover-row > td {
    background-color: #7B7D7D !important;
  }
  .el-table__body-wrapper::-webkit-scrollbar {
    height: 8px;
  }
  .el-table__body-wrapper::-webkit-scrollbar-track {
    background-color: transparent;
    border-radius: 4px;
  }
  .el-table__body-wrapper::-webkit-scrollbar-thumb {
    border-radius: 5px;
    background-color: rgba(255, 255, 255, .4);
  }
  .el-table__body-wrapper::-webkit-scrollbar-thumb:hover {
    background-color: rgba(255, 255, 255, .6);
  }
}
</style>
