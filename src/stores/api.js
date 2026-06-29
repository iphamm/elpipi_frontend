// frontend/src/stores/api.js
import axios from 'axios'

// Menggunakan VITE_API_URL dari environment variable, 
// dengan fallback langsung ke URL Railway sebagai pengaman.
const baseURL = (import.meta.env.VITE_API_URL || 'https://elpipi-production.up.railway.app') + '/api'

const api = axios.create({ 
  baseURL, 
  timeout: 60000 
})

// Interceptor untuk menyertakan token di setiap request
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token')
  if (token) {
    cfg.headers['Authorization'] = `Bearer ${token}`
  }
  return cfg
})

// Interceptor untuk menangani error (jika token kadaluarsa/tidak valid)
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response && [401, 403].includes(err.response.status)) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // Redirect ke login jika akses ditolak
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
