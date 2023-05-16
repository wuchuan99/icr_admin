<template>
  <div>
    <icr-table ref="table" :columns="table.columns" :data="records" :loading="loading" />
    <!-- pagination -->
    <pagination :total.sync="total" :page.sync="page" :limit.sync="limit" />
  </div>
</template>

<script>
import IcrTable from '@/components/table'
import { competitionOperationSubmitlog } from '@/api/competition'
import { ResourcePrefix } from '@/const/common'
import { extractFilename } from '../index.vue'
import { cloneDeep } from 'lodash-es'
import { usePagination } from '@/hooks'
import { reactive } from '@vue/composition-api'
import Pagination from '@/components/Pagination'

export default {
  setup() {
    const query = reactive({
    })
    return {
      query,
      ...usePagination(competitionOperationSubmitlog, query)
    }
  },
  components: { IcrTable, Pagination },
  inject: ['competitionId'],
  props: {
    user: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      publishDislogVisible: false,
      table: {
        columns: [
          { prop: 'title', label: '题目' },
          { prop: 'judgement', label: '判定点' },
          // { prop: 'q_answer', label: '提交答案', render: (scope) => {
          //   return (
          //     <div>
          //       { scope.row.q_category === 3
          //         ? !Array.isArray(scope.row.q_answer)
          //           ? <div>
          //             <a href={ ResourcePrefix + scope.row.q_answer.file_url } target='_blank' >
          //               { scope.row.q_answer.file_name }
          //               { scope.row.q_answer.target_name && ' (' + scope.row.q_answer.target_name + ')' }
          //             </a>
          //           </div>
          //           : scope.row.q_answer.map(ans => {
          //             return (
          //               <div>
          //                 <a href={ ResourcePrefix + ans.file_url } target='_blank' >
          //                   { ans.file_name }
          //                   { ans.target_name && ' (' + ans.target_name + ')' }
          //                 </a>
          //               </div>
          //             )
          //           })
          //         : JSON.stringify(scope.row.q_answer) }
          //     </div>
          //   )
          // } },
          { prop: 'student_answer', label: '提交答案', className: 'answer',
            render: (scope) => {
              if (scope.row.student_answer) {
                if (scope.row.category === 3) {
                  return (
                    <div>
                      <a href={ ResourcePrefix + scope.row.student_answer.file_url } target='_blank' >
                        { scope.row.student_answer.file_name }
                        { scope.row.student_answer.target_name && ' (' + scope.row.student_answer.target_name + ')' }
                      </a>
                    </div>
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
                  return <div>{isJudge ? judgeStr : clone.sort().join(',')}</div>
                }
              } else {
                return <div></div>
              }
            }
          },
          { prop: 'correct_answer', label: '正确答案', className: 'answer',
            render: (scope) => {
              if (scope.row.correct_answer) {
                if (scope.row.category === 3) {
                  return (
                    <div>
                      <a href={ ResourcePrefix + scope.row.correct_answer.writeup } target='_blank'>
                        { scope.row.correct_answer.name }
                        { scope.row.correct_answer.writeup && ' (' + extractFilename(scope.row.correct_answer.writeup) + ')' }
                      </a>
                    </div>
                  )
                } else {
                  const clone = cloneDeep(scope.row.correct_answer)
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
                  return <div>{isJudge ? judgeStr : clone.sort().join(',')}</div>
                }
              } else {
                return <div></div>
              }
            } },
          // { prop: 'q_correct_answer', label: '正确答案', render: (scope) => {
          //   return (
          //     <div style='white-space: normal;'>
          //       { scope.row.q_category === 3
          //         ? !Array.isArray(scope.row.q_correct_answer)
          //           ? <div>
          //             <a href={ ResourcePrefix + scope.row.q_correct_answer.writeup } target='_blank'>
          //               { scope.row.q_correct_answer.name }
          //               { scope.row.q_correct_answer.writeup && ' (' + extractFilename(scope.row.q_correct_answer.writeup) + ')' }
          //             </a>
          //           </div>
          //           : scope.row.q_correct_answer.map(ans => {
          //             return (
          //               <div>
          //                 <a href={ ResourcePrefix + ans.writeup } target='_blank'>
          //                   { ans.name }
          //                   { ans.writeup && ' (' + extractFilename(ans.writeup) + ')' }
          //                 </a>
          //               </div>
          //             )
          //           })
          //         : JSON.stringify(scope.row.q_correct_answer) }
          //     </div>
          //   )
          // } },
          // { prop: 'system_judgment', label: '判定结果', render: scope => {
          //   return (
          //     <div>{ getQuestStateByScore(scope.row.student_score) }</div>
          //   )
          // } },
          { prop: 'system_judgment', label: '判定结果' },
          { prop: 'submit_time', label: '提交时间' }
        ]
      }
    }
  },
  mounted() {
    this.query.id = this.competitionId
    if (this.user.id) {
      this.query.u_id = this.user.id
    }
    if (this.user.o_id) {
      this.query.o_id = this.user.o_id
    }
    this.getRecords()
  },
  methods: {
    // getRecords() {
    //   if (!this.competitionId) return
    //   return new Promise((resolve, reject) => {
    //     this.loading = true
    //     const data = {
    //       id: this.competitionId
    //     }
    //     if (this.user.id) {
    //       data['u_id'] = this.user.id
    //     }

    //     if (this.user.o_id) {
    //       data['o_id'] = this.user.o_id
    //     }

    //     competitionOperationSubmitlog({
    //       data: data
    //     })
    //       .then((res) => {
    //         if (res.data) {
    //           // const records = []
    //           // res.data?.data?.forEach(item => {
    //           //   if (item.q_category < 3) {
    //           //     records.push(item)
    //           //   } else if (item.q_category === 3) {
    //           //     item.q_answer?.forEach((rule, index) => {
    //           //       const correct_answer = item.q_correct_answer.find(answer => answer.name === rule.name)

    //           //       records.push({
    //           //         ...item,
    //           //         score: correct_answer?.score,
    //           //         student_score: rule.score,
    //           //         flag: rule.name,
    //           //         q_correct_answer: correct_answer,
    //           //         q_answer: rule
    //           //       })
    //           //     })
    //           //   }
    //           // })
    //           // console.log(records)
    //           // this.records = records
    //           this.records = res.data?.data
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
      // markPaperDownload({
      //   filename: scope.row[type]
      // }).then(res => {
      //   const title = res.headers['content-disposition'].split(';')[1].split('=')[1].split('"')[1]
      //   const filename = this.decodeUnicode(title)
      //   const bb = new Blob([res.data], { type: 'application/octet-stream' })
      //   const a = document.createElement('a')
      //   a.download = filename
      //   a.href = window.URL.createObjectURL(bb)
      //   a.click()
      // })
    },
    decodeUnicode(str) {
      str = str.replace(/\\u/gi, '%u')
      str = str.replace(/\\/gi, '')
      return unescape(str)
    },
    formatter(row) {
      return row.flag ? row.flag : '--'
      // if (!row.q_correct_answer?.length) return '--'
      // return (
      //   <div>
      //     {
      //       row.q_correct_answer.reduce((acc, item) => {
      //         acc.push(<div>{ item.name }</div>)
      //         return acc
      //       }, [])
      //     }
      //   </div>
      // )
    }
  }
}
</script>
<style lang="scss" scoped>
.answer {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
::v-deep {
  td.answer .cell a {
    display: inline-block;
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>
