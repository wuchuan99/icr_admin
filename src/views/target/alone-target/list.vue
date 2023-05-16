<template>
  <div style="padding-bottom: 10px;">
    <div class="operation-box">
      <div class="operation">
        <el-button
          class="filter-item"
          type="primary"
          size="medium"
          icon="el-icon-circle-plus-outline"
          @click="$router.push('/targets/alone-targets/add?new=1')"
        >新增</el-button>
      </div>
      <div class="query-conditions">
        <div class="query-conditions__item search">
          <!-- <span class="label">目标分类 : </span> -->
          <el-select v-model="query.target_classify" placeholder="目标分类" clearable size="medium" @change="getRecords">
            <el-option
              v-for="item in targetClassifyOptions"
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
    <icr-confirm-delete ref="confirmDelete" title="删除靶标" desc="您即将删除该靶标, 确定删除?" />
  </div>
</template>

<script>
import IcrTable from '@/components/table'
import IcrConfirmDelete from '@/components/confirm-delete.vue'
import Pagination from '@/components/Pagination'
import { usePagination, useTableSelection } from '@/hooks'
import {
  alonetargetPaging,
  alonetargetCopy,
  alonetargetUpdate,
  alonetargetDel,
  alonetargetEnable
} from '@/api/target'
import { reactive } from '@vue/composition-api'
import { mapGetters } from 'vuex'
import { ImageTargetClassify } from '@/const/resource'
import { mapToSelectionOptions } from '@/utils/'
import TargetViewer from './target-viewer.vue'
import StateButton from '@/views/common/state-button'
import { v4 as uuidv4 } from 'uuid'
import { vmSocket, AloneTargetEvent } from '@/utils/ws'

export const TargetDeactiveState = 0
export const TargetActiveState = 1
export const TargetBuildingState = 2
export const TargetSavingState = 3

export default {
  components: {
    IcrTable,
    IcrConfirmDelete,
    Pagination,
    // eslint-disable-next-line vue/no-unused-components
    TargetViewer,
    // eslint-disable-next-line vue/no-unused-components
    StateButton
  },
  provide() {
    return {
      alonetargetList: this
    }
  },
  setup() {
    const query = reactive({
      Categorys: null
    })

    const { selection } = useTableSelection()
    return {
      query,
      selection,
      ...usePagination(alonetargetPaging, query)
    }
  },
  data() {
    const targetClassifyOptions = mapToSelectionOptions(ImageTargetClassify)
    return {
      targetClassifyOptions,
      formFields: [
        {
          label: '靶标名称',
          type: 'input',
          prop: 'name',
          style: 'width: 240px'
        }
      ],
      formRules: {
        name: [
          { required: true, message: '名称不能为空', trigger: 'blur' }
        ]
      },
      showFormDialog: false,
      table: {
        columns: [
          { type: 'selection' },
          { prop: 'name', label: '靶标名称' },
          { prop: 'os', label: '操作系统' },
          { prop: 'frame', label: '处理器架构' },
          { prop: 'target_classify', label: '目标分类' },
          { prop: 'active_status', label: '调试状态', render: scope => {
            const statusMap = new Map([
              [0, '未调试'],
              [1, '已调试'],
              [2, '调试中']
            ])
            return (
              <div>{statusMap.get(scope.row.active_status)}</div>)
          } },
          { prop: 'create_time', label: '创建时间', width: '200px' },
          { label: '靶机状态', width: '150', showOverflowTooltip: false, render: scope => {
            return (
              <div>
                <el-switch
                  value={ scope.row.use_status }
                  oninput={ (val) => {
                    // incase status is string
                    if (isNaN(scope.row.use_status) || scope.row.use_status === val) {
                      scope.row.use_status = val
                      return
                    }
                    alonetargetEnable({
                      target_id: scope.row.id,
                      target_status: val
                    }).then(res => {
                      if (res.status === 0) {
                        scope.row.use_status = val
                      }
                    })
                  }}
                  active-value={1} inactive-value={0}
                  style='margin-right: 8px;'
                />
                { scope.row.use_status ? '启用' : '不启用' }
              </div>
            )
          } },
          {
            label: '操作',
            width: '340',
            fixed: 'right',
            showOverflowTooltip: false,
            render: (scope) => {
              const index = scope.$index
              const targetViewer = (<target-viewer target={ scope.row } { ...{ on: { 'update:target': val => {
                this.$set(this.records[index], 'active_status', val.active_status)
                this.$set(this.records[index], 'use_status', val.use_status)
                this.$set(this.records[index], 'running', val.running)
              } }} }></target-viewer>)

              return (
                <div>
                  { targetViewer }
                  <el-button type='text' disabled={!!scope.row.running} onclick={() => {
                    if (scope.row.running) {
                      return
                    }
                    this.$router.push(`/targets/alone-targets/${scope.row.id}`)
                  }}>编辑配置</el-button>
                  <state-button type='text' key={uuidv4()} request={this.copyAlonetarget.bind(this, scope.row.id)} >创建副本</state-button>
                  <state-button type='text' key={uuidv4()} request={this.delete.bind(this, scope)} >删除</state-button>
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
    this.getRecords()

    // watch socket events
    const taskMap = new Map([
      ['edit', { name: '调试' }],
      ['release', { name: '释放' }],
      ['reboot', { name: '重启' }],
      ['pause', { name: '暂停' }],
      ['unpause', { name: '启动' }],
      ['snapshot', { name: '保存快照' }]
    ])
    const destroyedHooks = this._events?.['hook:destroyed']
    destroyedHooks.push(vmSocket.on(AloneTargetEvent, data => {
      const code = data.code
      const task = taskMap.get(data.task)
      switch (code) {
        case 1001:
          this.$message({ message: `${task.name}成功`, type: 'success' })
          break
        default:
          this.$message({ message: `${task.name}失败`, type: 'error' })
          break
      }
      this.getRecords()
    }))
  },
  methods: {
    copyAlonetarget(id) {
      return alonetargetCopy({
        target_id: id
      }).then(res => {
        this.getRecords()
      })
    },
    update(data) {
      return alonetargetUpdate({
        data: data
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
        alonetargetDel({
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
  .el-table__row td:last-child .el-button:last-child {
    color: #00AD84;
  }
  .el-table__row td:last-child .cell>div>div>button.el-button:last-child {
    color: #ff6067;
  }
}
</style>
