<!-- Login-Seite mit Formular, Fehleranzeige und Redirect-Unterstützung. -->
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const username = ref('')
const password = ref('')

/** Führt den Login durch und leitet bei Erfolg zur Zielseite weiter. */
async function submit() {
  const ok = await auth.login(username.value, password.value)
  if (ok) {
    const redirect = (route.query.redirect as string) || '/'
    router.push(redirect)
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="w-full max-w-sm">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-wm-primary to-wm-accent items-center justify-center mb-4">
          <span class="text-white font-bold text-xl">W</span>
        </div>
        <h1 class="text-2xl font-bold text-wm-text">WeMood Admin</h1>
        <p class="text-wm-text-muted text-sm mt-1">Artikel-Datenbank Verwaltung</p>
      </div>

      <!-- form -->
      <form @submit.prevent="submit" class="card p-6 space-y-4">
        <div>
          <label class="label">Benutzername</label>
          <input v-model="username" type="text" class="input" placeholder="admin" required autocomplete="username" />
        </div>

        <div>
          <label class="label">Passwort</label>
          <input v-model="password" type="password" class="input" placeholder="••••••••" required autocomplete="current-password" />
        </div>

        <div v-if="auth.error" class="p-3 rounded-lg bg-wm-danger/10 border border-wm-danger/30 text-wm-danger text-sm">
          {{ auth.error }}
        </div>

        <button type="submit" :disabled="auth.loading" class="btn-primary w-full">
          <template v-if="auth.loading">
            <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Anmelden...
          </template>
          <template v-else>Anmelden</template>
        </button>
      </form>
    </div>
  </div>
</template>