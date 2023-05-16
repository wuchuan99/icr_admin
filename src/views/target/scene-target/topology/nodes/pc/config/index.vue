<template>
  <div class="pc-config">
    <div class="icrCollapse_item">
      <el-input v-model.trim="config.name" :disabled="disabled" size="mini" placeholder="组件名称" />
      <span class="item-title">靶机模板</span>
      <el-input v-model="config.image_info.target_name" :disabled="disabled" class="item-content" size="mini" :title="config.image_info.target_name" readonly>
        <template slot="append"><el-button :disabled="disabled" type="text" @click="selectTemplate">添加</el-button></template>
      </el-input>
    </div>
    <div class="icrCollapse_item">
      <span class="item-title">基本硬件</span>
      <el-row class="item-content">
        <el-col :span="8">
          内存(MB)
        </el-col>
        <el-col :span="16">
          <el-input-number
            ref="ram"
            v-model="config.ram"
            :min="1024"
            :max="16384"
            size="mini"
            style="width: 100%"
            :disabled="disabled"
            @input.native="disposalRange(config, 'ram', null, 1024, 16384)"
          />
        </el-col>
      </el-row>
      <el-row class="item-content">
        <el-col :span="8">
          VCPU数量
        </el-col>
        <el-col :span="16">
          <el-input-number
            ref="vcpus"
            v-model="config.vcpus"
            :min="1"
            :max="16"
            size="mini"
            style="width: 100%"
            :disabled="disabled"
            @input.native="disposalRange(config, 'vcpus', null, 1, 16)"
          />
        </el-col>
      </el-row>
    </div>
    <IcrCollapse title="硬盘（单位：GB）">
      <el-button slot="header-actions" :disabled="disabled" type="text" @click.stop="addHardDiskClick"><i class="iconfont icon-zengjia" /></el-button>
      <div v-if="config.disk && config.disk.length">
        <div v-for="(item, index) in config.disk" :key="item.name + (index + 1)">
          <el-row class="item-content">
            <el-col :span="8">
              {{ (index === 0 ? '*' : '') + item.name + (index + 1) }}
            </el-col>
            <el-col :span="12">
              <el-input-number
                ref="capacity"
                v-model="item.capacity"
                :min="1"
                :max="500"
                size="mini"
                style="width: 100%"
                :disabled="disabled"
                @input.native="disposalRange(item, 'capacity', index, 1, 500)"
              />
            </el-col>
            <el-col style="line-height: 30px;text-align: center" :span="4">
              <el-button :disabled="disabled" size="mini" type="text" @click="confirmDelete(index, 'HardDisk')"><i class="iconfont icon-shanchu" /></el-button>
            </el-col>
          </el-row>

        </div>
      </div>
      <div v-else class="no_data">暂无数据</div>
    </IcrCollapse>
    <IcrCollapse title="网络适配器">
      <el-button slot="header-actions" :disabled="disabled" type="text" @click.stop="addNetworkAdapterClick"><i class="iconfont icon-zengjia" /></el-button>
      <icr-table
        ref="networkTable"
        :columns="networkTable.columns"
        :data="config.nics"
      />
    </IcrCollapse>
    <el-dialog
      title="选择靶机模板"
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
        <el-form-item label="模板分类" prop="templateClassify">
          <el-select
            v-model="dialogForm.templateClassify"
            placeholder="请选择模板分类"
            @change="getTemplateList(true)"
          >
            <el-option
              v-for="item in templateClassifyOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="目标分类" prop="targetClassify">
          <el-select
            v-model="dialogForm.targetClassify"
            placeholder="请选择目标分类"
            @change="getTemplateList(true)"
          >
            <el-option
              v-for="item in ImageTargetClassifyOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="选择模板" prop="template">
          <el-select
            v-model="dialogForm.template"
            placeholder="请选择模板"
          >
            <el-option
              v-for="item in templateOptions"
              :key="item.id"
              :label="item.name || item.image_info.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="dialogForm.templateClassify === 3" label="分配方式" prop="allocation">
          <el-radio-group v-model="dialogForm.allocation">
            <el-radio :label="1">系统分配</el-radio>
            <el-radio :label="2">分发时指定</el-radio>
          </el-radio-group>
        </el-form-item>
      </icr-form>
    </el-dialog>
    <el-dialog
      title="网络适配器设置"
      :visible.sync="networkAdapterDialogVisible"
      width="946px"
      :before-close="networkAdapterHandleClose"
      custom-class="app-main"
      append-to-body
    >
      <icr-form
        ref="networkAdapterDialogForm"
        label-width="82px"
        class="networkAdapterDialogForm"
        :model="networkAdapterDialogForm"
        :rules="networkAdapterDialogRules"
        :fields="networkAdapterModelFormFields"
        :disabled="disabled"
        @cancel="networkAdapterHandleClose"
        @confirm="networkAdapterSubmit"
        @submit.native.prevent
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="接口名称" prop="interfaceName">
              <el-input v-model="networkAdapterDialogForm.interfaceName" placeholder="请输入接口名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="MAC地址" label-width="90px" prop="MACAddress">
              <el-input v-model="networkAdapterDialogForm.MACAddress" placeholder="请输入MAC地址">
                <template slot="append">
                  <el-button
                    type="text"
                    style="padding: 13px 15px;color: #00AD84;"
                    @click="networkAdapterDialogForm.MACAddress = genUnicastMac()"
                  >随机生成</el-button></template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="网卡类型" prop="cardType">
              <el-select
                v-model="networkAdapterDialogForm.cardType"
                placeholder="请选择网卡类型"
              >
                <el-option
                  v-for="item in cardTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="选择子网" label-width="90px" prop="subnetId">
              <el-select
                v-model="networkAdapterDialogForm.subnetId"
                placeholder="请选择子网"
              >
                <el-option
                  v-for="item in subnetOptions"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label-width="10px">
              <el-radio v-model="networkAdapterDialogForm.getIPType" :label="0" @change="selectChange({prop: 'getIPType'})">自动获取IP地址</el-radio>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label-width="10px">
              <el-radio v-model="networkAdapterDialogForm.getIPType" :label="1" @change="selectChange({prop: 'getIPType'})">手动获取IP地址</el-radio>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-show="networkAdapterDialogForm.getIPType === 1" :gutter="20">
          <el-col :span="12">
            <el-form-item label="IP地址" prop="ip">
              <el-input v-model="networkAdapterDialogForm.ip" placeholder="请输入IP地址" :disabled="networkAdapterDialogForm.getIPType === 0" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="子网掩码" label-width="90px" prop="mask">
              <el-input v-model="networkAdapterDialogForm.mask" placeholder="请输入子网掩码" :disabled="networkAdapterDialogForm.getIPType === 0" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="默认网关" prop="defaultGateway">
              <el-input v-model="networkAdapterDialogForm.defaultGateway" placeholder="请输入默认网关" :disabled="networkAdapterDialogForm.getIPType === 0" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label-width="10px">
              <el-radio v-model="networkAdapterDialogForm.getDNSServerType" :label="0" @change="selectChange({prop: 'getDNSServerType'})">自动获取DNS服务器地址</el-radio>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label-width="10px">
              <el-radio v-model="networkAdapterDialogForm.getDNSServerType" :label="1" @change="selectChange({prop: 'getDNSServerType'})">使用DNS服务器地址</el-radio>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-show="networkAdapterDialogForm.getDNSServerType === 1" :gutter="20">
          <el-col :span="12">
            <el-form-item label="首选DNS" prop="preference">
              <el-input v-model="networkAdapterDialogForm.preference" placeholder="请输入首选DNS" :disabled="networkAdapterDialogForm.getDNSServerType === 0" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="备用DNS" label-width="90px" prop="standby">
              <el-input v-model="networkAdapterDialogForm.standby" placeholder="请输入备用DNS" :disabled="networkAdapterDialogForm.getDNSServerType === 0" />
            </el-form-item>
          </el-col>
        </el-row>
      </icr-form>
    </el-dialog>
    <icr-confirm-delete ref="confirmDelete" :title="`删除${descTypeName}`" :desc="`您即将删除该${descTypeName}, 确定删除?`" />
  </div>
