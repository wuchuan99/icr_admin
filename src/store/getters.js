const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  routeHistory: state => state.routeHistory,
  sceneId: state => (state.topology.sceneData.id || '')
}
export default getters
