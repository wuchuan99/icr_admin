<template>
  <div class="scene-target-edit">
    <div class="step step1">></div>
    <div class="step step2">></div>
    <el-tabs v-model="step" class="scene-target-edit-tab">
      <el-tab-pane label="基本信息" name="baseinfo" :disabled="disabledTab" />
      <el-tab-pane label="场景编排" name="layout" :disabled="disabledTab" />
      <el-tab-pane label="判定设置" name="rules" :disabled="disabledTab" />
    </el-tabs>
    <div :class="{show: step === 'baseinfo'}" class="scene-target-edit-main">
      <base-info ref="baseinfo" :scene-data="sceneData" @submit="submitBaseinfo" />
    </div>
    <div :class="{show: step === 'layout'}" class="scene-target-edit-main">
      <layout v-if="isLoadTopology" ref="layout" :scene-data="sceneData" @submit="submitLayout" />
    </div>
    <div v-if="step === 'rules'" :class="{show: step === 'rules'}" class="scene-target-edit-main">
      <rules ref="rules" :scene-id="sceneData.id" @submit="submitRules" />
    </div>
  </div>
</template>

<script>
import BaseInfo from './baseinfo/form.vue'
import layout from './topology/editor.vue'
import rules from './rules/form.vue'
import {
  scenetargetAdd,
  scenetargetUpdate,
  scenetargetRetrieve
} from '@/api/scene'
export default {
  components: {
    BaseInfo,
    layout,
    rules
  },
  data() {
    return {
      sceneId: '',
      sceneData: {
        id: '',
        name: '',
        desc: '',
        topologyData: []
      },
      step: 'baseinfo',
      isLoadTopology: false,
      cache: {
        name: '',
        desc: ''
      },
      new: '1'
    }
  },
  computed: {
    disabledTab() {
      return this.new === '1'
    }
  },
  watch: {
    step(val) {
      if (val === 'layout') {
        this.$nextTick(() => {
          this.isLoadTopology = true
          this.$store.dispatch('topology/setSceneData', this.sceneData)
          if (this.$refs?.layout) {
            const container = this.$refs?.layout?.graph?.scroller?.widget?.container
            if (container.clientWidth > 0 && container.clientHeight > 0) return
            this.$refs?.layout?.setupGraphSzie()
          }
        })
      }
    }
  },
  created() {
    this.sceneId = Number(this.$route.params.id) || ''
    if (this.sceneId) {
      this.getDetail().then(() => {
        this.step = this.$route.query.step || 'baseinfo'
      })
    }
    this.new = this.$route.query.new
  },
  methods: {
    submitBaseinfo() {
      this.submit().then(res => {
        if (res.status === 0) {
          if (!this.sceneId) {
            this.sceneId = res.data.id
            this.getDetail().then(() => {
              this.$router.push(`/targets/scene-targets/${this.sceneId}?new=1&step=layout`)
            })
          } else {
            this.cache.name = this.sceneData.name
            this.cache.desc = this.sceneData.desc
            this.step = 'layout'
          }
        }
      })
    },
    submitLayout() {
      this.step = 'rules'
    },
    submitRules() {
      this.$router.push('/targets/scene-targets')
    },
    submit() {
      return this.sceneId ? this.update() : this.create()
    },
    create() {
      return scenetargetAdd({
        data: this.sceneData
      })
    },
    update() {
      if (
        this.cache.name === this.sceneData.name &&
        this.cache.desc === this.sceneData.desc
      ) {
        return Promise.resolve({ status: 0 })
      }
      return scenetargetUpdate({
        data: {
          name: this.sceneData.name,
          desc: this.sceneData.desc,
          id: this.sceneId
        }
      })
    },
    getDetail() {
      return scenetargetRetrieve({
        id: this.sceneId
      }).then(res => {
        if (res.status === 0) {
          this.sceneData = {
            id: this.sceneId,
            topologyData: res.data.data,
            ...res.data.scene
          }
        }
        this.cache.name = this.sceneData.name
        this.cache.desc = this.sceneData.desc
      })
    }
  },
  beforeRouteLeave(to, from, next) {
    const that = this.$refs.layout
    setTimeout(() => {
      // debugger
      console.log('离开场景编排', that)
      that && that.graph.dispose()
    }, 1000)
    next()
  }
}
</script>
<style lang="scss" scoped>
  .scene-target-edit {
    height: 100%;
    position: relative;
    ::v-deep {
      .scene-target-edit-tab {
        .el-tabs__header {
          margin-bottom: 0;
          .el-tabs__nav-wrap {
            &::after {
              display: none;
            }
          }
        }
      }
      .el-tabs__item.is-active.is-disabled {
        color: #00AD84;
      }
    }
    .scene-target-edit-main {
      height: 0;
      overflow: hidden;
      display: flex;
      &.show {
        height: calc(100% - 40px);
        overflow: visible;
      }
    }
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
  }
</style>
