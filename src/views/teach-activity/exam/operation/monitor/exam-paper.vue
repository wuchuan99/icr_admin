<template>
  <div class="paper">
    <div class="exam-title">{{ previewpaper.name }}</div>
    <!-- 单选题 -->
    <div v-if="previewpaper.hasOwnProperty('single') && previewpaper.single.question.length" class="question-type">
      <div class="title">
        {{
          `${previewpaper.single.number}、${previewpaper.single.name}（本大题共${previewpaper.single.total_number}小题，${previewpaper.single.score}分）`
        }}
      </div>
      <div
        v-for="(item, index) in previewpaper.single.question"
        :key="index"
        class="info"
      >
        <div class="item-title">
          {{ `${item.sort}、${item.name}（${item.score}分）` }}
        </div>
        <div
          v-for="(val, key) in item.choice_detail"
          :key="key"
          class="item-choice"
        >
          <el-radio
            v-model="item.student_answer[0]"
            :label="key"
            disabled
          >
            {{ `${key}: ${val}` }}
          </el-radio>
        </div>
        <div
          class="item-answer"
          :class="item.result==='错误'? 'wrong':'right'"
        >
          答案：{{ item.result }}
        </div>
      </div>
    </div>
    <!-- 多选题 -->
    <div v-if="previewpaper.hasOwnProperty('multiple') && previewpaper.multiple.question.length" class="question-type">
      <div class="title">
        {{
          `${previewpaper.multiple.number}、${previewpaper.multiple.name}（本大题共${previewpaper.multiple.total_number}小题，${previewpaper.multiple.score}分）`
        }}
      </div>
      <div
        v-for="(item, index) in previewpaper.multiple.question"
        :key="index"
        class="info"
      >
        <div class="item-title">
          {{ `${item.sort}、${item.name}（${item.score}分）` }}
        </div>
        <div
          v-for="(val, key) in item.choice_detail"
          :key="key"
          class="item-choice"
        >
          <el-checkbox-group v-model="item.student_answer">
            <el-checkbox
              :label="key"
              disabled
            >
              {{ `${key}: ${val}` }}
            </el-checkbox>
          </el-checkbox-group>
        </div>
        <div
          class="item-answer"
          :class="item.result==='错误'? 'wrong':'right'"
        >
          答案：{{ item.result }}
        </div>
      </div>
    </div>
    <!-- 判断题 -->
    <div v-if="previewpaper.hasOwnProperty('judgement') && previewpaper.judgement.question.length" class="question-type">
      <div class="title">
        {{
          `${previewpaper.judgement.number}、${previewpaper.judgement.name}（本大题共${previewpaper.judgement.total_number}小题，${previewpaper.judgement.score}分）`
        }}
      </div>
      <div
        v-for="(item, index) in previewpaper.judgement.question"
        :key="index"
        class="info"
      >
        <div class="item-title">
          {{ `${item.sort}、${item.name}（${item.score}分）` }}
        </div>
        <div class="item-choice">
          <el-radio v-model="item.student_answer[0]" label="YES" disabled>
            正确
          </el-radio>
        </div>
        <div class="item-choice">
          <el-radio v-model="item.student_answer[0]" label="NO" disabled>
            错误
          </el-radio>
        </div>
        <div
          class="item-answer"
          :class="item.result==='错误'? 'wrong':'right'"
        >
          答案：{{ item.result }}
        </div>
      </div>
    </div>
    <!-- 主观题 -->
    <div v-if="previewpaper.hasOwnProperty('subjective') && previewpaper.subjective.question.length" class="question-type">
      <div class="title">
        {{
          `${previewpaper.subjective.number}、${previewpaper.subjective.name}（本大题共${previewpaper.subjective.total_number}小题，${previewpaper.subjective.score}分）`
        }}
      </div>
      <div
        v-for="(item, index) in previewpaper.subjective.question"
        :key="index"
        class="info"
      >
        <div class="item-title">
          {{ `${item.sort}、${item.name}（${item.score}分）` }}
        </div>
        <div class="item-choice">
          <pre style="white-space: pre-wrap;"><span>{{ item.student_answer[0] }}</span></pre>
        </div>
        <div
          class="item-answer"
          :class="item.student_score==='0'? 'wrong':'right'"
        >
          得分：{{ item.student_score }}分
        </div>
      </div>
    </div>
    <!-- 实操题 -->
    <div v-if="previewpaper.hasOwnProperty('operation') && previewpaper.operation.question.length" class="question-type operation-type">
      <div class="title">
        {{
          `${previewpaper.operation.number}、${previewpaper.operation.name}（本大题共${previewpaper.operation.total_number}小题，${previewpaper.operation.score}分）`
        }}
      </div>
      <div
        v-for="(item, index) in previewpaper.operation.question"
        :key="index"
        class="info"
      >
        <div class="item-title">
          {{ `${item.sort}、${item.name}（${item.score}分）` }}
        </div>
        <div v-for="(item2, index2) in item.rules" :key="index2" class="item-choice">
          <div>{{ `判定点${index2+1}：${item2.name}（${item2.score}分）` }}</div>
          <div
            class="item-answer"
            :class="item2.student_score==='0'? 'wrong':'right'"
          >
            得分：{{ item2.student_score }}分
          </div>
        </div>
      </div>
    </div>
    <!-- 总分 -->
    <div v-if="previewpaper.hasOwnProperty('total_student_score')" class="totalScore">综合得分：{{ previewpaper.total_student_score }}</div>
  </div>
