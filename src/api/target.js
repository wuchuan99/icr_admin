import request from '@/utils/request'
import { withFlag, FLAG } from './index'

export function filetargetAdd(data) {
  return request({
    url: '/target_manage/filetarget/add',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function filetargetDel(data) {
  return request({
    url: '/target_manage/filetarget/delete',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function filetargetUpdate(data) {
  return request({
    url: '/target_manage/filetarget/update',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function filetargetRetrieve(data) {
  return request({
    url: '/target_manage/filetarget/retrieve',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function filetargetPaging(data) {
  return request({
    url: '/target_manage/filetarget/paging',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function filetargetList(data) {
  return request({
    url: '/target_manage/filetarget/list',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function alonetargetAdd(data) {
  return request({
    url: '/target_manage/alonetarget/add',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function alonetargetDel(data) {
  return request({
    url: '/target_manage/alonetarget/delete',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function alonetargetUpdate(data) {
  return request({
    url: '/target_manage/alonetarget/update',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function alonetargetEdit(data) {
  return request({
    url: '/target_manage/alonetarget/edit',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function alonetargetRetrieve(data) {
  return request({
    url: '/target_manage/alonetarget/retrieve',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function alonetargetPaging(data) {
  return request({
    url: '/target_manage/alonetarget/paging',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function alonetargetCopy(data) {
  return request({
    url: '/target_manage/alonetarget/copy',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function alonetargetRemote(data) {
  return request({
    url: '/target_manage/alonetarget/remote',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function alonetargetReboot(data) {
  return request({
    url: '/target_manage/alonetarget/reboot',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function alonetargetFree(data) {
  return request({
    url: '/target_manage/alonetarget/free',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function alonetargetPause(data) {
  return request({
    url: '/target_manage/alonetarget/pause',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function alonetargetUnpause(data) {
  return request({
    url: '/target_manage/alonetarget/unpause',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function alonetargetSnapshot(data) {
  return request({
    url: '/target_manage/alonetarget/snapshot',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function alonetargetStatus(data) {
  return request({
    url: '/target_manage/alonetarget/targetstatus',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function alonetargetList(data) {
  return request({
    url: '/target_manage/alonetarget/list',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function alonetargetEnable(data) {
  return request({
    url: '/target_manage/alonetarget/targetenable',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function alonetargetRuleAdd(data) {
  return request({
    url: '/target_manage/alonetarget/rule/add',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function alonetargetRuleDel(data) {
  return request({
    url: '/target_manage/alonetarget/rule/delete',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function alonetargetRuleUpdate(data) {
  return request({
    url: '/target_manage/alonetarget/rule/update',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function alonetargetRuleRetrieve(data) {
  return request({
    url: '/target_manage/alonetarget/rule/retrieve',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function alonetargetRuleList(data) {
  return request({
    url: '/target_manage/alonetarget/rule/list',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function alonetargetRulePaging(data) {
  return request({
    url: '/target_manage/alonetarget/rule/paging',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}
