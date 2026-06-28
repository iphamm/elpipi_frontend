<!-- frontend/src/views/NotesView.vue -->
<template>
  <AppLayout>
    <div class="p-6 space-y-5">

      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-base font-semibold text-gray-800">📝 Catatan Analisis</h2>
          <p class="text-xs text-gray-500 mt-0.5">Simpan temuan dan analisis penting dari hasil chat.</p>
        </div>
        <button @click="openModal()" class="btn-primary text-sm">＋ Catatan Baru</button>
      </div>

      <input v-model="search" type="text" placeholder="🔍  Cari catatan..." class="input-field max-w-sm" />

      <div v-if="loading" class="text-center py-10">
        <div class="animate-spin w-6 h-6 border-2 border-bi-blue border-t-transparent rounded-full mx-auto"></div>
      </div>
      <div v-else-if="!filtered.length" class="text-center py-12 text-gray-400">
        <p class="text-4xl mb-2">📝</p>
        <p class="text-sm">{{ search ? 'Tidak ada catatan yang cocok.' : 'Belum ada catatan. Buat catatan pertama Anda!' }}</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <div v-for="note in filtered" :key="note.id"
          class="card cursor-pointer hover:shadow-md transition-shadow group relative p-5"
          @click="openModal(note)">
          <div v-if="note.document_title" class="inline-flex items-center gap-1 bg-bi-light text-bi-blue text-xs px-2 py-0.5 rounded-full mb-2">
            📄 {{ note.document_title }}
          </div>
          <h3 class="font-semibold text-gray-800 text-sm mb-1 group-hover:text-bi-blue truncate">{{ note.judul }}</h3>
          <p class="text-xs text-gray-500 line-clamp-3 leading-relaxed">{{ note.isi_teks }}</p>
          <div class="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
            <span class="text-xs text-gray-400">{{ fmtDate(note.updated_at) }}</span>
            <button @click.stop="confirmDelete(note)"
              class="text-xs text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">🗑️ Hapus</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="modal.show" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div class="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h4 class="font-semibold text-gray-800">{{ modal.id ? 'Edit Catatan' : 'Catatan Baru' }}</h4>
          <button @click="modal.show=false" class="text-gray-400 hover:text-gray-600 text-lg">✕</button>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">Judul *</label>
            <input v-model="modal.judul" type="text" class="input-field" placeholder="Judul catatan..." />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">Terkait Dokumen</label>
            <select v-model="modal.document_id" class="input-field">
              <option value="">— Tidak terkait dokumen —</option>
              <option v-for="d in documents" :key="d.id" :value="d.id">{{ d.title }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">Isi Catatan *</label>
            <textarea v-model="modal.isi_teks" rows="7" class="input-field resize-none"
              placeholder="Tulis catatan analisis di sini..."></textarea>
          </div>
          <p v-if="modal.error" class="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{{ modal.error }}</p>
        </div>
        <div class="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end">
          <button @click="modal.show=false" class="btn-secondary text-sm">Batal</button>
          <button @click="saveNote" class="btn-primary text-sm" :disabled="modal.saving">
            {{ modal.saving ? 'Menyimpan...' : (modal.id ? 'Simpan Perubahan' : 'Buat Catatan') }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="deleteTarget" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div class="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <h4 class="font-semibold text-gray-800 mb-2">Hapus Catatan?</h4>
        <p class="text-sm text-gray-600 mb-4">Catatan "<strong>{{ deleteTarget.judul }}</strong>" akan dihapus permanen.</p>
        <div class="flex gap-3">
          <button @click="deleteTarget=null" class="btn-secondary flex-1 text-sm">Batal</button>
          <button @click="doDelete" class="btn-danger flex-1 text-sm" :disabled="deleting">
            {{ deleting ? 'Menghapus...' : 'Hapus' }}
          </button>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import api from '@/stores/api'

const notes = ref([]), documents = ref([])
const loading = ref(false), search = ref('')
const deleteTarget = ref(null), deleting = ref(false)

const modal = reactive({ show:false, id:null, judul:'', isi_teks:'', document_id:'', saving:false, error:'' })

const filtered = computed(() => {
  if (!search.value) return notes.value
  const q = search.value.toLowerCase()
  return notes.value.filter(n => n.judul.toLowerCase().includes(q) || n.isi_teks.toLowerCase().includes(q))
})

const fmtDate = d => new Date(d).toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'numeric' })

function openModal(note = null) {
  Object.assign(modal, {
    show: true, error: '',
    id:          note?.id   || null,
    judul:       note?.judul      || '',
    isi_teks:    note?.isi_teks   || '',
    document_id: note?.document_id || '',
  })
}

async function saveNote() {
  if (!modal.judul.trim() || !modal.isi_teks.trim()) { modal.error = 'Judul dan isi catatan wajib diisi.'; return }
  modal.saving = true; modal.error = ''
  try {
    const payload = { judul: modal.judul, isi_teks: modal.isi_teks, document_id: modal.document_id || null }
    if (modal.id) await api.put(`/notes/${modal.id}`, payload)
    else await api.post('/notes', payload)
    modal.show = false
    loadNotes()
  } catch (e) {
    modal.error = e.response?.data?.message || 'Gagal menyimpan.'
  } finally { modal.saving = false }
}

function confirmDelete(note) { deleteTarget.value = note }

async function doDelete() {
  deleting.value = true
  try { await api.delete(`/notes/${deleteTarget.value.id}`); deleteTarget.value = null; loadNotes() }
  finally { deleting.value = false }
}

async function loadNotes() {
  loading.value = true
  try { const res = await api.get('/notes'); notes.value = res.data.data }
  finally { loading.value = false }
}

onMounted(async () => {
  loadNotes()
  const d = await api.get('/documents', { params: { recent:'true' } })
  documents.value = d.data.data.filter(x => x.status==='ready')
})
</script>
