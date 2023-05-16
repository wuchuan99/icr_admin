<template>
  <div class="dns_manager">
    <icr-collapse title="DNS服务器">
      <el-button
        slot="header-actions"
        type="text"
        :disabled="disabled"
        @click.stop="addBtnClick"
      ><i class="iconfont icon-zengjia" /></el-button>
      <icr-table ref="Table" :columns="tableConfig.columns" :data="list" />
    </icr-collapse>
    <el-dialog
      :title="row ? '编辑DNS解析' : '新增DNS解析'"
      :visible.sync="dialogVisible"
      width="490px"
      :before-close="dialogHandleClose"
      custom-class="app-main"
      append-to-body
    >
      <icr-form
        ref="dialogForm"
        label-width="66px"
        class="dialogForm"
        :model="dialogForm"
        :rules="dialogRules"
        :fields="dialogFormFields"
        :disabled="disabled"
        @cancel="dialogHandleClose"
        @confirm="dialogSubmit"
        @submit.native.prevent
      />
    </el-dialog>
    <icr-confirm-delete
      ref="confirmDelete"
      :append-to-body="true"
      custom-class="app-main"
      title="删除DNS服务器"
      desc="您即将删除该DNS, 确定删除?"
    />
  </div>
</template>

<script>
import IcrForm from '@/components/form'
import IcrTable from '@/components/table'
import IcrCollapse from '../components/collapse.vue'
import IcrConfirmDelete from '@/components/confirm-delete.vue'
import IcrTooltip from '@/components/tooltip.vue'
import { isIpv4, isDomainName } from '@/utils/validate-helper'
import { mapGetters } from 'vuex'
import {
  scenetargetDnsPaging,
  scenetargetDnsAdd,
  scenetargetDnsUpdate,
  scenetargetDnsDelete }
from '@/api/scene'
export default {
  name: 'DnsManager',
  components: {
    IcrCollapse,
    IcrForm,
    IcrConfirmDelete,
    IcrTable,
    // eslint-disable-next-line vue/no-unused-components
    IcrTooltip
  },
  inject: ['getEditor'],
  data() {
    return {
      dialogVisible: false,
      dialogForm: {
        domain: '',
        ip: ''
      },
      dialogRules: {
        domain: [isDomainName('域名', { required: true })],
        ip: [isIpv4('IP地址', { required: true })]
      },
      dialogFormFields: [
        {
          label: '域名',
          type: 'input',
          prop: 'domain'
        },
        {
          label: 'IP地址',
          type: 'input',
          prop: 'ip'
        }
      ],
      list: [],
      row: null,
      tableConfig: {
        columns: [
          {
            label: '域名',
            render: (scope) => {
              return <div class='text_ellipsis'>{scope.row.domain}</div>
            }
          },
          {
            label: 'IP地址',
            width: 160,
            render: (scope) => {
              // return <div class='text_ellipsis'>{scope.row.ip}</div>
              return (
                <div class='last_td'>
                  <div class='icr_tooltip'>
                    <icr-tooltip content={ scope.row.ip } />
                  </div>
                  <div class='text_buttons'>
                    <el-button
                      type='text'
                      icon='iconfont icon-bianji'
                      size='mini'
                      onclick={() => {
                        this.editBtnClick(scope.row)
                      }}
                    ></el-button>
                    <el-button
                      type='text'
                      icon='iconfont icon-shanchu'
                      size='mini'
                      disabled={ this.disabled }
                      onclick={() => {
                        this.delBtnClick(scope.row)
                      }}
                    ></el-button></div>

                </div>
              )
            }
          }
        ]
      },
      disabled: false
    }
  },
  computed: {
    ...mapGetters(['sceneId'])
  },
  created() {
    const editor = this.getEditor()
    const status = editor.curDebuggerStatus
    this.disabled = [1, 2, 3].includes(status)
    this.getList()
  },
  methods: {
    getList() {
      scenetargetDnsPaging({
        page_info: {
          page_num: 1,
          page_size: 10000
        },
        data: {
          scene_id: this.sceneId
        }
      }).then((res) => {
        if (res.status === 0) {
          this.list = res?.data?.data || []
        }
      })
    },
    dialogHandleClose() {
      this.dialogVisible = false
      this.row = null
      this.restFieldEmpty(this.dialogForm)
    },
    restFieldEmpty(target) {
      for (const key in target) {
        if (Object.hasOwnProperty.call(target, key)) {
          target[key] = ''
        }
      }
    },
    dialogSubmit() {
      let method = ''
      let message = ''
      const params = {
        attrs: {
          ...this.dialogForm
        }
      }
      if (this.row) {
        method = scenetargetDnsUpdate
        message = '编辑DNS服务器成功！'
        params.id = this.row.id
      } else {
        method = scenetargetDnsAdd
        message = '新增DNS服务器成功！'
        params.scene_id = this.sceneId
      }
      method({ data: params }).then((res) => {
        if (res.status === 0) {
          this.$message.success(message)
          this.dialogHandleClose()
          this.getList()
        }
      })
    },
    editBtnClick(row) {
      this.dialogVisible = true
      this.row = row
      this.dialogForm = { ...row }
    },
    addBtnClick() {
      this.dialogVisible = true
    },
    delBtnClick(row) {
      this.$refs.confirmDelete.prompt().then(() => {
        scenetargetDnsDelete({
          data: {
            type: 1,
            id: row.id
          }
        }).then((res) => {
          if (res.status === 0) {
            this.$message.success('删除DNS服务器成功')
            this.getList()
          }
        })
      })
    }
  }
}
</script>
<style lang="scss" scoped>
  .dns_manager {
    overflow: hidden;
  }
</style>
