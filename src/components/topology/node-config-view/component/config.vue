<template>
  <div class="Config">
    <icr-form
      ref="form"
      label-width="80px"
      class="form"
      :display-actions="false"
    >
      <el-collapse v-model="activeNames">
        <el-collapse-item title="靶机模板" name="1">
          <el-form-item label="靶机模板">
            <el-row>
              <el-col :span="18">
                <el-input v-model="formData.targetName" readonly />
              </el-col>
              <el-col :span="5" :offset="1">
                <el-button type="primary" size="mini" @click="selectTemplate">选择</el-button>
              </el-col>
            </el-row>
          </el-form-item>
        </el-collapse-item>
        <el-collapse-item v-if="['notebook', 'desktop'].includes(deviceType)" title="基本硬件" name="2">
          <el-form-item label="内 存">
            <el-row>
              <el-col :span="18">
                <el-input-number
                  ref="memory"
                  v-model="formData.memory"
                  :min="0"
                  style="width: 100%"
                  @input.native="eventDisposalRangeChange(formData, 'memory')"
                />
              </el-col>
              <el-col :span="6">
                <div style="color: #fff;margin-left: 10px">MB</div>
              </el-col>
            </el-row>
          </el-form-item>
          <el-form-item label="核心数量">
            <el-row>
              <el-col :span="18">
                <el-select
                  v-model="formData.CPUNumber"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in cupOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
                <!-- <el-autocomplete
                  v-model="formData.CPUNumber"
                  style="width: 100%"
                  :fetch-suggestions="querySearch"
                  placeholder="请输入内容"
                /> -->
              </el-col>
              <!-- <el-col :span="6">
                <div style="color: #fff">MB</div>
              </el-col> -->
            </el-row>
          </el-form-item>
          <el-form-item label="USB启用">
            <el-switch
              v-model="formData.USBSwitch"
              active-color="#13ce66"
              inactive-color="#ff4949"
            />
          </el-form-item>
          <el-form-item label="显示器">
            <span style="color: #fff">默认分辨率600*800</span>
          </el-form-item>
        </el-collapse-item>
        <el-collapse-item v-if="['notebook', 'desktop'].includes(deviceType)" title="硬盘" name="3">
          <template slot="title">
            <el-row style="flex: 1">
              <el-col :span="18">
                <span>硬盘</span>
              </el-col>
              <el-col :span="6">
                <el-button v-show="activeNames.includes('3')" type="text" @click.stop="addHardDiskClick">添加</el-button>
              </el-col>
            </el-row>
          </template>
          <el-table
            :data="formData.hardDisk"
            style="width: 100%"
          >
            <el-table-column
              prop="name"
              label="硬盘"
            >
              <template slot-scope="e">
                <span>{{ e.row.name + (e.$index + 1) }}</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="capacity"
              label="容量GB"
            >
              <template slot-scope="e">
                <el-input-number
                  :ref="'capacity' + e.$index"
                  v-model="e.row.capacity"
                  :min="0"
                  style="width: 100%"
                  @input.native="eventDisposalRangeChange(e.row, 'capacity', e.$index)"
                />
              </template>
            </el-table-column>
            <el-table-column
              width="80"
            >
              <template slot-scope="e">
                <el-button type="text" @click="delHardDiskClick(e.$index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-collapse-item>
        <el-collapse-item title="网络适配器" name="4">
          <template slot="title">
            <el-row style="flex: 1">
              <el-col :span="18">
                <span>网络适配器</span>
              </el-col>
              <el-col :span="6">
                <el-button v-show="activeNames.includes('4')" type="text" @click.stop="addNetworkAdapterClick">添加</el-button>
              </el-col>
            </el-row>
          </template>
          <el-table
            :data="formData.networkAdapter"
            style="width: 100%"
          >
            <template v-if="['desktop', 'notebook'].includes(deviceType)">
              <el-table-column
                prop="interfaceName"
                label="接口名称"
              >
                <template slot-scope="e">
                  <el-input v-model="e.row.interfaceName" />
                </template>
              </el-table-column>
              <el-table-column
                prop="MACAddress"
                label="MAC地址"
              >
                <template slot-scope="e">
                  <el-input v-model="e.row.MACAddress" disabled />
                </template>
              </el-table-column>
            </template>
            <template v-else-if="['layerTwoSwitches', 'layerThreeSwitches', 'virtualNetwork'].includes(deviceType)">
              <el-table-column
                prop="interfaceName"
                label="接口名称"
              />
              <el-table-column
                prop="portMode"
                label="端口模式"
              />
            </template>
            <template v-else-if="deviceType === 'router'">
              <el-table-column
                prop="interfaceName"
                label="接口名称"
              />
              <el-table-column
                prop="ipAddress"
                label="IP地址"
              />
            </template>
            <el-table-column
              width="120"
            >
              <template slot-scope="e">
                <el-button type="text" @click="networkAdapterConfigClick(e.row)">配置</el-button>
                <el-button type="text" @click="delNetworkAdapterClick(e.row, e.$index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-collapse-item>
        <el-collapse-item v-if="deviceType === 'router'" title="端口映射" name="5">
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
              prop="internal"
              label="内部IP:端口"
            >
              <template slot-scope="e">
                <span>{{ `${e.row.internal}:${e.row.internalPort}` }}</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="external"
              label="外部IP:端口"
            >
              <template slot-scope="e">
                <span>{{ `${e.row.external}:${e.row.externalPort}` }}</span>
              </template>
            </el-table-column>
            <el-table-column
              width="66px"
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
      title="选择靶机模板"
      :visible.sync="dialogVisible"
      width="460px"
      :before-close="handleClose"
      append-to-body
      custom-class="app-main"
    >
      <icr-form
        ref="dialogForm"
        label-width="80px"
        class="topologyDialogForm dialogForm"
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
            style="width: 100%"
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
            style="width: 100%"
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
            style="width: 100%"
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
      title="路由接口设置"
      :visible.sync="routerDialogVisible"
      width="460px"
      :before-close="routerHandleClose"
      custom-class="app-main"
      append-to-body
    >
      <icr-form
        ref="routerDialogForm"
        label-width="80px"
        class="topologyDialogForm routerDialogForm"
        :model="routerDialogForm"
        :rules="routerDialogRules"
        :fields="routerModelFormFields"
        @cancel="routerHandleClose"
        @confirm="routerSubmit"
        @submit.native.prevent
      >
        <el-form-item label="选择子网" prop="subnet">
          <el-select
            v-model="routerDialogForm.subnet"
            placeholder="请选择子网"
            style="width: 100%"
          >
            <el-option
              v-for="item in subnetOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="IP地址" prop="ipAddress">
          <el-input v-model="routerDialogForm.ipAddress" placeholder="请输入IP地址" />
        </el-form-item>
      </icr-form>
    </el-dialog>
    <el-dialog
      title="添加端口映射"
      :visible.sync="portMapDialogVisible"
      width="460px"
      :before-close="portMapHandleClose"
      custom-class="app-main"
      append-to-body
    >
      <icr-form
        ref="portMapDialogForm"
        label-width="66px"
        class="topologyDialogForm portMapDialogForm"
        :model="portMapDialogForm"
        :rules="portMapDialogRules"
        :fields="portMapModelFormFields"
        @cancel="portMapHandleClose"
        @confirm="portMapSubmit"
        @submit.native.prevent
      />
    </el-dialog>
    <el-dialog
      title="交换机接口设置"
      :visible.sync="jhjDialogVisible"
      width="460px"
      :before-close="jhjHandleClose"
      custom-class="app-main"
      append-to-body
    >
      <icr-form
        ref="jhjDialogForm"
        label-width="80px"
        class="topologyDialogForm jhjDialogForm"
        :model="jhjDialogForm"
        :rules="jhjDialogRules"
        :fields="jhjModelFormFields"
        @cancel="jhjHandleClose"
        @confirm="jhjSubmit"
        @submit.native.prevent
      >
        <el-form-item label="网卡类型" prop="cardType">
          <el-select
            v-model="jhjDialogForm.cardType"
            placeholder="请选择网卡类型"
            style="width: 100%"
          >
            <el-option key="1" label="virto" value="1" />
            <el-option key="2" label="e1000" value="2" />
            <el-option key="3" label="rtl8139" value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="端口模式" prop="portMode">
          <el-select
            v-model="jhjDialogForm.portMode"
            placeholder="请选择端口模式"
            style="width: 100%"
            @change="jhjDialogForm.subnet = ''"
          >
            <el-option key="access" label="access" value="access" />
            <el-option key="trunk" label="trunk" value="trunk" />
          </el-select>
        </el-form-item>
        <template v-if="jhjDialogForm.portMode === 'access'">
          <el-form-item label="选择子网" prop="subnet">
            <el-select
              v-model="jhjDialogForm.subnet"
              placeholder="请选择子网"
              style="width: 100%"
            >
              <el-option
                v-for="item in subnetOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </template>
      </icr-form>
    </el-dialog>
    <el-dialog
      title="网络适配器设置"
      :visible.sync="networkAdapterDialogVisible"
      width="500px"
      :before-close="networkAdapterHandleClose"
      custom-class="app-main"
      append-to-body
    >
      <icr-form
        ref="networkAdapterDialogForm"
        label-width="84px"
        class="topologyDialogForm networkAdapterDialogForm"
        :model="networkAdapterDialogForm"
        :rules="networkAdapterDialogRules"
        :fields="networkAdapterModelFormFields"
        @cancel="networkAdapterHandleClose"
        @confirm="networkAdapterSubmit"
        @submit.native.prevent
      >
        <el-form-item label="选择子网" prop="subnetId">
          <el-select
            v-model="networkAdapterDialogForm.subnetId"
            placeholder="请选择子网"
            style="width: 100%"
          >
            <el-option
              v-for="item in subnetOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label-width="40px">
              <el-radio v-model="networkAdapterDialogForm.getIPType" :label="0" @change="selectChange({prop: 'getIPType'})">自动获取IP地址</el-radio>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label-width="40px">
              <el-radio v-model="networkAdapterDialogForm.getIPType" :label="1" @change="selectChange({prop: 'getIPType'})">手动获取IP地址</el-radio>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-show="networkAdapterDialogForm.getIPType === 1">
          <el-form-item label="IP地址" prop="ip">
            <el-input v-model="networkAdapterDialogForm.ip" placeholder="请输入IP地址" :disabled="networkAdapterDialogForm.getIPType === 0" />
          </el-form-item>
          <el-form-item label="子网掩码" prop="mask">
            <el-input v-model="networkAdapterDialogForm.mask" placeholder="请输入子网掩码" :disabled="networkAdapterDialogForm.getIPType === 0" />
          </el-form-item>
          <el-form-item label="默认网关" prop="defaultGateway">
            <el-input v-model="networkAdapterDialogForm.defaultGateway" placeholder="请输入默认网关" :disabled="networkAdapterDialogForm.getIPType === 0" />
          </el-form-item>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label-width="40px">
              <el-radio v-model="networkAdapterDialogForm.getDNSServerType" :label="0" @change="selectChange({prop: 'getDNSServerType'})">自动获取DNS服务器地址</el-radio>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label-width="40px">
              <el-radio v-model="networkAdapterDialogForm.getDNSServerType" :label="1" @change="selectChange({prop: 'getDNSServerType'})">使用DNS服务器地址</el-radio>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-show="networkAdapterDialogForm.getDNSServerType === 1">
          <el-form-item label="首选DNS" prop="preference">
            <el-input v-model="networkAdapterDialogForm.preference" placeholder="请输入首选DNS" :disabled="networkAdapterDialogForm.getDNSServerType === 0" />
          </el-form-item>
          <el-form-item label="备用DNS" prop="standby">
            <el-input v-model="networkAdapterDialogForm.standby" placeholder="请输入备用DNS" :disabled="networkAdapterDialogForm.getDNSServerType === 0" />
          </el-form-item>
        </el-row>
      </icr-form>
    </el-dialog>
  </div>
