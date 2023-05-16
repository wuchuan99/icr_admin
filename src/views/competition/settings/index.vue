<template>
  <div class="question-container">
    <AsideTabs v-model="itemActive" :class="{scrollPage: itemActive === 'preview'}" tab-position="left">
      <el-tab-pane
        v-for="(item, index) in leftOption"
        :key="index"
        :label="item.label"
        :name="item.value"
        :lazy="true"
      >
        <component
          :is="questionListComponent"
          v-if="itemActive === item.value"
          ref="questionList"
          :item-active="Number(itemActive)"
        />
      </el-tab-pane>
      <el-tab-pane
        v-if="itemActive !== '4' && itemActive !== '5'"
        :key="-1"
        label="预览"
        name="preview"
        :lazy="true"
      >
        <paper-view v-if="itemActive === 'preview'" ref="paperView" @submitQuestionInfo="submitQuestionInfo" />
      </el-tab-pane>
    </AsideTabs>
  </div>
</template>

<script>
import AsideTabs from '@/views/common/aside-tabs.vue'
import paperView from './paperview.vue'
import TheoryQuestions from './question/theory.vue'
import OperationQuestions from './question/operation.vue'
import SceneQuestions from './question/scene.vue'
import SceneQuestionRules from './question/scene-rule.vue'
import {
  CompetitionTheoryModel,
  CompetitionResolveModel,
  CompetitionDevOpsModel,
  CompetitionInvasionModel,
  CompetitionDrillModel,
  CompetitionHybridModel,
  CompetitionRealWorldModel
} from '../index.vue'

const JudgementQuestion = '0'
const SingleQuestion = '1'
const MultipleQuestion = '2'
const OperationQuestion = '3'
const SceneQuestion = '4'
const SceneQuestionRule = '5'

export default {
  components: {
    AsideTabs,
    paperView,
    TheoryQuestions,
    OperationQuestions,
    SceneQuestions,
    SceneQuestionRules
  },
  inject: ['getCompetitionId', 'getCompetition'],
  data() {
    return {
      itemActive: SingleQuestion
    }
  },
  computed: {
    leftOption: function() {
      const competition = this.getCompetition()
      if (!competition.id) return []
      const allOptions = [
        {
          label: '单选题',
          value: SingleQuestion,
          in: [CompetitionTheoryModel, CompetitionHybridModel]
        },
        {
          label: '多选题',
          value: MultipleQuestion,
          in: [CompetitionTheoryModel, CompetitionHybridModel]
        },
        {
          label: '判断题',
          value: JudgementQuestion,
          in: [CompetitionTheoryModel, CompetitionHybridModel]
        },
        {
          label: '实操题',
          value: OperationQuestion,
          in: [
            CompetitionResolveModel,
            CompetitionHybridModel
          ]
        },
        {
          label: '场景',
          value: SceneQuestion,
          in: [
            CompetitionDevOpsModel,
            CompetitionInvasionModel,
            CompetitionDrillModel,
            CompetitionRealWorldModel
          ]
        },
        {
          label: '题目',
          value: SceneQuestionRule,
          in: [
            CompetitionDevOpsModel,
            CompetitionInvasionModel,
            CompetitionDrillModel,
            CompetitionRealWorldModel
          ]
        }
      ]
      // return allOptions
      const option = competition.competition_model !== '' ? allOptions.filter(item => item.in.indexOf(competition.competition_model) >= 0) : allOptions

      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      this.itemActive = option[0]?.value
      return option
    },
    questionListComponent: function() {
      let component

      switch (this.itemActive) {
        case OperationQuestion:
          component = OperationQuestions
          break
        case SceneQuestion:
          component = SceneQuestions
          break
        case SceneQuestionRule:
          component = SceneQuestionRules
          break
        default:
          component = TheoryQuestions
      }

      return component
    }
  },
  methods: {
    // 预览试卷
    getPaperview() {
      this.itemActive = 'preview'
    },
    submitQuestionInfo() {
      if (this.itemActive === 'preview') {
        this.$emit('submitQuestionInfo')
      }
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
        // overflow-y: auto;
        .el-tab-pane {
          height: 100%;
        }
      }
      .el-tabs__item[aria-controls="pane-preview"] {
        margin-top: 40px;
      }
    }
  }
  .scrollPage {
    // 添加滚动条样式
    ::v-deep {
      >.el-tabs__content {
        overflow-y: auto;
        @import '@/styles/themes/black/customScroll.scss';
      }
    }
  }
}
</style>
