<template>
  <div class="System">
    <icr-form
      ref="form"
      label-width="80px"
      class="form"
      :display-actions="false"
    >
      <el-collapse v-model="activeNames">
        <el-collapse-item title="账号/密码" name="1">
          <template slot="title">
            <el-row style="flex: 1">
              <el-col :span="18">
                <span>账号/密码</span>
              </el-col>
              <el-col :span="6">
                <el-button v-show="activeNames.includes('1')" type="text" @click.stop="addAccountClick">添加</el-button>
              </el-col>
            </el-row>
          </template>
          <el-table
            :data="formData.accountList"
            style="width: 100%"
          >
            <el-table-column
              prop="account"
              label="账号"
            >
              <template slot-scope="e">
                <el-input v-model="e.row.account" />
              </template>
            </el-table-column>
            <el-table-column
              prop="passWord"
              label="密码"
            >
              <template slot-scope="e">
                <el-input v-model="e.row.passWord" />
              </template>
            </el-table-column>
          </el-table>
        </el-collapse-item>
        <el-collapse-item title="远程接入" name="2">
          <el-form-item label="接入方式">
            <el-select
              v-model="formData.access"
              placeholder="请选择接入方式"
            >
              <el-option key="novnc" label="novnc" value="novnc" />
              <el-option key="rdp" label="rdp" value="rdp" />
              <el-option key="ssh" label="ssh" value="ssh" />
            </el-select>
          </el-form-item>
          <el-form-item label="端口号">
            <el-input v-model="formData.port" />
          </el-form-item>
          <el-form-item label="账号">
            <el-input v-model="formData.account" />
          </el-form-item>
          <el-form-item label="密码">
            <el-input v-model="formData.passWord" />
          </el-form-item>
          <el-form-item label="远程连接">
            <el-button @click="targetRemote">远程连接</el-button>
          </el-form-item>
          <el-form-item v-if="formData.ipList && formData.ipList.length" label="连接IP">
            <el-row>
              <div class="ip-list">
                <div
                  v-for="(ip, index) in formData.ipList"
                  :key="index"
                  class="ip-item"
                  style="color: #fff"
                >{{ ip }}</div>
              </div>
            </el-row>
          </el-form-item>
        </el-collapse-item>
        <el-collapse-item v-show="['layerTwoSwitches', 'layerThreeSwitches'].includes(deviceType)" title="VLAN设置" name="3">
          <template slot="title">
            <el-row style="flex: 1">
              <el-col :span="18">
                <span>VLAN设置</span>
              </el-col>
              <el-col :span="6">
                <el-button v-show="activeNames.includes('3')" type="text" @click.stop="addVLANClick">添加</el-button>
              </el-col>
            </el-row>
          </template>
          <el-table
            :data="formData.VLANList"
            style="width: 100%"
          >
            <el-table-column
              prop="name"
              label="VLAN划分"
            />
            <el-table-column
              width="180"
            >
              <template slot-scope="e">
                <el-button type="text" @click="delVLANClick(e.$index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-collapse-item>
        <el-collapse-item v-show="deviceType === 'layerTwoSwitches'" title="DHCP设置" name="4">
          <el-form-item label="DHCP Snooping" label-width="130px">
            <el-switch
              v-model="formData.DHCPSwitch"
              active-color="#13ce66"
              inactive-color="#ff4949"
            />
          </el-form-item>
        </el-collapse-item>
        <el-collapse-item v-show="deviceType === 'router'" title="LAN设置" name="5">
          <el-form-item label="IP地址">
            <el-input v-model="formData.LANIp" placeholder="请输入IP地址" />
          </el-form-item>
          <el-form-item label="子网掩码">
            <el-input v-model="formData.LANMask" placeholder="请输入子网掩码" />
          </el-form-item>
          <el-form-item label="DHCP">
            <el-switch v-model="formData.DHCPSwitch" active-color="#13ce66" inactive-color="#ff4949" />
          </el-form-item>
          <el-form-item label="IP范围池">
            <span style="color: #fff">192.168.1.</span>
            <el-input v-model="formData.ipScopeStart" style="display: inline-block;width: 60px" />
            <span style="color: #fff;margin: 0 10px">~</span>
            <el-input v-model="formData.ipScopeEnd" style="display: inline-block;width: 60px" />
          </el-form-item>
        </el-collapse-item>
        <el-collapse-item v-show="deviceType === 'router'" title="端口映射" name="6">
          <template slot="title">
            <el-row style="flex: 1">
              <el-col :span="18">
                <span>端口映射</span>
              </el-col>
              <el-col :span="6">
                <el-button v-show="activeNames.includes('5')" type="text" @click.stop="addPortMapClick">添加</el-button>
              </el-col>
            </el-row>
          </template>
          <el-table
            :data="formData.portMapList"
            style="width: 100%"
          >
            <el-table-column
              prop="internalIP"
              label="内部IP"
            >
              <template slot-scope="e">
                <el-input v-model="e.row.internalIP" />
              </template>
            </el-table-column>
            <el-table-column
              prop="internalPort"
              label="内部端口"
            >
              <template slot-scope="e">
                <el-input v-model="e.row.internalPort" />
              </template>
            </el-table-column>
            <el-table-column
              prop="externalIp"
              label="外部端口"
            >
              <template slot-scope="e">
                <el-input v-model="e.row.externalIp" />
              </template>
            </el-table-column>
            <el-table-column
              width="180"
            >
              <template slot-scope="e">
                <el-button type="text" @click="delPortMapClick(e.$index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-collapse-item>
      </el-collapse>
    </icr-form>
    <el-dialog
      title="新增VLAN"
      :visible.sync="dialogVisible"
      width="30%"
      :before-close="handleClose"
    >
      <icr-form
        ref="dialogForm"
        label-width="100px"
        class="dialogForm"
        :model="dialogForm"
        :rules="dialogRules"
        :fields="modelFormFields"
        @cancel="handleClose"
        @confirm="submit"
        @submit.native.prevent
      />
    </el-dialog>
  </div>
