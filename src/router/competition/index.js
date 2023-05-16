import Layout from '@/layout'

export default [
  {
    path: '/competition-manage',
    component: Layout,
    redirect: '/competition-manage/competitions',
    meta: {
      title: '竞赛管理',
      icon: 'iconfont icon-jingsaiguanli'
    },
    children: [
      {
        path: 'competitions',
        component: () => import('@/views/competition/index'),
        hidden: true,
        meta: {
          title: '竞赛管理',
          breadcrumb: false
        },
        children: [
          {
            path: '',
            name: 'competitionList',
            component: () => import('@/views/competition/list'),
            hidden: true,
            meta: {
              title: '竞赛管理',
              icon: 'iconfont icon-jingsaiguanli',
              breadcrumb: false,
              activeMenu: '/competition-manage'
            }
          },
          {
            path: 'add',
            name: 'competitionAdd',
            component: () => import('@/views/competition/edit'),
            hidden: true,
            meta: {
              title: '新增竞赛',
              activeMenu: '/competition-manage',
              parent: {
                name: 'competitionList'
              }
            }
          },
          {
            path: ':id',
            name: 'competitionEdit',
            component: () => import('@/views/competition/edit'),
            hidden: true,
            meta: {
              title: '编辑竞赛',
              activeMenu: '/competition-manage',
              parent: {
                name: 'competitionList'
              }
            }
          },
          {
            path: 'operation/:id',
            name: 'competitionOperation',
            component: () => import('@/views/competition/operation'),
            hidden: true,
            meta: {
              title: '运维',
              activeMenu: '/competition-manage',
              parent: {
                name: 'competitionList'
              }
            }
          }
        ]
      }
    ]
  }
]
