import request from '@/utils/request'
import { withFlag, FLAG } from './index'

export function clusterManagePaging(data) {
  return request({
    url: '/sys_operations/cluster_manage/paging',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function clusterManageReboot(data) {
  return request({
    url: '/sys_operations/cluster_manage/reboot',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function clusterManageShutdown(data) {
  return request({
    url: '/sys_operations/cluster_manage/shutdown',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function clusterManageShutdownall(data) {
  return request({
    url: '/sys_operations/cluster_manage/shutdownall',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function clusterManageStackserviceinfo(data) {
  return request({
    url: '/sys_operations/cluster_manage/stackserviceinfo',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function clusterManageStacksource(data) {
  return request({
    url: '/sys_operations/cluster_manage/stacksource',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function clusterManageStackinstanceinfo(data) {
  return request({
    url: '/sys_operations/cluster_manage/stackinstanceinfo',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}
