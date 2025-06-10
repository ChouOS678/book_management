import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/store/auth'
//import { useUserStore } from '../store/user.js'

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/pages/auth/Login.vue'),
        meta: { guestOnly: true }
    },
    {
        path: '/register',
        name: 'Register',
        component: () => import('@/pages/auth/Register.vue'),
        meta: { guestOnly: true }
    },
    {
        path: '/',
        component: () => import('@/layouts/MainLayout.vue'),
        meta: { requiresAuth: true },
        children: [
            {
                path: '',
                redirect: '/dashboard'
            },
            {
                path: 'dashboard',
                name: 'Dashboard',
                component: () => import('@/pages/dashboard/Index.vue')
            },
            {
                path: 'books',
                name: 'BookList',
                component: () => import('@/pages/book/List.vue')
            },
            {
                path: 'books/add',
                name: 'BookAdd',
                component: () => import('@/pages/book/Form.vue'),
                meta: { adminOnly: true }
            },
            {
                path: 'books/edit/:id',
                name: 'BookEdit',
                component: () => import('@/pages/book/Form.vue'),
                props: true,
                meta: { adminOnly: true }
            },
            {
                path: 'records',
                name: 'RecordList',
                component: () => import('@/pages/record/List.vue')
            },
            {
                path: 'records/add',
                name: 'RecordAdd',
                component: () => import('@/pages/record/Form.vue')
            },
            // {
            //     path: '/reports',
            //     name: 'Reports',
            //     component: () => import('@/pages/report/Index.vue'),
            //     meta: { adminOnly: true }
            // },
            // 用户登录日志（以表格形式呈现用户名、登录时间、IP地址等关键字段）
            {
                path: 'logs',
                name: 'Logs',
                component: () => import('@/pages/log/List.vue'),
                meta: { adminOnly: true }
            }
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to, from, next) => {
    const authStore = useAuthStore()

    // 检查是否需要认证
    if (to.matched.some(record => record.meta && record.meta.requiresAuth)) {
        if (!authStore.isAuthenticated) {
            next({ name: 'Login' });
            return;
        }
    }

    // 检查管理员权限
    if (to.matched.some(record => record.meta && record.meta.adminOnly && !authStore.isAdmin)) {
        next({ name: 'Dashboard' }); // 或者一个无权限页面
        return;
    }

    // 已登录用户禁止访问登录/注册页
    if (to.matched.some(record => record.meta && record.meta.guestOnly) && authStore.isAuthenticated) {
        next({ name: 'Dashboard' });
        return;
    }

    next(); // 确保在所有条件都不满足时调用 next()
})

export default router