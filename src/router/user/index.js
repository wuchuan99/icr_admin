import Layout from '@/layout'

export default [
  {
    path: '/user',
    component: Layout,
    redirect: '/user/account',
    name: 'User',
    meta: {
      title: '用户管理',
      icon: 'iconfont icon-yonghuguanli'
    },
    children: [
      {
        path: 'account',
        name: 'Account',
        component: () => import('@/views/user/account/list'),
        meta: {
          title: '账号管理'
        }
      },
      {
        path: 'organiza',
        name: 'Organiza',
        component: () => import('@/views/user/organiza/list'),
        meta: {
          title: '组织管理'
        }
      },
      {
        path: 'role',
        // name: 'Role',
        // redirect: '',
        component: () => import('@/views/user/role/index'),
        meta: {
          title: '角色管理'
        },
        children: [
          {
            path: '',
            name: 'RoleList',
            redirect: '',
            component: () => import('@/views/user/role/list'),
            meta: {
              title: '角色管理',
              breadcrumb: false
            }
          },
          {
            path: 'add',
            name: 'RoleCreate',
            hidden: true,
            component: () => import('@/views/user/role/edit'),
            meta: {
              title: '新建角色',
              parent: {
                name: 'RoleList'
              }
            }
          },
          {
            path: ':id',
            name: 'RoleEdit',
            hidden: true,
            component: () => import('@/views/user/role/edit'),
            meta: {
              title: '编辑角色',
              parent: {
                name: 'RoleList'
              }
            }
          }
        ]
      }
    ]
  }
]

