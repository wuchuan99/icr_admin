const state = {
  sceneData: {}
}

const mutations = {
  SET_SCENE_DATA: (state, data) => {
    state.sceneData = data
  }
}

const actions = {
  setSceneData({ commit }, data) {
    commit('SET_SCENE_DATA', data)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
