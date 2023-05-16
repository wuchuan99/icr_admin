export const TargetVirtualType = 0
export const TargetPhysicsType = 1

export const TargetTypes = new Map([
  [TargetVirtualType, '虚拟资源']
  // [TargetPhysicsType, '物理资源']
])

export const ManualJudgment = 6

export const Judgments = new Map([
  [0, '静态flag判定'],
  // [1, '注册表判定'],
  // [2, '进程判定'],
  // [3, '日志判定'],
  // [4, '流量判定'],
  // [5, '动态FLAG判定'],
  [ManualJudgment, '人工判定']
  // [7, '文件判定']
])

export const Categorys = new Map([
  [0, 'WEB安全'],
  [1, '逆向工程'],
  [2, '二进制漏洞'],
  [3, '密码学'],
  [4, '杂项'],
  [5, '移动安全'],
  [6, '隐写']
])

export const CpuCores = new Map([
  [1, 1],
  [2, 2],
  [4, 4],
  [8, 8],
  [16, 16],
  [32, 32]
])

export const SystemFrames = new Map([
  [0, 'X86'],
  [1, 'ARM'],
  [2, 'MIPS'],
  [3, 'PowerPC'],
  [4, 'Loongson']
])

export const ImageDiskClassify = new Map([
  [0, 'U盘镜像'],
  [1, '光盘镜像'],
  [2, '虚拟机镜像'],
  [3, 'docker镜像'],
  [4, '仿真脚本镜像']
])

export const ImageTargetClassify = new Map([
  [0, '应用'],
  [1, '操作系统'],
  [2, '网络设备'],
  [3, '安全设备'],
  [4, '工控设备'],
  [5, '现场执行设备'],
  [6, '现场传感器']
])

export const diskTypeClassify = new Map([
  ['default', 'default'],
  ['scsi', 'scsi'],
  ['virtio', 'virtio'],
  ['ide', 'ide'],
  ['sata', 'sata'],
  ['usb', 'usb']
])

export const ImageFileTypes = new Map([
  ['iso', 'iso'],
  ['qcow2', 'qcow2'],
  ['vmdk', 'vmdk']
])

export const templateClassify = new Map([
  [1, '单机靶标'],
  [2, '虚拟资源']
  // [3, '物理资源']
])

export const cardTypes = new Map([
  [1, 'virto'],
  [2, 'e1000'],
  [3, 'rtl8139']
])

export const protocols = new Map([
  ['tcp', 'tcp'],
  ['udp', 'udp']
])

// export const ruleJudgments = new Map([
//   [0, 'flag判定'],
//   [2, '注册表判定'],
//   [3, '进程判定'],
//   [4, '日志判定'],
//   [5, '流量判定'],
//   [6, '动态FLAG判定'],
//   [7, '人工判定'],
//   [8, '文件下载'],
//   [9, '文件上传']
// ])
export const ruleJudgments = Judgments

export const dirllModes = new Map([
  [0, '个人演练'],
  [1, '组队演练'],
  [2, '红蓝对抗']
  // [3, '混战']
])

// 虚实控制器品牌
export const controllerBrand = new Map([
  ['H3C', '新华三'],
  ['BDCOM', '博达通信']
])
// 虚实控制器类型
export const controllerType = new Map([
  ['switch', '交换机'],
  ['Serial', '串口服务器']
])
// 虚实控制器协议
export const controllerProtocol = new Map([
  ['ssh', 'ssh']
])
// 虚实控制器状态
export const controllerStatus = new Map([
  ['online', '在线'],
  ['offline', '离线']
])

// 虚实接口端口状态
export const managerPortStatus = new Map([
  ['1', '在线'],
  ['0', '离线'],
  ['2', '占用']
])
