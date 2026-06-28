// frontend/src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  { path: '/login',     component: () => import('@/views/LoginView.vue'),     meta: { guest: true } },
  { path: '/',          component: () => import('@/views/DashboardView.vue'),  meta: { auth: true } },
  { path: '/documents', component: () => import('@/views/DocumentsView.vue'), meta: { auth: true } },
  { path: '/chat/:sessionId?', component: () => import('@/views/ChatView.vue'), meta: { auth: true } },
  { path: '/notes',     component: () => import('@/views/NotesView.vue'),     meta: { auth: true } },
  { path: '/users',     component: () => import('@/views/UsersView.vue'),     meta: { auth: true, admin: true } },
]

const router = createRouter({ history: createWebHistory(), routes })

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.auth  && !auth.isLoggedIn) return '/login'
  if (to.meta.guest && auth.isLoggedIn)  return '/'
  if (to.meta.admin && !auth.isAdmin)    return '/'
})

export default router
