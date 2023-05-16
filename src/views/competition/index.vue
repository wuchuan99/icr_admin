<template>
  <div class="app-container">
    <router-view />
  </div>
</template>

<script>
export const CompetitionTheoryModel = 0
export const CompetitionResolveModel = 1
export const CompetitionDevOpsModel = 2
export const CompetitionInvasionModel = 3
export const CompetitionDrillModel = 4
export const CompetitionHybridModel = 5
export const CompetitionRealWorldModel = 6

export const CompetitionModelMap = new Map([
  [CompetitionTheoryModel, '理论赛'],
  [CompetitionResolveModel, '解题赛'],
  [CompetitionDevOpsModel, '运维赛'],
  [CompetitionInvasionModel, '渗透赛'],
  [CompetitionDrillModel, '攻防赛'],
  [CompetitionHybridModel, '混编赛'],
  [CompetitionRealWorldModel, 'Real World赛']
])

export const CompetitionSingleType = 0
export const CompetitionTeamType = 1
export const CompetitionTypeMap = new Map([
  [CompetitionSingleType, '单人赛'],
  [CompetitionTeamType, '组队赛']
])
export default {}
</script>
<style lang="scss" scoped>
.app-container {
  max-height: 100%;
}
</style>
