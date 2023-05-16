<template>
  <div>
    <div class="operation" style="margin-bottom: 10px;">
      <el-button
        class="filter-item"
        type="primary"
        size="medium"
        icon="el-icon-circle-plus-outline"
        @click="openDialog()"
      >新增</el-button>
      <!-- <el-button
        class="filter-item"
        :disabled="!selection.length"
        type="danger"
        size="medium"
        icon="el-icon-delete"
        @click="deleteBatch"
      >刪除</el-button> -->
    </div>
    <icr-table ref="table" class="fixed_table" :loading="loading" :columns="table.columns" :data="records" />
    <!-- pagination -->
    <pagination :total.sync="total" :page.sync="page" :limit.sync="limit" />
    <el-dialog :visible.sync="showFormDialog" :title="(model.id ? '编辑' : '新增') + '规则'">
      <icr-form
        ref="form"
        :model="model"
        :rules="formRules"
        :fields="formFields"
        class="question-form"
        @cancel="showFormDialog = false"
        @confirm="submit"
      >
        <el-form-item label="解析过程" prop="writeup">
          <FileUploader v-model="model.writeup" :data="{ file_type: 'manual' }" accept=".pdf" />
        </el-form-item>
        <el-form-item
          v-if="model.judgment !== ManualJudgment"
          label="Flag值"
          prop="flag"
        >
          <el-input v-model="model.flag" />
        </el-form-item>
        <el-form-item label="判定描述" prop="desc">
          <el-input v-model="model.desc" type="textarea" :autosize="{ minRows: 6 }" />
        </el-form-item>
      </icr-form>
    </el-dialog>
    <icr-confirm-delete ref="confirmDelete" title="删除规则" desc="您即将删除该规则, 确定删除?" />
  </div>
</template>

<script>
import { reactive } from '@vue/composition-api'
import { useTableSelection, usePagination } from '@/hooks'
import IcrTable from '@/components/table'
import IcrForm from '@/components/form'
import IcrConfirmDelete from '@/components/confirm-delete.vue'
import Pagination from '@/components/Pagination'
import {
  // alonetargetRuleList,
  alonetargetRuleAdd,
  alonetargetRuleUpdate,
  alonetargetRuleDel,
  alonetargetRulePaging
} from '@/api/target'
import { cloneDeep } from 'lodash-es'
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
    FileUploader,
    Pagination
  },
  props: {
    id: {
      type: Number,
      default: null
    }
  },
  setup() {
    const { selection } = useTableSelection()
    const query = reactive({ target_id: '' })
    return {
      query,
      selection,
      ...usePagination(alonetargetRulePaging, query)
    }
  },
  data() {
    return {
      ManualJudgment,
      file: '',
      model: {
        name: '', // 规则名称
        judgment: null, // 判定方式
        category: null, // 技巧分类
        desc: '', // 判定描述
        writeup: '', // 解析过程
        flag: '' // flag 值
      },
      // loading: false,
      // records: [],
      formFields: [
        {
          label: '规则名称',
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
        name: required('规则名称'),
        category: required('技巧分类'),
        judgment: required('判定方式'),
        writeup: required('解析过程'),
        flag: required('flag')
      },
      showFormDialog: false,
      table: {
        columns: [
          { type: 'selection' },
          { prop: 'name', label: '规则名称' },
          { prop: 'category', label: '技巧分类' },
          { prop: 'judgment', label: '判定方式' },
          { prop: 'desc', label: '判定描述' },
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
    if (!this.id) return
    this.query.target_id = this.id
    this.getRecords()
  },
  methods: {
    // getRecords() {
    //   if (!this.id) return
    //   return new Promise((resolve, reject) => {
    //     this.loading = true
    //     alonetargetRuleList({
    //       target_id: this.id
    //     }).then(res => {
    //       if (res.data) {
    //         this.records = res.data.data
    //       }
    //       resolve(res)
    //     }).catch((err) => {
    //       console.error(err)
    //       reject(err)
    //     }).finally(() => {
    //       this.loading = false
    //     })
    //   })
    // },
    openDialog() {
      this.initModel()
      this.showFormDialog = true
    },
    initModel() {
      this.model = {
        target_id: this.id,
        name: '',
        judgment: null,
        category: null,
        desc: '',
        writeup: '',
        flag: ''
      }
    },
    serializeModel(data) {
      const model = cloneDeep(data)
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
      alonetargetRuleAdd({
        data: this.postModel
      }).then(() => {
        this.showFormDialog = false
        this.getRecords()
      })
    },
    update() {
      alonetargetRuleUpdate({
        data: this.postModel
      }).then(() => {
        this.showFormDialog = false
        this.getRecords()
      })
    },
    edit(scope) {
      this.model = this.serializeModel(scope.row)
      this.model.target_id = this.id
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
        alonetargetRuleDel({
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
</style>
