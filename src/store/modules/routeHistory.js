const state = {
  fromRoute: {},
  toRoute: {}
}

const mutations = {
  SET_FROM_ROUTE: (state, payload) => {
    state.fromRoute = payload
  },
  SET_TO_ROUTE: (state, payload) => {
    state.toRoute = payload
  }
}

export default {
  namespaced: true,
  state,
  mutations
}
