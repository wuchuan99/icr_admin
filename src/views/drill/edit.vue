<template>
  <div class="app-container">
    <div class="step step1">></div>
    <div v-if="drillData.scope === 0" class="step step2">></div>
    <el-tabs
      v-model="step"
      class="dirll-target-edit-tab"
    >
      <el-tab-pane label="基本信息" name="baseinfo" :disabled="disabledTab" />
      <el-tab-pane label="任务设置" name="settings" :disabled="disabledTab" />
      <el-tab-pane
        v-if="drillData.scope === 0"
        label="参与人员"
        name="participants"
        :disabled="disabledTab"
      />
    </el-tabs>
    <div v-show="step === 'baseinfo'" class="drill-edit">
      <base-info
        ref="baseinfo"
        :drill-data="drillData"
        @submitBaseinfo="submitBaseinfo"
      />
    </div>
    <div v-if="step === 'settings'" class="drill-edit">
      <settings
        ref="settings"
        :drill-data="drillData"
        @submitSettings="submitSettings"
      />
    </div>
    <div v-if="step === 'participants'" class="drill-edit">
      <participants
        ref="participants"
        :drill-data="drillData"
        @submitUserInfo="submitUserInfo"
      />
    </div>
  </div>
</template>

<script>
import BaseInfo from './baseinfo'
import settings from './settings'
import participants from './participants'
import { drillRetrieve, drillAdd, drillUpdate } from '@/api/drill'
import { isEqual, cloneDeep, omit } from 'lodash-es'
export default {
  components: {
    BaseInfo,
    settings,
    participants
  },
  props: {},
  data() {
    return {
      new: '1',
      drillID: '',
      step: 'baseinfo',
      drillData: {
        id: '',
        name: '',
        scope: 0,
        start_time: '',
        end_time: '',
        mode: 0,
        desc: '',
        scene: {
          id: '',
          name: ''
        },
        status: '',
        enable_status: '',
        record: 0
      },
      cache: {}
    }
  },
  computed: {
    disabledTab() {
      return this.new === '1' || !this.drillData.id
    }
  },
  created() {
    this.new = this.$route.query.new || ''
    this.drillID = this.$route.params.id * 1 || ''
    this.drillID && this.getDetail().then(() => {
      this.step = this.$route.query.step || 'baseinfo'
    })
  },
  mounted() {},
  methods: {
    submitBaseinfo() {
      this.submit().then((res) => {
        if (res.status === 0) {
          if (!this.drillID) {
            this.drillID = res?.data?.data?.id || ''
            this.drillData.id = res?.data?.data?.id || ''
            this.$router.push(`/drill-manage/drill/${this.drillID}?new=1&step=settings`)
          } else {
            console.log('1')
            this.cache = cloneDeep(this.drillData)
            this.step = 'settings'
          }
        }
      })
    },
    submitSettings(payload) {
      if (payload.go) return this.settingsjumbTo()
      this.drillData.scene = { id: payload.id, name: payload.name }
      const params = { id: this.drillData.id, scene_id: payload.id }
      this.update(params).then(() => {
        payload.callback && payload.callback()
      })
    },
    settingsjumbTo() {
      if (this.drillData.scope === 0) {
        this.step = 'participants'
      } else {
        this.$router.push('/drill-manage/drill')
      }
    },
    submitUserInfo() {
      this.$router.push('/drill-manage/drill')
    },
    submit() {
      const params = this.omitKey(this.drillData)
      return this.drillID ? this.update(params) : this.create(params)
    },
    omitKey(target) {
      const key_list = ['scene', 'enable_status', 'status']
      if (this.drillData.scope === 1) {
        key_list.push('start_time', 'end_time')
      }
      return omit(target, key_list)
    },
    create(data) {
      this.changeTime(data)
      return drillAdd({ data })
    },
    update(data) {
      const cache = this.omitKey(this.cache)
      if (isEqual(cache, data)) {
        return Promise.resolve({ status: 0 })
      }
      this.changeTime(data)
      return drillUpdate({ data })
    },
    changeTime(data) {
      if (data.scope === 0) {
        data.start_time = `${data.start_time}:00`
        data.end_time = `${data.end_time}:00`
      }
    },
    getDetail() {
      return drillRetrieve({ drill_id: this.drillID }).then((res) => {
        const data = res?.data.data
        data.scene = data.scene || { id: '', name: '' }
        if (data.scope === 0) {
          data.start_time = data.start_time.slice(0, 16)
          data.end_time = data.end_time.slice(0, 16)
        }
        this.drillData = data
        this.cache = cloneDeep(this.drillData)
      })
    }
  }
}
</script>

<style scoped lang="scss">
.app-container {
  padding: 0;
  height: 100%;
  position: relative;
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
::v-deep {
  .dirll-target-edit-tab {
    .el-tabs__header {
      margin: 0;
    }
    .el-tabs__item.is-active.is-disabled {
      color: #00AD84;
    }
  }
  .el-dialog {
    max-width: 80%;
    padding-top: 20px;
    padding-bottom: 30px;
    margin-top: 50px !important;
    max-height: calc(100% - 100px);
    .el-dialog__body {
      padding-top: 25px;
      padding-bottom: 0;
    }
  }
}
.drill-edit {
  box-sizing: border-box;
  height: calc(100% - 40px);
  padding-top: 16px;
}
</style>
