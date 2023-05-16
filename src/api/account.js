import request from '@/utils/request'
import { withFlag, FLAG } from './index'

export function getlist(data) {
  return request({
    url: '/user_manage/account/paging',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}
export function addauter(data) {
  return request({
    url: '/user_manage/account/add',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}
export function getrole(data) {
  return request({
    url: '/user_manage/role/queryroles',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}
export function getorg(data) {
  return request({
    url: '/user_manage/org/queryorgs',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}
export function dellist(data) {
  return request({
    url: '/user_manage/account/delete ',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}
export function updatelist(data) {
  return request({
    url: '/user_manage/account/update',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}
export function changepassword(data) {
  return request({
    url: '/user_manage/account/changepw',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}
export function statusswitch(data) {
  return request({
    url: '/user_manage/account/statusswitch',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}
export function searchinfo(data) {
  return request({
    url: '/user_manage/account/match',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

// rewrite code
export function accountPaging(data) {
  return request({
    url: '/user_manage/account/paging',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function accountAdd(data) {
  return request({
    url: '/user_manage/account/add',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function accountUpdate(data) {
  return request({
    url: '/user_manage/account/update',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function accountDel(data) {
  return request({
    url: '/user_manage/account/delete ',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function accountImport(data) {
  return request({
    url: '/user_manage/account/import ',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function accountExport(data) {
  return request({
    url: '/user_manage/account/export ',
    method: 'post',
    data: withFlag(FLAG, data),
    responseType: 'arraybuffer'
  })
}

// 导出接口 ids 为空时, 接口返回下载模板
export function accountImportTemplate() {
  return request({
    url: '/user_manage/account/export ',
    method: 'post',
    data: withFlag(FLAG, { ids: [] }),
    responseType: 'arraybuffer'
  })
}
