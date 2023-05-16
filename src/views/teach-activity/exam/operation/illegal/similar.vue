<template>
  <div>
    <div class="operation-box">
      <div class="query-conditions">
        <div class="query-conditions__item search">
          <el-input
            v-model="search_info.account_a"
            placeholder="请输入考生1姓名"
            size="medium"
            :disabled="loading"
            @keyup.enter.native="getRecords"
          >
            <i
              slot="suffix"
              class="el-input__icon iconfont icon-sousuo"
              @click="getRecords"
            />
          </el-input>
        </div>
        <div class="query-conditions__item search">
          <el-input
            v-model="search_info.account_b"
            placeholder="请输入考生2姓名"
            size="medium"
            :disabled="loading"
            @keyup.enter.native="getRecords"
          >
            <i
              slot="suffix"
              class="el-input__icon iconfont icon-sousuo"
              @click="getRecords"
            />
          </el-input>
        </div>
      </div>
    </div>
    <icr-table ref="table" :columns="table.columns" :data="records" :loading="loading" @sort-change="similaritySort" @filter-change="similarityFilter" />
    <el-dialog
      title="添加处罚"
      :visible.sync="judgeDislogVisible"
      @close="closeDialog"
    >
      <icr-form
        ref="form"
        :model="model"
        class="question-form"
        @cancel="judgeDislogVisible = false"
        @confirm="submit"
      >
        <div class="inline">
          <el-form-item label="组织">
            <el-select v-model="org_id" @change="changeOrgs">
              <el-option
                v-for="item in orgs"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="姓名">
            <el-select v-model="model.account_id">
              <el-option
                v-for="item in accounts"
                :key="item.account_id"
                :label="item.real_name"
                :value="item.account_id"
              />
            </el-select>
          </el-form-item>
        </div>
        <el-form-item label="处罚">
          <el-radio v-model="model.cancel_grades" :label="false">扣分</el-radio>
          <el-input-number v-model="model.points_deducted" size="small" :min="0" />
          <div>
            <el-radio v-model="model.cancel_grades" :label="true">取消考试成绩</el-radio>
          </div>
        </el-form-item>
        <el-form-item label="违规描述">
          <el-input v-model="model.description" type="textarea" :autosize="{ minRows: 6 }" />
        </el-form-item>
      </icr-form>
    </el-dialog>

    <!-- pagination -->
    <pagination :total.sync="total" :page.sync="page" :limit.sync="limit" @pagination="pageChange" />
  </div>
</template>

<script>
import IcrTable from '@/components/table'
import IcrForm from '@/components/form'
import { getorg as getOrgs } from '@/api/account'
import { examViolationAdd, examViolationSimilarity, examViolationStudent } from '@/api/exam'
import Pagination from '@/components/Pagination'
import { vmSocket } from '@/utils/ws'

export default {
  components: { IcrTable, IcrForm, Pagination },
  inject: ['examId'],
  props: {
    publishStatus: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      judgeDislogVisible: false,
      model: {
        account_id: '',
        cancel_grades: null,
        points_deducted: '',
        description: ''
      },
      records: [],
      table: {
        columns: [
          { prop: 'account_a', label: '考生1' },
          { prop: 'account_b', label: '考生2' },
          { prop: 'category', label: '相似类型',
            filters: [{ text: '选项相似', value: 'choice' }, { text: '内容相似', value: 'content' }],
            columnKey: 'filterTag',
            filterPlacement: 'bottom-end'
          },
          { prop: 'similarity', label: '相似度', sortable: 'custom' },
          { label: '得分',
            render: (scope) => {
              return (
                <div>{`${scope.row.account_a_score}/${scope.row.account_b_score}`}</div>
              )
            }
          },
          { label: '操作',
            width: 200,
            render: (scope) => {
              return (
                <div>
                  <el-button
                    type='text'
                    onclick={() => {
                      this.$emit('handleChangeView',
                        {
                          user_a_id: scope.row.account_a_id,
                          user_b_id: scope.row.account_b_id
                        }
                      )
                    }}
                  >
                    试卷对比
                  </el-button>
                  <el-button
                    type='text'
                    disabled={this.publishStatus}
                    onclick={() => {
                      this.judgeDislogVisible = true
                    }}
                  >
                    处罚
                  </el-button>
                </div>
              )
            }
          }
        ]
      },
      org_id: '',
      orgs: [],
      accounts: [],
      loading: false,
      search_info: {},
      total: 0,
      page: 1,
      limit: 10
    }
  },
  watch: {
    'model.cancel_grades'(val) {
      if (val) {
        this.model.points_deducted = 0
      }
    }
  },
  mounted() {
    const destroyedHooks = this._events?.['hook:destroyed']
    destroyedHooks.push(vmSocket.on('similarity', data => {
      if (data === 0) {
        this.getRecords()
      } else {
        this.loading = true
      }
    }))

    this.getRecords()
    this.getOrgs()
  },
  methods: {
    getRecords() {
      this.loading = true
      examViolationSimilarity({
        page_info: { page_num: this.page, page_size: this.limit },
        search_info: { ...this.search_info, exam_id: this.examId }
      }).then(({ data }) => {
        this.records = data.data
        this.total = data.total
        if (data.notice) {
          this.$message.warning(data.notice)
          return
        }
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    getOrgs() {
      getOrgs().then(({ data }) => {
        this.orgs = data?.data?.reduce((acc, item) => {
          if (item.type === 2) {
            acc.push(...item.org_ls)
          }
          return acc
        }, [])
      })
    },
    filterTag(value, row) {
      return row.category === value
    },
    changeOrgs() {
      this.model.account_id = ''
      this.getUserList()
    },
    // 初始化表单数据
    initModel() {
      this.org_id = ''
      this.model = {
        account_id: '',
        cancel_grades: null,
        points_deducted: '',
        description: ''
      }
    },
    getUserList() {
      examViolationStudent({
        search_info: { exam_id: this.examId, org_id: this.org_id }
      }).then((res) => {
        if (res.data) {
          this.accounts = res.data.data
        }
      })
    },
    closeDialog() {
      this.initModel()
    },
    submit() {
      examViolationAdd({
        data: { exam_id: this.examId, ...this.model }
      }).then(() => {
        this.judgeDislogVisible = false
      })
    },
    similaritySort(column) {
      console.log(column)
      if (column.prop === 'similarity') {
        if (column.order === 'ascending') { // 递增
          this.search_info.order = ['quantity']
        } else if (column.order === 'descending') { // 递减
          this.search_info.order = ['-quantity']
        } else {
          delete this.search_info.order
        }
        this.page = this.$options.data().page
        this.limit = this.$options.data().limit
        this.getRecords()
      }
    },
    similarityFilter(filters) {
      if (filters.filterTag.length && filters.filterTag.length === 1) {
        this.search_info.category = filters.filterTag[0]
      } else {
        delete this.search_info.category
      }
      this.page = this.$options.data().page
      this.limit = this.$options.data().limit
      this.getRecords()
    },
    pageChange({ page, limit }) {
      this.page = page
      this.limit = limit
      this.getRecords()
    }
  }
}
</script>
<style lang="scss" scoped>
.inline {
  display: flex;
}
::v-deep {
  .el-input-number .el-input-number__increase,
  .el-input-number .el-input-number__decrease {
    line-height: 32px;
  }
}
</style>
