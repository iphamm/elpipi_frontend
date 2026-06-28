<!-- frontend/src/components/AppLayout.vue -->
<template>
  <div class="min-h-screen flex bg-gray-50">
    <aside class="w-64 bg-bi-blue flex flex-col shadow-xl flex-shrink-0">
      <div class="px-5 py-4 border-b border-blue-800 flex items-center gap-3">
        <div class="w-10 h-10 bg-bi-gold rounded-xl flex items-center justify-center font-bold text-bi-blue text-lg flex-shrink-0">BI</div>
        <div class="min-w-0">
          <p class="text-white font-semibold text-sm leading-tight">Chatbot LLM</p>
          <p class="text-blue-300 text-xs truncate">KPwBI Riau</p>
        </div>
      </div>

      <nav class="flex-1 px-3 py-4 space-y-0.5">
        <router-link v-for="item in navItems" :key="item.path" :to="item.path"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
          :class="isActive(item.path) ? 'bg-white/20 text-white' : 'text-blue-200 hover:bg-white/10 hover:text-white'">
          <span class="text-base w-5 text-center">{{ item.icon }}</span>{{ item.label }}
        </router-link>
      </nav>

      <div class="px-4 py-4 border-t border-blue-800">
        <div class="flex items-center gap-2 mb-3 px-1">
          <div class="w-8 h-8 bg-bi-gold rounded-full flex items-center justify-center text-bi-blue font-bold text-sm flex-shrink-0">
            {{ auth.user?.name?.charAt(0).toUpperCase() }}
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-white text-sm font-medium truncate">{{ auth.user?.name }}</p>
            <p class="text-blue-300 text-xs capitalize">{{ roleLabel }}</p>
          </div>
        </div>
        <button @click="handleLogout" class="w-full flex items-center gap-2 px-3 py-2 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg text-sm transition-colors">
          <span>🚪</span> Keluar
        </button>
      </div>
    </aside>

    <main class="flex-1 flex flex-col overflow-hidden min-w-0">
      <header class="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
        <h1 class="text-base font-semibold text-gray-800">{{ pageTitle }}</h1>
        <div class="flex items-center gap-2 text-xs text-gray-500">
          <span class="w-2 h-2 bg-green-400 rounded-full"></span> Sistem Aktif
        </div>
      </header>
      <div class="flex-1 overflow-auto"><slot /></div>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route  = useRoute()
const router = useRouter()
const auth   = useAuthStore()

const roleLabel = computed(() => ({ admin:'Administrator', analyst:'Analis', viewer:'Pengguna' }[auth.user?.role] || auth.user?.role))

const navItems = computed(() => {
  const items = [
    { path: '/',          label: 'Dashboard',  icon: '🏠' },
    { path: '/documents', label: 'Dokumen',    icon: '📄' },
    { path: '/chat',      label: 'Chat',       icon: '💬' },
    { path: '/notes',     label: 'Catatan',    icon: '📝' },
  ]
  if (auth.isAdmin) items.push({ path: '/users', label: 'Pengguna', icon: '👥' })
  return items
})

const pageTitles = { '/': 'Dashboard', '/documents': 'Manajemen Dokumen', '/chat': 'Chatbot Analisis', '/notes': 'Catatan Analisis', '/users': 'Manajemen Pengguna' }
const pageTitle  = computed(() => {
  if (route.path.startsWith('/chat')) return 'Chatbot Analisis'
  return pageTitles[route.path] || 'KPwBI Riau'
})

const isActive = (p) => p === '/' ? route.path === '/' : route.path.startsWith(p)

function handleLogout() { auth.logout(); router.push('/login') }
</script>
