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
import { examReportList, examReportPublish, examReportExport } from '@/api/exam'

export default {
  components: { IcrTable, IcrDialog },
  inject: ['examId'],
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
        { prop: 'real_name', label: '姓名' },
        { prop: 'single', label: '单选题' },
        { prop: 'multiple', label: '多选题' },
        { prop: 'judgement', label: '判断题' },
        { prop: 'subjective', label: '主观题' },
        { prop: 'operation', label: '实操题' },
        { prop: 'total', label: '总成绩', sortable: true },
        { prop: 'sort', label: '排名' }
      ],
      loading: false,
      columns: [
        { prop: 'real_name', label: '姓名' },
        { prop: 'single', label: '单选题' },
        { prop: 'multiple', label: '多选题' },
        { prop: 'judgement', label: '判断题' },
        { prop: 'subjective', label: '主观题' },
        { prop: 'operation', label: '实操题' },
        { prop: 'total', label: '总成绩', sortable: true },
        { prop: 'sort', label: '排名' }
      ]
    }
  },
  mounted() {
    this.getRecords()
  },
  methods: {
    getRecords() {
      if (!this.examId) return
      return new Promise((resolve, reject) => {
        this.loading = true
        examReportList({
          search_info: { exam_id: this.examId }
        })
          .then((res) => {
            if (res.data) {
              this.records = res.data.data
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
    reportPublish() {
      examReportPublish({
        data: { exam_id: this.examId, publish: true }
      }).then((res) => {
        this.$message.success('成绩公布成功')
        this.$emit('changeStatus', res.data.publish)
        this.getRecords()
      }).finally(() => {
        this.publishDislogVisible = false
      })
    },
    exportReport() {
      examReportExport({
        search_info: { exam_id: this.examId }
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
    getColumn() {
      this.columns = []
      this.columnOptions.forEach(val => {
        if (this.records[0][val.prop]) {
          this.columns.push(val)
        }
      })
    }
  }
}
</script>
