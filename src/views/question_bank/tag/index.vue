<template>
  <div class="app-container">
    <div class="filter-container">
      <div class="operation">
        <el-button class="filter-item" type="primary" @click="initModel(), showDialog = true">新增</el-button>
        <el-button class="filter-item" type="danger" :disabled="!selection.length" @click="deleteBatch">刪除</el-button>
      </div>
      <div class="query-conditions">
        <el-input v-model="query.name" placeholder="请输入内容" style="width: 55%; margin-right: 20px" class="search" />
        <el-button class="filter-item" icon="el-icon-search" type="primary" @click="getRecords()">搜索</el-button>
      </div>
    </div>
    <icr-table ref="table" :loading="loading" :data="records" :columns="table.columns" :options="table.options" />

    <pagination :total.sync="total" :page.sync="page" :limit.sync="limit" />

    <el-dialog :visible.sync="showDialog" width="400px" :title="(model.id ? '编辑' : '新增') + '标签'">
      <icr-form
        :model="model"
        :fields="modelFormFields"
        class="question-form"
        @cancel="showDialog = false"
        @confirm="submit"
      />
    </el-dialog>
  </div>
</template>

<script>
import IcrTable from '@/components/table'
import IcrForm from '@/components/form'
import Pagination from '@/components/Pagination'
import { usePagination, useTableSelection } from '@/hooks'
import { tagPaging, tagAdd, tagUpdate, tagDel } from '@/api/question'
import { cloneDeep } from 'lodash-es'
import { reactive } from '@vue/composition-api'

const JUDGE = 0
const SINGLE = 1
const MULTI = 2

export default {
  components: {
    IcrTable,
    IcrForm,
    Pagination
  },
  setup() {
    const query = reactive({
      name: ''
    })

    const { selection } = useTableSelection()

    return {
      query,
      ...usePagination(tagPaging, query),
      selection
    }
  },
  data() {
    return {
      model: {
        name: ''
      },
      types: {
        judge: JUDGE,
        single: SINGLE,
        multi: MULTI
      },
      modelFormFields: [
        {
          label: '标签名称',
          type: 'input',
          prop: 'name',
          itemOption: { required: true }
        }
      ],
      showDialog: false,
      table: {
        options: {
          stripe: true
        },
        columns: [
          { type: 'selection' },
          { prop: 'id', label: 'ID' },
          { prop: 'name', label: '名称' },
          { prop: 'create_time', label: '创建时间' },
          { prop: 'update_time', label: '更新时间' },
          {
            label: '操作',
            render: (scope) => {
              return (
                <div>
                  <el-tooltip content='编辑' placement='top'>
                    <i
                      class='el-icon-edit'
                      onclick={() => {
                        this.edit(scope)
                      }}
                    ></i>
                  </el-tooltip>
                  <el-tooltip content='删除' placement='top'>
                    <i
                      class='el-icon-delete'
                      onclick={() => {
                        this.delete(scope)
                      }}
                    ></i>
                  </el-tooltip>
                </div>
              )
            }
          }
        ]
      }
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
    submit() {
      this.model.id ? this.update() : this.create()
    },
    create() {
      tagAdd({
        data: this.model
      }).then(() => {
        this.showDialog = false
        this.getRecords()
      })
    },
    update() {
      tagUpdate({
        data: this.model
      }).then(() => {
        this.showDialog = false
        this.getRecords()
      })
    },
    edit(scope) {
      this.model = cloneDeep(scope.row)
      this.showDialog = true
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
      tagDel({
        data: {
          type: 1,
          ids: ids
        }
      }).then(() => {
        this.getRecords()
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.question-form {
  .options {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}
</style>
