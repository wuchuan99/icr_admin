<template>
  <div>
    <div class="icrCollapse_item">
      <el-input v-model="data.attrs.name" :disabled="disabled" size="mini" placeholder="组件名称" />
      <!-- <span class="item-title">靶机模板</span>
      <el-input size="mini" class="item-content" readonly>
        <template slot="append"><el-button type="text" :disabled="disabled">添加</el-button></template>
      </el-input> -->
    </div>
    <icr-collapse :title="NetTitle">
      <el-button slot="header-actions" :disabled="disabled" type="text" @click.stop="openDialog('inf')"><i class="iconfont icon-zengjia" /></el-button>
      <icr-table ref="NetTable" :columns="NetTable.columns" :data="data.attrs.inf" />
    </icr-collapse>
    <icr-collapse :title="PortTitle">
      <el-button slot="header-actions" :disabled="disabled" type="text" @click.stop="openDialog('port_mappings')"><i class="iconfont icon-zengjia" /></el-button>
      <icr-table
        ref="PortTable"
        :columns="PortTable.columns"
        :data="data.attrs.port_mappings"
      />
    </icr-collapse>
    <icr-collapse :title="StaticRoutersTitle">
      <el-button slot="header-actions" :disabled="disabled" type="text" @click.stop="showStaticRoutersFormDialog = true"><i class="iconfont icon-zengjia" /></el-button>
      <icr-table
        ref="staticRoutersTable"
        :columns="staticRoutersTable.columns"
        :data="data.attrs.static_routes"
      />
    </icr-collapse>
    <el-dialog
      :visible.sync="showFormDialog"
      append-to-body
      custom-class="app-main"
      :title="DialogTitle"
      @close="closeDialog"
    >
      <icr-form
        ref="form"
        :model="model"
        :rules="formRules"
        :disabled="disabled"
        class="question-form"
        @cancel="showFormDialog = false"
        @confirm="submit"
      >
        <!-- 路由接口设置 -->
        <div
          v-if="!DialogType"
          style="
            width: 860px;
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;
          "
        >
          <el-form-item label="接口名称" prop="eth_name">
            <el-input v-model="model.eth_name" />
          </el-form-item>
          <el-form-item label="选择子网" prop="subnet_id">
            <el-select v-model="model.subnet_id" placeholder="请选择">
              <el-option
                v-for="item in subnetOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="IP地址" prop="ip">
            <el-input v-model="model.ip" />
          </el-form-item>
        </div>
        <!-- 添加端口映射 -->
        <div
          v-else
          style="
            width: 670px;
            display: flex;
            justify-content: start;
            flex-wrap: wrap;
          "
        >
          <el-form-item label="内部IP" prop="to_ip" class="ip">
            <el-input v-model="model.to_ip" />
          </el-form-item>
          <span style="margin-left: 20px; line-height: 40px">:</span>
          <el-form-item label="端口" prop="t_port">
            <el-input v-model="model.t_port" style="width: 166px" />
          </el-form-item>
          <el-form-item label="外部IP" prop="dest_ip">
            <el-input v-model="model.dest_ip" />
          </el-form-item>
          <span style="margin-left: 20px; line-height: 40px">:</span>
          <el-form-item label="端口" prop="d_port">
            <el-input v-model="model.d_port" style="width: 166px" />
          </el-form-item>
          <el-form-item label="协议" prop="protocol">
            <el-select v-model="model.protocol" placeholder="请选择">
              <el-option
                v-for="item in protocolOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </div>
      </icr-form>
    </el-dialog>
    <el-dialog
      :visible.sync="showStaticRoutersFormDialog"
      append-to-body
      custom-class="app-main"
      title="添加静态路由表"
      @close="closeStaticRoutersDialog"
    >
      <icr-form
        ref="staticRoutersForm"
        :model="model"
        :rules="formRules"
        :disabled="disabled"
        class="question-form"
        @cancel="showStaticRoutersFormDialog = false"
        @confirm="staticRoutersubmit"
      >
        <el-form-item label="目标网段" prop="destination" class="ip">
          <el-input v-model="model.destination" />
        </el-form-item>
        <el-form-item label="下一跳" prop="nexthop">
          <el-input v-model="model.nexthop" />
        </el-form-item>
      </icr-form>
    </el-dialog>
    <el-dialog
      width="400px"
      :visible.sync="TargetTemplateShowDialog"
      title="选择靶机模板"
      @close="TargetTemplateShowDialog = false"
    >
      <icr-table
        v-if="TargetTemplateShowDialog"
        ref="TargetTemplateTable"
        class="targetTemplateTable"
        :columns="TargetTemplateTable.columns"
        :data="TargetTemplateRecords"
      />
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="TargetTemplateSubmit">确认</el-button>
        <el-button @click="TargetTemplateShowDialog = false">取消</el-button>
      </div>
    </el-dialog>
    <icr-confirm-delete ref="confirmDelete" :title="`删除${descTypeName}`" :desc="`您即将删除该${descTypeName}, 确定删除?`" />
  </div>
