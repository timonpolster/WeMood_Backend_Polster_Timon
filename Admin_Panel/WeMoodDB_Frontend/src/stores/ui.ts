import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Toast } from '@/types'

export const useUIStore = defineStore('ui', () => {
  const toasts = ref<Toast[]>([])

  function show(type: Toast['type'], message: string, duration = 4000): void {
    const id = Math.random().toString(36).slice(2)
    toasts.value.push({ id, type, message })
    if (duration > 0) setTimeout(() => remove(id), duration)
  }

  function remove(id: string): void {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  const success = (msg: string) => show('success', msg)
  const error = (msg: string) => show('error', msg, 6000)
  const warning = (msg: string) => show('warning', msg)

  return { toasts, show, remove, success, error, warning }
})
