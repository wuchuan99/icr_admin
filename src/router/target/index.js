import Layout from '@/layout'

export default [
  {
    path: '/targets',
    redirect: '/targets/file-targets',
    component: Layout,
    meta: {
      title: '靶标管理',
      icon: 'iconfont icon-babiaoguanli'
    },
    children: [
      {
        name: 'fileTargets',
        path: 'file-targets',
        component: () => import('@/views/target/file-target/list'),
        meta: {
          title: '文件靶标'
        }
      },
      {
        // name: 'aloneTargets',
        path: 'alone-targets',
        // redirect: '',
        component: () => import('@/views/target/alone-target/index'),
        meta: {
          title: '单机靶标'
        },
        children: [
          {
            name: 'aloneTargetList',
            path: '',
            component: () => import('@/views/target/alone-target/list'),
            meta: {
              title: '单机靶标',
              breadcrumb: false
            }
          },
          {
            name: 'alone-targets-add',
            path: 'add',
            component: () => import('@/views/target/alone-target/edit'),
            hidden: true,
            meta: {
              title: '添加单机靶标',
              parent: {
                name: 'aloneTargetList'
              }
            }
          },
          {
            name: 'alone-targets-edit',
            path: ':id',
            component: () => import('@/views/target/alone-target/edit'),
            hidden: true,
            meta: {
              title: '编辑单机靶标',
              parent: {
                name: 'aloneTargetList'
              }
            }
          }
        ]
      },
      {
        // name: 'sceneTargets',
        path: 'scene-targets',
        // redirect: '',
        component: () => import('@/views/target/scene-target/index'),
        meta: {
          title: '场景靶标'
        },
        children: [
          {
            name: 'sceneTargetList',
            path: '',
            component: () => import('@/views/target/scene-target/list'),
            meta: {
              title: '场景靶标',
              breadcrumb: false
            }
          },
          {
            name: 'scene-targets-add',
            path: 'add',
            component: () => import('@/views/target/scene-target/edit'),
            hidden: true,
            meta: {
              title: '添加场景靶标',
              parent: {
                name: 'sceneTargetList'
              }
            }
          },
          {
            name: 'scene-targets-edit',
            path: ':id',
            component: () => import('@/views/target/scene-target/edit'),
            hidden: true,
            meta: {
              title: '编辑场景靶标',
              parent: {
                name: 'sceneTargetList'
              }
            }
          }
        ]
      }
    ]
  }
]
