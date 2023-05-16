import Layout from '@/layout'

export default [
  {
    path: '/sys_operations',
    component: Layout,
    redirect: '/sys_operations/cluster_manage',
    // alwaysShow: true,
    name: 'Sys_operations',
    meta: {
      title: '系统运维',
      icon: 'iconfont icon-xitongyunwei'
    },
    children: [
      {
        path: 'cluster_manage',
        component: () => import('@/views/sys_operations/cluster_manage/index'),
        meta: {
          title: '集群管理'
        },
        children: [
          {
            path: '',
            name: 'Cluster_manage',
            component: () => import('@/views/sys_operations/cluster_manage/list'),
            meta: {
              title: '集群管理',
              breadcrumb: false,
              activeMenu: '/sys_operations/cluster_manage'
            }
          },
          {
            path: 'virtual_machine',
            hidden: true,
            component: () => import('@/views/sys_operations/cluster_manage/virtual_machine/index'),
            meta: {
              title: '虚拟机',
              activeMenu: '/sys_operations/cluster_manage',
              parent: {
                name: 'Cluster_manage'
              }
            },
            children: [
              {
                path: '',
                name: 'Cluster_manage_list',
                component: () => import('@/views/sys_operations/cluster_manage/virtual_machine/list'),
                meta: {
                  activeMenu: '/sys_operations/cluster_manage'
                }
              },
              {
                path: ':id',
                name: 'Cluster_manage_detail',
                component: () => import('@/views/sys_operations/cluster_manage/virtual_machine/detail'),
                meta: {
                  activeMenu: '/sys_operations/cluster_manage'
                }
              }
            ]
          },
          {
            path: 'virtual_port',
            name: 'virtual_port',
            hidden: true,
            component: () => import('@/views/sys_operations/cluster_manage/virtual_port/list'),
            meta: {
              title: '虚拟端口',
              activeMenu: '/sys_operations/cluster_manage',
              parent: {
                name: 'Cluster_manage'
              }
            }
          },
          {
            path: 'image',
            name: 'image_file',
            hidden: true,
            component: () => import('@/views/sys_operations/cluster_manage/image_file/list'),
            meta: {
              title: '镜像',
              activeMenu: '/sys_operations/cluster_manage',
              parent: {
                name: 'Cluster_manage'
              }
            }
          },
          {
            path: 'virtual_network',
            name: 'virtual_network',
            hidden: true,
            component: () => import('@/views/sys_operations/cluster_manage/virtual_network/list'),
            meta: {
              title: '虚拟网络',
              activeMenu: '/sys_operations/cluster_manage',
              parent: {
                name: 'Cluster_manage'
              }
            }
          }
        ]
      },
      {
        name: 'sysLogs',
        path: 'sys-logs',
        component: () => import('@/views/sys_operations/sys-log/log'),
        meta: {
          title: '平台日志'
        }
      }
    ]
  }
]

