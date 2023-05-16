export default {
  path: 'exam',
  component: () => import('@/views/teach-activity/exam/index'),
  meta: {
    title: '考试管理',
    breadcrumb: false
  },
  children: [
    {
      path: '',
      name: 'examList',
      component: () => import('@/views/teach-activity/exam/list'),
      hidden: true,
      meta: {
        title: '考试管理'
      }
    },
    {
      path: 'add',
      name: 'examAdd',
      component: () => import('@/views/teach-activity/exam/edit'),
      hidden: true,
      meta: {
        title: '新增考试',
        parent: {
          name: 'examList'
        }
      }
    },
    {
      path: ':id',
      name: 'examEdit',
      component: () => import('@/views/teach-activity/exam/edit'),
      hidden: true,
      meta: {
        title: '编辑考试',
        parent: {
          name: 'examList'
        }
      }
    },
    {
      path: 'operation/:id',
      name: 'operation',
      component: () => import('@/views/teach-activity/exam/operation'),
      hidden: true,
      meta: {
        title: '运维',
        parent: {
          name: 'examList'
        }
      }
    }
  ]
}
