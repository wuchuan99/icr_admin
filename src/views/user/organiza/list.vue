<template>
  <div class="app-container">
    <div class="operation-box">
      <div class="operation" style="margin-bottom: 20px">
        <el-button
          class="filter-item"
          type="primary"
          size="medium"
          icon="el-icon-circle-plus-outline"
          @click="openDialog()"
        >新增</el-button>
      </div>
      <div class="query-conditions">
        <el-input
          v-model="query.name"
          placeholder="请输入内容"
          class="search"
          size="medium"
          @keyup.enter.native="getRecords"
        >
          <i slot="suffix" class="el-input__icon iconfont icon-sousuo" @click="getRecords" />
        </el-input>
        <!-- <el-button
          class="filter-item"
          icon="el-icon-search"
          type="primary"
          size="medium"
          @click="getRecords"
        >搜索</el-button> -->
      </div>
    </div>

    <icr-table ref="table" class="fixed_table" :loading="loading" :columns="table.columns" :data="records" />

    <pagination :total.sync="total" :page.sync="page" :limit.sync="limit" />
    <el-dialog :visible.sync="showFormDialog" :title="(model.id ? '编辑' : '新增') + '组织'">
      <icr-form
        ref="form"
        :model="model"
        :rules="formRules"
        :fields="formFields"
        class="question-form"
        @cancel="showFormDialog = false"
        @confirm="submit"
      />
    </el-dialog>
    <icr-confirm-delete ref="confirmDelete" title="删除组织" desc="您即将删除该组织, 确定删除?" />
  </div>
</template>

<script>
import IcrTable from '@/components/table'
import IcrForm from '@/components/form'
import IcrConfirmDelete from '@/components/confirm-delete.vue'
import Pagination from '@/components/Pagination'
import { usePagination, useTableSelection } from '@/hooks'
import {
  orgPaging,
  orgAdd,
  orgUpdate,
  orgDel
} from '@/api/organiza'
import { cloneDeep } from 'lodash-es'
import { reactive } from '@vue/composition-api'
import { mapGetters } from 'vuex'
import { mapToSelectionOptions } from '@/utils/'
import { OrgTypes } from '@/const/org'
import { normalizeTime } from '@/utils'

export default {
  components: {
    IcrTable,
    IcrForm,
    IcrConfirmDelete,
    Pagination
  },
  setup() {
    const query = reactive({
      name: null
    })

    const { selection } = useTableSelection()
    return {
      query,
      selection,
      ...usePagination(orgPaging, query)
    }
  },
  data() {
    return {
      model: {
        name: '',
        type: ''
      },
      formFields: [
        {
          label: '组织名称',
          type: 'input',
          prop: 'name'
        },
        {
          label: '组织类型',
          type: 'select',
          prop: 'type',
          options: mapToSelectionOptions(OrgTypes)
        }
      ],
      formRules: {
        name: [
          { required: true, message: '名称不能为空', trigger: 'blur' }
        ],
        type: [
          { required: true, message: '组织不能为空', trigger: 'blur' }
        ]
      },
      showFormDialog: false,
      table: {
        columns: [
          { type: 'selection' },
          { prop: 'name', label: '组织名称' },
          { label: '组织类型', render: (scope) => {
            return (<div>{ OrgTypes.get(scope.row.type) }</div>)
          } },
          { label: '创建时间', render: (scope) => {
            return (<div>{ normalizeTime(scope.row.create_time) }</div>)
          } },
          { label: '修改时间', render: (scope) => {
            return (<div>{ normalizeTime(scope.row.update_time) }</div>)
          } },
          {
            label: '操作',
            width: 150,
            fixed: 'right',
            render: (scope) => {
              return (
                // <div>
                //   <el-tooltip content='编辑' placement='top'>
                //     <i
                //       class='el-icon-edit'
                //       onclick={() => {
                //         this.edit(scope)
                //       }}
                //     ></i>
                //   </el-tooltip>
                //   <el-tooltip content='删除' placement='top'>
                //     <i
                //       class='el-icon-delete'
                //       onclick={() => {
                //         this.delete(scope)
                //       }}
                //     ></i>
                //   </el-tooltip>
                // </div>
                <div>
                  <el-button type='text' onclick={() => { this.edit(scope) }}>编辑</el-button>
                  <el-button type='text' onclick={() => { this.delete(scope) }}>删除</el-button>
                </div>
              )
            }
          }
        ]
      }
    }
  },
  computed: {
    ...mapGetters(['token']),
    postModel() {
      return this.serializeModel(this.model)
    }
  },
  mounted() {
    this.initModel()
    this.getRecords()
  },
  methods: {
    openDialog() {
      this.initModel()
      this.showFormDialog = true
    },
    initModel() {
      this.model = {
        name: '',
        type: ''
      }
    },
    serializeModel(data) {
      const model = cloneDeep(data)
      return model
    },
    submit() {
      this.model.id ? this.update() : this.create()
    },
    create() {
      orgAdd({
        data: this.postModel
      }).then(() => {
        this.showFormDialog = false
        this.getRecords()
      })
    },
    update() {
      orgUpdate({
        data: this.postModel
      }).then(() => {
        this.showFormDialog = false
        this.getRecords()
      })
    },
    edit(scope) {
      this.model = this.serializeModel(scope.row)
      this.showFormDialog = true
    },
    delete(scope) {
      this._delete([scope.row.id])
    },
    deleteBatch() {
      const ids = this.$refs.table.getSelection().reduce((acc, val) => {
        acc.push(val.id)
        return acc
      }, [])
      this._delete(ids)
    },
    _delete(ids) {
      this.$refs.confirmDelete.prompt().then(() => {
        orgDel({
          data: {
            type: 1,
            ids: ids
          }
        }).then(() => {
          this.getRecords()
        })
      })
    }
  }
}
</script>
