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
          答案：{{ item.result }} <span v-if="item.user_name" class="user_name">（{{ item.user_name }}）</span>
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
          答案：{{ item.result }} <span v-if="item.user_name" class="user_name">（{{ item.user_name }}）</span>
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
          答案：{{ item.result }} <span v-if="item.user_name" class="user_name">（{{ item.user_name }}）</span>
        </div>
      </div>
    </div>
    <!-- 实操题 -->
    <div v-if="previewpaper.hasOwnProperty('operation') && previewpaper.operation.question.length && !isSceneQuest" class="question-type operation-type">
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
          <div>{{ `判定点${index+1}：${item2.name}（${item2.score}分）` }}</div>
          <div
            class="item-answer"
            :class="item2.student_score==='0'? 'wrong':'right'"
          >
            得分：{{ item2.student_score }}分 <span v-if="item.user_name" class="user_name">（{{ item.user_name }}）</span>
          </div>
        </div>
      </div>
    </div>
    <!-- 场景题 -->
    <div v-if="previewpaper.hasOwnProperty('operation') && previewpaper.operation.question.length && isSceneQuest" class="question-type operation-type">
      <div class="title">
        {{
          `${previewpaper.operation.number}、${previewpaper.operation.question[0].name}（本大题共${previewpaper.operation.question[0].rules.length}小题，${previewpaper.operation.score}分）`
        }}
      </div>
      <div
        v-for="(item, index) in previewpaper.operation.question[0].rules"
        :key="index"
        class="info"
      >
        <div class="item-title">
          {{ `${index+1}、${item.name}（${item.score}分）` }}
          <div
            class="item-answer"
            :class="item.student_score==='0'? 'wrong':'right'"
          >
            目标: {{ item.target_name }}
            <br>
            得分：{{ item.student_score }}分 <span v-if="item.user__name" class="user_name">{{ item.user_name }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 总分 -->
    <div v-if="previewpaper.hasOwnProperty('total_student_score')" class="totalScore">综合得分：{{ previewpaper.total_student_score }}</div>
  </div>
</template>
<script>
import { competitionOperationView } from '@/api/competition'
import { currentCompetition } from '../index.vue'
import { CompetitionDevOpsModel,
  CompetitionDrillModel,
  CompetitionInvasionModel,
  CompetitionRealWorldModel
} from '@/views/competition/index.vue'

function formatPaper(data) {
  const typeMap = new Map([
    ['单选题', 'single'],
    ['多选题', 'multiple'],
    ['判断题', 'judgement'],
    ['实操题', 'operation']
  ])

  // make questions ordered
  const weightMap = new Map([
    ['单选题', 1],
    ['多选题', 2],
    ['判断题', 3],
    ['实操题', 4]
  ])

  const ans = {
    name: currentCompetition.name || '',
    total_student_score: 0
  }

  let categoryIndex = 0
  let questionIndex = 0
  let totalStudentScore = 0
  Object.keys(data).sort((a, b) => {
    return weightMap.get(a) - weightMap.get(b)
  }).forEach(k => {
    const questions = data[k]
    const tk = typeMap.get(k)

    if (!questions.length) return
    categoryIndex++

    ans[tk] = {
      name: k,
      number: Number(categoryIndex).toLocaleString('zh-Hans-CN-u-nu-hanidec'),
      score: questions.reduce((acc, item) => {
        if (item.question__category < 3) {
          acc += item.competition_question__score
        } else if (item.question__category === 3) {
          Array.isArray(item.correct_answer) && item.correct_answer.forEach(rule => {
            acc += rule.score
          })
        }
        return acc
      }, 0),
      total_number: questions.length,
      question: questions.map(q => {
        questionIndex++
        if (q.question__category < 3) {
          totalStudentScore += q.student_score
          return {
            category: q.question__category,
            sort: questionIndex,
            answer: q.correct_answer,
            choice_detail: q.question__choice_detail,
            name: q.question__desc,
            score: q.competition_question__score,
            student_answer: q.competition_answer,
            result: JSON.stringify(q.correct_answer.sort()) === JSON.stringify(q.competition_answer.sort()) ? '正确' : '错误',
            user_name: q?.user__name
          }
        } else if (q.question__category === 3) {
          return {
            category: q.question__category,
            sort: questionIndex,
            answer: q.correct_answer,
            choice_detail: q.question__choice_detail,
            name: q.question__desc,
            score: q.competition_question__score,
            student_answer: q.competition_answer,
            result: JSON.stringify(q.correct_answer.sort()) === JSON.stringify(q.competition_answer.sort()) ? '正确' : '错误',
            rules: Array.isArray(q.competition_answer) ? q.competition_answer.map(rule => {
              const correct_answer = q.correct_answer.find(answer => answer.name === rule.name)
              totalStudentScore += rule.score || 0
              return {
                name: rule.name,
                score: correct_answer.score,
                student_score: rule.score || 0,
                student_flag: rule.flag,
                target_name: rule.target_name
              }
            }) : [],
            user_name: q?.user__name
          }
        }
      })
    }
  })
  ans['total_student_score'] = totalStudentScore
  return ans
}

export default {
  props: {
    user: {
      type: Object,
      default: () => {}
    }
  },
  inject: ['competitionId'],
  data() {
    return {
      publishDislogVisible: false,
      previewpaper: {}
    }
  },
  computed: {
    isSceneQuest: function() {
      return [CompetitionDevOpsModel, CompetitionDrillModel, CompetitionInvasionModel, CompetitionRealWorldModel].indexOf(currentCompetition.competition_model) >= 0
    }
  },
  created() {
    this.getPreviewpaper()
  },
  methods: {
    getPreviewpaper() {
      if (!this.competitionId) return
      return new Promise((resolve, reject) => {
        const data = {
          c_id: this.competitionId
        }
        if (this.user.id) {
          data['u_id'] = this.user.id
        }

        if (this.user.o_id) {
          data['o_id'] = this.user.o_id
        }
        competitionOperationView({
          data: data
        })
          .then((res) => {
            if (res.data) {
              this.previewpaper = formatPaper(res.data.data)
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
  .user_name {
    color: #00AD84;
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
