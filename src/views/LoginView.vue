<!-- frontend/src/views/LoginView.vue -->
<template>
  <div class="min-h-screen bg-bi-blue flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <div class="bg-white rounded-2xl shadow-2xl p-8">
        <div class="text-center mb-7">
          <div class="w-14 h-14 bg-bi-blue rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span class="text-bi-gold font-bold text-2xl">BI</span>
          </div>
          <h1 class="text-xl font-bold text-gray-800">Selamat Datang</h1>
          <p class="text-gray-400 text-sm mt-1">Chatbot LLM — KPwBI Riau</p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input v-model="form.email" type="email" required placeholder="email@bi.go.id" class="input-field" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input v-model="form.password" type="password" required placeholder="••••••••" class="input-field" />
          </div>
          <div v-if="error" class="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2.5 rounded-lg">{{ error }}</div>
          <button type="submit" class="btn-primary w-full py-2.5 text-base" :disabled="loading">
            {{ loading ? '⏳ Masuk...' : 'Masuk' }}
          </button>
        </form>

        <p class="text-center text-xs text-gray-400 mt-5">Sistem hanya untuk pengguna terotorisasi KPwBI Riau</p>
      </div>

      <div class="mt-4 bg-white/10 rounded-xl p-4 text-center text-blue-200 text-xs space-y-1">
        <p class="font-medium text-white">📋 Akun Default (development)</p>
        <p>admin@bi.go.id · analis@bi.go.id · viewer@bi.go.id</p>
        <p class="text-blue-300">Password semua: <span class="font-mono text-white">password</span></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router  = useRouter()
const auth    = useAuthStore()
const form    = reactive({ email: '', password: '' })
const loading = ref(false)
const error   = ref('')

async function handleLogin() {
  console.log("Tombol ditekan, mencoba login..."); // TAMBAHKAN INI
  loading.value = true; error.value = ''
  try {
    await auth.login(form.email, form.password)
    console.log("Login sukses!"); // TAMBAHKAN INI
    router.push('/')
  } catch (e) {
    console.error("Error login:", e); // TAMBAHKAN INI
    error.value = e.response?.data?.message || 'Login gagal. Periksa email dan password.'
  } finally {
    loading.value = false
  }
}
</script>
