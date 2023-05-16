<template>
  <div class="app-container">
    <div class="operation-box">
      <div class="operation">
        <el-button
          class="filter-item"
          type="primary"
          size="medium"
          icon="el-icon-circle-plus-outline"
          @click="initModel(), (showFormDialog = true)"
        >新增</el-button>
      </div>
      <div class="query-conditions">
        <div class="query-conditions__item search">
          <!-- <span class="label">标签选择 : </span> -->
          <el-select v-model="query.tag" clearable size="medium" placeholder="标签选择" @change="getRecords">
            <el-option
              v-for="item in tags"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </div>
        <div class="query-conditions__item search">
          <el-select v-model="query.target_classify" clearable size="medium" placeholder="靶标类型" @change="getRecords">
            <el-option
              v-for="item in typeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
        <div class="search">
          <el-input
            v-model="query.desc"
            placeholder="请输入内容"
            size="medium"
            @keyup.enter.native="getRecords"
          >
            <i slot="suffix" class="el-input__icon iconfont icon-sousuo" @click="getRecords" />
          </el-input>
        </div>
      </div>
    </div>
    <icr-table ref="table" class="fixed_table" :loading="loading" :columns="table.columns" :options="tableOptions" :data="records" />

    <pagination :total.sync="total" :page.sync="page" :limit.sync="limit" />

    <el-dialog :visible.sync="showFormDialog" :title="(model.id ? '编辑' : '新增') + '题目'">
      <icr-form
        refs="form"
        :model="model"
        :fields="modelFormFields"
        :rules="formRules"
        class="question-form"
        @cancel="showFormDialog = false"
        @confirm="submit"
      >
        <el-form-item label="题目标签" prop="tag" class="tags-wrapper">
          <div class="tags-input">
            <el-autocomplete
              ref="tagInput"
              v-model="inputTag"
              clearable
              autofocus
              :fetch-suggestions="tagSuggestions"
              @clear="tagInputClear"
            />
            <span class="addBtn" @click="addTag">添加</span>
          </div>
          <div class="tags">
            <el-tag v-for="tag in model.tag" :key="tag" class="tags-item" closable @close="removeTag(tag)">{{ tag }}</el-tag>
          </div>
        </el-form-item>

        <div style="display: flex; gap: 30px;">
          <el-form-item label="靶标类型" prop="target_classify">
            <el-select v-model="model.target_classify" size="medium" placeholder="">
              <el-option
                v-for="item in typeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>

          <div>
            <el-form-item label="选择靶标" prop="target_id">
              <el-select v-model="model.target_id" size="medium" placeholder="">
                <el-option
                  v-for="item in targetList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <div style="text-align: right;position: relative;top: -20px;">
              没有需要的靶标?<el-link class="resource-tip__link" @click="showFormDialog = false; showTipDialog = true">去添加靶标</el-link>
            </div>
          </div>

        </div>

        <el-form-item label="判定规则" prop="target_rule">
          <el-select v-model="model.target_rule" multiple size="medium" placeholder="">
            <el-option
              v-for="item in ruleList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label=''>
          <icr-table ref="ruleTable" :loading="loading" :columns="ruleTableColumns" :data="selectRules" />
        </el-form-item>
      </icr-form>
    </el-dialog>
    <el-dialog
      title='请选择要创建的靶标类型'
      :visible.sync="showTipDialog"
      width="350px"
      class="btn-dialog"
    >
      <div style='display: flex; justify-content: space-between;'>
        <router-link to='/targets/file-targets'>
          <el-button type="primary">文件靶标</el-button>
        </router-link>
        <router-link to='/targets/alone-targets'>
          <el-button type="primary">单机靶标</el-button>
        </router-link>
        <!-- <router-link to='/targets/scene-targets'>
          <el-button type="primary">场景靶标</el-button>
        </router-link> -->
      </div>
    </el-dialog>

    <icr-confirm-delete ref="confirmDelete" title="删除题目" desc="您即将删除题目, 删除题目的同时会从试卷内删除该题目, 确定删除" />
  </div>
</template>

<script>
import IcrTable from '@/components/table'
import IcrForm from '@/components/form'
import IcrConfirmDelete from '@/components/confirm-delete.vue'
import Pagination from '@/components/Pagination'
import { usePagination, useTableSelection, useCurd } from '@/hooks'
import {
  tagList,
  questionOperationAdd,
  questionDel,
  questionOperationUpdate,
  questionOperationPaging
} from '@/api/question'
import { filetargetList, filetargetRetrieve, alonetargetList, alonetargetRuleList } from '@/api/target'
import { scenetargetList, scenetargetRuleList } from '@/api/scene'
import { cloneDeep } from 'lodash-es'
import { reactive } from '@vue/composition-api'
import { mapGetters } from 'vuex'
import { required } from '@/utils/validate-helper'

