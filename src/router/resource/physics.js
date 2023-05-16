export default [
  {
    // name: 'physicsResources',
    path: 'physics',
    component: () => import('@/views/resource/physics/index'),
    meta: {
      title: '物理资源'
    },
    children: [
      {
        name: 'physicsResourcesList',
        path: '',
        component: () => import('@/views/resource/physics/list'),
        meta: {
          title: '物理资源',
          breadcrumb: false
        }
      },
      {
        name: 'equipmentManagement',
        path: ':id',
        component: () => import('@/views/resource/physics/equipment'),
        meta: {
          title: '设备管理',
          parent: {
            name: 'physicsResourcesList'
          }
        },
        hidden: true
      }
    ]
  }
]
