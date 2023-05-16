export default {
  id: '',
  name: '链路',
  group: '',
  deviceType: 'cable',
  target: {
    nodeId: '',
    id: '',
    deviceType: ''
  },
  source: {
    nodeId: '',
    id: '',
    deviceType: ''
  },
  tabList: [
    {
      name: '样式',
      componentName: 'CableStyle',
      prop: 'style'
    },
    {
      name: '配置',
      componentName: 'CableConfig',
      prop: 'config'
    }
  ],
  configData: {
    style: {
      strokeDasharray: 0,
      connector: 'rounded',
      strokeWidth: 2
    },
    config: {
      from: '',
      fromId: '',
      to: '',
      toId: '',
      Bandwidth: '',
      packetLossRate: '',
      delay: '',
      sourceInterface: {
        name: '',
        interface: []
      },
      targetInterface: {
        name: '',
        interface: []
      }
    }
  }
}
