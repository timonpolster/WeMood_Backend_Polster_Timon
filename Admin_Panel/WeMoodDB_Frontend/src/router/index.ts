import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/pages/LoginPage.vue'),
      meta: { guest: true }
    },
    {
      path: '/',
      component: () => import('@/layouts/MainLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        { path: '', name: 'dashboard', component: () => import('@/pages/DashboardPage.vue') },
        { path: 'articles', name: 'articles', component: () => import('@/pages/ArticlesPage.vue') },
        { path: 'articles/new', name: 'article-new', component: () => import('@/pages/ArticleFormPage.vue') },
        { path: 'articles/:id', name: 'article-view', component: () => import('@/pages/ArticleViewPage.vue'), props: true },
        { path: 'articles/:id/edit', name: 'article-edit', component: () => import('@/pages/ArticleFormPage.vue'), props: true },
      ]
    },
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ]
})

router.beforeEach(async (to, _from, next) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth) {
    const ok = await auth.checkAuth()
    if (!ok) return next({ name: 'login', query: { redirect: to.fullPath } })
  }

  if (to.meta.guest && auth.isAuthenticated) {
    return next({ name: 'dashboard' })
  }

  next()
})

export default router
