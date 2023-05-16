<template>
  <div class="configure">
    <icr-card style="width: 500px;min-width: 500px">
      <div slot="header" style="padding: 0;">
        <div class="hardware-options">
          <span class="hardware__option">硬件</span>
          <span class="hardware__option">配置</span>
        </div>
      </div>
      <div>
        <div
          v-for="(item, index) in configOptions"
          :key="index"
          class="hardware-options"
          :class="{ &quot;hardware-options_active&quot;: activeIndex === index }"
          @click="configTabChange(item, index)"
        >
          <span class="hardware__option">{{ item.name }}</span>
          <span class="hardware__option">{{ item.render(value[item.prop]) || item.defaultValue }}</span>
        </div>
      </div>
      <div class="actions" style="padding: 10px 20px;">
        <el-button @click="configDialogVisible = true, initAddConfigModel()">添加</el-button>
        <el-button @click="delConfig()">删除</el-button>
      </div>
    </icr-card>
    <div v-if="showEdit">
      <icr-card v-if="currentActiveConfigure === &quot;ram&quot;" style="width: 500px;margin-left: 32px;height: 100%;">
        <div slot="header" style="padding-left: 34px;">
          内存
        </div>
        <div class="configure-detail">
          <div class="configure-detail__item">
            <span class="label">虚拟机内存 : </span>
            <el-input-number
              v-model="value.ram"
              :min="1024"
              :max="1024 * 16"
              controls-position="right"
            /> MB
          </div>
        </div>
      </icr-card>
      <icr-card v-if="currentActiveConfigure === &quot;vcpus&quot;" style="width: 500px;margin-left: 32px;height: 100%;">
        <div slot="header" style="padding-left: 34px;">
          处理器
        </div>
        <div class="configure-detail">
          <div class="configure-detail__item"><span class="label">VCPU数量 : </span>
            <el-input-number
              v-model="value.vcpus"
              :min="1"
              :max="16"
              step-strictly
              style="width: 198px;"
            />
          </div>
          <div class="configure-detail__item"><span class="label">处理器架构 : </span>
            <el-select v-model="value.frame">
              <el-option
                v-for="item in frameOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </div>
        </div>
      </icr-card>
      <icr-card v-if="currentActiveConfigure === &quot;disk&quot;" style="width: 500px;margin-left: 32px;height: 100%;">
        <div slot="header" style="padding-left: 34px;">
          硬盘
        </div>
        <div class="configure-detail">
          <div class="configure-detail__item">
            <span class="label">硬盘大小: </span>
            <el-input-number
              v-model="value.disk[pIndex]"
              :min="1"
              :max="500"
              step-strictly
              controls-position="right"
            /> GB
          </div>
        </div>
      </icr-card>
      <icr-card v-if="currentActiveConfigure === &quot;nics&quot;" style="width: 500px;margin-left: 32px;height: 100%;">
        <div slot="header" style="padding-left: 34px;">
          网络适配器
        </div>
        <div class="configure-detail">
          <div style="margin-bottom:10px;">
            <div class="configure-detail__item"><span class="label">接口名称: </span><el-input v-model="value.nics[pIndex].name" style="width:256px" /></div>
            <div class="configure-detail__item"><span class="label">MAC地址: </span><el-input v-model="value.nics[pIndex].mac" style="width:256px" /></div>
            <el-button @click="value.nics[pIndex].mac = genUnicastMac()">随机生成</el-button>
          </div>
        </div>
      </icr-card>
      <icr-card v-if="currentActiveConfigure === &quot;usb&quot;" style="width: 500px;margin-left: 32px;height: 100%;">
        <div slot="header" style="padding-left: 34px;">
          USB控制器
        </div>
        <div class="configure-detail">
          <div class="configure-detail__item">
            <span style="display: inline-block; margin-right: 30px;">usb: {{ value.usb[pIndex].name }}</span>
            <span class="label">是否启用: </span><el-switch v-model="value.usb[pIndex].status" :active-value="1" :inactive-value="0" />
          </div>
        </div>
      </icr-card>
      <icr-card v-if="currentActiveConfigure === &quot;display&quot;" style="width: 500px;margin-left: 32px;height: 100%;">
        <div slot="header" style="padding-left: 34px;">
          显示器
        </div>
        <div class="configure-detail">
          <div class="configure-detail__item">
            <span class="label">当前显示器仅支持默认设置, 分辨率800*600</span>
          </div>
        </div>
      </icr-card>
    </div>
    <div class="actions" style="width: 1032px; margin-top: 20px;">
      <el-button @click="$router.push('/targets/alone-targets')">取消</el-button>
      <el-button type="primary" @click="submitConfig">下一步</el-button>
    </div>
    <el-dialog title="添加硬件" :visible.sync="configDialogVisible" width="540px">
      <p><el-checkbox v-model="addConfigModel.nics"> 网络适配器 </el-checkbox></p>
      <p><el-checkbox v-model="addConfigModel.usb"> USB控制器 </el-checkbox></p>
      <p><el-checkbox v-model="addConfigModel.disk"> 硬盘 </el-checkbox></p>
      <div class="actions">
        <el-button @click="() => {configDialogVisible=false}">取消</el-button>
        <el-button type="primary" @click="addConfig">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import IcrCard from '@/components/card'
