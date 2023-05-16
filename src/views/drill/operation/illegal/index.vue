<template>
  <div>
    <div class="operation-box">
      <div class="operation">
        <el-button
          class="filter-item"
          type="primary"
          size="medium"
          icon="el-icon-circle-plus-outline"
          :disabled="publishStatus"
          @click="judgeDislogVisible = true"
        >添加处罚</el-button>
      </div>
    </div>
    <icr-table ref="table" class="fixed_table" :columns="table.columns" :data="records" :loading="loading" />
    <!-- pagination -->
    <pagination :total.sync="total" :page.sync="page" :limit.sync="limit" />
    <el-dialog
      :title="(model.id ? '编辑' : '添加') + '处罚'"
      :visible.sync="judgeDislogVisible"
      @close="closeDialog"
    >
      <icr-form
        ref="form"
        :model="model"
        class="question-form"
        :rules="formRules"
        @cancel="judgeDislogVisible = false"
        @confirm="submit"
      >
        <el-form-item v-if="[1, 2, 3].includes(mode)" label="组织" prop="org_id">
          <el-select
            v-model="model.org_id"
            :disabled="!!model.id"
            @change="changeOrgs"
          >
            <el-option
              v-for="item in orgs"
              :key="item.org_id"
              :label="item.name"
              :value="item.org_id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="选手姓名" prop="account_id">
          <el-select v-model="model.account_id" :disabled="!!model.id">
            <el-option
              v-for="item in accounts"
              :key="item.account_id"
              :label="item.real_name"
              :value="item.account_id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="处罚方式" prop="punish_type">
          <el-radio-group v-model="model.punish_type">
            <el-radio :label="0">警告</el-radio>
            <el-radio :label="1">取消演练资格</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="违规描述" prop="desc">
          <el-input v-model="model.desc" type="textarea" :autosize="{ minRows: 6 }" />
        </el-form-item>
      </icr-form>
    </el-dialog>
    <!-- 删除弹框 -->
    <icr-confirm-delete
      ref="confirmDelete"
      title="删除处罚"
      desc="您即将删除该处罚, 确定删除?"
    />
  </div>
</template>

<script>
import IcrTable from '@/components/table'
import IcrForm from '@/components/form'
import {
  drillFoulPaging,
  drillFoulAdd,
  drillFoulUpdate,
  drillFoulDelete,
  drillUserPaging,
  drillOrgPaging
} from '@/api/drill'
import { getlist } from '@/api/account'
import IcrConfirmDelete from '@/components/confirm-delete.vue'
import { required } from '@/utils/validate-helper'
import { reactive } from '@vue/composition-api'
import Pagination from '@/components/Pagination'
import { usePagination } from '@/hooks'