</template>
<script>
import { markPaperUserView } from '@/api/exam'
export default {
  props: {
    userId: {
      type: Number,
      default: 0
    }
  },
  inject: ['examId'],
  data() {
    return {
      publishDislogVisible: false,
      previewpaper: {}
    }
  },
  created() {
    this.getPreviewpaper()
  },
  methods: {
    getPreviewpaper() {
      if (!this.examId) return
      return new Promise((resolve, reject) => {
        markPaperUserView({
          data: { exam_id: this.examId, user_id: this.userId }
        })
          .then((res) => {
            if (res.data) {
              this.previewpaper = res.data
              console.log('查看试卷', this.previewpaper)
            }
            resolve(res)
          })
          .catch((err) => {
            console.error(err)
            reject(err)
          })
      })
    }
  }
}
</script>

<style scoped lang="scss">
.top {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 5px;
}
.paper {
  background: rgba(255,255,255,0.1);
  padding: 48px 140px 60px;
  .exam-title {
    font-size: 30px;
    text-align: center;
    font-weight: 600;
    padding-bottom: 37px;
    border-bottom: 2px solid rgba(255,255,255,0.10);
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
        margin-bottom: 15px;
        line-height: 1.5;
      }
      .item-choice {
        color:rgba(255,255,255,0.6);
        margin-top: 6px;
      }
      .item-answer {
        margin-top: 20px;
        &.right {
          color: #68BF60;
        }
        &.wrong {
          color: #ff797f;
        }
      }
    }
  }
  .operation-type {
    .info {
      .item-answer {
        margin-top: 10px;
      }
    }
  }
  .totalScore {
    color: #ffbc99;
    font-size: 24px;
    font-weight: 700;
  }
  pre {
    margin: 0;
    font-family: Microsoft YaHei, Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB, Arial, sans-serif;
  }
}
::v-deep {
  .el-radio__input.is-disabled .el-radio__inner {
    background-color: transparent;
    cursor: pointer;
  }
  .el-radio__input.is-disabled.is-checked .el-radio__inner {
    border-color: #00AD84;
    background: #00AD84;
  }
  .el-radio__input.is-disabled.is-checked .el-radio__inner::after {
    background-color: #FFFFFF;
    cursor: pointer;
  }
  .el-radio__input.is-disabled + span.el-radio__label {
    color: #FFFFFF;
    opacity: 0.6;
    cursor: pointer;
    white-space: normal;
    line-height: 1.5;
  }
  .el-checkbox__input.is-disabled .el-checkbox__inner {
    background-color: transparent;
    cursor: pointer;
  }
  .el-checkbox__input.is-disabled.is-checked .el-checkbox__inner {
    background-color: #00AD84;
    border-color: #00AD84;
  }
  .el-checkbox__input.is-disabled.is-checked .el-checkbox__inner::after {
    border-color: #FFFFFF;
    cursor: pointer;
  }
  .el-checkbox__input.is-disabled + span.el-checkbox__label {
    color: #FFFFFF;
    opacity: 0.6;
    cursor: pointer;
    white-space: normal;
    display: inline;
    line-height: 1.5;
  }
}
</style>
