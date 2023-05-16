<template>
  <div>
    <!-- <div class="top">
      <el-button type="text">下载试卷</el-button>
    </div> -->
    <div class="paper">
      <div class="competition-title">
        {{ previewpaper.name }}
        <span class="total-score">总分{{ previewpaper.totalScore }}</span>
      </div>
      <!-- 单选题 -->
      <div v-if="previewpaper.hasOwnProperty('single') && previewpaper.single.question.length" class="question-type">
        <div class="title">
          {{ `${ previewpaper.single.number}、${previewpaper.single.name}（本大题共${previewpaper.single.total_number}小题，${previewpaper.single.score}分）` }}
        </div>
        <div v-for="item in previewpaper.single.question" :key="item.sort" class="info">
          <div class="item-title">{{ `${item.sort}、${item.name}（${item.score}分）` }}</div>
          <div v-for="(val, key) in item.choice_detail" :key="key" class="item-choice">{{ `${key}: ${val}` }}</div>
        </div>
      </div>
      <!-- 多选题 -->
      <div v-if="previewpaper.hasOwnProperty('multiple') && previewpaper.multiple.question.length" class="question-type">
        <div class="title">
          {{ `${ previewpaper.multiple.number}、${previewpaper.multiple.name}（本大题共${previewpaper.multiple.total_number}小题，${previewpaper.multiple.score}分）` }}
        </div>
        <div v-for="item in previewpaper.multiple.question" :key="item.sort" class="info">
          <div class="item-title">{{ `${item.sort}、${item.name}（${item.score}分）` }}</div>
          <div v-for="(val, key) in item.choice_detail" :key="key" class="item-choice">{{ `${key}: ${val}` }}</div>
        </div>
      </div>
      <!-- 判断题 -->
      <div v-if="previewpaper.hasOwnProperty('judgement') && previewpaper.judgement.question.length" class="question-type">
        <div class="title">
          {{ `${ previewpaper.judgement.number}、${previewpaper.judgement.name}（本大题共${previewpaper.judgement.total_number}小题，${previewpaper.judgement.score}分）` }}
        </div>
        <div v-for="item in previewpaper.judgement.question" :key="item.sort" class="info">
          <div class="item-title">{{ `${item.sort}、${item.name}（${item.score}分）` }}</div>
          <div class="item-choice">正确</div>
          <div class="item-choice">错误</div>
        </div>
      </div>
      <!-- 实操题 -->
      <div v-if="previewpaper.hasOwnProperty('operation') && previewpaper.operation.question.length" class="question-type">
        <div class="title">
          {{ `${ previewpaper.operation.number}、${previewpaper.operation.name}（本大题共${previewpaper.operation.total_number}小题，${previewpaper.operation.score}分）` }}
        </div>
        <div v-for="item in previewpaper.operation.question" :key="item.sort" class="info">
          <div class="item-title">{{ `${item.sort}、${item.name}（${item.score}分）` }}</div>
          <div v-for="(item2, index) in item.rules" :key="index" class="item-choice">{{ `判定点${index+1}：${item2.name}（${item2.score}分）` }}</div>
        </div>
      </div>
    </div>
    <div class="submit-btn">
      <el-button type="primary" :disabled="competition.going" @click="submitQuestionInfo">下一步</el-button>
      <el-button :disabled="competition.going" @click="goBack">取消</el-button>
    </div>
  </div>
</template>

<script>
import { competitionQuestionList } from '@/api/competition'

const formatQuestionList = function(questions, competition) {
  // make questions ordered
  const weightMap = new Map([
    ['单选题', 1],
    ['多选题', 2],
    ['判断题', 3],
    ['实操题', 4]
  ])
  questions.sort((a, b) => {
    console.log(a.category, b.category, weightMap.get(a.category), weightMap.get(b.category))
    return weightMap.get(a.category) - weightMap.get(b.category)
  })

  const ans = {
    name: competition.name,
    totalScore: 0
  }

  const JudgementQuestion = 'judgement'
  const SingleQuestion = 'single'
  const MultipleQuestion = 'multiple'
  const OperationQuestion = 'operation'

  const questionTypeMap = new Map([
    ['判断题', JudgementQuestion],
    ['单选题', SingleQuestion],
    ['多选题', MultipleQuestion],
    ['实操题', OperationQuestion]
  ])
  questionTypeMap.forEach((v, k) => {
    ans[v] = {
      name: k,
      number: '',
      question: [],
      score: 0,
      total_number: 0
    }
  })
  let index = 0
  questions.forEach(quest => {
    ans.totalScore += quest.score

    const t = questionTypeMap.get(quest.category)
    const formatTypeQuestions = ans[t]
    if (formatTypeQuestions.question.length === 0) {
      index++
      formatTypeQuestions.number = Number(index).toLocaleString('zh-Hans-CN-u-nu-hanidec')
    }

    // 实操题分数修正
    const enabledRules = []
    if (t === OperationQuestion) {
      quest.score = quest.rules.reduce((acc, item) => {
        if (item.enable) {
          acc += item.score
          enabledRules.push(item)
        }
        return acc
      }, 0)
      quest.rules = enabledRules
    }

    formatTypeQuestions.name = quest.category
    formatTypeQuestions.question.push({
      ...quest,
      name: quest.desc,
      sort: formatTypeQuestions.question.length + 1
    })
    formatTypeQuestions.score += quest.score
    formatTypeQuestions.total_number++
  })

  console.log(ans)

  return ans
}

export default {
  inject: ['getCompetition', 'getCompetitionId'],
  data() {
    return {
      competition: this.getCompetition(),
      previewpaper: {},
      total_score: 0
    }
  },
  created() {
    this.getPreviewpaper()
  },
  methods: {
    getPreviewpaper() {
      if (!this.getCompetitionId()) return
      return new Promise((resolve, reject) => {
        competitionQuestionList({
          data: { id: this.getCompetitionId() }
        })
          .then((res) => {
            if (res.data) {
              const competition = this.getCompetition()
              console.log(res.data)
              this.previewpaper = formatQuestionList(res.data?.data, competition)
            }
            resolve(res)
          })
          .catch((err) => {
            console.error(err)
            reject(err)
          })
      })
    },
    submitQuestionInfo() {
      this.$emit('submitQuestionInfo')
    },
    goBack() {
      this.$router.go(-1)
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
  .competition-title {
    position: relative;
    font-size: 30px;
    text-align: center;
    font-weight: 600;
    padding-bottom: 37px;
    border-bottom: 2px solid rgba(255,255,255,0.10);
    .total-score {
      position: absolute;
      bottom: 0;
      right: 0;
      font-size: 20px;
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
        line-height: 1.5;
        margin-bottom: 20px;
      }
      .item-choice {
        color:rgba(255,255,255,0.6);
        margin-top: 10px;
        margin-left: 25px;
        line-height: 1.5;
      }
    }
  }
}
.submit-btn {
  margin-top: 16px;
}
</style>
