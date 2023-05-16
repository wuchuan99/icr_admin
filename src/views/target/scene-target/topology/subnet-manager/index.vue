<template>
  <div class="subnet_manager">
    <icr-collapse title="子网管理">
      <el-button slot="header-actions" :disabled="disabled" type="text" @click.stop="addBtnClick"><i class="iconfont icon-zengjia" /></el-button>
      <icr-table ref="Table" :columns="tableConfig.columns" :data="list" />
    </icr-collapse>
    <el-dialog
      :title="row ? '编辑子网' : '新增子网'"
      :visible.sync="dialogVisible"
      width="946px"
      :before-close="dialogHandleClose"
      custom-class="app-main"
      append-to-body
    >
      <icr-form
        ref="dialogForm"
        label-width="90px"
        class="dialogForm"
        :model="dialogForm"
        :rules="dialogRules"
        :fields="[]"
        :disabled="disabled"
        @cancel="dialogHandleClose"
        @confirm="dialogSubmit"
        @submit.native.prevent
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="VLAN名称" prop="name">
              <el-input v-model="dialogForm.name" placeholder="请输入VLAN名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="VLAN ID" prop="vid">
              <el-input v-model="dialogForm.vid" placeholder="请输入VLAN ID" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="子网网段" prop="subnet_ip">
              <el-input v-model="dialogForm.subnet_ip" placeholder="请输入子网网段" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="子网掩码" prop="sub_mask">
              <el-input v-model="dialogForm.sub_mask" placeholder="请输入子网掩码" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="默认网关" prop="gateway_ip">
              <el-input v-model="dialogForm.gateway_ip" placeholder="请输入默认网关" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="DHCP" prop="enable_dhcp">
          <el-switch
            v-model="dialogForm.enable_dhcp"
            active-color="#13ce66"
            inactive-color="#ff4949"
            @change="switchChange"
          />
        </el-form-item>
        <template v-if="dialogForm.enable_dhcp">
          <el-form-item prop="start">
            <el-input v-model="dialogForm.start" placeholder="起始IP" />
          </el-form-item>
          <el-form-item prop="end">
            <el-input v-model="dialogForm.end" placeholder="终止IP" />
          </el-form-item>
        </template>
      </icr-form>
    </el-dialog>
    <icr-confirm-delete
      ref="confirmDelete"
      :append-to-body="true"
      custom-class="app-main"
      title="删除子网"
      desc="您即将删除该子网, 确定删除?"
    />
  </div>
</template>

