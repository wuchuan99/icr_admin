import Layout from '@/layout'
import courseManage from './courseManage'
import exam from './exam'
import analysisStatistics from './analysisStatistics'

export default [
  {
    path: '/teach-activity',
    name: 'teachActivity',
    component: Layout,
    redirect: '/teach-activity/course-manage',
    meta: {
      title: '教学活动',
      icon: 'iconfont icon-kechengzhongxin'
    },
    children: [courseManage, exam, analysisStatistics]
  }
]
