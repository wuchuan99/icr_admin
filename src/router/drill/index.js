import Layout from '@/layout'

export default [
  {
    path: '/drill-manage',
    component: Layout,
    redirect: '/drill-manage/drill',
    meta: {
      title: '攻防演练',
      icon: 'iconfont icon-gongfangyanlian'
    },
    children: [
      {
        path: 'drill',
        component: () => import('@/views/drill/index'),
        hidden: true,
        meta: {
          title: '攻防演练',
          breadcrumb: false
        },
        children: [
          {
            path: '',
            name: 'drillList',
            component: () => import('@/views/drill/list'),
            hidden: true,
            meta: {
              title: '攻防演练',
              icon: 'iconfont icon-gongfangyanlian',
              breadcrumb: false,
              activeMenu: '/drill-manage'
            }
          },
          {
            path: 'add',
            name: 'drillAdd',
            component: () => import('@/views/drill/edit'),
            hidden: true,
            meta: {
              title: '新增攻防演练',
              activeMenu: '/drill-manage',
              parent: {
                name: 'drillList'
              }
            }
          },
          {
            path: ':id',
            name: 'drillEdit',
            component: () => import('@/views/drill/edit'),
            hidden: true,
            meta: {
              title: '编辑攻防演练',
              activeMenu: '/drill-manage',
              parent: {
                name: 'drillList'
              }
            }
          },
          {
            path: 'operation/:id',
            name: 'drillOperation',
            component: () => import('@/views/drill/operation'),
            hidden: true,
            meta: {
              title: '运维',
              activeMenu: '/drill-manage',
              parent: {
                name: 'drillList'
              }
            }
          }
        ]
      }
    ]
  }
]