<script>
import IcrForm from '@/components/form'
import IcrTable from '@/components/table'
import IcrCollapse from '../components/collapse.vue'
import IcrConfirmDelete from '@/components/confirm-delete.vue'
import IcrTooltip from '@/components/tooltip.vue'
import {
  scenetargetSubnetAdd,
  scenetargetSubnetDelete,
  scenetargetSubnetUpdate,
  scenetargetSubnetPaging
} from '@/api/scene'
import { required, isIpv4, isMask, isInteger } from '@/utils/validate-helper'
import { checkIp, matchMask } from '@/utils'
import { mapGetters } from 'vuex'
export default {
  name: 'SubnetManager',
  components: {
    IcrForm,
    IcrTable,
    IcrCollapse,
    IcrConfirmDelete,
    // eslint-disable-next-line vue/no-unused-components
    IcrTooltip
  },
  inject: ['getEditor'],
  data() {
    return {
      dialogVisible: false,
      dialogForm: {
        name: '',
        vid: '',
        subnet_ip: '',
        sub_mask: '',
        gateway_ip: '',
        enable_dhcp: true,
        start: '',
        end: ''
      },
      dialogRules: {
        name: [required('VLAN名称')],
        vid: [isInteger('VLAN ID', { required: true })],
        subnet_ip: [isIpv4('子网网段', { required: true })],
        sub_mask: [isMask('子网掩码', { required: true })],
        gateway_ip: [isIpv4('默认网关', { required: true, filterBroadcast: true })],
        start: [isIpv4('起始IP', { required: false, filterBroadcast: true })],
        end: [isIpv4('终止IP', { required: false, filterBroadcast: true })]
      },
      dialogFormFields: [],
      list: [],
      row: null,
      tableConfig: {
        columns: [
          {
            label: '名称',
            render: (scope) => {
              return <div class='text_ellipsis'>{scope.row.attrs.name}</div>
            }
          },
          {
            label: '子网网段',
            width: 160,
            render: (scope) => {
              // return <div class='text_ellipsis'>{scope.row.attrs.cidr}</div>
              return (
                <div class='last_td'>
                  <div class='icr_tooltip'>
                    <icr-tooltip content={ scope.row.attrs.cidr } />
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
                    ></el-button>
                  </div>
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
      scenetargetSubnetPaging({
        page_info: {
          page_num: 1,
          page_size: 10000
        },
        search_info: {
          scene_id: this.sceneId
        }
      }).then((res) => {
        if (res.status === 0) {
          this.list = res?.data?.data || []
        }
      })
    },
    switchChange(val) {
      if (!val) {
        this.dialogForm.start = ''
        this.dialogForm.end = ''
      }
    },
    dialogHandleClose() {
      this.dialogVisible = false
      this.row = null
      this.restFieldEmpty(this.dialogForm)
    },
    restFieldEmpty(target) {
      for (const key in target) {
        if (Object.hasOwnProperty.call(target, key)) {
          if (key === 'enable_dhcp') {
            target[key] = true
          } else {
            target[key] = ''
          }
        }
      }
    },
    dialogSubmit() {
      const vlanId = this.dialogForm.vid * 1
      const VLAN_ID_MAX = 4094
      if (vlanId > VLAN_ID_MAX) {
        return this.$message({
          message: 'vlan id取值范围为1~4094',
          type: 'error'
        })
      }
      if (!matchMask(this.dialogForm.sub_mask, this.dialogForm.subnet_ip)) {
        return this.$message({
          message: '子网掩码与子网网段不匹配',
          type: 'error'
        })
      }
      if (!checkIp(this.dialogForm.gateway_ip, this.dialogForm.sub_mask, this.dialogForm.subnet_ip)) {
        return this.$message({
          message: '默认网关与子网网段不在同一网段',
          type: 'error'
        })
      }
      if ((this.dialogForm.start && !this.dialogForm.end) || (!this.dialogForm.start && this.dialogForm.end)) {
        return this.$message({
          message: '起始ip和终止ip需同时指定',
          type: 'error'
        })
      }
      if (this.dialogForm.start && this.dialogForm.end) {
        if (
          !checkIp(this.dialogForm.start, this.dialogForm.sub_mask, this.dialogForm.subnet_ip) ||
          !checkIp(this.dialogForm.end, this.dialogForm.sub_mask, this.dialogForm.subnet_ip)
        ) {
          return this.$message({
            message: 'ip分配池与子网网段不在同一网段',
            type: 'error'
          })
        }

        const startAfter = this.dialogForm.start.split('.').slice(3).join('') * 1
        const endAfter = this.dialogForm.end.split('.').slice(3).join('') * 1
        if (startAfter > endAfter) {
          return this.$message({
            message: '起始ip应小于终止ip',
            type: 'error'
          })
        }

        const gateway_ip_after = this.dialogForm.gateway_ip.split('.').slice(3).join('') * 1
        if (gateway_ip_after >= startAfter && gateway_ip_after <= endAfter) {
          return this.$message({
            message: '网关ip不能在分配池之间',
            type: 'error'
          })
        }
      }
      const attrs = {
        ...this.dialogForm,
        allocation_pools: {
          start: this.dialogForm.start,
          end: this.dialogForm.end
        }
      }
      delete attrs.start
      delete attrs.end
      let method = ''
      let message = ''
      const params = {
        attrs,
        illustration_info: {}
      }
      if (this.row) {
        method = scenetargetSubnetUpdate
        message = '编辑子网成功！'
        params.id = this.row.id
      } else {
        method = scenetargetSubnetAdd
        message = '新增子网成功！'
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
      this.dialogForm = {
        ...this.row.attrs,
        start: this.row.attrs.allocation_pools.start,
        end: this.row.attrs.allocation_pools.end
      }
      delete this.dialogForm.allocation_pools
    },
    addBtnClick() {
      this.dialogVisible = true
    },
    delBtnClick(row) {
      this.$refs.confirmDelete.prompt().then(() => {
        scenetargetSubnetDelete({
          data: {
            type: 1,
            ids: [row.id]
          }
        }).then((res) => {
          if (res.status === 0) {
            this.$message.success('删除子网成功')
            this.getList()
          }
        })
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.subnet_manager {
  overflow: hidden;
}

</style>
