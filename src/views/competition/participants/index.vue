<template>
  <div class="question-container">
    <AsideTabs tab-position="left" @tab-click="handleClick">
      <el-tab-pane v-for="item in leftOption" :key="item.value" :label="item.label">
        <component :is='getListComponentByType(item.value)'  v-if="itemActive === item.value" :item-active="itemActive" />
        <div class="submit-btn">
          <el-button :disabled="competition.going" type="primary" @click="submitUserInfo">保存</el-button>
          <el-button :disabled="competition.going" @click="goBack">取消</el-button>
        </div>
      </el-tab-pane>
    </AsideTabs>
  </div>
</template>

<script>
import AsideTabs from '@/views/common/aside-tabs.vue'
import { CompetitionTeamType } from '../index.vue'
import PlayerList from './player-list.vue'
import TeamList from './team-list.vue'

export const JudgeType = 'judge'
export const PlayerType = 'player'
export const TeamType = 'team'
export const ParticipantTypeMap = new Map([
  [PlayerType, 0],
  [JudgeType, 1],
  [TeamType, 0]
])

export default {
  components: {
    AsideTabs,
    // eslint-disable-next-line vue/no-unused-components
    PlayerList,
    // eslint-disable-next-line vue/no-unused-components
    TeamList
  },
  props: {},
  inject: ['getCompetitionId', 'getCompetition'],
  data() {
    return {
      competition: this.getCompetition(),
      itemActive: JudgeType
    }
  },
  computed: {
    leftOption: function() {
      const competition = this.getCompetition()
      const options = [
        {
          label: '裁判',
          value: JudgeType
        },
        {
          label: '选手',
          value: PlayerType
        },
        {
          label: '队伍',
          value: TeamType
        }
      ]
      if (CompetitionTeamType === competition.competition_type) {
        options.splice(1, 1)
      } else {
        options.splice(2, 1)
      }

      return options
    }
  },
  methods: {
    getListComponentByType(type) {
      return type === TeamType ? TeamList : PlayerList
    },
    handleClick(tab) {
      this.itemActive = this.leftOption[Number(tab.index)]?.value
    },
    submitUserInfo() {
      // this.$emit('submitUserInfo')
      this.$router.push('/competition-manage/competitions')
    },
    goBack() {
      this.$router.go(-1)
    }
  }
}
</script>

<style scoped lang="scss">
.question-container {
  height: 100%;
  ::v-deep {
    .aside-tabs {
      height: 100%;
      >.el-tabs__content {
        height: 100%;
        overflow-y: auto;
        .el-tab-pane {
          height: 100%;
        }
      }
    }
  }
}
.submit-btn {
  margin-top: 16px;
}
</style>
