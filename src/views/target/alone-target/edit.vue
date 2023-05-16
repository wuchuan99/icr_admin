<template>
  <div style="height: 100%; position: relative;">
    <div class="step step1">></div>
    <div class="step step2">></div>
    <el-tabs
      v-model='curTab'
      :before-leave='beforeTabLeave'
    >
      <el-tab-pane label="基本信息" :name="tabs[0]" class='baseinfo' :disabled='isNew && step !=  1'>
        <Baseinfo v-model='model' @submit='submitBaseinfo' />
      </el-tab-pane>
      <el-tab-pane label="配置管理" :name="tabs[1]" :disabled="(model.type != 0 || !model.id) || (isNew && step != 2)">
        <Config v-model='model' @submit='submitConfig' />
      </el-tab-pane>
      <el-tab-pane label="判定设置" :name="tabs[2]" :disabled='isNew && step !=  3'>
        <rules-manage :id="parseInt(targetId)"></rules-manage>
        <div class="actions" style='margin-top: 20px;'>
            <el-button type="primary" @click="$router.push('/targets/alone-targets')">完成</el-button>
          </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { mapToSelectionOptions, genUnicastMac } from '@/utils/'
import {
  TargetVirtualType,
  TargetPhysicsType,
  TargetTypes, CpuCores, SystemFrames, ImageTargetClassify } from '@/const/resource'
import {
  alonetargetAdd,
  alonetargetUpdate,
  alonetargetRetrieve
} from '@/api/target'
import { virtualImageList } from '@/api/resource'
import { cloneDeep, pick } from 'lodash-es'
import RulesManage from './rules/list'
import Baseinfo from './baseinfo/form.vue'
import Config from './config/form.vue'

export default {
  components: {
    RulesManage,
    Baseinfo,
    Config
  },
  data() {
    const targetClassifyOptions = mapToSelectionOptions(ImageTargetClassify)
    const frameOptions = mapToSelectionOptions(SystemFrames)
    return {
      targetClassifyOptions,
      frameOptions,
      curTab: 'baseinfo',
      tabs: ['baseinfo', 'hardware', 'rules'],
      model: {
        name: '',
        type: '',
        image_info: {
          name: '',
          image_id: ''
        },
        target_classify: '',
        os: '',
        desc: '',
        ram: '',
        vcpus: '',
        frame: '',
        disk: [],
        nics: [],
        mac: '',
        usb: []
      },
      image: null,
      resources: [],
      createMethod: 1,
      cupOptions: mapToSelectionOptions(CpuCores),
      currentActiveConfigure: 'ram',
      baseinfoFormFields: [
        {
          label: '靶标名称',
          type: 'input',
          prop: 'name',
          style: 'width: 240px'
        },
        {
          label: '靶标类型',
          type: 'select',
          prop: 'type',
          options: mapToSelectionOptions(TargetTypes)
        }
      ],
      // TODO
      baseinfoFormRules: []
    }
  },
  computed: {
    isNew() {
      return !!this.$route.query?.new
    },
    step() {
      return this.tabs.indexOf(this.curTab) + 1
    },
    isEdit() {
      return !!this.model.id
    },
    targetId() {
      return this.$route.params.id
    },
    postModel() {
      let model = cloneDeep(this.model)

      if (!model.id) {
        model = pick(model, ['name', 'type', 'image_info', 'target_classify', 'os', 'desc'])
      }

      return model
    }
  },
  watch: {
    'model.type': {
      handler(newVal) {
        switch (newVal) {
          case TargetVirtualType:
            virtualImageList().then(({ data }) => {
              this.resources = data.data.map(item => ({
                label: item.name,
                value: item.image_id,
                ...item
              }))
            })
            return
          case TargetPhysicsType:
            this.resources = []
            return
        }
      },
      immediate: !!1
    },
    'model.image_info': {
      handler(newVal) {
        const image = this.resources.find(image => image.image_id === newVal.image_id)
        if (image) {
          this.model.target_classify = image.target_classify
          this.model.os = image.os
        }
      },
      immediate: !!1
    }
  },
  created() {
    this.curTab = this.$route.query.tab || 'baseinfo'
  },
  mounted() {
    if (this.targetId) {
      this.getModel()
    } else {
      this.model = {
        ...this.model
        // ...this.getDefaultHardwareConfigure()
      }
    }
  },
  methods: {
    genUnicastMac,
    beforeTabLeave() {
      return !!this.model.id
    },
    getModel() {
      if (!this.targetId) return
      alonetargetRetrieve({
        target_id: this.targetId
      }).then(res => {
        if (res.data?.data?.frame < 0) {
          this.model = {
            ...res.data?.data,
            ...this.getDefaultHardwareConfigure()
          }
        } else {
          this.model = res.data?.data
        }
      })
    },
    getDefaultHardwareConfigure() {
      return {
        ram: 2048,
        vcpus: 2,
        frame: 0,
        disk: [40],
        nics: [{
          name: 'eth0',
          mac: this.genUnicastMac()
        }],
        usb: [{
          name: 1,
          status: 1
        }]
      }
    },
    submitBaseinfo() {
      this.submit().then(res => {
        const id = res.data?.data?.id
        if (!this.isEdit) {
          return this.$router.push(`/targets/alone-targets/${id}?tab=hardware&new=1`)
        }

        const isVirtualType = this.model.type === TargetVirtualType
        if (this.isEdit || isVirtualType) {
          this.curTab = isVirtualType ? this.tabs[1] : this.tabs[2]
        }
      })
    },
    submitConfig() {
      this.submit().then((res) => {
        this.curTab = this.tabs[2]
      })
    },
    submit() {
      return this.model.id ? this.update() : this.create()
    },
    create() {
      return alonetargetAdd({
        data: this.postModel
      })
    },
    update() {
      return alonetargetUpdate({
        data: this.postModel
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.step {
  position: absolute;
  &.step1 {
    top: 12px;
    left: 70px;
  }
  &.step2 {
    top: 12px;
    left: 165px;
  }
}
::v-deep {
  .el-tabs {
    height: 100%;
    & > .el-tabs__content {
      height: calc(100% - 55px);
      & > .el-tab-pane {
        height: 100%;
        overflow-y: auto;
      }
    }
  }
}
</style>
