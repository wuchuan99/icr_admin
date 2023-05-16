import request from '@/utils/request'
import {
  withFlag,
  FLAG
} from './index'

/**
 * course management
 */
// add course
export function courseAdd(data) {
  return request({
    url: '/education_manage/course_manage/course/add',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}
// delete course
export function courseDel(data) {
  return request({
    url: '/education_manage/course_manage/course/delete',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}
// update course
export function courseUpdate(data) {
  return request({
    url: '/education_manage/course_manage/course/update',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}
// paging course
export function coursePaging(data) {
  return request({
    url: '/education_manage/course_manage/course/paging',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}
// 编辑课程信息
export function courseRetrieve(data) {
  return request({
    url: '/education_manage/course_manage/course/retrieve',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}
// add direction
export function directionAdd(data) {
  return request({
    url: '/education_manage/course_manage/course/direction/add',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}
// delete direction
export function directionDel(data) {
  return request({
    url: '/education_manage/course_manage/course/direction/delete',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}
// update direction
export function directionUpdate(data) {
  return request({
    url: '/education_manage/course_manage/course/direction/update',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}
// paging direction
export function directionPaging(data) {
  return request({
    url: '/education_manage/course_manage/course/direction/paging',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}
// list all directions
export function directionList(data) {
  return request({
    url: '/education_manage/course_manage/course/direction/list',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}
// 课时 新增
export function itemAdd(data) {
  return request({
    url: '/education_manage/course_manage/course/item/add',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}
// 课时 删除
export function itemDel(data) {
  return request({
    url: '/education_manage/course_manage/course/item/delete',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}
// 课时 修改
export function itemUpdate(data) {
  return request({
    url: '/education_manage/course_manage/course/item/update',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}
// '全部' 课时列表
export function All_ItemPaging(data) {
  return request({
    url: '/education_manage/course_manage/course/item/paging',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}
// '章节' 课时列表
export function itemPaging(data) {
  return request({
    url: '/education_manage/course_manage/course/item/list',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}
// 课时 详情
export function itemRetrieve(data) {
  return request({
    url: '/education_manage/course_manage/course/item/retrieve',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}
// '章节' 课时列表 排序
export function itemSorting(data) {
  return request({
    url: '/education_manage/course_manage/course/item/sorting',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}
// 章节list
export function chapterPaging(data) {
  return request({
    url: '/education_manage/course_manage/course/chapter/list',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}
// 章节Add
export function chapterAdd(data) {
  return request({
    url: '/education_manage/course_manage/course/chapter/add',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}
// 章节Update
export function chapterUpdate(data) {
  return request({
    url: '/education_manage/course_manage/course/chapter/update',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}
// 章节Delete
export function chapterDelete(data) {
  return request({
    url: '/education_manage/course_manage/course/chapter/delete',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

// 富文本上传图片
export function fileUpload(data) {
  return request({
    url: '/common/file/upload',
    method: 'post',
    data
  })
}