</template>

<script>
import { cloneDeep } from 'lodash-es'
import { v4 as uuidv4 } from 'uuid'
import IcrForm from '@/components/form'
import IcrCollapse from '../../../components/collapse.vue'
import IcrTable from '@/components/table'
import IcrTooltip from '@/components/tooltip.vue'
import { mapToSelectionOptions } from '@/utils/'
import {
  templateClassify, ImageTargetClassify, cardTypes, CpuCores } from '@/const/resource'
import { alonetargetRetrieve } from '@/api/target'
import { physicalPaging } from '@/api/resource'
import { alonetargetClassifylist, virtualResourceImageClassifylist } from '@/api/scene'
import {
  scenetargetSubnetList
} from '@/api/scene'
import { mapGetters } from 'vuex'
import { required, isIpv4, isMask, isMac } from '@/utils/validate-helper'
import { genUnicastMac, checkIp, disposalRange } from '@/utils/index'
import IcrConfirmDelete from '@/components/confirm-delete.vue'
const templateClassifyOptions = mapToSelectionOptions(templateClassify)

const cardTypeOptions = mapToSelectionOptions(cardTypes)

const ImageTargetClassifyOptions = mapToSelectionOptions(ImageTargetClassify)

const descTypeMaps = new Map([
  ['NetworkAdapter', '网络适配器'],
  ['HardDisk', '硬盘']
])