const punishTypeMap = {
  0: '警告',
  1: '取消演练资格'
}
export default {
  components: { IcrTable, IcrForm, IcrConfirmDelete, Pagination },
  inject: ['drillId', 'mode'],
  props: {
    publishStatus: {
      type: Boolean,
      default: false
    }
  },
  setup() {
    const query = reactive({ drill_id: '' })
    return {
      query,
      ...usePagination(drillFoulPaging, query)
    }
  },
  data() {
    return {
      judgeDislogVisible: false,
      violationList: [],
      model: {
        org_id: '',
        account_id: '',
        punish_type: null,
        desc: ''
      },
      formRules: {
        org_id: required('组织'),
        account_id: required('姓名'),
        punish_type: required('处罚方式')
      },
      table: {
        columns: [
          { prop: 'name', label: '选手姓名' },
          { prop: 'org', label: '所在组织' },
          {
            prop: 'punish_type',
            label: '处罚方式',
            render: (scope) => {
              return (
                <div>{punishTypeMap[scope.row.punish_type]}</div>
              )
            }
          },
          { prop: 'desc', label: '违规描述' },
          // { label: '是否公布',
          //   render: (scope) => {
          //     return (
          //       <div>
          //         <el-switch
          //           active-value={ 0 }
          //           inactive-value={ 1 }
          //           value={scope.row.publish_status}
          //           oninput={ (val) => { this.drillFoulEnable(scope, val) }}
          //           disabled={ this.publishStatus }
          //           style='margin-right: 8px;'
          //         />
          //         {scope.row.publish_status === 0 ? '公布' : '不公布'}
          //       </div>
          //     )
          //   }
          // },
          { label: '操作',
            width: 150,
            fixed: 'right',
            render: (scope) => {
              return (
                <div>
                  <el-button
                    type='text'
                    onclick={() => {
                      this.edit(scope.row)
                    }}
                    disabled={ this.publishStatus }
                  >
                    编辑
                  </el-button>
                  <el-button
                    type='text'
                    onclick={() => {
                      this.delete(scope)
                    }}
                    disabled={ this.publishStatus }
                  >
                    删除
                  </el-button>
                </div>
              )
            }
          }
        ]
      },
      orgs: [],
      accounts: []
      // loading: false
    }
  },
  mounted() {
    // this.getViolationList()
    if (this.mode === 0) {
      this.getPersonnelList()
    } else {
      this.getOrgs()
    }
    if (!this.drillId) return
    this.query.drill_id = this.drillId
    this.getRecords()
  },
  methods: {
    getViolationList() {
      if (!this.drillId) return
      return new Promise((resolve, reject) => {
        this.loading = true
        drillFoulPaging({
          page_info: { page_num: 1, page_size: 10000 },
          search_info: { drill_id: this.drillId }
        })
          .then((res) => {
            if (res.data) {
              this.violationList = res.data.data || []
            }
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
    getPersonnelList() {
      drillUserPaging({
        page_info: { page_num: 1, page_size: 10000 },
        search_info: { drill_id: this.drillId, color: 0 }
      }).then((res) => {
        if (res.data) {
          this.accounts = res.data?.data || []
        }
      })
    },
    getOrgs() {
      drillOrgPaging({
        page_info: { page_num: 1, page_size: 10000 },
        search_info: { drill_id: this.drillId }
      }).then(({ data }) => {
        this.orgs = data?.data || []
      })
    },
    changeOrgs() {
      this.model.account_id = ''
      this.getUserList()
    },
    getUserList() {
      getlist({
        page_info: { page_num: 1, page_size: 10000 },
        search_info: { org_id: this.model.org_id }
      }).then(({ data }) => {
        if (data?.data?.length) {
          data?.data?.forEach(item => {
            item.account_id = item.id
          })
        }
        this.accounts = data?.data || []
      })
    },
    // 初始化表单数据
    initModel() {
      this.model = {
        org_id: '',
        account_id: '',
        punish_type: null,
        desc: ''
      }
      if ([1, 2].includes(this.mode)) {
        this.accounts = []
      }
    },
    closeDialog() {
      this.initModel()
    },
    submit() {
      this.model.id ? this.update() : this.create()
    },
    create() {
      drillFoulAdd({
        data: { drill_id: this.drillId, ...this.model, publish_status: 1 }
      }).then(() => {
        this.judgeDislogVisible = false
        this.getRecords()
      })
    },
    update() {
      const { id, punish_type, desc } = this.model
      drillFoulUpdate({
        data: { drill_id: this.drillId, id, punish_type, desc }
      }).then(() => {
        this.judgeDislogVisible = false
        this.getRecords()
      })
    },
    edit(scope) {
      const { id, punish_type, desc, name, org } = scope
      this.model = {
        id,
        punish_type,
        desc,
        org_id: org,
        account_id: name
      }
      this.judgeDislogVisible = true
    },
    // 单项删除
    delete(scope) {
      this._delete([scope.row.id])
    },
    // 删除项目
    _delete(ids) {
      this.$refs.confirmDelete.prompt().then(() => {
        drillFoulDelete({
          data: {
            type: 1,
            ids: ids
          }
        }).then(() => {
          this.getRecords()
        })
      })
    },
    drillFoulEnable(scope, val) {
      drillFoulUpdate({
        data: {
          drill_id: this.drillId,
          id: scope.row.id,
          publish_status: val
        }
      }).then(() => {
        this.getRecords()
      })
    }
  }
}
</script>
