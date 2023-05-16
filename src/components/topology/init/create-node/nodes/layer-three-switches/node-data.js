export default {
  id: '',
  name: '三层交换机',
  group: 'network',
  deviceType: 'layerThreeSwitches',
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
      classify: '',
      networkAdapter: []
    }
  }
}