const FileTargetType = 1
const AloneTargetType = 2
const SenceTargetType = 3

const typeMap = new Map([
  [FileTargetType, '文件靶标'],
  [AloneTargetType, '单机靶标']
  // [SenceTargetType, '场景靶标']
])

const typeOptions = Array.from(typeMap).map((v) => {
  return { label: v[1], value: v[0] }
})

export default {
  components: {
    IcrTable,
    IcrForm,
    IcrConfirmDelete,
    Pagination
  },
  setup() {
    const query = reactive({
      desc: ''
    })

    const { selection } = useTableSelection()

    return {
      query,
      selection,
      ...usePagination(questionOperationPaging, query),
      ...useCurd({ removeFn: questionDel })
    }
  },
  data() {
    return {
      showTipDialog: false,
      model: {
        target_classify: '',
        desc: '',
        tag: [],
        target_id: null,
        target_rule: []
      },
      inputTag: '',
      tags: [],
      targetList: [],
      ruleList: [],
      types: {
        file: FileTargetType,
        alone: AloneTargetType,
        sence: SenceTargetType
      },
      typeOptions,
      modelFormFields: [
        {
          label: '题目描述',
          type: 'input',
          prop: 'desc',
          inputOption: { type: 'textarea', autosize: { minRows: 4 }},
          itemOption: { required: true }
        }
      ],
      formRules: {
        category: [
          { required: true, message: '类型不能为空', trigger: 'blur' }
        ],
        desc: [
          { required: true, message: '描述不能为空', trigger: 'blur' }
        ],
        target_classify: [required('靶标类型')],
        target_id: [required('靶标')],
        target_rule: [required('靶标规则')]
      },
      showFormDialog: false,
      tableOptions: {
        stripe: true
      },
      table: {
        columns: [
          { type: 'selection' },
          { prop: 'desc', label: '题目描述' },
          {
            label: '靶标类型',
            render: (scope) => {
              return <div> {typeMap.get(scope.row.target_classify)}</div>
            }
          },
          { prop: 'target_name', label: '靶标名称' },
          {
            label: '题目标签',
            render: (scope) => {
              const { tag } = scope.row
              return <div> {tag.join(',')}</div>
            }
          },
          { label: '设为练习', width: '150', render: scope => {
            return (
              <div>
                <el-switch
                  value={ scope.row.status }
                  oninput={ (val) => {
                    const data = cloneDeep(scope.row)
                    data.status = val
                    questionOperationUpdate({
                      data
                    }).then(res => {
                      if (res.status === 0) {
                        scope.row.status = val
                      }
                    })
                  }}
                  active-value={1} inactive-value={0}
                  style='margin-right: 8px;'
                />
                { scope.row.status ? '是' : '否' }
              </div>
            )
          } },
          {
            label: '操作',
            width: 150,
            fixed: 'right',
            render: (scope) => {
              return (
                <div>
                  <el-button type='text' onclick={() => { this.edit(scope) }}>编辑</el-button>
                  <el-button type='text' onclick={() => { this.delete(scope) }}>删除</el-button>
                </div>
              )
            }
          }
        ]
      },
      ruleTableColumns: [
        { prop: 'name', label: '规则名称' },
        { prop: 'category', label: '技巧分类' },
        { prop: 'judgment', label: '判定方式' },
        { prop: 'desc', label: '判定描述' }
      ]
    }
  },
  computed: {
    ...mapGetters(['token']),
    $table() {
      return this.$refs.table
    },
    selectRules() {
      return this.ruleList.filter((rule) => {
        return this.model.target_rule.indexOf(rule.value) >= 0
      })
    },
    postModel() {
      const model = cloneDeep(this.model)
      return model
    }
  },
  watch: {
    'model.target_classify': {
      handler(newVal) {
        let fetchTargetFn
        switch (newVal) {
          case FileTargetType:
            fetchTargetFn = filetargetList
            break
          case AloneTargetType:
            fetchTargetFn = alonetargetList
            break
          case SenceTargetType:
            fetchTargetFn = scenetargetList
            break
        }
        fetchTargetFn().then(res => {
          if (res.status === 0) {
            this.targetList = res.data?.data?.map(item => {
              return {
                label: item.name,
                value: item.id
              }
            })
            const index = this.targetList.findIndex(item => item.value === this.model.target_id) || 0
            if (index < 0) {
              this.model.target_id = ''
            }
            this.onTargetChange(this.targetList[Math.max(index, 0)]?.value)
          }
        })
      }
    },
    'model.target_id': {
      handler(newVal) {
        this.onTargetChange(newVal)
      }
    }
  },
  created() {
    this.getTags()
  },
  mounted() {
    this.initModel()
    this.getRecords()
  },
  methods: {
    initModel() {
      this.inputTag = ''
      this.targetList = []
      this.ruleList = []
      this.model = {
        target_classify: '',
        desc: '',
        tag: [],
        target_id: null,
        target_rule: []
      }
    },
    onTargetChange(target_id) {
      if (!target_id) this.model.target_rule = []
      if (target_id) {
        let fetchRulesFn
        const targetType = this.model.target_classify
        switch (targetType) {
          case FileTargetType:
            fetchRulesFn = filetargetRetrieve
            break
          case AloneTargetType:
            fetchRulesFn = alonetargetRuleList
            break
          case SenceTargetType:
            fetchRulesFn = scenetargetRuleList
            break
        }

        let data
        if (targetType === FileTargetType || targetType === AloneTargetType) {
          data = { target_id: target_id }
        } else if (targetType === SenceTargetType) {
          data = { scene_id: target_id }
        }

        fetchRulesFn(data).then(res => {
          const fixLastTargetRule = () => {
            this.model.target_rule = this.model.target_rule?.filter(val => {
              return this.ruleList.some(rule => rule.value === val)
            })
          }

          // file target rule list
          if (targetType === FileTargetType) {
            const data = res.data?.data
            this.ruleList = [
              {
                ...data,
                label: data.name,
                value: data.id
              }
            ]

            // fix last model.target_rule
            fixLastTargetRule()
            return
          }

          this.ruleList = res.data?.data?.map(item => {
            return {
              ...item,
              label: item.name,
              value: item.id
            }
          })
          // fix last model.target_rule
          fixLastTargetRule()
        })
      }
    },
    getTags() {
      tagList().then((res) => {
        if (res.data) {
          this.tags = res.data.data.map((item) => {
            return Object.assign({}, item, {
              label: item.name,
              value: item.name
            })
          })
        }
      })
    },
    submit() {
      this.model.id ? this.update() : this.create()
    },
    create() {
      questionOperationAdd({
        data: this.postModel
      }).then(() => {
        this.showFormDialog = false
        this.getRecords()
        this.getTags()
      })
    },
    update() {
      questionOperationUpdate({
        data: this.postModel
      }).then(() => {
        this.showFormDialog = false
        this.getRecords()
        this.getTags()
      })
    },
    edit(scope) {
      setTimeout(() => {
        this.model = cloneDeep(scope.row)
        this.showFormDialog = true
      })
    },
    tagSuggestions(query, cb) {
      const results = query ? this.tags.filter((tag) => {
        return tag.value.indexOf(query) >= 0
      }) : this.tags
      cb(results)
    },
    addTag() {
      if (!this.inputTag) return
      if (this.model.tag.indexOf(this.inputTag) >= 0) {
        return this.$message({
          message: '标签已存在',
          type: 'warning'
        })
      }
      this.model.tag.push(this.inputTag)
      this.inputTag = ''
    },
    removeTag(tag) {
      this.model.tag.splice(this.model.tag.indexOf(tag), 1)
    },
    tagInputClear() {
      document.activeElement.blur()
    }
  }
}
</script>

<style lang="scss" scoped>
.el-dialog {
  min-width: 750px;
}
.question-form {
  .options {
    display: grid;
    grid-template-columns: 1fr 1fr;
    max-width: 740px;
  }
}

.tags-wrapper {
  .tags {
    display: flex;
    flex-wrap: wrap;
    max-width: 660px;
    .tags-item {
      margin-right: 8px;
      margin-top: 8px;
      font-size: 14px;
    }
  }
  .addBtn {
    display: inline-block;
    width: 60px;
    background-color:rgba(255,255,255,0.1);
    border-left: 1px solid rgba(255,255,255,0.2);
    text-align: center;
    color: #00AD84;
    cursor: pointer;
    &:hover {
      text-decoration: underline;
    }
  }
}
::v-deep {
  .options-wrapper .el-form-item {
    margin-bottom: 20px;
  }
  .options .el-form-item:nth-child(2n) .el-form-item__content {
    margin-left: 20px !important;
  }
  .options .el-input-group__prepend {
    width: 80px;
  }
  .el-autocomplete .el-input {
    width: 260px;
  }
}
</style>
