import request from '@/utils/request'
import { withFlag, FLAG } from './index'

export function courserank(data) {
  return request({
    url: '/education_manage/analysis_statistics/course_analysis/courserank',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function directionrank(data) {
  return request({
    url: '/education_manage/analysis_statistics/course_analysis/directionrank',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function courseAnalysisPaging(data) {
  return request({
    url: '/education_manage/analysis_statistics/course_analysis/paging',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function selectList(data) {
  return request({
    url: '/education_manage/analysis_statistics/course_analysis/select',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function courseAnalysisItempaging(data) {
  return request({
    url: '/education_manage/analysis_statistics/course_analysis/itempaging',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

export function courseAnalysisAccountpaging(data) {
  return request({
    url: '/education_manage/analysis_statistics/course_analysis/accountpaging',
    method: 'post',
    data: withFlag(FLAG, data)
  })
}

