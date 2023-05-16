import request from '@/utils/request'
import { withFlag, FLAG } from './index'

export function scenetargetPaging(data) {
  return request({
    url: '/target_manage/scenetarget/scene/paging',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function scenetargetAdd(data) {
  return request({
    url: '/target_manage/scenetarget/scene/add',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function scenetargetUpdate(data) {
  return request({
    url: '/target_manage/scenetarget/scene/update',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function scenetargetRetrieve(data) {
  return request({
    url: '/target_manage/scenetarget/scene/retrieve',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function scenetargetReversal(data) {
  return request({
    url: '/target_manage/scenetarget/scene/reversal',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function scenetargetDuplicate(data) {
  return request({
    url: '/target_manage/scenetarget/scene/duplicate',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function scenetargetSceneCopy(data) {
  return request({
    url: '/target_manage/scenetarget/scene/copy',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function scenetargetDelete(data) {
  return request({
    url: '/target_manage/scenetarget/scene/delete',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function scenetargetList(data) {
  return request({
    url: '/target_manage/scenetarget/scene/list',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

// topology

// 二层交换机
export function networkElementSwitchl2Add(data) {
  return request({
    url: '/target_manage/scenetarget/network_element/switch/l2/add',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function networkElementSwitchl2Retrieve(data) {
  return request({
    url: '/target_manage/scenetarget/network_element/switch/l2/retrieve',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function networkElementSwitchl2Update(data) {
  return request({
    url: '/target_manage/scenetarget/network_element/switch/l2/update',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function networkElementSwitchl2Delete(data) {
  return request({
    url: '/target_manage/scenetarget/network_element/switch/l2/delete',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

// 三层交换机
export function networkElementSwitchl3Add(data) {
  return request({
    url: '/target_manage/scenetarget/network_element/switch/l3/add',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function networkElementSwitchl3Retrieve(data) {
  return request({
    url: '/target_manage/scenetarget/network_element/switch/l3/retrieve',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function networkElementSwitchl3Update(data) {
  return request({
    url: '/target_manage/scenetarget/network_element/switch/l3/update',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function networkElementSwitchl3Delete(data) {
  return request({
    url: '/target_manage/scenetarget/network_element/switch/l3/delete',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

// 路由器
export function networkElementRouterAdd(data) {
  return request({
    url: '/target_manage/scenetarget/network_element/router/add',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function networkElementRouterUpdate(data) {
  return request({
    url: '/target_manage/scenetarget/network_element/router/update',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function networkElementRouterDelete(data) {
  return request({
    url: '/target_manage/scenetarget/network_element/router/delete',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

// 线缆
export function networkElementCableAdd(data) {
  return request({
    url: '/target_manage/scenetarget/network_element/cable/add',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function networkElementCableUpdate(data) {
  return request({
    url: '/target_manage/scenetarget/network_element/cable/update',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function networkElementCableDelete(data) {
  return request({
    url: '/target_manage/scenetarget/network_element/cable/delete',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

// 终端
export function networkElementTerminalAdd(data) {
  return request({
    url: '/target_manage/scenetarget/network_element/pc_terminal/add',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function networkElementTerminalUpdate(data) {
  return request({
    url: '/target_manage/scenetarget/network_element/pc_terminal/update',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function networkElementTerminalDelete(data) {
  return request({
    url: '/target_manage/scenetarget/network_element/pc_terminal/delete',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function networkElementTerminalRemote(data) {
  return request({
    url: '/target_manage/scenetarget/network_element/pc_terminal/remote',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function networkElementTerminalRetrieve(data) {
  return request({
    url: '/target_manage/scenetarget/network_element/pc_terminal/retrieve',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

// 场景调试

// 启动调试
export function scenetargetStartup(data) {
  return request({
    url: '/target_manage/scenetarget/scene/startup',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

// 获取调试状态
export function scenetargetStartingstatus(data) {
  return request({
    url: '/target_manage/scenetarget/scene/startingstatus',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

// 释放场景调试
export function scenetargetRelease(data) {
  return request({
    url: '/target_manage/scenetarget/scene/release',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

// 子网新增
export function scenetargetSubnetAdd(data) {
  return request({
    url: '/target_manage/scenetarget/network_element/subnet/add',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

// 子网删除
export function scenetargetSubnetDelete(data) {
  return request({
    url: '/target_manage/scenetarget/network_element/subnet/delete',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

// 子网修改
export function scenetargetSubnetUpdate(data) {
  return request({
    url: '/target_manage/scenetarget/network_element/subnet/update',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

// 子网列表分页
export function scenetargetSubnetPaging(data) {
  return request({
    url: '/target_manage/scenetarget/network_element/subnet/paging',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

// 子网列表不分页
export function scenetargetSubnetList(data) {
  return request({
    url: '/target_manage/scenetarget/network_element/subnet/list',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

// dns服务器分页列表
export function scenetargetDnsPaging(data) {
  return request({
    url: '/target_manage/scenetarget/network_element/dns/paging',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

// dns服务器新增
export function scenetargetDnsAdd(data) {
  return request({
    url: '/target_manage/scenetarget/network_element/dns/add',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

// dns服务器修改
export function scenetargetDnsUpdate(data) {
  return request({
    url: '/target_manage/scenetarget/network_element/dns/update',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

// dns服务器删除
export function scenetargetDnsDelete(data) {
  return request({
    url: '/target_manage/scenetarget/network_element/dns/delete',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

// 虚拟网络
export function scenetargetSubnetAddvirtualnet(data) {
  return request({
    url: '/target_manage/scenetarget/network_element/subnet/addvirtualnet',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function scenetargetSubnetUpdatevirtualnet(data) {
  return request({
    url: '/target_manage/scenetarget/network_element/subnet/updatevirtualnet',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

// 链路连接或断开设备
export function scenetargetSubnetAttachvirtualnet(data) {
  return request({
    url: '/target_manage/scenetarget/network_element/subnet/attachvirtualnet',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function scenetargetSubnetSetdns(data) {
  return request({
    url: '/target_manage/scenetarget/network_element/subnet/setdns',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

// 虚机选择
export function alonetargetClassifylist(data) {
  return request({
    url: '/target_manage/alonetarget/classifylist',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function virtualResourceImageClassifylist(data) {
  return request({
    url: '/pool_manage/virtual_resource/image/classifylist',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

// 矩形工具
export function scenetargetRectangleAdd(data) {
  return request({
    url: '/target_manage/scenetarget/network_element/rectangle/add',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}
export function scenetargetRectangleUpdate(data) {
  return request({
    url: '/target_manage/scenetarget/network_element/rectangle/update',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}
export function scenetargetRectangleDelete(data) {
  return request({
    url: '/target_manage/scenetarget/network_element/rectangle/delete',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

// 文本工具
export function scenetargetTextAdd(data) {
  return request({
    url: '/target_manage/scenetarget/network_element/text/add',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function scenetargetTextUpdate(data) {
  return request({
    url: '/target_manage/scenetarget/network_element/text/update',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function scenetargetTextDelete(data) {
  return request({
    url: '/target_manage/scenetarget/network_element/text/delete',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

// 判定规则

export function scenetargetRuleAdd(data) {
  return request({
    url: '/target_manage/scenetarget/scene/rule/add',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function scenetargetRuleDelete(data) {
  return request({
    url: '/target_manage/scenetarget/scene/rule/delete',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function scenetargetRuleUpdate(data) {
  return request({
    url: '/target_manage/scenetarget/scene/rule/update',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function scenetargetRulePaging(data) {
  return request({
    url: '/target_manage/scenetarget/scene/rule/paging',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function scenetargetRuleRetrieve(data) {
  return request({
    url: '/target_manage/scenetarget/scene/rule/retrieve',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function scenetargetRuleList(data) {
  return request({
    url: '/target_manage/scenetarget/scene/rule/list',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

// 物理设备
export function networkElementPhysicalAdd(data) {
  return request({
    url: '/target_manage/scenetarget/network_element/physical/add',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function networkElementPhysicalDelete(data) {
  return request({
    url: '/target_manage/scenetarget/network_element/physical/delete',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function networkElementPhysicalUpdate(data) {
  return request({
    url: '/target_manage/scenetarget/network_element/physical/update',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function networkElementPhysicalRetrieve(data) {
  return request({
    url: '/target_manage/scenetarget/network_element/physical/retrieve',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}
