<template>
  <div class="drill_monitor_record">
    <icr-table ref="table" :columns="table.columns" :data="records" :loading="loading" />
    <!-- pagination -->
    <pagination :total.sync="total" :page.sync="page" :limit.sync="limit" />
  </div>
</template>

<script>
import IcrTable from '@/components/table'
import { drillTaskLogHistory } from '@/api/drill'
import { downloadFile } from '@/utils/file'
import { reactive } from '@vue/composition-api'
import Pagination from '@/components/Pagination'
import { usePagination } from '@/hooks'

const resultMap = {
  0: '待人工判定',
  1: '验证通过',
  2: '验证不通过'
}
export default {
  components: { IcrTable, Pagination },
  inject: ['drillId'],
  props: {
    userId: {
      type: Number,
      default: 0
    }
  },
  setup() {
    const query = reactive({ drill_id: '', complex_id: '' })
    return {
      query,
      ...usePagination(drillTaskLogHistory, query)
    }
  },
  data() {
    return {
      publishDislogVisible: false,
      table: {
        columns: [
          { prop: 'name', label: '任务名称' },
          {
            prop: 'commit',
            label: '提交解析',
            className: 'answer',
            render: (scope) => {
              return (
                <div>
                  <span
                    type='text'
                    onclick={() => { this.downLoadFile(scope.row.commit) }}
                  >
                    {scope.row.commit.name}
                  </span>
                </div>
              )
            }
          },
          {
            prop: 'writeup',
            label: '标准解析',
            className: 'answer',
            render: (scope) => {
              return (
                <div>
                  <span
                    type='text'
                    onclick={() => { this.downLoadFile(scope.row.writeup) }}
                  >
                    {scope.row.writeup.name}
                  </span>
                </div>
              )
            }
          },
          {
            prop: 'result',
            label: '判定结果',
            render: (scope) => {
              let color = ''
              if (scope.row.result === 0) {
                color = 'warn'
              }
              return (
                <div class={color}>{ resultMap[scope.row.result] }</div>
              )
            }
          },
          {
            prop: 'create_time',
            label: '提交时间'
          }
        ]
      }
      // loading: false
    }
  },
  mounted() {
    if (!this.drillId) return
    this.query.drill_id = this.drillId
    this.query.complex_id = this.userId
    this.getRecords()
  },
  methods: {
    // getRecords() {
    //   if (!this.drillId) return
    //   return new Promise((resolve, reject) => {
    //     this.loading = true
    //     drillTaskLogHistory({
    //       page_info: this.page_info,
    //       search_info: { drill_id: this.drillId, complex_id: this.userId }
    //     })
    //       .then((res) => {
    //         if (res.data) {
    //           this.records = res.data.data || []
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
    decodeUnicode(str) {
      str = str.replace(/\\u/gi, '%u')
      str = str.replace(/\\/gi, '')
      return unescape(str)
    },
    formatter(row) {
      return row.flag ? row.flag : '--'
    },
    downLoadFile(file) {
      file.url && downloadFile(`/resource/${file.url}`, file.name)
    }
  }
}
</script>
<style lang="scss" scoped>
  .drill_monitor_record {
    .warn {
      color: #F6BF53;
    }
  }
::v-deep {
  td.answer .cell span {
    color: #00CDA8;
    display: inline-block;
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>
