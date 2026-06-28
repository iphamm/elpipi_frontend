<!-- frontend/src/views/DashboardView.vue -->
<template>
  <AppLayout>
    <div class="p-6 space-y-5">
      <div class="bg-gradient-to-r from-bi-blue to-blue-800 rounded-2xl p-6 text-white">
        <p class="text-blue-200 text-sm mb-1">Selamat datang kembali,</p>
        <h2 class="text-xl font-bold mb-3">{{ auth.user?.name }} 👋</h2>
        <div class="flex flex-wrap gap-2">
          <router-link to="/chat" class="btn-gold text-sm px-4 py-2">💬 Mulai Chat</router-link>
          <router-link v-if="auth.isAnalyst" to="/documents" class="bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors">📄 Kelola Dokumen</router-link>
          <router-link to="/notes" class="bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors">📝 Catatan Saya</router-link>
        </div>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div v-for="s in stats" :key="s.label" class="card flex items-center gap-3 p-4">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" :class="s.bg">{{ s.icon }}</div>
          <div>
            <p class="text-xl font-bold text-gray-800">{{ s.value }}</p>
            <p class="text-xs text-gray-500">{{ s.label }}</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div class="card">
          <h3 class="font-semibold text-gray-800 mb-3 text-sm">Chat Terbaru</h3>
          <div v-if="!sessions.length" class="text-center py-6 text-gray-400 text-sm">Belum ada sesi chat.</div>
          <div v-else class="space-y-1">
            <router-link v-for="s in sessions.slice(0,4)" :key="s.id" :to="`/chat/${s.id}`"
              class="flex items-center gap-2 p-2.5 rounded-lg hover:bg-gray-50 transition-colors group">
              <span class="text-base">💬</span>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-800 truncate group-hover:text-bi-blue">{{ s.title }}</p>
                <p class="text-xs text-gray-400 truncate">{{ s.document_title }}</p>
              </div>
            </router-link>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-semibold text-gray-800 text-sm">Catatan Terbaru</h3>
            <router-link to="/notes" class="text-xs text-bi-blue hover:underline">Lihat semua →</router-link>
          </div>
          <div v-if="!notes.length" class="text-center py-6 text-gray-400 text-sm">Belum ada catatan.</div>
          <div v-else class="space-y-1">
            <router-link v-for="n in notes.slice(0,4)" :key="n.id" to="/notes"
              class="flex items-center gap-2 p-2.5 rounded-lg hover:bg-gray-50 transition-colors group">
              <span class="text-base">📝</span>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-800 truncate group-hover:text-bi-blue">{{ n.judul }}</p>
                <p class="text-xs text-gray-400 truncate">{{ n.document_title || 'Tanpa dokumen' }} · {{ fmtDate(n.updated_at) }}</p>
              </div>
            </router-link>
          </div>
        </div>
      </div>

      <div class="card">
        <h3 class="font-semibold text-gray-800 mb-4 text-sm">Cara Menggunakan Sistem</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div v-for="step in steps" :key="step.no" class="flex gap-3">
            <div class="w-7 h-7 bg-bi-blue text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{{ step.no }}</div>
            <div>
              <p class="text-sm font-medium text-gray-800">{{ step.title }}</p>
              <p class="text-xs text-gray-500 mt-0.5 leading-relaxed">{{ step.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/stores/api'

const auth = useAuthStore()
const sessions = ref([]), notes = ref([])
const docCount = ref(0), noteCount = ref(0)

const stats = computed(() => [
  { icon: '📄', label: 'Dokumen',   value: docCount.value,   bg: 'bg-blue-100' },
  { icon: '💬', label: 'Sesi Chat', value: sessions.value.length, bg: 'bg-green-100' },
  { icon: '📝', label: 'Catatan',   value: noteCount.value,  bg: 'bg-yellow-100' },
  { icon: '🤖', label: 'Model AI',  value: 'Claude',         bg: 'bg-purple-100' },
])

const steps = [
  { no:1, title:'Unggah Dokumen PDF', desc:'Upload LPP dari menu Dokumen. Sistem akan mengekstrak teks otomatis.' },
  { no:2, title:'Buat Sesi Chat',     desc:'Pilih dokumen yang ingin dianalisis lalu mulai percakapan.' },
  { no:3, title:'Tanya & Catat',      desc:'Ajukan pertanyaan dalam Bahasa Indonesia. Simpan hasil analisis ke Catatan.' },
]

const fmtDate = (d) => new Date(d).toLocaleDateString('id-ID', { day:'2-digit', month:'short' })

onMounted(async () => {
  const [d, s, n] = await Promise.allSettled([api.get('/documents'), api.get('/chat/sessions'), api.get('/notes')])
  if (d.status === 'fulfilled') docCount.value  = d.value.data.data.length
  if (s.status === 'fulfilled') sessions.value  = s.value.data.data
  if (n.status === 'fulfilled') { notes.value   = n.value.data.data; noteCount.value = notes.value.length }
})
</script>
