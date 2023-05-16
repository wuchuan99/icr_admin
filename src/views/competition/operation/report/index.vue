<template>
  <div>
    <div class="operation-box">
      <div class="operation">
        <el-button
          class="filter-item"
          type="primary"
          size="medium"
          icon="el-icon-circle-plus-outline"
          @click="exportReport"
        >导出成绩</el-button>
        <el-button
          class="filter-item"
          size="medium"
          icon="el-icon-circle-plus-outline"
          :disabled="publishStatus"
          @click="publishDislogVisible = true"
        >{{ publishStatus ? '已公布成绩' : '公布成绩' }}</el-button>
      </div>
    </div>
    <icr-table ref="table" :columns="columns" :data="records" :loading="loading" height="calc(100vh - 271px)" />
    <IcrDialog
      title="公布成绩"
      width="400px"
      :visible.sync="publishDislogVisible"
      @confirm="reportPublish"
    >
      <span>确定公布本次成绩</span>
    </IcrDialog>
  </div>
</template>

<script>
import IcrTable from '@/components/table'
import IcrDialog from '@/components/dialog.vue'
import { competitionOperationScoreOrder, competitionOperationPublishScore, competitionOperationExportOrder } from '@/api/competition'

export default {
  components: { IcrTable, IcrDialog },
  inject: ['competitionId'],
  props: {
    publishStatus: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      publishDislogVisible: false,
      records: [],
      columnOptions: [
        { prop: 'name', label: '姓名' },
        { prop: '单选题', label: '单选题' },
        { prop: '多选题', label: '多选题' },
        { prop: '判断题', label: '判断题' },
        { prop: '实操题', label: '实操题' },
        { prop: 'total_score', label: '总成绩', sortable: true },
        { prop: 'order', label: '排名' }
      ],
      loading: false,
      columns: [
        { prop: 'name', label: '姓名' },
        { prop: '单选题', label: '单选题' },
        { prop: '多选题', label: '多选题' },
        { prop: '判断题', label: '判断题' },
        { prop: '实操题', label: '实操题' },
        { prop: 'total_score', label: '总成绩', sortable: true },
        { prop: 'order', label: '排名' }
      ]
    }
  },
  mounted() {
    this.getRecords()
  },
  methods: {
    getRecords() {
      if (!this.competitionId) return
      return new Promise((resolve, reject) => {
        this.loading = true
        competitionOperationScoreOrder({
          data: {
            id: this.competitionId
          }
        })
          .then((res) => {
            if (res.data) {
              const records = []
              res.data?.data.forEach((item, index) => {
                records.push({ ...item, order: index + 1 })
              })
              this.records = records
            }
            this.getColumn()
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
    exportReport() {
      competitionOperationExportOrder({
        data: {
          id: this.competitionId
        }
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
    reportPublish() {
      competitionOperationPublishScore({
        data: {
          id: this.competitionId
        }
      }).then(res => {
        console.log(res)
        if (res.status === 0) {
          this.$message({
            message: '发布成功',
            type: 'success'
          })
          this.$emit('changeStatus', true)
          this.publishDislogVisible = false
        }
      })
    },
    decodeUnicode(str) {
      str = str.replace(/\\u/gi, '%u')
      str = str.replace(/\\/gi, '')
      return unescape(str)
    },
    getColumn() {
      this.columns = []
      this.columnOptions.forEach(val => {
        console.log(this.records[0][val.prop])
        if (this.records[0][val.prop] !== undefined) {
          this.columns.push(val)
        }
      })
    }
  }
}
</script>
