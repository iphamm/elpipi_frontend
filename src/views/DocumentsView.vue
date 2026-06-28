<!-- frontend/src/views/DocumentsView.vue -->
<template>
  <AppLayout>
    <div class="p-6 space-y-5">

      <div v-if="auth.isAnalyst" class="card">
        <h3 class="font-semibold text-gray-800 mb-4 text-sm">📤 Unggah Dokumen Baru</h3>
        <form @submit.prevent="handleUpload" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="md:col-span-2">
            <label class="block text-xs font-medium text-gray-700 mb-1">Judul Dokumen *</label>
            <input v-model="form.title" type="text" required class="input-field" placeholder="Laporan Perekonomian Provinsi Riau Triwulan I 2024" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">Periode</label>
            <input v-model="form.period" type="text" class="input-field" placeholder="Triwulan I 2024" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Tahun</label>
              <input v-model="form.year" type="number" class="input-field" placeholder="2024" min="2015" max="2024" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Triwulan</label>
              <select v-model="form.quarter" class="input-field">
                <option value="">—</option>
                <option v-for="q in [1,2,3,4]" :key="q" :value="q">TW {{ q }}</option>
              </select>
            </div>
          </div>

          <div class="md:col-span-2">
            <label class="block text-xs font-medium text-gray-700 mb-1">File PDF *</label>
            <div @click="$refs.fileInput.click()" @dragover.prevent="e=>e.preventDefault()" @drop.prevent="e => form.file = e.dataTransfer.files[0]"
              class="border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors"
              :class="form.file ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-bi-blue'">
              <input ref="fileInput" type="file" accept=".pdf" class="hidden" @change="e => form.file = e.target.files[0]" />
              <div v-if="!form.file">
                <p class="text-3xl mb-1">📄</p>
                <p class="text-sm text-gray-600">Klik atau seret file PDF ke sini</p>
                <p class="text-xs text-gray-400 mt-1">Maks. 50 MB · 2 tahun terakhir</p>
              </div>
              <div v-else class="flex items-center justify-center gap-3">
                <span class="text-2xl">✅</span>
                <div class="text-left">
                  <p class="text-sm font-medium text-gray-800">{{ form.file.name }}</p>
                  <p class="text-xs text-gray-400">{{ (form.file.size/1024/1024).toFixed(2) }} MB</p>
                </div>
                <button type="button" @click.stop="form.file=null" class="text-red-400 hover:text-red-600 ml-2 text-lg">✕</button>
              </div>
            </div>
          </div>

          <div v-if="uploading" class="md:col-span-2 flex items-center gap-3 bg-blue-50 px-4 py-3 rounded-lg text-sm text-bi-blue">
            <div class="animate-spin w-4 h-4 border-2 border-bi-blue border-t-transparent rounded-full"></div>
            Mengunggah dan memproses dokumen...
          </div>
          <p v-if="uploadMsg" class="md:col-span-2 text-sm px-3 py-2.5 rounded-lg"
            :class="uploadMsg.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'">
            {{ uploadMsg.text }}
          </p>
          <div class="md:col-span-2 flex justify-end">
            <button type="submit" class="btn-primary text-sm" :disabled="uploading || !form.file || !form.title">
              {{ uploading ? '⏳ Mengunggah...' : '📤 Unggah' }}
            </button>
          </div>
        </form>
      </div>

      <div class="card py-4">
        <div class="flex flex-wrap items-center gap-3">
          <span class="text-sm font-medium text-gray-600">Filter:</span>
          <select v-model="filter.year" class="input-field w-28 text-sm py-1.5">
            <option value="">Semua Tahun</option>
            <option v-for="y in availableYears" :key="y" :value="y">{{ y }}</option>
          </select>
          <select v-model="filter.quarter" class="input-field w-36 text-sm py-1.5">
            <option value="">Semua Triwulan</option>
            <option v-for="q in [1,2,3,4]" :key="q" :value="q">Triwulan {{ q }}</option>
          </select>
          <label class="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input type="checkbox" v-model="filter.recent" class="rounded" />
            <span>2 Tahun Terakhir</span>
          </label>
          <button @click="loadDocuments" class="btn-secondary text-sm py-1.5 px-3">🔄 Refresh</button>
        </div>
      </div>

      <div class="card">
        <div v-if="loading" class="text-center py-10">
          <div class="animate-spin w-7 h-7 border-2 border-bi-blue border-t-transparent rounded-full mx-auto"></div>
        </div>
        <div v-else-if="!documents.length" class="text-center py-10 text-gray-400">
          <p class="text-4xl mb-2">📭</p>
          <p class="text-sm">Tidak ada dokumen. Coba ubah filter atau unggah dokumen baru.</p>
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-gray-100 text-left text-xs text-gray-500 uppercase tracking-wide">
                <th class="py-3 pr-4 font-medium">Judul</th>
                <th class="py-3 pr-4 font-medium">Periode</th>
                <th class="py-3 pr-4 font-medium">Ukuran</th>
                <th class="py-3 pr-4 font-medium">Status</th>
                <th class="py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="doc in documents" :key="doc.id" class="hover:bg-gray-50">
                <td class="py-3 pr-4">
                  <p class="font-medium text-gray-800 truncate max-w-xs">{{ doc.title }}</p>
                  <p class="text-xs text-gray-400 mt-0.5">{{ doc.original_name }}</p>
                </td>
                <td class="py-3 pr-4 text-gray-600 text-xs">{{ doc.period || '—' }}</td>
                <td class="py-3 pr-4 text-gray-500 text-xs">{{ (doc.file_size/1024/1024).toFixed(1) }} MB</td>
                <td class="py-3 pr-4">
                  <span :class="{ 'badge-ready': doc.status==='ready', 'badge-process': doc.status==='processing', 'badge-error': doc.status==='error' }">
                    {{ { ready:'✅ Siap', processing:'⏳ Proses', error:'❌ Error' }[doc.status] }}
                  </span>
                </td>
                <td class="py-3">
                  <div class="flex gap-1">
                    <button v-if="doc.status==='ready'" @click="startChat(doc)"
                      class="text-xs bg-bi-light text-bi-blue px-2.5 py-1 rounded-lg hover:bg-blue-100 font-medium">💬</button>
                    <button v-if="auth.isAnalyst" @click="toggleArchive(doc)"
                      class="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg hover:bg-gray-200 font-medium"
                      :title="doc.is_archived ? 'Pulihkan' : 'Arsipkan'">
                      {{ doc.is_archived ? '📂' : '🗃️' }}
                    </button>
                    <button v-if="auth.isAdmin" @click="deleteTarget=doc"
                      class="text-xs bg-red-50 text-red-500 px-2.5 py-1 rounded-lg hover:bg-red-100 font-medium">🗑️</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="deleteTarget" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
        <div class="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
          <h4 class="font-semibold text-gray-800 mb-2">Hapus Dokumen?</h4>
          <p class="text-sm text-gray-600 mb-4">Dokumen "<strong>{{ deleteTarget.title }}</strong>" akan dihapus permanen.</p>
          <div class="flex gap-3">
            <button @click="deleteTarget=null" class="btn-secondary flex-1 text-sm">Batal</button>
            <button @click="doDelete" class="btn-danger flex-1 text-sm" :disabled="deleting">{{ deleting?'Menghapus...':'Hapus' }}</button>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/stores/api'

