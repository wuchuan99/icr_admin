import Vue from 'vue'
import Router from 'vue-router'
import TargetRoutes from './target'
import ResourceRoutes from './resource'
// import ExamRoutes from './exam'
import TeachActivityRoutes from './teach_activity'
import CompetitionRoutes from './competition'
import UserRoutes from './user'
import DrillRoutes from './drill'
import SystemRoutes from './system'
import OperationRoutes from './sys_operations'

export const BasePath = process.env.NODE_ENV === 'development' ? '/' : '/admin/'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [{
  path: '/redirect',
  component: Layout,
  hidden: true,
  children: [{
    path: '/redirect/:path(.*)',
    component: () => import('@/views/redirect/index')
  }]
},
{
  path: '/login',
  component: () => import('@/views/login/index'),
  hidden: true
},
{
  path: '/license/grant',
  component: () => import('@/views/system/license/index'),
  hidden: true
},
{
  path: '/fakeLogin',
  component: () => import('@/views/fakeLogin/index'),
  hidden: true
},
{
  path: '/404',
  component: () => import('@/views/404'),
  hidden: true
},

// { 暂时隐藏仪表盘
//   path: '/',
//   component: Layout,
//   redirect: '/dashboard',
//   children: [{
//     path: 'dashboard',
//     name: 'Dashboard',
//     component: () => import('@/views/dashboard/index'),
//     meta: {
//       title: '仪表盘',
//       icon: 'iconfont icon-yibiaopan'
//     }
//   }]
// },
{
  path: '/',
  component: Layout,
  redirect: '/sys_operations/cluster_manage' // 替换为集群管理
},
...TeachActivityRoutes,
// {
//   path: '/course-manage',
//   component: Layout,
//   redirect: '/course-manage/course',
//   name: 'courseManage',
//   alwaysShow: true,
//   meta: {
//     title: '课程管理',
//     icon: 'iconfont icon-kechengzhongxin'
//   },
//   children: [
//     {
//       path: 'course',
//       // name: 'course',
//       component: () => import('@/views/course-manage/course/index'),
//       meta: {
//         title: '课程'
//       },
//       children: [{
//         path: '',
//         name: 'courseList',
//         hidden: true,
//         component: () => import('@/views/course-manage/course/course-info/index'),
//         meta: {
//           title: '课程',
//           breadcrumb: false
//         }
//       },
//       {
//         path: 'edit',
//         name: 'courseEdit',
//         hidden: true,
//         component: () => import('@/views/course-manage/course/course-info/course-details/edit'),
//         meta: {
//           title: '编辑课程管理',
//           parent: {
//             name: 'courseList'
//           }
//         }
//       },
//       {
//         path: 'create',
//         name: 'courseCreated',
//         hidden: true,
//         component: () => import('@/views/course-manage/course/course-info/course-details/created'),
//         meta: {
//           title: '新建课程管理',
//           parent: {
//             name: 'courseList'
//           }
//         }
//       },
//       {
//         path: 'classMange',
//         // name: 'classMange',
//         hidden: true,
//         component: () => import('@/views/course-manage/course/course-info/class-mange/index'),
//         meta: {
//           title: '课时管理'
//         },
//         children: [
//           {
//             path: '',
//             name: 'classList',
//             hidden: true,
//             component: () => import('@/views/course-manage/course/course-info/class-mange/class-info/index'),
//             meta: {
//               title: '课时管理',
//               breadcrumb: false
//             }
//           }, {
//             path: 'edit',
//             name: 'classEdit',
//             hidden: true,
//             component: () => import('@/views/course-manage/course/course-info/class-mange/class-info/class-details/edit'),
//             meta: {
//               title: '编辑课时',
//               parent: {
//                 name: 'classList'
//               }
//             }
//           },
//           {
//             path: 'created',
//             name: 'classCreated',
//             hidden: true,
//             component: () => import('@/views/course-manage/course/course-info/class-mange/class-info/class-details/created'),
//             meta: {
//               title: '新建课时',
//               parent: {
//                 name: 'classList'
//               }
//             }
//           }
//         ]
//       },
//       {
//         path: 'direction',
//         name: 'direction',
//         hidden: true,
//         component: () => import('@/views/course-manage/course/course-info/direction-mange/index'),
//         meta: {
//           title: '方向管理'
//         }
//       }
//       ]
//     }]
// },
// ...ExamRoutes,
...DrillRoutes,
...CompetitionRoutes,
{
  path: '/question-bank',
  component: Layout,
  redirect: '/question-bank/subject',
  name: 'Question',
  alwaysShow: true,
  meta: {
    title: '题库管理',
    icon: 'iconfont icon-tikuguanli'
  },
  children: [{
    path: 'subject',
    name: 'Subject',
    component: () => import('@/views/question_bank/subject/index'),
    meta: {
      title: '理论题目'
    }
  },
  {
    path: 'operation',
    name: 'QuestionOperation',
    component: () => import('@/views/question_bank/operation/list'),
    meta: {
      title: '实操题目'
    }
  }
  // {
  //   path: 'classify',
  //   name: 'Classify',
  //   // hidden: true ,
  //   component: () => import('@/views/question_bank/classify/index'),
  //   meta: {
  //     title: '分类管理',
  //     icon: 'form'
  //   }
  // },
  // {
  //   path: 'tag',
  //   name: 'Tag',
  //   component: () => import('@/views/question_bank/tag/index'),
  //   meta: {
  //     title: '标签管理'
  //   }
  // }
  ]
},
...TargetRoutes,
...ResourceRoutes,
...UserRoutes,
...OperationRoutes,
...SystemRoutes,
// 404 page must be placed at the end !!!
{
  path: '*',
  redirect: '/404',
  hidden: true
}
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({
    y: 0
  }),
  routes: constantRoutes,
  mode: 'history',
  base: BasePath
})
const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
