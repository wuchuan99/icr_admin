<template>
  <div class="app-container">
    <div class="operation-box">
      <div class="search-buttons">
        <div class="search-buttons-left">
          <el-button
            class="search-buttons-item"
            type="primary"
            size="medium"
            icon="iconfont icon-tianjia search_icon"
            @click="initModel(), (showDialog = true), (isEdit = false)"
          >
            新增
          </el-button>
          <!-- <el-button
            class="search-buttons-item"
            type="danger"
            size="medium"
            icon="iconfont icon-shanchu search_icon"
            :disabled="!selection.length"
            @click="deleteBatch"
          > 刪除
          </el-button> -->
        </div>
      </div>
      <div class="query-conditions">
        <el-input
          v-model="query.name"
          class="search"
          placeholder="请输入内容"
          @keyup.enter.native="getRecords()"
        >
          <i slot="suffix" class="el-input__icon iconfont icon-sousuo" @click="getRecords" />
        </el-input>
        <!-- <el-button
          class="search-buttons-item"
          type="primary"
          size="medium"
          icon="iconfont icon-sousuo search_icon"
          @click="getRecords()"
        >
          搜索
        </el-button> -->
      </div>
    </div>
    <icr-table
      ref="table"
      class="fixed_table"
      :data="records"
      :loading="loading"
      :columns="table.columns"
      :options="table.options"
    />
    <pagination
      :total.sync="total"
      :page.sync="page"
      :limit.sync="limit"
    />
    <el-dialog
      :visible.sync="showDialog"
      :title="(isEdit ? '编辑' : '新增') + '方向'"
    >
      <icr-form
        :model="model"
        :rules="rules"
        :fields="modelFormFields"
        @cancel="showDialog = false"
        @confirm="submit"
        @submit.native.prevent
      />
    </el-dialog>
    <icr-confirm-delete
      ref="confirmDelete"
      :title="title"
      desc="您即将删除课程方向，删除操作同时会清除与之关联的课程方向字段，确定删除？"
    />
  </div>
</template>
<script>
import { cloneDeep } from 'lodash-es'
import { reactive } from '@vue/composition-api'
import IcrTable from '@/components/table'
import IcrForm from '@/components/form'
import Pagination from '@/components/Pagination'
import IcrConfirmDelete from '@/components/confirm-delete.vue'
import { usePagination, useTableSelection } from '@/hooks'
import { required } from '@/utils/validate-helper'
import {
  directionPaging,
  directionDel,
  directionAdd,
  directionUpdate
} from '@/api/course'
export default {
  name: 'Direction',
  components: { Pagination, IcrTable, IcrForm, IcrConfirmDelete },
  setup() {
    const query = reactive({ name: '' })
    const { selection } = useTableSelection()
    return {
      query,
      selection,
      ...usePagination(directionPaging, query)
    }
  },
  data() {
    return {
      table: {
        columns: [
          {
            type: 'selection'
          },
          {
            prop: 'name',
            label: '方向名称'
          },
          {
            label: '创建时间',
            render: (scope) => {
              return <div>{scope.row.create_time}</div>
            }
          },
          {
            label: '修改时间',
            render: (scope) => {
              return <div>{scope.row.update_time}</div>
            }
          },
          {
            label: '操作',
            width: 250,
            fixed: 'right',
            render: (scope) => {
              return (
                // <div>
                //   <el-tooltip content='编辑' placement='top'>
                //     <i class='iconfont icon-bianji tables_icon' onclick={() => {
                //       this.edit(scope.row)
                //     }} />
                //   </el-tooltip>
                //   <el-tooltip content='删除' placement='top'>
                //     <i class='iconfont icon-shanchu tables_icon' onclick={() => {
                //       this.delete(scope)
                //     }} />
                //   </el-tooltip>
                // </div>
                <div>
                  <el-button type='text' onclick={() => { this.edit(scope.row) }}>编辑</el-button>
                  <el-button type='text' onclick={() => { this.delete(scope) }}>删除</el-button>
                </div>
              )
            }
          }
        ],
        options: {
          stripe: true
        }
      },
      showDialog: false,
      model: {
        name: ''
      },
      modelFormFields: [
        {
          label: '方向名称',
          type: 'input',
          prop: 'name'
        }
      ],
      rules: {
        name: [
          required('方向名称'),
          { min: 0, max: 100, message: '长度在100个字符以内', trigger: 'blur' }
        ]
      },
      isEdit: false, // 新增编辑
      title: '删除方向'
    }
  },
  computed: {
    $table() {
      return this.$refs.table
    }
  },
  mounted() {
    this.initModel()
    this.getRecords()
  },
  methods: {
    initModel() {
      this.model = {
        name: ''
      }
    },
    edit(row) {
      this.isEdit = true
      const rowMsg = cloneDeep(row)
      this.model = {
        id: rowMsg.id,
        name: rowMsg.name
      }
      this.showDialog = true
    },
    submit() {
      this.model.id ? this.update() : this.create()
    },
    create() {
      directionAdd({
        data: this.model
      }).then((res) => {
        this.showDialog = false
        this.getRecords()
      })
    },
    update() {
      directionUpdate({
        data: this.model
      }).then((res) => {
        this.showDialog = false
        this.getRecords()
      })
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
        directionDel({
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
