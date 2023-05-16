export default {
  path: 'course-manage',
  name: 'courseManage',
  component: () => import('@/views/teach-activity/course-manage/index'),
  redirect: '/teach-activity/course-manage/course',
  meta: {
    title: '课程管理'
  },
  children: [
    {
      path: 'course',
      component: () => import('@/views/teach-activity/course-manage/course/index'),
      meta: {
        title: '课程'
      },
      children: [
        {
          path: '',
          name: 'courseList',
          component: () => import('@/views/teach-activity/course-manage/course/course-info/index'),
          meta: {
            title: '课程',
            breadcrumb: false
          },
          hidden: true
        },
        {
          path: 'edit',
          name: 'courseEdit',
          hidden: true,
          component: () => import('@/views/teach-activity/course-manage/course/course-info/course-details/edit'),
          meta: {
            title: '编辑课程管理',
            parent: {
              name: 'courseList'
            }
          }
        },
        {
          path: 'create',
          name: 'courseCreated',
          hidden: true,
          component: () => import('@/views/teach-activity/course-manage/course/course-info/course-details/created'),
          meta: {
            title: '新建课程管理',
            parent: {
              name: 'courseList'
            }
          }
        },
        {
          path: 'classMange',
          // name: 'classMange',
          hidden: true,
          component: () => import('@/views/teach-activity/course-manage/course/course-info/class-mange/index'),
          meta: {
            title: '课时管理'
          },
          children: [
            {
              path: '',
              name: 'classList',
              hidden: true,
              component: () => import('@/views/teach-activity/course-manage/course/course-info/class-mange/class-info/index'),
              meta: {
                title: '课时管理',
                breadcrumb: false
              }
            }, {
              path: 'edit',
              name: 'classEdit',
              hidden: true,
              component: () => import('@/views/teach-activity/course-manage/course/course-info/class-mange/class-info/class-details/edit'),
              meta: {
                title: '编辑课时',
                parent: {
                  name: 'classList'
                }
              }
            },
            {
              path: 'created',
              name: 'classCreated',
              hidden: true,
              component: () => import('@/views/teach-activity/course-manage/course/course-info/class-mange/class-info/class-details/created'),
              meta: {
                title: '新建课时',
                parent: {
                  name: 'classList'
                }
              }
            }
          ]
        },
        {
          path: 'direction',
          name: 'direction',
          hidden: true,
          component: () => import('@/views/teach-activity/course-manage/course/course-info/direction-mange/index'),
          meta: {
            title: '方向管理'
          }
        }
      ]
    },
    {
      path: 'schedule',
      name: 'schedule',
      component: () => import('@/views/teach-activity/course-manage/schedule/index'),
      meta: {
        title: '课程表'
      }
    }
  ]
}
