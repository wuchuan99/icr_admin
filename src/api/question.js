import request from '@/utils/request'
import { withFlag, FLAG } from './index'

/**
 * question management
 */
// add tag
export function tagAdd(data) {
  return request({
    url: '/question_manage/question/tag/add',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}
// delete tag
export function tagDel(data) {
  return request({
    url: '/question_manage/question/tag/delete',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}
// update tag
export function tagUpdate(data) {
  return request({
    url: '/question_manage/question/tag/update',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}
// paging tag
export function tagPaging(data) {
  return request({
    url: '/question_manage/question/tag/paging',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}
// list all tags
export function tagList(data) {
  return request({
    url: '/question_manage/question/tag/list',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}
// add question
export function questionAdd(data) {
  return request({
    url: '/question_manage/question/add',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}
// delete question
export function questionDel(data) {
  return request({
    url: '/question_manage/question/delete',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}
// update question
export function questionUpdate(data) {
  return request({
    url: '/question_manage/question/update',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}
// paging question
export function questionPaging(data) {
  return request({
    url: '/question_manage/question/paging',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function questionEnable(data) {
  return request({
    url: '/question_manage/question/questionenable',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

// question operation
export function questionOperationAdd(data) {
  return request({
    url: '/question_manage/operation/add',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}
export function questionOperationDel(data) {
  return request({
    url: '/question_manage/operation/delete',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}
export function questionOperationUpdate(data) {
  return request({
    url: '/question_manage/operation/update',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}
export function questionOperationPaging(data) {
  return request({
    url: '/question_manage/operation/paging',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}
export function questionOperationRetrieve(data) {
  return request({
    url: '/question_manage/operation/retrieve',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}
