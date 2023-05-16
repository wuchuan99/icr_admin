import Layout from '@/layout'

export default [
  {
    path: '/sys',
    component: Layout,
    redirect: '/sys/license',
    meta: {
      title: '系统管理',
      icon: 'iconfont icon-xitongguanli',
      breadcrumb: false
    },
    children: [
      {
        path: 'license',
        name: 'license',
        component: () => import('@/views/system/license/index'),
        meta: {
          title: '授权管理'
        }
      },
      {
        path: 'license/grant',
        component: () => import('@/views/system/license/grant'),
        hidden: true,
        meta: {
          title: '申请授权'
        }
      }
    ]
  }
]
