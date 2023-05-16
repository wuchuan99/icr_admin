import request from '@/utils/request'
import { withFlag, FLAG } from './index'

export function getLicenseInfo(data) {
  return request({
    url: '/sys_manage/license/systeminfo',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function exportLicense(data) {
  return request({
    url: '/sys_manage/license/export',
    method: 'post',
    data: withFlag(FLAG, data),
    responseType: 'arraybuffer'
  })
}

export function importLicense(data) {
  return request({
    url: '/sys_manage/license/importlicense',
    method: 'post',
    data: data,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export function readLicense(data) {
  return request({
    url: '/sys_manage/license/convertfile',
    method: 'post',
    data: data,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export function obtainmodule(data) {
  return request({
    url: '/sys_manage/license/obtainmodule',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function applyLicense(data) {
  return request({
    url: '/sys_manage/license/applylicense',
    method: 'post',
    data: withFlag(FLAG, data),
    responseType: 'arraybuffer'
  })
}