import { mapToSelectionOptions, genUnicastMac } from '@/utils/'
import {
  CpuCores, SystemFrames } from '@/const/resource'

export default {
  components: {
    IcrCard
  },
  props: {
    value: Object
  },
  data() {
    const frameOptions = mapToSelectionOptions(SystemFrames)
    return {
      frameOptions,
      cupOptions: mapToSelectionOptions(CpuCores),
      currentActiveConfigure: 'ram',
      aflag: false,
      pIndex: 0,
      activeIndex: 0,
      showEdit: true,
      configDialogVisible: false,
      addConfigModel: {
        nics: false,
        usb: false,
        disk: false
      }
    }
  },
  computed: {
    configOptions: function() {
      return [
        { name: '*内存', prop: 'ram', render: val => (val / 1024).toFixed(2) + 'GB' },
        { name: '*处理器', prop: 'vcpus', render: val => val },
        ...this.value.disk.map((val, index) => {
          const prefix = index === 0 ? '*' : ''
          return { name: `${prefix}硬盘`, prop: 'disk', render: val => `${val?.[index]}GB` }
        }),
        ...this.value.nics.map((val, index) => {
          const prefix = index === 0 ? '*' : ''
          return { name: `${prefix}网络适配器`, prop: 'nics', render: val => val?.[index]?.name }
        }),
        ...this.value.usb.map((val, index) => {
          const prefix = index === 0 ? '*' : ''
          return { name: `${prefix}USB控制器`, prop: 'usb', render: val => val?.[index]?.['status'] ? '启用' : '关闭' }
        }),
        { name: '*显示器', prop: 'display', render: val => val, defaultValue: '默认' }
      ]
    }
  },
  methods: {
    genUnicastMac,
    submitConfig() {
      this.$emit('submit')
    },
    initAddConfigModel() {
      this.addConfigModel = {
        nics: false,
        usb: false,
        disk: false
      }
    },
    addConfig() {
      if (!this.addConfigModel.nics && !this.addConfigModel.usb && !this.addConfigModel.disk) {
        this.$message.error('请先选择硬件')
        return
      }
      if (this.addConfigModel.nics) {
        this.value.nics.push({ name: `eth${this.value.nics.length}`, mac: this.genUnicastMac() })
      }
      if (this.addConfigModel.usb) {
        this.value.usb.push({ name: `${this.value.usb.length + 1}`, status: 1 })
      }
      if (this.addConfigModel.disk) {
        this.value.disk.push(2)
      }
      this.configDialogVisible = false
    },
    configTabChange(item, index) {
      this.currentActiveConfigure = item.prop
      this.activeIndex = index
      this.showEdit = false
      this.currentActiveConfigure = item.prop
      let posIndex = 0
      if (['disk', 'nics', 'usb'].indexOf(item.prop) >= 0) {
        this.aflag = true
        for (index--; index >= 0; index--) {
          if (this.configOptions[index].prop === item.prop) {
            posIndex++
          }
        }
      } else {
        this.aflag = false
      }

      if (this.aflag) {
        this.pIndex = posIndex
      }
      this.showEdit = true
    },
    delConfig() {
      const item = this.configOptions[this.activeIndex]
      this.showEdit = false
      let posIndex = 0
      let index = this.activeIndex
      if (['disk', 'nics', 'usb'].indexOf(item.prop) >= 0) {
        for (index--; index >= 0; index--) {
          if (this.configOptions[index].prop === item.prop) {
            posIndex++
          }
        }

        if (posIndex === 0) {
          this.showEdit = true
          return this.$message({
            type: 'warning',
            message: '不能删除默认配置'
          })
        }

        this.pIndex--
        this.value[item.prop].splice(posIndex, 1)
        this.activeIndex > 0 && this.activeIndex--
      } else {
        this.showEdit = true
        return this.$message({
          type: 'warning',
          message: '不能删除默认配置'
        })
      }

      this.showEdit = true
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/themes/black/vars.scss';

.configure {
  display: flex;
  flex-wrap: wrap;
}
.configure-detail {
  padding: 30px 40px;
}
.hardware-options {
  display: flex;
  &:hover {
    background: $--icr-card-bg-color;
  }
  cursor: pointer;
}
.hardware__option{
  flex: 1;
  justify-content: center;
  padding-left: 19%;
  height: 48px;
  line-height: 48px;
}
.hardware-options_active {
  background: $--icr-card-bg-color;
}
.configure-detail__item {
  margin-bottom: 10px;
  .label {
    display: inline-block;
    min-width: 120px;
  }
}
</style>
