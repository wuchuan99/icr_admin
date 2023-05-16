<template>
  <div class="cable-config">
    <icr-form
      ref="form"
      label-width="80px"
      class="form"
      :display-actions="false"
    >
      <el-collapse v-model="activeNames">
        <el-collapse-item title="链路设置" name="1">
          <el-form-item label="链路带宽">
            <el-row>
              <el-col :span="18">
                <el-input-number
                  ref="Bandwidth"
                  v-model="formData.Bandwidth"
                  :min="0"
                  :max="10000"
                  step-strictly
                  style="width: 100%"
                  @input.native="eventDisposalRangeChange('Bandwidth', 10000)"
                />
              </el-col>
              <el-col :span="6">
                <div style="color: #fff">Mbps</div>
              </el-col>
            </el-row>
          </el-form-item>
          <el-form-item label="丢包率">
            <el-row>
              <el-col :span="18">
                <el-input-number
                  ref="packetLossRate"
                  v-model="formData.packetLossRate"
                  :min="0"
                  :max="100"
                  step-strictly
                  style="width: 100%"
                  @input.native="eventDisposalRangeChange('packetLossRate', 100)"
                />
              </el-col>
              <el-col :span="6">
                <div style="color: #fff">%</div>
              </el-col>
            </el-row>
          </el-form-item>
          <el-form-item label="延迟">
            <el-row>
              <el-col :span="18">
                <el-input-number
                  ref="delay"
                  v-model="formData.delay"
                  :min="0"
                  :max="10000"
                  step-strictly
                  style="width: 100%"
                  @input.native="eventDisposalRangeChange('delay', 10000)"
                />
              </el-col>
              <el-col :span="6">
                <div style="color: #fff">ms</div>
              </el-col>
            </el-row>
          </el-form-item>
        </el-collapse-item>
        <el-collapse-item title="接口设置" name="2">
          <el-row v-if="['desktop', 'notebook', 'layerTwoSwitches', 'router'].includes(nodeData.source.deviceType)">
            <el-form-item label="组件名称">
              <span style="color: #fff">{{ formData.sourceInterface.name }}</span>
            </el-form-item>
            <el-form-item label="网络接口">
              <el-select
                v-model="formData.fromId"
                placeholder="请选择网络接口"
                clearable
              >
                <el-option
                  v-for="item in formData.sourceInterface.interface"
                  :key="item.id"
                  :label="item.interfaceName"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-row>
          <el-row v-if="['desktop', 'notebook', 'layerTwoSwitches', 'router'].includes(nodeData.target.deviceType)">
            <el-form-item label="组件名称">
              <div style="color: #fff">{{ formData.targetInterface.name }}</div>
            </el-form-item>
            <el-form-item label="网络接口">
              <el-select
                v-model="formData.toId"
                placeholder="请选择网络接口"
                clearable
              >
                <el-option
                  v-for="item in formData.targetInterface.interface"
                  :key="item.id"
                  :label="item.interfaceName"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-row>
        </el-collapse-item>
      </el-collapse>
    </icr-form>
  </div>
</template>

<script>
import IcrForm from '@/components/form'
export default {
  name: 'CableConfig',
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
      activeNames: ['1', '2'],
      restaurants: []
    }
  },
  mounted() {
    this.restaurants = this.loadAll()
  },
  methods: {
    eventDisposalRangeChange(prop, max) {
      const IntegerRegex = /^[1-9]*[1-9][0-9]*$/
      const key = this.$refs[prop]['displayValue']
      if (key) {
        if (key === '0') {
          this.formData[prop] = 0
        } else {
          if (IntegerRegex.test(key)) {
            if (max && parseInt(key) > max) {
              this.formData[prop] = max
              this.$refs[prop]['userInput'] = max + ''
            } else {
              this.formData[prop] = parseInt(key)
            }
          } else {
            this.$refs[prop]['userInput'] = null
          }
        }
      } else {
        this.formData[prop] = undefined
      }
    },
    loadAll() {
      return [
        {
          value: 'eth0'
        },
        {
          value: 'eth1'
        },
        {
          value: 'eth2'
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
  .cable-config {
    ::v-deep {
      .el-form {
        .el-input {
          width: 100%;
        }
      }
    }
  }
</style>
