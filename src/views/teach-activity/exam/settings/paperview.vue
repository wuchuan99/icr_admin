<template>
  <div>
    <div class="top">
      <el-button type="text" @click="downloadPaper">下载试卷</el-button>
    </div>
    <div class="paper">
      <div class="exam-title">
        {{ previewpaper.name }}
        <span class="total-score">总分{{ total_score }}</span>
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
      <!-- 主观题 -->
      <div v-if="previewpaper.hasOwnProperty('subjective') && previewpaper.subjective.question.length" class="question-type">
        <div class="title">
          {{ `${ previewpaper.subjective.number}、${previewpaper.subjective.name}（本大题共${previewpaper.subjective.total_number}小题，${previewpaper.subjective.score}分）` }}
        </div>
        <div v-for="item in previewpaper.subjective.question" :key="item.sort" class="info">
          <div class="item-title">{{ `${item.sort}、${item.name}（${item.score}分）` }}</div>
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
      <el-button type="primary" :disabled="getAccess()" @click="submitQuestionInfo">下一步</el-button>
      <el-button @click="goBack">取消</el-button>
    </div>
  </div>
</template>

<script>
import { previewpaperInfo, examQuestionPapersave, examPaperExport } from '@/api/exam'
export default {
  inject: ['getExamId', 'getAccess'],
  data() {
    return {
      previewpaper: {}
    }
  },
  computed: {
    total_score() {
      const paperData = Object.values(this.previewpaper)
      return paperData.reduce((total, currentValue) => {
        return currentValue['score'] ? (total + currentValue['score']) : total
      }, 0)
    }
  },
  created() {
    this.getPreviewpaper()
  },
  methods: {
    getPreviewpaper() {
      if (!this.getExamId()) return
      return new Promise((resolve, reject) => {
        previewpaperInfo({
          data: { exam_id: this.getExamId() }
        })
          .then((res) => {
            if (res.data) {
              this.previewpaper = res.data
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
      if (this.checkQuestion()) {
        this.$message.warning('请先添加题目')
        return
      }
      examQuestionPapersave({ exam_id: this.getExamId() })
      this.$emit('submitQuestionInfo')
    },
    goBack() {
      this.$router.go(-1)
    },
    checkQuestion() {
      // 判断试卷是否有题
      if (
        !this.previewpaper.single.question.length &&
        !this.previewpaper.multiple.question.length &&
        !this.previewpaper.judgement.question.length &&
        !this.previewpaper.subjective.question.length &&
        !this.previewpaper.operation.question.length
      ) {
        return true
      } else {
        return false
      }
    },
    downloadPaper() {
      examPaperExport({
        search_info: { exam_id: this.getExamId(), name: 'paper' }
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
