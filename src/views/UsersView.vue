<!-- frontend/src/views/UsersView.vue -->
<template>
  <AppLayout>
    <div class="p-6 space-y-5">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-base font-semibold text-gray-800">👥 Manajemen Pengguna</h2>
          <p class="text-xs text-gray-500 mt-0.5">Kelola akun dan hak akses pengguna sistem.</p>
        </div>
        <button @click="modal.show=true" class="btn-primary text-sm">＋ Tambah Pengguna</button>
      </div>

      <div class="card overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wide text-left">
              <th class="py-3 pr-4 font-medium">Nama</th>
              <th class="py-3 pr-4 font-medium">Email</th>
              <th class="py-3 pr-4 font-medium">Role</th>
              <th class="py-3 pr-4 font-medium">Login Terakhir</th>
              <th class="py-3 pr-4 font-medium">Status</th>
              <th class="py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="u in users" :key="u.id" class="hover:bg-gray-50">
              <td class="py-3 pr-4 font-medium text-gray-800">{{ u.name }}</td>
              <td class="py-3 pr-4 text-gray-600">{{ u.email }}</td>
              <td class="py-3 pr-4">
                <span class="text-xs px-2 py-0.5 rounded-full font-medium"
                  :class="{ 'bg-purple-100 text-purple-700': u.role==='admin', 'bg-blue-100 text-blue-700': u.role==='analyst', 'bg-gray-100 text-gray-600': u.role==='viewer' }">
                  {{ { admin:'Administrator', analyst:'Analis', viewer:'Pengguna' }[u.role] }}
                </span>
              </td>
              <td class="py-3 pr-4 text-xs text-gray-400">{{ u.last_login ? fmtDate(u.last_login) : 'Belum pernah' }}</td>
              <td class="py-3 pr-4">
                <span class="text-xs px-2 py-0.5 rounded-full font-medium"
                  :class="u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'">
                  {{ u.is_active ? 'Aktif' : 'Nonaktif' }}
                </span>
              </td>
              <td class="py-3">
                <button @click="toggleStatus(u)"
                  class="text-xs px-2.5 py-1 rounded-lg font-medium transition-colors"
                  :class="u.is_active ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'">
                  {{ u.is_active ? 'Nonaktifkan' : 'Aktifkan' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div v-for="r in roles" :key="r.name" class="card p-4">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-lg">{{ r.icon }}</span>
            <span class="font-semibold text-sm text-gray-800">{{ r.name }}</span>
          </div>
          <ul class="space-y-1">
            <li v-for="p in r.perms" :key="p" class="text-xs text-gray-500 flex items-center gap-1.5">
              <span class="text-green-500">✓</span> {{ p }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div v-if="modal.show" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div class="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h4 class="font-semibold text-gray-800">Tambah Pengguna</h4>
          <button @click="modal.show=false" class="text-gray-400 hover:text-gray-600 text-lg">✕</button>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">Nama Lengkap *</label>
            <input v-model="modal.name" type="text" class="input-field" placeholder="Nama pengguna" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">Email *</label>
            <input v-model="modal.email" type="email" class="input-field" placeholder="email@bi.go.id" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">Password *</label>
            <input v-model="modal.password" type="password" class="input-field" placeholder="Min. 6 karakter" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">Role</label>
            <select v-model="modal.role" class="input-field">
              <option value="viewer">Pengguna (Viewer)</option>
              <option value="analyst">Analis (Analyst)</option>
              <option value="admin">Administrator (Admin)</option>
            </select>
          </div>
          <p v-if="modal.error" class="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{{ modal.error }}</p>
        </div>
        <div class="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end">
          <button @click="modal.show=false" class="btn-secondary text-sm">Batal</button>
          <button @click="createUser" class="btn-primary text-sm" :disabled="modal.saving">
            {{ modal.saving ? 'Menyimpan...' : 'Buat Akun' }}
          </button>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import api from '@/stores/api'

const users = ref([])
const modal = reactive({ show:false, name:'', email:'', password:'', role:'viewer', saving:false, error:'' })

const roles = [
  { icon:'👑', name:'Administrator', perms:['Upload & hapus dokumen','Kelola pengguna','Akses semua fitur'] },
  { icon:'🔍', name:'Analis',        perms:['Upload dokumen','Buat sesi chat','Kelola catatan analisis'] },
  { icon:'👁️', name:'Pengguna',      perms:['Lihat dokumen','Buat sesi chat','Kelola catatan sendiri'] },
]

const fmtDate = d => new Date(d).toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'numeric' })

async function loadUsers() { const res = await api.get('/auth/users'); users.value = res.data.data }

async function toggleStatus(u) {
  await api.patch(`/auth/users/${u.id}`, { is_active: !u.is_active })
  loadUsers()
}

async function createUser() {
  if (!modal.name || !modal.email || !modal.password) { modal.error = 'Semua field wajib diisi.'; return }
  modal.saving = true; modal.error = ''
  try {
    await api.post('/auth/register', { name:modal.name, email:modal.email, password:modal.password, role:modal.role })
    modal.show = false
    Object.assign(modal, { name:'', email:'', password:'', role:'viewer' })
    loadUsers()
  } catch (e) {
    modal.error = e.response?.data?.message || 'Gagal membuat akun.'
  } finally { modal.saving = false }
}

onMounted(loadUsers)
</script>
