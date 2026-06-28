<!-- frontend/src/views/ChatView.vue -->
<template>
  <AppLayout>
    <div class="flex h-[calc(100vh-65px)]">

      <aside class="w-64 bg-white border-r border-gray-100 flex flex-col flex-shrink-0">
        <div class="px-3 py-3 border-b border-gray-100">
          <button @click="openNewSession" class="btn-primary w-full text-sm py-2">＋ Sesi Baru</button>
        </div>
        <div class="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
          <p v-if="!sessions.length" class="text-xs text-gray-400 text-center py-6">Belum ada sesi.</p>
          <button v-for="s in sessions" :key="s.id" @click="loadSession(s.id)"
            class="w-full text-left px-3 py-2.5 rounded-xl transition-colors"
            :class="activeId===s.id ? 'bg-bi-light border border-bi-blue/20' : 'hover:bg-gray-50'">
            <p class="text-xs font-medium text-gray-800 truncate" :class="activeId===s.id&&'text-bi-blue'">{{ s.title }}</p>
            <p class="text-xs text-gray-400 truncate mt-0.5">{{ s.document_title }}</p>
          </button>
        </div>
      </aside>

      <div class="flex-1 flex flex-col min-w-0">
        <div v-if="activeSession" class="bg-white border-b border-gray-100 px-5 py-3 flex items-center gap-3 flex-shrink-0">
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-gray-800 truncate">{{ activeSession.title }}</p>
            <p class="text-xs text-gray-400">{{ activeSession.document_title }}{{ activeSession.period ? ` · ${activeSession.period}` : '' }}</p>
          </div>
          <button @click="showDeleteConfirm=true" class="text-xs text-gray-400 hover:text-red-500 transition-colors flex-shrink-0">🗑️</button>
        </div>

        <div v-if="!activeId" class="flex-1 flex items-center justify-center">
          <div class="text-center px-4">
            <p class="text-5xl mb-3">🤖</p>
            <h3 class="text-base font-semibold text-gray-700 mb-2">Chatbot LLM KPwBI Riau</h3>
            <p class="text-sm text-gray-400 max-w-xs mb-4">Pilih sesi di panel kiri atau buat sesi baru untuk mulai menganalisis laporan.</p>
            <button @click="openNewSession" class="btn-primary text-sm">＋ Sesi Chat Baru</button>
          </div>
        </div>

        <div v-else ref="msgContainer" class="flex-1 overflow-y-auto px-5 py-5 space-y-4">
          <div v-if="loadingMsgs" class="flex justify-center py-6">
            <div class="animate-spin w-5 h-5 border-2 border-bi-blue border-t-transparent rounded-full"></div>
          </div>
          <div v-else-if="!messages.length" class="text-center py-8 text-gray-400 text-sm">
            Ajukan pertanyaan pertama Anda tentang laporan ini.
          </div>

          <div v-for="msg in messages" :key="msg.id" class="flex gap-2.5" :class="msg.role==='user'?'flex-row-reverse':''">
            <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5 font-bold"
              :class="msg.role==='user'?'bg-bi-blue text-white':'bg-bi-gold text-bi-blue'">
              {{ msg.role==='user'?'👤':'🤖' }}
            </div>
            <div class="max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
              :class="msg.role==='user'
                ?'bg-bi-blue text-white rounded-tr-sm'
                :'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-sm'">
              <div v-if="msg.role==='assistant'" class="prose prose-sm max-w-none" v-html="md(msg.content)"></div>
              <p v-else class="whitespace-pre-wrap">{{ msg.content }}</p>
              <p class="text-xs mt-1 opacity-40">{{ fmtTime(msg.created_at) }}</p>
            </div>
          </div>

          <div v-if="thinking" class="flex gap-2.5">
            <div class="w-7 h-7 rounded-full bg-bi-gold text-bi-blue flex items-center justify-center text-xs font-bold">🤖</div>
            <div class="bg-white border border-gray-100 shadow-sm px-4 py-3 rounded-2xl rounded-tl-sm">
              <div class="flex gap-1 items-center h-4">
                <span v-for="i in 3" :key="i" class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                  :style="`animation-delay:${(i-1)*150}ms`"></span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeId" class="bg-white border-t border-gray-100 px-5 py-3 flex-shrink-0">
          <div class="flex gap-2 items-end">
            <textarea v-model="input" ref="textarea"
              @keydown.enter.exact.prevent="send"
              @keydown.enter.shift.exact="input+='\n'"
              @input="adjustTA"
              rows="1"
              placeholder="Ketik pertanyaan... (Enter kirim, Shift+Enter baris baru)"
              class="flex-1 resize-none input-field py-2.5 text-sm max-h-28 overflow-y-auto"
              :disabled="thinking"></textarea>
            <button @click="send" :disabled="thinking||!input.trim()" class="btn-primary px-4 py-2.5 text-sm flex-shrink-0">
              {{ thinking?'⏳':'📨' }}
            </button>
          </div>
          <p class="text-xs text-gray-400 mt-1.5">Enter kirim · Shift+Enter baris baru</p>
        </div>
      </div>
    </div>

    <div v-if="showNew" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div class="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <h4 class="font-semibold text-gray-800 mb-1">Sesi Chat Baru</h4>
        <p class="text-sm text-gray-500 mb-4">Pilih dokumen yang ingin dianalisis (2 tahun terakhir).</p>
        <div v-if="loadingDocs" class="py-4 text-center"><div class="animate-spin w-5 h-5 border-2 border-bi-blue border-t-transparent rounded-full mx-auto"></div></div>
        <div v-else-if="!readyDocs.length" class="py-4 text-center text-sm text-gray-400">
          Belum ada dokumen siap.
          <router-link to="/documents" class="text-bi-blue hover:underline block mt-1">→ Unggah dokumen</router-link>
        </div>
        <div v-else class="space-y-1.5 max-h-56 overflow-y-auto mb-4">
          <button v-for="d in readyDocs" :key="d.id" @click="selectedDoc=d.id"
            class="w-full text-left px-3 py-2.5 rounded-xl border-2 transition-colors text-sm"
            :class="selectedDoc===d.id?'border-bi-blue bg-bi-light':'border-gray-100 hover:border-gray-200'">
            <p class="font-medium text-gray-800">{{ d.title }}</p>
            <p class="text-xs text-gray-400 mt-0.5">{{ d.period||'Tanpa periode' }} · {{ d.chunk_count }} potongan teks</p>
          </button>
        </div>
        <div class="flex gap-3">
          <button @click="showNew=false;selectedDoc=null" class="btn-secondary flex-1 text-sm">Batal</button>
          <button @click="createSession" :disabled="!selectedDoc||creating" class="btn-primary flex-1 text-sm">
            {{ creating?'Membuat...':'Mulai Chat' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div class="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <h4 class="font-semibold text-gray-800 mb-2">Hapus Sesi?</h4>
        <p class="text-sm text-gray-600 mb-4">Semua riwayat percakapan akan dihapus permanen.</p>
        <div class="flex gap-3">
          <button @click="showDeleteConfirm=false" class="btn-secondary flex-1 text-sm">Batal</button>
          <button @click="doDeleteSession" class="btn-danger flex-1 text-sm">Hapus</button>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import api from '@/stores/api'

const route = useRoute(), router = useRouter()
const sessions = ref([]), messages = ref([])
const activeId = ref(null), input = ref(''), thinking = ref(false)
const loadingMsgs = ref(false), showNew = ref(false), showDeleteConfirm = ref(false)
const readyDocs = ref([]), selectedDoc = ref(null), creating = ref(false), loadingDocs = ref(false)
const msgContainer = ref(null), textarea = ref(null)

const activeSession = computed(() => sessions.value.find(s => s.id === activeId.value))

const fmtTime = d => new Date(d).toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' })

function md(text) {
  return text
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,'<em>$1</em>')
    .replace(/^### (.+)$/gm,'<h3 class="font-semibold mt-2 mb-1">$1</h3>')
    .replace(/^## (.+)$/gm,'<h2 class="font-bold mt-3 mb-1">$1</h2>')
    .replace(/^- (.+)$/gm,'<li class="ml-4 list-disc">$1</li>')
    .replace(/(<li[^>]*>.*<\/li>\n?)+/g,'<ul class="my-1 space-y-0.5">$&</ul>')
    .replace(/\n{2,}/g,'</p><p class="mt-2">')
    .replace(/\n/g,'<br>')
}

function scrollBottom() { nextTick(() => { if (msgContainer.value) msgContainer.value.scrollTop = 9e9 }) }

function adjustTA() {
  nextTick(() => {
    if (textarea.value) { textarea.value.style.height='auto'; textarea.value.style.height = Math.min(textarea.value.scrollHeight,112)+'px' }
  })
}

async function loadSessions() {
  const res = await api.get('/chat/sessions')
  sessions.value = res.data.data
}

async function loadSession(id) {
  activeId.value = id; loadingMsgs.value = true; messages.value = []
  router.replace(`/chat/${id}`)
  try {
    const res = await api.get(`/chat/sessions/${id}/messages`)
    messages.value = res.data.data
    scrollBottom()
  } finally { loadingMsgs.value = false }
}

async function send() {
  const text = input.value.trim()
  if (!text || thinking.value) return
  messages.value.push({ id: Date.now(), role:'user', content:text, created_at: new Date() })
  input.value = ''; thinking.value = true; scrollBottom()
  try {
    const res = await api.post(`/chat/sessions/${activeId.value}/message`, { message: text })
    messages.value.push({ id: Date.now()+1, role:'assistant', content:res.data.message, created_at:new Date() })
    loadSessions()
  } catch (e) {
    messages.value.push({ id:Date.now()+1, role:'assistant', content:'❌ ' + (e.response?.data?.message||'Gagal. Coba lagi.'), created_at:new Date() })
  } finally { thinking.value = false; scrollBottom() }
}

async function openNewSession() {
  showNew.value = true; loadingDocs.value = true
  try {
    const res = await api.get('/documents', { params: { recent:'true' } })
    readyDocs.value = res.data.data.filter(d => d.status==='ready')
  } finally { loadingDocs.value = false }
}

async function createSession() {
  creating.value = true
  try {
    const res = await api.post('/chat/sessions', { documentId: selectedDoc.value })
    showNew.value = false; selectedDoc.value = null
    await loadSessions()
    loadSession(res.data.sessionId)
  } finally { creating.value = false }
}

async function doDeleteSession() {
  await api.delete(`/chat/sessions/${activeId.value}`)
  showDeleteConfirm.value = false; activeId.value = null; messages.value = []
  router.replace('/chat'); loadSessions()
}

onMounted(async () => {
  await loadSessions()
  const id = parseInt(route.params.sessionId)
  if (id) loadSession(id)
})
</script>