</template>

<script>
import { v4 as uuidv4 } from 'uuid'
import IcrTable from '@/components/table'
import IcrForm from '@/components/form'
import IcrCollapse from '../../components/collapse.vue'
import IcrTooltip from '@/components/tooltip.vue'
import { protocols } from '@/const/resource'
import { mapToSelectionOptions } from '@/utils/'
import { required, isIpv4, isInteger, isIpv4AndMask } from '@/utils/validate-helper'
import { mapGetters } from 'vuex'
import { checkIp } from '@/utils/index'
import IcrConfirmDelete from '@/components/confirm-delete.vue'
import {
  scenetargetSubnetList
} from '@/api/scene'

const descTypeMaps = new Map([
  ['inf', '网络适配器'],
  ['port_mappings', '端口映射'],
  ['static_routes', '静态路由表']
])

export default {
  name: 'RouterConfig',
  components: {
    IcrCollapse,
    IcrTable,
    IcrForm,
    // eslint-disable-next-line vue/no-unused-components
    IcrTooltip,
    IcrConfirmDelete
  },
  props: {
    data: {
      type: Object,
      default: () => {}
    }
  },
  inject: ['getEditor'],
  data() {
    return {
      descTypeName: '',
      TargetTitle: '靶机模板',
      NetTitle: '网络适配器',
      StaticRoutersTitle: '静态路由表',
      NetTable: {
        columns: [
          { prop: 'eth_name', label: '接口名称' },
          {
            prop: 'ip',
            label: 'IP地址',
            width: 160,
            render: (scope) => {
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
                        this.edit(scope)
                      }}
                    ></el-button>
                    <el-button
                      type='text'
                      icon='iconfont icon-shanchu'
                      size='mini'
                      disabled={ this.disabled }
                      onclick={() => {
                        this.confirmDelete(scope, 'inf')
                      }}
                    ></el-button>
                  </div>
                </div>
              )
            }
          }
        ]
      },
      PortTitle: '端口映射',
      PortTable: {
        columns: [
          {
            label: '内部IP:端口',
            render: (scope) => {
              return <div class='text_ellipsis'>{`${scope.row.to_ip}:${scope.row.t_port}`}</div>
            }
          },
          {
            label: '外部IP:端口',
            render: (scope) => {
              return <div class='text_ellipsis'>{`${scope.row.dest_ip}:${scope.row.d_port}`}</div>
            }
          },
          {
            width: 35,
            render: (scope) => {
              return (
                <div>
                  <el-button
                    type='text'
                    icon='iconfont icon-shanchu'
                    disabled={ this.disabled }
                    onclick={() => {
                      this.confirmDelete(scope, 'port_mappings')
                    }}
                  ></el-button>
                </div>
              )
            }
          }
        ]
      },
      staticRoutersTable: {
        columns: [
          {
            label: '目标网段',
            render: (scope) => {
              return <div class='text_ellipsis'>{`${scope.row.destination}`}</div>
            }
          },
          {
            label: '下一跳',
            render: (scope) => {
              return <div class='text_ellipsis'>{`${scope.row.nexthop}`}</div>
            }
          },
          {
            width: 35,
            render: (scope) => {
              return (
                <div>
                  <el-button
                    type='text'
                    icon='iconfont icon-shanchu'
                    disabled={ this.disabled }
                    onclick={() => {
                      this.confirmDelete(scope, 'static_routes')
                    }}
                  ></el-button>
                </div>
              )
            }
          }
        ]
      },
      DialogTitle: '路由接口设置',
      DialogType: 0, // 0:路由接口设置; 1:添加端口映射
      submitType: 'add',
      showFormDialog: false,
      model: {},
      formRules: {
        eth_name: [required('接口名称')],
        subnet_id: [required('子网')],
        ip: [isIpv4('IP地址', { required: true, filterBroadcast: true })],
        to_ip: [isIpv4('IP地址', { required: true, filterBroadcast: true })],
        t_port: [isInteger('端口', { required: true, max: 65535 })],
        dest_ip: [isIpv4('IP地址', { required: true, filterBroadcast: true })],
        d_port: [isInteger('端口', { required: true, max: 65535 })],
        protocol: [required('协议')],
        destination: [isIpv4AndMask('目标网段', { required: true })],
        nexthop: [isIpv4('下一跳地址', { required: true, filterBroadcast: true })]
      },
      subnetOptions: [], // todo: subnetOptions通过请求获得
      protocolOptions: mapToSelectionOptions(protocols),
      showStaticRoutersFormDialog: false,
      TargetTemplateShowDialog: false,
      TargetTemplateTable: {
        columns: [
          { type: 'selection' },
          { prop: 'name', label: '模板名称' }
        ]
      },
      TargetTemplateRecords: [{ name: 'openWRT' }],
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
  },
  mounted() {
    console.log(this.data)
  },
  methods: {
    TargetTemplateSubmit() {
      const checkList = this.$refs.TargetTemplateTable.getSelection()
      if (!checkList?.length) {
        return this.$message({
          type: 'error',
          message: '请选择模板'
        })
      }
      const name = checkList[0].name
      console.log(name)
    },
    getSubnetList() {
      scenetargetSubnetList({
        scene_id: this.sceneId
      }).then((res) => {
        if (res.status === 0) {
          this.subnetOptions = res?.data?.data || []
        }
      })
    },
    openDialog(val) {
      this.DialogTitle = val === 'inf' ? '路由接口设置' : '添加端口映射'
      this.DialogType = val === 'inf' ? 0 : 1
      this.showFormDialog = true
      this.getSubnetList()
    },
    closeDialog() {
      this.model = {}
      this.submitType = 'add'
      this.$refs.form.resetFields()
    },
    closeStaticRoutersDialog() {
      this.model = {}
    },
    edit(scope) {
      this.submitType = 'edit'
      this.model = { ...scope.row }
      this.openDialog('inf')
    },
    confirmDelete(scope, type) {
      this.descTypeName = descTypeMaps.get(type)
      this.$refs.confirmDelete.prompt().then(() => {
        this.delete(scope, type)
      })
    },
    delete(scope, type) {
      if (type === 'inf') {
        // 删除路由接口
        // todo: 如果已经有链路配置到该接口，则不可删除，提示“已经有链路链接该接口，请先修改链路设置”
        const self_eth_id_list = this.data.connections.map(it => it.self_eth_id)
        if (self_eth_id_list.includes(scope.row.id)) {
          return this.$message({
            message: '已经有链路链接该接口，请先修改链路设置！',
            type: 'error'
          })
        }
        this.data.attrs.inf.splice(scope.$index, 1)
      } else if (type === 'port_mappings') {
        // 删除端口映射
        this.data.attrs.port_mappings.splice(scope.$index, 1)
      } else {
        // 删除静态路由表
        this.data.attrs.static_routes.splice(scope.$index, 1)
      }
    },
    submit() {
      if (!this.DialogType) { // 路由表单校验
        const name_list = this.data.attrs.inf.filter(item => item.id !== this.model.id).map(item => item.eth_name)
        if (name_list.includes(this.model.eth_name)) {
          return this.$message({
            message: '接口名称已存在',
            type: 'error'
          })
        }
        const subnet_id_list = this.data.attrs.inf.filter(item => item.id !== this.model.id).map(item => item.subnet_id)
        if (subnet_id_list.includes(this.model.subnet_id)) {
          return this.$message({
            message: '请勿重复添加子网',
            type: 'error'
          })
        }
        const subnet_info = this.subnetOptions.find((item) => this.model.subnet_id === item.id)
        if (!checkIp(this.model.ip, subnet_info.sub_mask, subnet_info.subnet_ip)) {
          return this.$message({
            message: 'IP地址不在选择的子网内',
            type: 'error'
          })
        }
      }
      if (this.submitType === 'add') {
        if (this.DialogType) {
          // 添加端口映射
          this.data.attrs.port_mappings.push({ ...this.model })
        } else {
          // 路由接口设置-新增
          this.data.attrs.inf.push({ id: uuidv4(), ...this.model })
        }
      } else {
        // 路由接口设置-编辑
        const index = this.data.attrs.inf.findIndex((val) => {
          return val.id === this.model.id
        })
        this.data.attrs.inf.splice(index, 1, { ...this.model })
      }
      this.showFormDialog = false
    },
    staticRoutersubmit() {
      this.data.attrs.static_routes.push({ ...this.model })
      this.showStaticRoutersFormDialog = false
    }
  }
}
</script>
<style lang="scss" scoped>
::v-deep {
  .question-form {
    .el-form-item:last-child {
      margin-bottom: 0
    }
  }
  .targetTemplateTable {
    .el-table__header {
      tr {
        th {
          font-size: 14px !important;
          padding: 12px 0 !important;
          color: rgba(255, 255, 255, 0.7) !important;
          background-color: rgba(255, 255, 255, 0.1) !important;
        }
      }
    }
    tr.el-table__row {
      td {
        padding: 16px 0 !important;
      }
    }
  }
}
</style>
