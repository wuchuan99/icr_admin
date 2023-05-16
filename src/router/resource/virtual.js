export default [
  {
    name: 'virtualResources',
    path: 'virtual',
    component: () => import('@/views/resource/virtual/list'),
    meta: {
      title: '虚拟资源'
    }
  }
]
