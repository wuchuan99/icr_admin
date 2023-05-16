<template>
  <div class="System">
    <div class="icrCollapse_item">
      <el-input v-model.trim="config.name" :disabled="disabled" size="mini" placeholder="组件名称" />
      <icr-collapse :title="`账号/密码`">
        <el-button slot="header-actions" :disabled="disabled" type="text" @click.stop="addAccountClick"><i class="iconfont icon-zengjia" /></el-button>
        <icr-table ref="accountTable" :columns="accountTable.columns" :data="system.account_info" />
      </icr-collapse>
    </div>
    <icr-collapse title="远程接入">
      <el-row style="margin-bottom: 10px;">
        <el-col :span="8">
          <span>远程接入</span>
        </el-col>
        <el-col :span="16">
          <el-select
            v-model="system.remote.remote_type"
            size="mini"
            placeholder="请选择接入方式"
            :disabled="disabled"
          >
            <el-option key="novnc" label="novnc" value="novnc" />
            <!-- <el-option key="rdp" label="rdp" value="rdp" />
            <el-option key="ssh" label="ssh" value="ssh" /> -->
          </el-select>
        </el-col>
      </el-row>
      <!-- <el-row style="margin-bottom: 10px;">
        <el-col :span="8">
          <span>端口号</span>
        </el-col>
        <el-col :span="16">
          <el-input v-model="system.remote.port" :disabled="disabled" size="mini" />
        </el-col>
      </el-row>
      <el-row style="margin-bottom: 10px;">
        <el-col :span="8">
          <span>账号</span>
        </el-col>
        <el-col :span="16">
          <el-input v-model="system.remote.account" :disabled="disabled" size="mini" />
        </el-col>
      </el-row>
      <el-row style="margin-bottom: 10px;">
        <el-col :span="8">
          <span>密码</span>
        </el-col>
        <el-col :span="16">
          <el-input v-model="system.remote.password" :disabled="disabled" size="mini" />
        </el-col>
      </el-row> -->
      <el-row style="margin-bottom: 3px;">
        <el-col :span="16" :offset="8">
          <el-button size="mini" type="primary" @click="targetRemote">远程连接</el-button>
        </el-col>
      </el-row>
      <el-row v-if="config.ip_list && config.ip_list.length">
        <el-col :span="8">
          <span>连接IP</span>
        </el-col>
        <el-col :span="16">
          <div class="ip-list">
            <div
              v-for="(ip, index) in config.ip_list"
              :key="index"
              class="ip-item"
              style="color: #fff"
            >{{ ip }}</div>
          </div>
        </el-col>
      </el-row>
    </icr-collapse>
    <el-dialog
      :title="(isEdit ? '编辑' : '新增') + '账号/密码'"
      :visible.sync="dialogVisible"
      :before-close="handleClose"
      append-to-body
      custom-class="app-main"
    >
      <icr-form
        ref="dialogForm"
        label-width="80px"
        class="dialogForm"
        :model="dialogForm"
        :rules="dialogRules"
        :fields="[]"
        @cancel="handleClose"
        @confirm="submit"
        @submit.native.prevent
      >
        <el-form-item label="账号" prop="account">
          <el-input v-model="dialogForm.account" placeholder="请输入账号" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="dialogForm.password" placeholder="请输入密码" />
        </el-form-item>
      </icr-form>
    </el-dialog>
    <icr-confirm-delete ref="confirmDelete" :title="`删除${descTypeName}`" :desc="`您即将删除该${descTypeName}, 确定删除?`" />
  </div>
</template>

<script>
import IcrForm from '@/components/form'
import IcrTable from '@/components/table'
import IcrCollapse from '../../../components/collapse.vue'
import { BasePath } from '@/router/index'
import { networkElementTerminalRemote } from '@/api/scene'
import { required } from '@/utils/validate-helper'
import { v4 as uuidv4 } from 'uuid'
import IcrConfirmDelete from '@/components/confirm-delete.vue'

export default {
  name: 'System',
  components: {
    IcrForm,
    IcrTable,
    IcrCollapse,
    IcrConfirmDelete
  },
  props: {
    // eslint-disable-next-line vue/require-default-prop
    data: Object
  },
  inject: ['getEditor'],
  data() {
    return {
      descTypeName: '账号',
      activeNames: ['1', '2'],
      isEdit: false,
      dialogVisible: false,
      dialogForm: {
        account: '',
        password: ''
      },
      dialogRules: {
        account: [required('账号')],
        password: [required('密码')]
      },
      accountTable: {
        columns: [
          { prop: 'account', label: '账号' },
          { prop: 'password', label: '密码' },
          {
            label: '',
            width: 60,
            render: (scope) => {
              return (
                <div>
                  <el-button disabled={this.disabled} type='text' onclick={() => { this.editAccountClick(scope.row) }}><i class='iconfont icon-bianji' ></i></el-button>
                  <el-button disabled={this.disabled} type='text' onclick={() => { this.confirmDelete(scope.$index) }}><i class='iconfont icon-shanchu'></i></el-button>
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
    config() {
      return this.data.attrs
    },
    system() {
      return this.config.system
    }
  },
  created() {
    const editor = this.getEditor()
    const status = editor.curDebuggerStatus
    this.disabled = [1, 2, 3].includes(status)
  },
  methods: {
    targetRemote() {
      const editor = this.getEditor()
      console.log(editor.sceneTmpUuid)
      networkElementTerminalRemote({
        scene_tmp_uuid: editor.sceneTmpUuid,
        element_id: this.data.id,
        remote_type: 'novnc'
      }).then(({ data }) => {
        const url = new URL(data.data.url)
        const path = `${BasePath}vnc/vnc_lite.html${url.search}&host=${url.hostname}&port=${url.port}`
        window.open(path)
      })
    },
    addAccountClick() {
      this.isEdit = false
      this.dialogVisible = true
    },
    confirmDelete(data) {
      this.$refs.confirmDelete.prompt().then(() => {
        this.delAccountClick(data)
      })
    },
    delAccountClick(index) {
      this.system.account_info.splice(index, 1)
    },
    editAccountClick(row) {
      this.isEdit = true
      this.dialogVisible = true
      this.dialogForm = {
        ...row
      }
    },
    submit() {
      if (this.isEdit) {
        const index = this.system.account_info.findIndex(ele => {
          return ele.id === this.dialogForm.id
        })
        this.system.account_info.splice(index, 1, { ...this.dialogForm })
      } else {
        this.system.account_info.push({
          id: uuidv4(),
          ...this.dialogForm
        })
      }
      this.handleClose()
    },
    handleClose() {
      this.dialogVisible = false
      this.$refs.dialogForm.resetFields()
    }
  }
}
</script>
<style lang="scss" scoped>
.System{
  .icrCollapse_item:first-child{
    ::v-deep{
      .el-collapse{
        border: none;
        padding: 0;
      }
      .el-collapse-item__content{
        padding-bottom: 0;
      }
    }

  }
}

</style>
