import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo } from '@/types'
import api from '@/api/client'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserInfo | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!user.value && api.hasToken())

  async function login(username: string, password: string): Promise<boolean> {
    loading.value = true
    error.value = null
    try {
      await api.login(username, password)
      user.value = await api.getMe()
      return true
    } catch (e: any) {
      error.value = e.response?.data?.detail || 'Login fehlgeschlagen'
      return false
    } finally {
      loading.value = false
    }
  }

  function logout(): void {
    api.logout()
    user.value = null
  }

  async function checkAuth(): Promise<boolean> {
    if (!api.hasToken()) return false
    try {
      user.value = await api.getMe()
      return true
    } catch {
      api.clearToken()
      return false
    }
  }

  return { user, loading, error, isAuthenticated, login, logout, checkAuth }
})
