export default (graph, eventType, callBack) => {
  graph.on(eventType, (callBackData) => {
    callBack(callBackData)
  })
}
