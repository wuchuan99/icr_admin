import Layout from '@/layout'
import virtualRoutes from './virtual'
import physicsRoutes from './physics'
import vitualRealRoutes from './vitualReal'

export default [
  {
    path: '/pool_manage',
    redirect: '/pool_manage/virtual',
    component: Layout,
    meta: {
      title: '资源池管理',
      icon: 'iconfont icon-ziyuanchiguanli'
    },
    children: [
      ...physicsRoutes,
      ...virtualRoutes,
      ...vitualRealRoutes
    ]
  }
]