</template>

<script>
import { v4 as uuidv4 } from 'uuid'
import IcrForm from '@/components/form'
import { mapToSelectionOptions } from '@/utils/'
import { cloneDeep } from 'lodash-es'
import {
  templateClassify,
  cardTypes, ImageTargetClassify, protocols, CpuCores } from '@/const/resource'
import { alonetargetRetrieve } from '@/api/target'
import { physicalPaging } from '@/api/resource'
import { alonetargetClassifylist, virtualResourceImageClassifylist } from '@/api/scene'
import {
  scenetargetSubnetList
} from '@/api/scene'
import { mapGetters } from 'vuex'
import { required, isIpv4, isMask, isInteger } from '@/utils/validate-helper'
import { genUnicastMac, checkIp } from '@/utils/index'

const templateClassifyOptions = mapToSelectionOptions(templateClassify)

const cardTypeOptions = mapToSelectionOptions(cardTypes)

const ImageTargetClassifyOptions = mapToSelectionOptions(ImageTargetClassify)

const protocolOptions = mapToSelectionOptions(protocols)

export default {
  name: 'Config',
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
      cupOptions: mapToSelectionOptions(CpuCores),
      activeNames: ['1', '2', '3', '4', '5'],
      restaurants: [],
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
      templateInfo: {},
      jhjDialogVisible: false,
      jhjDialogForm: {
        interfaceName: '',
        cardType: '',
        portMode: '',
        subnet: ''
      },
      jhjModelFormFields: [
        {
          label: '接口名称',
          type: 'input',
          prop: 'interfaceName'
        }
      ],
      jhjDialogRules: {
        interfaceName: [required('接口名称')],
        cardType: [required('网卡类型')],
        portMode: [required('端口模式')],
        subnet: [required('端口模式'), { required: false }]
      },
      networkAdapterRow: {},
      subnetOptions: [],
      routerDialogVisible: false,
      routerDialogForm: {
        interfaceName: '',
        subnet: '',
        ipAddress: ''
      },
      routerDialogRules: {
        interfaceName: [required('接口名称')],
        subnet: [required('子网')],
        ipAddress: [isIpv4('IP地址', { required: true, filterBroadcast: true })]
      },
      routerModelFormFields: [
        {
          label: '接口名称',
          type: 'input',
          prop: 'interfaceName'
        }
      ],
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
        MACAddress: [required('MAC地址')],
        cardType: [required('网卡类型')],
        subnetId: [required('子网')],
        ip: [isIpv4('IP地址', { required: false })],
        mask: [isMask('子网掩码', { required: false })],
        defaultGateway: [isIpv4('默认网关', { required: false })],
        preference: [isIpv4('首选DNS', { required: false })],
        standby: [isIpv4('备用DNS', { required: false })]
      },
      networkAdapterModelFormFields: [
        {
          label: '接口名称',
          type: 'input',
          prop: 'interfaceName'
        },
        {
          label: 'MAC地址',
          type: 'input',
          prop: 'MACAddress',
          disabled: true
        },
        {
          label: '网卡类型',
          type: 'select',
          prop: 'cardType',
          inputOption: {
            options: cardTypeOptions
          }
        }
      ],
      portMapDialogVisible: false,
      portMapDialogForm: {
        internal: '',
        internalPort: '',
        external: '',
        externalPort: '',
        protocol: ''
      },
      portMapDialogRules: {
        internal: [isIpv4('内部IP', { required: true })],
        internalPort: [isInteger('端口', { required: true })],
        external: [isIpv4('外部IP', { required: true })],
        externalPort: [isInteger('端口', { required: true })],
        protocol: [required('协议')]
      },
      portMapModelFormFields: [
        {
          label: '内部IP',
          type: 'input',
          prop: 'internal'
        },
        {
          label: '端口',
          type: 'input',
          prop: 'internalPort'
        },
        {
          label: '外部IP',
          type: 'input',
          prop: 'external'
        },
        {
          label: '端口',
          type: 'input',
          prop: 'externalPort'
        },
        {
          label: '协议',
          type: 'select',
          prop: 'protocol',
          inputOption: {
            options: protocolOptions
          }
        }
      ],
      operationType: ''
    }
  },
  computed: {
    ...mapGetters(['sceneId'])
  },
  watch: {
    'dialogForm.templateClassify': function(val) {
      if (val === 3) {
        this.dialogRules.allocation = [required('分配方式')]
        this.dialogForm.allocation = ''
      }
    },
    'jhjDialogForm.portMode': function(val) {
      if (val === 'access') {
        this.jhjDialogRules.subnet = [required('端口模式')]
      } else {
        this.jhjDialogRules.subnet = [required('端口模式'), { required: false }]
      }
    },
    'networkAdapterDialogForm.getIPType': function(val) {
      if (val === 0) {
        this.networkAdapterDialogRules.ip = [isIpv4('IP地址', { required: false })]
        this.networkAdapterDialogRules.mask = [isMask('子网掩码', { required: false })]
        this.networkAdapterDialogRules.defaultGateway = [isIpv4('默认网关', { required: false })]
        this.$refs.networkAdapterDialogForm.$refs.inner_form.clearValidate(['ip', 'mask', 'defaultGateway'])
      } else {
        this.networkAdapterDialogRules.ip = [isIpv4('IP地址', { required: true })]
        this.networkAdapterDialogRules.mask = [isMask('子网掩码', { required: true })]
        this.networkAdapterDialogRules.defaultGateway = [isIpv4('默认网关', { required: true })]
      }
    }
    // 'networkAdapterDialogForm.getDNSServerType': function(val) {
    //   if (val === 0) {
    //     this.networkAdapterDialogRules.preference = [isIpv4('首选DNS', { required: false })]
    //     this.networkAdapterDialogRules.standby = [isIpv4('备用DNS', { required: false })]
    //     this.$refs.networkAdapterDialogForm.$refs.inner_form.clearValidate(['preference', 'standby'])
    //   } else {
    //     this.networkAdapterDialogRules.preference = [isIpv4('首选DNS', { required: true })]
    //     this.networkAdapterDialogRules.standby = [isIpv4('备用DNS', { required: true })]
    //   }
    // }
  },
  created() {

  },
  mounted() {
    this.restaurants = this.loadAll()
  },
  methods: {
    eventDisposalRangeChange(data, prop, index, max) {
      const IntegerRegex = /^[1-9]*[1-9][0-9]*$/
      let ref = null
      if (index || index === 0) {
        ref = this.$refs[prop + index]
      } else {
        ref = this.$refs[prop]
      }
      const key = ref['displayValue']
      if (key) {
        if (key === '0') {
          data[prop] = 0
        } else {
          if (IntegerRegex.test(key)) {
            if (max && parseInt(key) > max) {
              data[prop] = max
              ref['userInput'] = max + ''
            } else {
              data[prop] = parseInt(key)
            }
          } else {
            ref['userInput'] = null
          }
        }
      } else {
        data[prop] = undefined
      }
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
    portMapSubmit() {
      this.formData.portMapList.push(cloneDeep(this.portMapDialogForm))
      this.portMapHandleClose()
    },
    portMapHandleClose() {
      this.portMapDialogVisible = false
      this.$refs.portMapDialogForm.$refs.inner_form.resetFields()
    },
    addPortMapClick() {
      this.portMapDialogVisible = true
    },
    networkAdapterHandleClose() {
      this.networkAdapterDialogVisible = false
      this.networkAdapterRow = {}
      this.restFieldEmpty(this.networkAdapterDialogForm)
      this.networkAdapterDialogForm.cardType = 1
      this.networkAdapterDialogForm.getIPType = 0
      this.networkAdapterDialogForm.getDNSServerType = 0
    },
    networkAdapterSubmit() {
      const name_list = this.formData.networkAdapter.filter(item => item.id !== this.networkAdapterRow.id).map(item => item.interfaceName)
      if (name_list.includes(this.networkAdapterDialogForm.interfaceName)) {
        return this.$message({
          message: '接口名称已存在',
          type: 'error'
        })
      }
      if (this.networkAdapterDialogForm.getIPType === 1) {
        if (!checkIp(this.networkAdapterDialogForm.defaultGateway, this.networkAdapterDialogForm.mask, this.networkAdapterDialogForm.ip)) {
          return this.$message({
            message: '子网掩码与网关ip不匹配',
            type: 'error'
          })
        }
      }
      if (this.operationType === 'add') {
        this.formData.networkAdapter.push(cloneDeep({ ...this.networkAdapterDialogForm, id: uuidv4() }))
      } else if (this.operationType === 'edit') {
        for (const key in this.networkAdapterRow) {
          if (Object.hasOwnProperty.call(this.networkAdapterRow, key)) {
            this.networkAdapterRow[key] = this.networkAdapterDialogForm[key]
          }
        }
      }
      this.networkAdapterHandleClose()
    },
    delPortMapClick(index) {
      this.formData.portMapList.splice(index, 1)
    },
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
    routerSubmit() {
      const name_list = this.formData.networkAdapter.filter(item => item.id !== this.networkAdapterRow.id).map(item => item.interfaceName)
      if (name_list.includes(this.routerDialogForm.interfaceName)) {
        return this.$message({
          message: '接口名称已存在',
          type: 'error'
        })
      }
      const subnet_id_list = this.formData.networkAdapter.filter(item => item.id !== this.networkAdapterRow.id).map(item => item.subnet)
      if (subnet_id_list.includes(this.routerDialogForm.subnet)) {
        return this.$message({
          message: '请勿重复添加子网',
          type: 'error'
        })
      }
      const subnet_info = this.subnetOptions.find((item) => this.routerDialogForm.subnet === item.id)
      if (!checkIp(this.routerDialogForm.ipAddress, subnet_info.sub_mask, subnet_info.subnet_ip)) {
        return this.$message({
          message: 'IP地址不在选择的子网内',
          type: 'error'
        })
      }
      if (this.operationType === 'add') {
        this.formData.networkAdapter.push(cloneDeep({ ...this.routerDialogForm, id: uuidv4() }))
      } else if (this.operationType === 'edit') {
        for (const key in this.networkAdapterRow) {
          if (Object.hasOwnProperty.call(this.networkAdapterRow, key)) {
            this.networkAdapterRow[key] = this.routerDialogForm[key]
          }
        }
      }
      this.routerHandleClose()
    },
    routerHandleClose() {
      this.routerDialogVisible = false
      this.networkAdapterRow = {}
      this.restFieldEmpty(this.routerDialogForm)
      // this.$refs.routerDialogForm.$refs.inner_form.resetFields()
    },
    jhjSubmit() {
      const name_list = this.formData.networkAdapter.filter(item => item.id !== this.networkAdapterRow.id).map(item => item.interfaceName)
      if (name_list.includes(this.jhjDialogForm.interfaceName)) {
        return this.$message({
          message: '接口名称已存在',
          type: 'error'
        })
      }
      if (this.operationType === 'add') {
        this.formData.networkAdapter.push(cloneDeep({ ...this.jhjDialogForm, id: uuidv4() }))
      } else if (this.operationType === 'edit') {
        for (const key in this.networkAdapterRow) {
          if (Object.hasOwnProperty.call(this.networkAdapterRow, key)) {
            this.networkAdapterRow[key] = this.jhjDialogForm[key]
          }
        }
      }
      this.jhjHandleClose()
    },
    jhjHandleClose() {
      this.jhjDialogVisible = false
      this.networkAdapterRow = {}
      this.restFieldEmpty(this.jhjDialogForm)
      // this.$refs.jhjDialogForm.$refs.inner_form.resetFields()
    },
    addHardDiskClick() {
      this.formData.hardDisk.push({
        name: '硬盘',
        capacity: 0
      })
    },
    delHardDiskClick(index) {
      this.formData.hardDisk.splice(index, 1)
    },
    addNetworkAdapterClick() {
      if (!this.subnetOptions.length) {
        this.getSubnetList()
      }
      this.operationType = 'add'
      if (['desktop', 'notebook'].includes(this.deviceType)) {
        this.networkAdapterDialogVisible = true
        this.networkAdapterDialogForm.MACAddress = genUnicastMac()
        // this.formData.networkAdapter.push({
        //   id: uuidv4(),
        //   interfaceName: '',
        //   MACAddress: genUnicastMac(),
        //   cardType: 1,
        //   portMode: '',
        //   VLAN: '',
        //   getIPType: 0,
        //   ip: '',
        //   mask: '',
        //   subnetId: '',
        //   defaultGateway: '',
        //   getDNSServerType: 0,
        //   preference: '',
        //   standby: ''
        // })
      } else if (this.deviceType === 'router') {
        this.routerDialogVisible = true
      } else if (['layerTwoSwitches', 'layerThreeSwitches', 'virtualNetwork'].includes(this.deviceType)) {
        this.jhjDialogVisible = true
      }
    },
    delNetworkAdapterClick(item, index) {
      const flag = this.nodeData.cableList.some(it => item.id === it.selfEthId)
      if (flag) {
        return this.$message({
          message: '已经有链路链接该接口，请先修改链路设置！',
          type: 'error'
        })
      }
      this.formData.networkAdapter.splice(index, 1)
    },
    networkAdapterConfigClick(row) {
      if (!this.subnetOptions.length) {
        this.getSubnetList()
      }
      this.operationType = 'edit'
      if (['desktop', 'notebook'].includes(this.deviceType)) {
        this.networkAdapterDialogVisible = true
        this.networkAdapterRow = row
        this.networkAdapterDialogForm = { ...row }
      } else if (this.deviceType === 'router') {
        this.routerDialogVisible = true
        this.networkAdapterRow = row
        this.routerDialogForm = { ...row }
      } else if (['layerTwoSwitches', 'layerThreeSwitches', 'virtualNetwork'].includes(this.deviceType)) {
        this.jhjDialogVisible = true
        this.networkAdapterRow = row
        this.jhjDialogForm = { ...row }
      }
    },
    restFieldEmpty(target) {
      for (const key in target) {
        if (Object.hasOwnProperty.call(target, key)) {
          target[key] = ''
        }
      }
    },
    submit() {
      if (!this.dialogForm.template) {
        return this.handleClose()
      }
      if (this.dialogForm.templateClassify === 1) {
        alonetargetRetrieve({
          target_id: this.dialogForm.template
        }).then((res) => {
          if (res.status === 0) {
            if (['notebook', 'desktop'].includes(this.deviceType)) {
              if (res?.data?.data?.nics?.length) {
                for (const item of this.formData.networkAdapter) {
                  const flag = this.nodeData.cableList.some(it => item.id === it.selfEthId)
                  if (flag) {
                    return this.$message.warning('已经有链路链接到网卡接口，请先修改链路设置!')
                  }
                }
              }
              this.setTemplateData()
              this.formData.memory = res?.data?.data?.ram || 0
              this.formData.CPUNumber = (res?.data?.data?.vcpus || '') + ''
              this.formData.USBSwitch = res?.data?.data?.usb?.[0]?.status === 1
              this.formData.hardDisk = res?.data?.data?.disk.map((item) => ({
                name: '硬盘',
                capacity: item
              }))
              this.formData.networkAdapter = res?.data?.data?.nics.map((item) => ({
                id: uuidv4(),
                interfaceName: item.name,
                // MACAddress: item.mac,
                MACAddress: genUnicastMac(),
                cardType: 1,
                getIPType: 0,
                ip: '',
                mask: '',
                subnetId: '',
                defaultGateway: '',
                getDNSServerType: 0,
                preference: '',
                standby: ''
              }))
              this.handleClose()
            } else {
              this.setTemplateData()
              this.handleClose()
            }
          }
        })
      } else if (this.dialogForm.templateClassify === 2) {
        this.setTemplateData()
        // this.formData.memory = 0
        // this.formData.CPUNumber = ''
        // this.formData.USBSwitch = true
        // this.formData.hardDisk = []
        // this.formData.networkAdapter = []
        this.handleClose()
      } else if (this.dialogForm.templateClassify === 3) {
        this.handleClose()
      }
    },
    selectTemplate() {
      this.dialogForm.templateClassify = this.formData.classify
      this.dialogForm.targetClassify = this.formData.targetClassify
      this.dialogForm.template = this.formData.targetId
      this.dialogForm.allocation = ''
      this.getTemplateList(false)
      this.dialogVisible = true
    },
    setTemplateData() {
      for (const item of this.templateOptions) {
        if (item.id === this.dialogForm.template) {
          this.formData.imageId = item.image_info.image_id
          this.formData.imageName = item.image_info.name
          this.formData.targetName = item.name || item.image_info.name
        }
      }
      this.formData.targetId = this.dialogForm.template
      this.formData.targetClassify = this.dialogForm.targetClassify
      this.formData.classify = this.dialogForm.templateClassify
    },
    handleClose() {
      this.dialogVisible = false
    },
    loadAll() {
      return [
        {
          value: '1'
        },
        {
          value: '2'
        },
        {
          value: '4'
        },
        {
          value: '6'
        },
        {
          value: '18'
        },
        {
          value: '32'
        }
      ]
    },
    createFilter(queryString) {
      return (restaurant) => {
        return (restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0)
      }
    },
    querySearch(queryString, cb) {
      const restaurants = this.restaurants
      const results = queryString ? restaurants.filter(this.createFilter(queryString)) : restaurants
      // 调用 callback 返回建议列表的数据
      cb(results)
    }
  }
}
</script>
<style lang="scss" scoped>
  .Config {
    ::v-deep {
      .el-form {
        .el-form-item {
          .el-select {
            width: 100%;
          }
          .el-input {
            width: 100%;
          }
        }
      }
    }
  }
</style>
