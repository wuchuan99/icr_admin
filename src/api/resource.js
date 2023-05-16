import request from '@/utils/request'
import { withFlag, FLAG } from './index'

export function virtualImageAdd(data) {
  return request({
    url: '/pool_manage/virtual_resource/image/add',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function virtualImageDel(data) {
  return request({
    url: '/pool_manage/virtual_resource/image/delete',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function virtualImageUpdate(data) {
  return request({
    url: '/pool_manage/virtual_resource/image/update',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function virtualImagePaging(data) {
  return request({
    url: '/pool_manage/virtual_resource/image/paging',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function virtualImageList(data) {
  return request({
    url: '/pool_manage/virtual_resource/image/list',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function precheckUpload(data) {
  return request({
    url: '/common/file/precheckupload',
    method: 'post',
    data: withFlag('file', data)
  })
}

export function commitUpload(data) {
  return request({
    url: '/common/file/commitupload',
    method: 'post',
    data: withFlag('file', data)
  })
}

export function physicalPaging(data) {
  return request({
    url: '/pool_manage/physical_resource/paging',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function physicalAdd(data) {
  return request({
    url: '/pool_manage/physical_resource/add',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function physicalUpdate(data) {
  return request({
    url: '/pool_manage/physical_resource/update',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function physicalDel(data) {
  return request({
    url: '/pool_manage/physical_resource/delete',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function equipmentList(data) {
  return request({
    url: '/pool_manage/physical_resource/equipment/list',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function equipmentAdd(data) {
  return request({
    url: '/pool_manage/physical_resource/equipment/add',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function equipmentUpdate(data) {
  return request({
    url: '/pool_manage/physical_resource/equipment/update',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function equipmentDel(data) {
  return request({
    url: '/pool_manage/physical_resource/equipment/delete',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function physicalLogo(data) {
  return request({
    url: '/pool_manage/physical_resource/phylogo',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