</template>

<script>
import IcrForm from '@/components/form'
import { BasePath } from '@/router/index'
import { networkElementTerminalRemote } from '@/api/scene'
export default {
  name: 'System',
  components: {
    IcrForm
  },
  props: {
    deviceType: {
      type: String,
      default: ''
    },
    formData: {
      type: Object,
      default: () => {}
    },
    nodeData: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      form: {
        accountList: [],
        VLANList: [],
        portMapList: []
      },
      activeNames: ['1', '2', '3', '4', '5', '6'],
      dialogVisible: false,
      dialogForm: {
        name: '',
        id: '',
        ip: '',
        mask: '',
        defaultGateway: '',
        DHCP: true,
        startIp: '',
        endIp: ''
      },
      dialogRules: {
        name: [
          { required: true, message: 'VLAN名称不能为空', trigger: 'change' }
        ],
        id: [
          { required: true, message: 'VLAN ID不能为空', trigger: 'change' }
        ],
        ip: [
          { required: false, message: '子网IP不能为空', trigger: 'change' }
        ],
        mask: [
          { required: false, message: '子网掩码不能为空', trigger: 'change' }
        ],
        defaultGateway: [
          { required: false, message: '默认网关不能为空', trigger: 'change' }
        ],
        startIp: [
          { required: true, message: '默认网关不能为空', trigger: 'change' }
        ],
        endIp: [
          { required: true, message: '默认网关不能为空', trigger: 'change' }
        ]
      },
      modelFormFields: [
        {
          label: 'VLAN名称',
          type: 'input',
          prop: 'name'
        },
        {
          label: 'VLAN ID',
          type: 'input',
          prop: 'id'
        },
        {
          label: '子网IP',
          type: 'input',
          prop: 'ip'
        },
        {
          label: '子网掩码',
          type: 'input',
          prop: 'mask'
        },
        {
          label: '默认网关',
          type: 'input',
          prop: 'defaultGateway'
        },
        {
          abel: 'DHCP',
          type: 'switch',
          prop: 'DHCP'
        },
        {
          label: '起始IP',
          type: 'input',
          prop: 'startIp'
        },
        {
          label: '终止IP',
          type: 'input',
          prop: 'endIp'
        }
      ]
    }
  },
  watch: {
    'dialogForm.ip': function(val) {
      if (this.deviceType === 'layerThreeSwitches') {
        if (val) {
          this.dialogRules.mask[0].required = true
          this.dialogRules.defaultGateway[0].required = true
        } else {
          this.dialogRules.mask[0].required = false
          this.dialogRules.defaultGateway[0].required = false
        }
      }
    },
    'dialogForm.DHCP': function(val) {
      if (this.deviceType === 'layerThreeSwitches') {
        if (val) {
          this.dialogRules.startIp[0].required = true
          this.dialogRules.endIp[0].required = true
        } else {
          this.dialogRules.startIp[0].required = false
          this.dialogRules.endIp[0].required = false
        }
      }
    }
  },
  created() {
    if (this.deviceType === 'layerTwoSwitches') {
      this.restDialogForm()
    }
  },
  methods: {
    targetRemote() {
      return networkElementTerminalRemote({
        element_id: this.nodeData.id,
        remote_type: 'novnc'
      }).then(({ data }) => {
        const url = new URL(data.data.url)
        const path = `${BasePath}vnc/vnc_lite.html${url.search}&host=${url.hostname}&port=${url.port}`
        window.open(path)
      })
    },
    addPortMapClick() {
      this.formData.portMapList.push({
        internalIP: '',
        internalPort: '',
        externalIp: ''
      })
    },
    delPortMapClick(index) {
      this.formData.portMapList.splice(index, 1)
    },
    restDialogForm() {
      this.dialogForm = {
        name: '',
        id: ''
      }
      this.modelFormFields = [
        {
          label: 'VLAN名称',
          type: 'input',
          prop: 'name'
        },
        {
          label: 'VLAN ID',
          type: 'input',
          prop: 'id'
        }
      ]
      this.dialogRules = {
        name: [
          { required: true, message: 'VLAN名称不能为空', trigger: 'change' }
        ],
        id: [
          { required: true, message: 'VLAN ID不能为空', trigger: 'change' }
        ]
      }
    },
    submit() {
      this.formData.VLANList.push({
        ...this.dialogForm
      })
      this.handleClose()
    },
    handleClose() {
      this.dialogVisible = false
      this.$refs.dialogForm.$refs.inner_form.resetFields()
    },
    addAccountClick() {
      this.formData.accountList.push({
        account: '',
        passWord: ''
      })
    },
    setData(data) {
      this.form = data
    },
    delVLANClick(index) {
      this.formData.VLANList.splice(index, 1)
    },
    addVLANClick() {
      this.dialogVisible = true
    }
  }
}
</script>
<style lang="scss" scoped>
  .System {
    ::v-deep {
      .el-form {
        .el-select {
          width: 100%;
        }
        .el-input {
          width: 100%;
        }
      }
    }
  }
</style>
