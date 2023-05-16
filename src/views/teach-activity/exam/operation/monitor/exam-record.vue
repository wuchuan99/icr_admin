<template>
  <div>
    <icr-table ref="table" :columns="table.columns" :data="records" :loading="loading" />
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
import { markPaperList, markPaperDownload } from '@/api/exam'
import { cloneDeep } from 'lodash-es'
import { usePagination } from '@/hooks'
import { reactive } from '@vue/composition-api'
import Pagination from '@/components/Pagination'

export default {
  setup() {
    const query = reactive({
      exam_id: null,
      user_id: null,
      source: 'view'
    })
    return {
      query,
      ...usePagination(markPaperList, query)
    }
  },
  components: { IcrTable, Pagination },
  inject: ['examId'],
  props: {
    userId: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      detailVisible: false,
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
          { prop: 'system_judgment', label: '自动判定',
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
          { prop: 'submit_time', label: '提交时间' }
        ]
      },
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
    //       search_info: { exam_id: this.examId, user_id: this.userId, source: 'view' }
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
