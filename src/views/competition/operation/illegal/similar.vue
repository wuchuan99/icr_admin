<template>
  <div>
    <icr-table ref="table" :columns="table.columns" :data="records" :loading="loading" />
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
                :key="item.id"
                :label="item.username"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </div>
        <el-form-item label="处罚">
          <el-radio v-model="model.cancel_grades" :label="false">扣分</el-radio>
          <div>
            <el-input-number v-model="model.points_deducted" size="small" :min="0" />
          </div>
          <el-radio v-model="model.cancel_grades" :label="true">取消考试成绩</el-radio>
        </el-form-item>
        <el-form-item label="违规描述">
          <el-input v-model="model.description" type="textarea" :autosize="{ minRows: 6 }" />
        </el-form-item>
      </icr-form>
    </el-dialog>
  </div>
</template>

<script>
import IcrTable from '@/components/table'
import IcrForm from '@/components/form'
import { accountPaging, getorg as getOrgs } from '@/api/account'
import { examViolationAdd, examViolationSimilarity } from '@/api/exam'

export default {
  components: { IcrTable, IcrForm },
  inject: ['examId'],
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
            filters: [{ text: '选项相似', value: '选项相似' }, { text: '内容相似', value: '内容相似' }],
            filterMethod: this.filterTag,
            filterPlacement: 'bottom-end'
          },
          { prop: 'similarity', label: '相似度', sortable: true, sortMethod: this.similaritySort },
          { label: '得分', sortable: true, sortMethod: this.scoreSort,
            render: (scope) => {
              return (
                <div>{`${scope.row.account_a_score}/${scope.row.account_b_score}`}</div>
              )
            }
          },
          { label: '操作',
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
      loading: false
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
    this.getSimilarity()
    this.getOrgs()
  },
  methods: {
    getSimilarity() {
      this.loading = true
      examViolationSimilarity({
        data: { exam_id: this.examId }
      }).then(({ data }) => {
        this.records = data.data
      }).finally(() => {
        this.loading = false
      })
    },
    getOrgs() {
      getOrgs().then(({ data }) => {
        this.orgs = data?.data
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
      accountPaging({
        search_info: { org_id: this.org_id, info: '' },
        page_info: { page_num: 1, page_size: 9999 }
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
        this.getViolationList()
      })
    },
    similaritySort(obj1, obj2) {
      const val1 = obj1.similarity.substring(0, obj1.similarity.length - 1)
      const val2 = obj2.similarity.substr(0, obj2.similarity.length - 1)
      return val1 - val2
    },
    scoreSort(obj1, obj2) {
      const val1 = obj1.account_a_score
      const val2 = obj1.account_b_score
      const val3 = obj2.account_a_score
      const val4 = obj2.account_b_score
      if (val1 !== val3) {
        return val1 - val3
      } else {
        return val2 - val4
      }
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
