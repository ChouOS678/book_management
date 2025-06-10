import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/pages/auth/Login.vue')
    },
    {
      path: '/',
      component: MainLayout,
      children: [
        {
          path: '',
          redirect: '/dashboard'
        },
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('@/pages/dashboard/Index.vue')
        },
        {
          path: 'books',
          name: 'books',
          component: () => import('@/pages/book/List.vue')
        },
        {
          path: 'books/add',
          name: 'book-add',
          component: () => import('@/pages/book/Form.vue')
        },
        {
          path: 'books/edit/:id',
          name: 'book-edit',
          component: () => import('@/pages/book/Form.vue')
        },
        {
          path: 'records',
          name: 'records',
          component: () => import('@/pages/record/List.vue')
        },
        {
          path: 'records/add',
          name: 'record-add',
          component: () => import('@/pages/record/Form.vue')
        },
        {
          path: 'reports',
          name: 'reports',
          component: () => import('@/pages/report/Index.vue')
        },
        {
          path: 'logs',
          name: 'logs',
          component: () => import('@/pages/log/List.vue')
        }
      ]
    }
  ]
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.path !== '/login' && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router 