export default {
  path: 'analysis-statistics',
  name: 'analysisStatistics',
  component: () => import('@/views/teach-activity/analysis-statistics/index'),
  alwaysShow: true,
  redirect: '/teach-activity/analysis-statistics/course-analysis',
  meta: {
    title: '分析统计'
  },
  children: [
    {
      path: 'course-analysis',
      component: () => import('@/views/teach-activity/analysis-statistics/course-analysis/index'),
      meta: {
        title: '课程分析'
      },
      children: [
        {
          path: '',
          name: 'courseAnalysis',
          component: () => import('@/views/teach-activity/analysis-statistics/course-analysis/course-analysis-info/index'),
          meta: {
            title: '课程分析',
            breadcrumb: false
          },
          hidden: true
        },
        {
          path: 'period-statistics/:id',
          name: 'periodStatistics',
          hidden: true,
          component: () => import('@/views/teach-activity/analysis-statistics/course-analysis/course-analysis-info/period-statistics/index'),
          meta: {
            title: '课时统计数据查看'
          }
        }
      ]
    },
    {
      path: 'student-analysis',
      component: () => import('@/views/teach-activity/analysis-statistics/student-analysis/index'),
      meta: {
        title: '学员能力分析',
        activeMenu: '/teach-activity/analysis-statistics/student-analysis',
        breadcrumb: false
      },
      children: [
        {
          path: '',
          name: 'studentAnalysis',
          component: () => import('@/views/teach-activity/analysis-statistics/student-analysis/list'),
          meta: {
            title: '学员能力分析',
            activeMenu: '/teach-activity/analysis-statistics/student-analysis'
          }
        },
        {
          path: ':id',
          hidden: true,
          name: 'studentAnalysiDetail',
          component: () => import('@/views/teach-activity/analysis-statistics/student-analysis/detail'),
          meta: {
            title: '个人信息',
            activeMenu: '/teach-activity/analysis-statistics/student-analysis'
          }
        }
      ]
    }
  ]
}
