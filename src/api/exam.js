import request from '@/utils/request'
import { withFlag, FLAG } from './index'

export function examPaging(data) {
  return request({
    url: '/education_manage/exam_manage/paging',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function examAdd(data) {
  return request({
    url: '/education_manage/exam_manage/add',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function examUpdate(data) {
  return request({
    url: '/education_manage/exam_manage/update',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function examDel(data) {
  return request({
    url: '/education_manage/exam_manage/delete',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function examRetrieve(data) {
  return request({
    url: '/education_manage/exam_manage/retrieve',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function examQuestionList(data) {
  return request({
    url: '/education_manage/exam_manage/exam_question/list',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function examQuestionAdd(data) {
  return request({
    url: '/education_manage/exam_manage/exam_question/add',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function examQuestionDel(data) {
  return request({
    url: '/education_manage/exam_manage/exam_question/delete',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function examQuestionScore(data) {
  return request({
    url: '/education_manage/exam_manage/exam_question/score',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function examQuestionPerscore(data) {
  return request({
    url: '/education_manage/exam_manage/exam_question/perscore',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function examQuestionOperationlist(data) {
  return request({
    url: '/education_manage/exam_manage/exam_question/operationlist',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function examQuestionPeroperationscore(data) {
  return request({
    url: '/education_manage/exam_manage/exam_question/peroperationscore',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function examQuestionPapersave(data) {
  return request({
    url: '/education_manage/exam_manage/exam_question/papersave',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function examUserList(data) {
  return request({
    url: '/education_manage/exam_manage/exam_user/list',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function examUserAdd(data) {
  return request({
    url: '/education_manage/exam_manage/exam_user/add',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function examUserDel(data) {
  return request({
    url: '/education_manage/exam_manage/exam_user/delete',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function previewpaperInfo(data) {
  return request({
    url: '/education_manage/exam_manage/exam_question/previewpaper',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function markPaperUserList(data) {
  return request({
    url: '/education_manage/exam_manage/mark_paper/userlist',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function markPaperList(data) {
  return request({
    url: '/education_manage/exam_manage/mark_paper/list',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function markPaperUserView(data) {
  return request({
    url: '/education_manage/exam_manage/mark_paper/view',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function examViolationList(data) {
  return request({
    url: '/education_manage/exam_manage/violation/list',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function examViolationAdd(data) {
  return request({
    url: '/education_manage/exam_manage/violation/add',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function examViolationUpdate(data) {
  return request({
    url: '/education_manage/exam_manage/violation/update',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function examViolationDel(data) {
  return request({
    url: '/education_manage/exam_manage/violation/delete',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function examViolationSimilarity(data) {
  return request({
    url: '/education_manage/exam_manage/violation/similarity',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function examViolationDiff(data) {
  return request({
    url: '/education_manage/exam_manage/violation/diff',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function examViolationStudent(data) {
  return request({
    url: '/education_manage/exam_manage/violation/student',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function markPaperScore(data) {
  return request({
    url: '/education_manage/exam_manage/mark_paper/score',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function markPaperOperationscore(data) {
  return request({
    url: '/education_manage/exam_manage/mark_paper/operationscore',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function examReportList(data) {
  return request({
    url: '/education_manage/exam_manage/report/list',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function examReportPublish(data) {
  return request({
    url: '/education_manage/exam_manage/report/publish',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function examReportExport(data) {
  return request({
    url: '/education_manage/exam_manage/report/export',
    method: 'post',
    data: withFlag(FLAG, data),
    responseType: 'blob'
  })
}

export function examAnalysisHistogram(data) {
  return request({
    url: '/education_manage/exam_manage/analysis/histogram',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function examAnalysisPiechart(data) {
  return request({
    url: '/education_manage/exam_manage/analysis/piechart',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function examAccess(data) {
  return request({
    url: '/education_manage/exam_manage/access',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function examEnable(data) {
  return request({
    url: '/education_manage/exam_manage/enable',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function markPaperDownload(data) {
  return request({
    url: '/education_manage/exam_manage/mark_paper/download',
    method: 'post',
    data: withFlag(FLAG, data),
    responseType: 'blob'
  })
}

export function examMonitor(data) {
  return request({
    url: '/education_manage/exam_manage/monitor/monitor',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function examPaperExport(data) {
  return request({
    url: '/education_manage/exam_manage/exam_question/paperexport',
    method: 'post',
    data: withFlag(FLAG, data),
    responseType: 'blob'
  })
}