const router = useRouter(), auth = useAuthStore()
const documents = ref([]), availableYears = ref([])
const loading = ref(false), uploading = ref(false)
const uploadMsg = ref(null), deleteTarget = ref(null), deleting = ref(false)
const form = reactive({ title:'', period:'', year:'', quarter:'', file:null })
const filter = reactive({ year:'', quarter:'', recent:true })

async function loadDocuments() {
  loading.value = true
  try {
    const params = {}
    if (filter.year)    params.year    = filter.year
    if (filter.quarter) params.quarter = filter.quarter
    if (filter.recent)  params.recent  = 'true'
    const res = await api.get('/documents', { params })
    documents.value = res.data.data
  } finally { loading.value = false }
}

async function handleUpload() {
  uploading.value = true; uploadMsg.value = null
  const fd = new FormData()
  Object.entries(form).forEach(([k,v]) => { if (v && k !== 'file') fd.append(k, v) })
  fd.append('pdf', form.file)
  try {
    await api.post('/documents/upload', fd)
    uploadMsg.value = { ok:true, text:'✅ Berhasil diunggah! Sedang diproses...' }
    Object.assign(form, { title:'', period:'', year:'', quarter:'', file:null })
    setTimeout(loadDocuments, 3000)
  } catch (e) {
    uploadMsg.value = { ok:false, text: e.response?.data?.message || 'Gagal.' }
  } finally { uploading.value = false }
}

async function startChat(doc) {
  const res = await api.post('/chat/sessions', { documentId: doc.id })
  router.push(`/chat/${res.data.sessionId}`)
}

async function toggleArchive(doc) {
  await api.patch(`/documents/${doc.id}/archive`, { is_archived: !doc.is_archived })
  loadDocuments()
}

async function doDelete() {
  deleting.value = true
  try { await api.delete(`/documents/${deleteTarget.value.id}`); deleteTarget.value=null; loadDocuments() }
  finally { deleting.value = false }
}

onMounted(async () => {
  loadDocuments()
  const y = await api.get('/documents/years')
  availableYears.value = y.data.data
})

watch(filter, loadDocuments, { deep: true })
</script>
