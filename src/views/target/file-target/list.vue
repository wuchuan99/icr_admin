<template>
  <div class="app-container">
    <div class="operation-box">
      <div class="operation">
        <el-button
          class="filter-item"
          type="primary"
          size="medium"
          icon="el-icon-circle-plus-outline"
          @click="openDialog()"
        >新增</el-button>
      </div>
      <div class="query-conditions">
        <div class="query-conditions__item search">
          <!-- <span class="label">技巧分类 : </span> -->
          <el-select v-model="query.category" placeholder="技巧分类" clearable size="medium" @change="getRecords">
            <el-option
              v-for="item in CategorysOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
        <div class="search">
          <el-input
            v-model="query.name"
            placeholder="请输入内容"
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
    </div>
    <icr-table ref="table" class="fixed_table" :loading="loading" :columns="table.columns" :data="records" />

    <pagination :total.sync="total" :page.sync="page" :limit.sync="limit" />
    <el-dialog :visible.sync="showFormDialog" :title="(model.id ? '编辑' : '新增') + '文件靶标'">
      <icr-form
        ref="form"
        :model="model"
        :rules="formRules"
        :fields="formFields"
        class="question-form"
        @cancel="showFormDialog = false"
        @confirm="submit"
      >
        <el-form-item label="靶标文件" prop="file">
          <!-- large files should use slice chunk https://github.com/ElemeFE/element/issues/21309 -->
          <FileUploader v-model='model.file' type="slice-chunk" :data="{ file_type: 'all' }" />
        </el-form-item>
        <el-form-item label="解析过程" prop="writeup">
          <FileUploader v-model='model.writeup' :data="{ file_type: 'manual' }" accept=".pdf" />
        </el-form-item>
        <el-form-item
          v-if="model.judgment !== ManualJudgment"
          label="Flag值"
          prop="flag"
        >
          <el-input v-model="model.flag" />
        </el-form-item>
        <el-form-item label="靶标描述" prop="desc">
          <el-input v-model="model.desc" type="textarea" :autosize="{ minRows: 6 }" />
        </el-form-item>
      </icr-form>
    </el-dialog>
    <icr-confirm-delete ref="confirmDelete" title="删除文件靶标" desc="您即将删除该文件靶标, 确定删除?" />
  </div>
</template>

<script>
import IcrTable from '@/components/table'
import IcrForm from '@/components/form'
import IcrConfirmDelete from '@/components/confirm-delete.vue'
import Pagination from '@/components/Pagination'
import { usePagination, useTableSelection } from '@/hooks'
import {
  filetargetPaging,
  filetargetAdd,
  filetargetUpdate,
  filetargetDel
} from '@/api/target'
import { cloneDeep } from 'lodash-es'
import { reactive } from '@vue/composition-api'
import { mapGetters } from 'vuex'
import { Categorys, Judgments, ManualJudgment } from '@/const/resource'
import FileUploader from '@/views/common/upload/file-uploader.vue'
import { mapToSelectionOptions } from '@/utils/'
import { required } from '@/utils/validate-helper'

export default {
  components: {
    IcrTable,
    IcrForm,
    IcrConfirmDelete,
    Pagination,
    FileUploader
  },
  setup() {
    const query = reactive({
      name: null
    })

    const { selection } = useTableSelection()
    return {
      query,
      selection,
      ...usePagination(filetargetPaging, query)
    }
  },
  data() {
    return {
      ManualJudgment,
      model: {
        name: '', // 靶标名称
        judgment: null, // 判定方式
        category: null, // 技巧分类
        file: '', // 靶标文件
        desc: '', // 课程详情
        writeup: '', // 解析过程
        flag: '' // flag 值
      },
      formFields: [
        {
          label: '靶标名称',
          type: 'input',
          prop: 'name'
        },
        {
          label: '技巧分类',
          type: 'select',
          prop: 'category',
          options: mapToSelectionOptions(Categorys)
        },
        {
          label: '判定方式',
          type: 'select',
          prop: 'judgment',
          options: mapToSelectionOptions(Judgments)
        }
      ],
      formRules: {
        name: required('靶标名称'),
        category: required('技巧分类'),
        judgment: required('判定'),
        file: required('靶标文件'),
        writeup: required('解析过程'),
        flag: required('flag')
      },
      showFormDialog: false,
      table: {
        columns: [
          { type: 'selection' },
          { prop: 'name', label: '靶标名称' },
          { prop: 'category', label: '技巧分类' },
          { prop: 'judgment', label: '判定方式' },
          { label: '靶标文件', render: (scope) => {
            return (
              <div>{ scope.row.file.split('/').pop().replace(/_[^_\.]+(\.\w+)?$/, '$1') }</div>
            )
          } },
          { prop: 'desc', label: '靶标描述' },
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
    CategorysOptions() {
      return mapToSelectionOptions(Categorys)
    },
    JudgmentsOptions() {
      return mapToSelectionOptions(Judgments)
    },
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
        judgment: null,
        category: null,
        file: '',
        desc: '',
        writeup: '',
        flag: ''
      }
    },
    serializeModel(data) {
      const model = cloneDeep(data)
      model.file = model.file?.url ? model.file.url : model.file
      model.writeup = model.writeup?.url ? model.writeup.url : model.writeup

      function getMapKeyByValue(m, v) {
        for (const [k, val] of m.entries()) {
          if (val === v) {
            return k
          }
        }
      }
      if (typeof model.category !== 'number') {
        model.category = getMapKeyByValue(Categorys, model.category)
      }
      if (typeof model.judgment !== 'number') {
        model.judgment = getMapKeyByValue(Judgments, model.judgment)
      }

      return model
    },
    submit() {
      this.model.id ? this.update() : this.create()
    },
    create() {
      filetargetAdd({
        data: this.postModel
      }).then(() => {
        this.showFormDialog = false
        this.getRecords()
      })
    },
    update() {
      filetargetUpdate({
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
        filetargetDel({
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

<style lang="scss" scoped>
.question-form {
  .options {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}
::v-deep {
  .el-form-item:nth-child(-n+2) {
    display: inline-block;
  }
  .el-form-item:nth-child(1) {
    margin-right: 70px;
  }
}
</style>
