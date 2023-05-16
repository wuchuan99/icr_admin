export default {
  id: '',
  name: '台式机',
  group: 'terminal',
  deviceType: 'desktop',
  selfEthId: '',
  devId: '',
  devEthId: '',
  cableList: [],
  tabList: [
    {
      name: '样式',
      componentName: 'Style',
      prop: 'style'
    },
    {
      name: '配置',
      componentName: 'Config',
      prop: 'config'
    },
    {
      name: '系统',
      componentName: 'System',
      prop: 'system'
    }
  ],
  configData: {
    style: {
      location: {
        x: 0,
        y: 0
      },
      size: {
        width: 50,
        height: 50
      },
      color: 'rgb(255, 255, 255)'
    },
    config: {
      // templateClassify: '',
      // targetClassify: '',
      // template: '',
      imageName: '',
      imageId: '',
      targetName: '',
      targetId: '',
      targetClassify: '',
      classify: 1,
      memory: 0,
      CPUNumber: '',
      USBSwitch: true,
      hardDisk: [],
      networkAdapter: []
    },
    system: {
      accountList: [],
      access: 'novnc',
      port: '',
      account: '',
      passWord: '',
      VLANList: [],
      LANIp: '',
      LANMask: '',
      DHCPSwitch: true,
      ipScopeStart: '',
      ipScopeEnd: '',
      portMapList: [],
      ipList: []
    }
  }
}
