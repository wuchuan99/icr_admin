<template>
  <div class="app-container">
    <div class="step step1">></div>
    <div class="step step2">></div>
    <el-tabs v-model="curStep" class="edit-tabs">
      <el-tab-pane
        label="基本信息"
        name="1"
        :disabled="isAdd"
      >
        <base-info
          ref="baseinfo"
          :data="model"
          class="competition-edit baseinfo-edit"
          @submitBaseinfo="submitBaseinfo"
        />
      </el-tab-pane>
      <el-tab-pane
        label="题目设置"
        name="2"
        :disabled="isAdd"
        lazy
      >
        <settings
          v-if="step === 2"
          ref="settings"
          class="competition-edit"
          @submitQuestionInfo="submitQuestionInfo"
        />
      </el-tab-pane>
      <el-tab-pane
        label="参与人员"
        name="3"
        :disabled="isAdd"
        lazy
      >
        <participants
          ref="participants"
          class="competition-edit"
          @submitUserInfo="submitUserInfo"
        />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import BaseInfo from './baseinfo'
import settings from './settings'
import participants from './participants'
import { competitionRetrieve, competitionAdd, competitionUpdate } from '@/api/competition'
import { CompetitionDrillModel } from './index.vue'
// import { isEqual, cloneDeep } from 'lodash-es'

export default {
  componentName: 'CompetitionEdit',
  components: {
    BaseInfo,
    settings,
    participants
  },
  provide() {
    return {
      getCompetitionId: () => {
        return this.competitionId
      },
      getCompetition: () => {
        return this.model
      }
    }
  },
  props: {},
  data() {
    return {
      step: 1,
      model: {
        id: '',
        name: '',
        start_time: '',
        end_time: '',
        answer_disorder: false,
        record: false,
        desc: '',
        competition_type: '',
        competition_model: '',
        starting_score: 1,
        going: false
      },
      cache: {
        name: '',
        start_time: '',
        end_time: '',
        total_time: '',
        attend_limit: '',
        hand_limit: '',
        answer_disorder: '',
        result_display: '',
        description: ''
      },
      accessFlag: false
    }
  },
  computed: {
    curStep: {
      get() {
        return String(this.step)
      },
      set(val) {
        this.step = Number(val)
      }
    },
    competitionId: function() {
      return Number(this.$route.params.id) || this.model.id
    },
    isAdd: function() {
      return this.$route.path.slice(-3) === 'add'
    }
  },
  created() {
    this.competitionId && this.retrieve()
  },
  mounted() {
    this.$on('next', () => {
      this.curStep++
    })
  },
  methods: {
    isGoing() {
      const now = Date.now()
      if ((!this.isAdd &&
        this.model.start_time &&
        this.model.end_time &&
        now >= new Date(this.model.start_time)) ||
        // enabled competition can not edit
        this.model.enable
      ) return true
      return false
    },
    setModel(model) {
      this.model = model
    },
    submitBaseinfo() {
      this.submit().then((res) => {
        if (res.status === 0) {
          this.model.id = this.model.id || res.data.id
          this.step++
        }
      })
    },
    submitQuestionInfo() {
      this.step++
    },
    submitUserInfo() {
      this.$router.push('/competition-manage/competition')
    },
    submit() {
      if (this.model.competition_model !== CompetitionDrillModel) {
        delete this.model.starting_score
      }
      return this.competitionId ? this.update() : this.create()
    },
    create() {
      this.changeTime(this.model)
      return competitionAdd({
        data: this.model
      })
    },
    update() {
      this.changeTime(this.model)
      return competitionUpdate({
        data: this.model
      })
    },
    retrieve() {
      competitionRetrieve({
        data: {
          id: this.competitionId
        }
      }).then(res => {
        if (res.status === 0) {
          Object.assign(this.model, res.data.data)
          this.model.going = this.isGoing()
        }
      })
    },
    changeTime(data) {
      data.start_time = `${data.start_time}:00`.slice(0, 19)
      data.end_time = `${data.end_time}:00`.slice(0, 19)
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
  .el-tabs {
    height: 100%;
    & > .el-tabs__content {
      height: calc(100% - 40px);
      & > .el-tab-pane {
        height: 100%;
        // overflow-y: auto;
      }
    }
  }

 .edit-tabs {
    .el-tabs__item.is-active.is-disabled {
      color: #00AD84;
    }
  }
}
::v-deep .breadcrumb {
  height: 40px;
  display: flex;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  align-items: center;
  .el-breadcrumb__item {
    .el-breadcrumb__inner {
      cursor: pointer;
      color: #adaeaf;
    }
    &.active {
      .el-breadcrumb__inner {
        color: #00cda8;
      }
      .el-breadcrumb__separator {
        &.el-icon-arrow-right {
          color: #00cda8;
        }
      }
    }
    &.disabled {
      pointer-events: none;
    }
  }
}
::v-deep {
 .edit-tabs {
    >.el-tabs__header {
      margin: 0;
    }
  }
}
.competition-edit {
  box-sizing: border-box;
  height: 100%;
  padding-top: 16px;
  &.baseinfo-edit {
    overflow-y: auto;
  }
}
</style>