export default {
  name: 'Config',
  components: {
    IcrForm,
    IcrCollapse,
    IcrTable,
    // eslint-disable-next-line vue/no-unused-components
    IcrTooltip,
    IcrConfirmDelete
  },
  props: {
    // eslint-disable-next-line vue/require-default-prop
    data: Object
  },
  inject: ['getEditor'],
  data() {
    return {
      descTypeName: '',
      networkTable: {
        columns: [
          { prop: 'name', label: '接口名称' },
          {
            prop: 'mac',
            label: 'MAC地址',
            width: 160,
            render: (scope) => {
              return (
                <div class='last_td'>
                  <div class='icr_tooltip'>
                    <icr-tooltip content={ scope.row.mac } />
                  </div>
                  <div class='text_buttons'>
                    <el-button
                      type='text'
                      icon='iconfont icon-bianji'
                      size='mini'
                      onclick={() => {
                        this.networkAdapterConfigClick(scope.row)
                      }}
                    ></el-button>
                    <el-button
                      type='text'
                      icon='iconfont icon-shanchu'
                      size='mini'
                      disabled={ this.disabled }
                      onclick={() => {
                        this.confirmDelete(scope, 'NetworkAdapter')
                      }}
                    ></el-button>
                  </div>
                </div>
              )
            }
          }
        ]
      },
      activeNames: ['1', '2', '3', '4', '5'],
      cupOptions: mapToSelectionOptions(CpuCores),
      dialogVisible: false,
      dialogForm: {
        templateClassify: '',
        targetClassify: '',
        template: '',
        allocation: ''
      },
      dialogRules: {
        templateClassify: [required('模板分类')],
        template: [required('模板')],
        allocation: [required('分配方式', { required: false })]
      },
      templateClassifyOptions,
      ImageTargetClassifyOptions,
      templateOptions: [],
      subnetOptions: [],
      networkAdapterRow: {},
      networkAdapterDialogVisible: false,
      networkAdapterDialogForm: {
        interfaceName: '',
        MACAddress: '',
        cardType: 1,
        getIPType: 0,
        ip: '',
        mask: '',
        subnetId: '',
        defaultGateway: '',
        getDNSServerType: 0,
        preference: '',
        standby: ''
      },
      networkAdapterDialogRules: {
        interfaceName: [required('接口名称')],
        MACAddress: [isMac('MAC地址', { required: true })],
        cardType: [required('网卡类型')],
        subnetId: [required('子网')],
        ip: [isIpv4('IP地址', { required: false })],
        mask: [isMask('子网掩码', { required: false })],
        defaultGateway: [isIpv4('默认网关', { required: false })],
        preference: [isIpv4('首选DNS', { required: false })],
        standby: [isIpv4('备用DNS', { required: false })]
      },
      networkAdapterModelFormFields: [],
      cardTypeOptions,
      operationType: '',
      disabled: false
    }
  },
  computed: {
    ...mapGetters(['sceneId']),
    config() {
      return this.data.attrs
    }
  },
  watch: {
    'dialogForm.templateClassify': function(val) {
      if (val === 3) {
        this.dialogRules.allocation = [required('分配方式')]
        this.dialogForm.allocation = ''
      }
    },
    'networkAdapterDialogForm.getIPType': function(val) {
      if (val === 0) {
        this.networkAdapterDialogRules.ip = [isIpv4('IP地址', { required: false })]
        this.networkAdapterDialogRules.mask = [isMask('子网掩码', { required: false })]
        this.networkAdapterDialogRules.defaultGateway = [isIpv4('默认网关', { required: false })]
        this.$refs.networkAdapterDialogForm.$refs.inner_form.clearValidate(['ip', 'mask', 'defaultGateway'])
      } else {
        this.networkAdapterDialogRules.ip = [isIpv4('IP地址', { required: true, filterBroadcast: true })]
        this.networkAdapterDialogRules.mask = [isMask('子网掩码', { required: true })]
        this.networkAdapterDialogRules.defaultGateway = [isIpv4('默认网关', { required: true, filterBroadcast: true })]
      }
    }
  },
  created() {
    const editor = this.getEditor()
    const status = editor.curDebuggerStatus
    this.disabled = [1, 2, 3].includes(status)
  },
  methods: {
    genUnicastMac,
    selectChange(data) {
      if (data.prop === 'portMode') {
        this.networkAdapterDialogForm.getIPType = 0
        this.networkAdapterDialogForm.ip = ''
        this.networkAdapterDialogForm.mask = ''
        this.networkAdapterDialogForm.defaultGateway = ''
        this.networkAdapterDialogForm.getDNSServerType = 0
        this.networkAdapterDialogForm.preference = ''
        this.networkAdapterDialogForm.standby = ''
      }
      if (data.prop === 'getIPType') {
        if (this.networkAdapterDialogForm[data.prop] === 0) {
          this.networkAdapterDialogForm.ip = ''
          this.networkAdapterDialogForm.mask = ''
          this.networkAdapterDialogForm.defaultGateway = ''
          this.networkAdapterDialogForm.preference = ''
          this.networkAdapterDialogForm.standby = ''
        }
        this.networkAdapterDialogForm.getDNSServerType = this.networkAdapterDialogForm[data.prop]
      }
      if (data.prop === 'getDNSServerType') {
        if (this.networkAdapterDialogForm[data.prop] === 0) {
          this.networkAdapterDialogForm.ip = ''
          this.networkAdapterDialogForm.mask = ''
          this.networkAdapterDialogForm.defaultGateway = ''
          this.networkAdapterDialogForm.preference = ''
          this.networkAdapterDialogForm.standby = ''
        }
        this.networkAdapterDialogForm.getIPType = this.networkAdapterDialogForm[data.prop]
      }
    },
    addHardDiskClick() {
      this.config.disk.push({
        name: '硬盘',
        capacity: 0
      })
    },
    disposalRange() {
      disposalRange.apply(this, arguments)
    },
    getTemplateList(isRestTemplate) {
      if (isRestTemplate) {
        this.dialogForm.template = ''
        this.$nextTick(() => {
          this.$refs.dialogForm.$refs.inner_form.clearValidate('template')
        })
      }
      if (!this.dialogForm.templateClassify) {
        this.templateOptions = []
        return
      }
      const params = {
        search_info: {}
      }
      if (this.dialogForm.targetClassify || this.dialogForm.targetClassify === 0) {
        params.search_info.target_classify = this.dialogForm.targetClassify
      }
      if (this.dialogForm.templateClassify === 1) {
        alonetargetClassifylist(params).then((res) => {
          if (res.status === 0) {
            console.log(res)
            if (res?.data?.data?.length) {
              this.templateOptions = res.data.data
            } else {
              this.dialogForm.template = ''
              this.templateOptions = []
            }
          }
        })
      } else if (this.dialogForm.templateClassify === 2) {
        virtualResourceImageClassifylist(params).then((res) => {
          if (res.status === 0) {
            console.log(res)
            this.templateOptions = res?.data?.data || []
          }
        })
      } else if (this.dialogForm.templateClassify === 3) {
        params.page_info = {
          page_num: 1,
          page_size: 10000
        }
        physicalPaging(params).then((res) => {
          if (res.status === 0) {
            console.log(res)
            this.templateOptions = res?.data?.data || []
          }
        })
      }
    },
    submit() {
      for (const nic of this.config.nics) {
        const self_eth_id_list = this.data.connections.map(it => it.self_eth_id)
        if (self_eth_id_list.includes(nic.id)) {
          return this.$message({
            message: '已经有链路链接到已有接口，请先修改链路接口设置！',
            type: 'error'
          })
        }
      }
      if (!this.dialogForm.template) {
        return this.handleClose()
      }
      if (this.dialogForm.templateClassify === 1) {
        alonetargetRetrieve({
          target_id: this.dialogForm.template
        }).then((res) => {
          if (res.status === 0) {
            this.setTemplateData()
            this.config.ram = res?.data?.data?.ram || 0
            this.config.vcpus = (res?.data?.data?.vcpus || '') + ''
            this.config.disk = res?.data?.data?.disk.map((item) => ({
              name: '硬盘',
              capacity: item
            }))
            this.config.nics = res?.data?.data?.nics.map((item) => ({
              id: uuidv4(),
              name: item.name,
              mac: genUnicastMac(),
              subnet_id: '',
              network_type: 1,
              ip_info: {
                ip_type: 0,
                ip_address: '',
                mask: '',
                gateway: ''
              },
              dns_info: {
                dns_type: 0,
                prefer_DNS: '',
                backup_DNS: ''
              }
            }))
            this.handleClose()
          }
        })
      } else if (this.dialogForm.templateClassify === 2) {
        this.setTemplateData()
        this.setDefalutData()
        this.handleClose()
      } else if (this.dialogForm.templateClassify === 3) {
        this.setTemplateData()
        this.setDefalutData()
        this.handleClose()
      }
    },
    selectTemplate() {
      this.dialogForm.templateClassify = this.config.image_info.classify
      this.dialogForm.targetClassify = this.config.image_info.target_classify
      this.dialogForm.template = this.config.image_info.target_id
      this.dialogForm.allocation = ''
      this.getTemplateList(false)
      this.dialogVisible = true
    },
    setTemplateData() {
      for (const item of this.templateOptions) {
        if (item.id === this.dialogForm.template) {
          this.config.image_info.image_id = item.image_info.image_id
          this.config.image_info.name = item.image_info.name
          this.config.image_info.target_name = item.name || item.image_info.name
        }
      }
      this.config.image_info.target_id = this.dialogForm.template
      this.config.image_info.target_classify = this.dialogForm.targetClassify
      this.config.image_info.classify = this.dialogForm.templateClassify
    },
    setDefalutData() {
      this.config.ram = 2048
      this.config.vcpus = 2
      this.config.disk = [
        {
          name: '硬盘',
          capacity: 40
        }
      ]
      this.config.nics = []
    },
    handleClose() {
      this.dialogVisible = false
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
    networkAdapterHandleClose() {
      this.networkAdapterDialogVisible = false
      this.networkAdapterRow = {}
      this.restFieldEmpty(this.networkAdapterDialogForm)
      this.networkAdapterDialogForm.cardType = 1
      this.networkAdapterDialogForm.getIPType = 0
      this.networkAdapterDialogForm.getDNSServerType = 0
    },
    restFieldEmpty(target) {
      for (const key in target) {
        if (Object.hasOwnProperty.call(target, key)) {
          target[key] = ''
        }
      }
    },
    quoteObject(source, target) {
      for (const key in source) {
        if (Object.hasOwnProperty.call(source, key)) {
          if (typeof (source[key]) === 'object' && source[key] !== null) {
            this.quoteObject(source[key], target[key])
          } else {
            target[key] = source[key]
          }
        }
      }
    },
    networkAdapterSubmit() {
      const name_list = this.config.nics.filter(item => item.id !== this.networkAdapterRow.id).map(item => item.name)
      if (name_list.includes(this.networkAdapterDialogForm.interfaceName)) {
        return this.$message({
          message: '接口名称已存在',
          type: 'error'
        })
      }
      const mac_list = this.config.nics.filter(item => item.id !== this.networkAdapterRow.id).map(item => item.mac)
      if (mac_list.includes(this.networkAdapterDialogForm.MACAddress)) {
        return this.$message({
          message: 'MAC地址已存在',
          type: 'error'
        })
      }
      if (this.networkAdapterDialogForm.getIPType === 1) {
        const subnet_info = this.subnetOptions.find((item) => this.networkAdapterDialogForm.subnetId === item.id)
        if (!checkIp(this.networkAdapterDialogForm.ip, subnet_info.sub_mask, subnet_info.subnet_ip)) {
          return this.$message({
            message: 'IP地址不在选择的子网内',
            type: 'error'
          })
        }
        if (!checkIp(this.networkAdapterDialogForm.defaultGateway, this.networkAdapterDialogForm.mask, this.networkAdapterDialogForm.ip)) {
          return this.$message({
            message: '默认网关与IP地址不在同一网段',
            type: 'error'
          })
        }
      }
      const obj = {
        name: this.networkAdapterDialogForm.interfaceName,
        mac: this.networkAdapterDialogForm.MACAddress,
        subnet_id: this.networkAdapterDialogForm.subnetId,
        network_type: this.networkAdapterDialogForm.cardType,
        ip_info: {
          ip_type: this.networkAdapterDialogForm.getIPType,
          ip_address: this.networkAdapterDialogForm.ip,
          mask: this.networkAdapterDialogForm.mask,
          gateway: this.networkAdapterDialogForm.defaultGateway
        },
        dns_info: {
          dns_type: this.networkAdapterDialogForm.getDNSServerType,
          prefer_DNS: this.networkAdapterDialogForm.preference,
          backup_DNS: this.networkAdapterDialogForm.standby
        }
      }
      if (this.operationType === 'add') {
        this.config.nics.push({
          id: uuidv4(),
          ...cloneDeep(obj)
        })
      } else if (this.operationType === 'edit') {
        this.quoteObject(obj, this.networkAdapterRow)
      }
      this.networkAdapterHandleClose()
    },
    addNetworkAdapterClick() {
      this.getSubnetList()
      this.operationType = 'add'
      this.networkAdapterDialogVisible = true
      // this.networkAdapterDialogForm.MACAddress = genUnicastMac()
    },
    delHardDiskClick(index) {
      if (index === 0) {
        return this.$message({
          type: 'warning',
          message: '不能删除默认硬盘！'
        })
      }
      this.config.disk.splice(index, 1)
    },
    networkAdapterConfigClick(row) {
      this.getSubnetList()
      this.operationType = 'edit'
      this.networkAdapterDialogVisible = true
      this.networkAdapterRow = row
      this.networkAdapterDialogForm = {
        interfaceName: row.name,
        MACAddress: row.mac,
        subnetId: row.subnet_id,
        cardType: row.network_type,
        getIPType: row.ip_info?.ip_type,
        ip: row.ip_info.ip_address,
        mask: row.ip_info.mask,
        defaultGateway: row.ip_info.gateway,
        getDNSServerType: row.dns_info.dns_type,
        preference: row.dns_info.prefer_DNS,
        standby: row.dns_info.backup_DNS
      }
    },
    confirmDelete(data, type) {
      this.descTypeName = descTypeMaps.get(type)
      this.$refs.confirmDelete.prompt().then(() => {
        this[`del${type}Click`](data)
      })
    },
    delNetworkAdapterClick(scope) {
      const self_eth_id_list = this.data.connections.map(it => it.self_eth_id)
      if (self_eth_id_list.includes(scope.row.id)) {
        return this.$message({
          message: '已经有链路链接该接口，请先修改链路接口设置！',
          type: 'error'
        })
      }
      this.config.nics.splice(scope.$index, 1)
    }
  }
}
</script>
<style lang="scss" scoped>
  .pc-config {
    .network_adapter_list {
      .network_adapter_title {
        margin-bottom: 10px;
        color: rgba(255, 255, 255, 0.3);
      }
      .network_adapter_list_item {
        background-color: rgba(255, 255, 255, 0.1);
        padding: 4px;
        .network_adapter_list_item_name {
          background-color: rgba(0, 0, 0, 0.2);
          margin-bottom: 4px;
        }
        .network_adapter_list_item_mac {
          background-color: rgba(0, 0, 0, 0.2);
        }
        .network_adapter_list_item_operation {
          justify-content: center;
          margin-top: 16px;
          display: none;
          >i {
            cursor: pointer;
          }
        }
        &:hover {
          .network_adapter_list_item_operation {
            display: flex;
          }
        }
        ::v-deep {
          .el-input {
            .el-input__inner {
              background-color: rgba(0, 0, 0, 0.2);
            }
          }
        }
      }
    }
    .no_data {
      color: rgba(255, 255, 255, 0.7);
      text-align: center;
    }
  }
  .networkAdapterDialogForm {
    ::v-deep.el-row:last-child {
      .el-form-item {
        margin-bottom: 0;
      }
    }
  }
</style>
