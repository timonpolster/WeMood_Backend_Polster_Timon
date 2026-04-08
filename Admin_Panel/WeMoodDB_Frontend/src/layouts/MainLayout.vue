<!-- Haupt-Layout mit Sidebar-Navigation, Benutzeranzeige und Logout-Funktion. -->
<script setup lang="ts">
import { RouterView, RouterLink, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const auth = useAuthStore()

/** Meldet den Benutzer nach Bestätigung ab und leitet zum Login weiter. */
function logout() {
  if (confirm('Wirklich abmelden?')) {
    auth.logout()
    window.location.href = '/login'
  }
}
</script>

<template>
  <div class="flex min-h-screen">

    <!-- sidebar -->
    <aside class="w-56 bg-wm-surface border-r border-wm-border flex flex-col">

      <!-- logo -->
      <div class="h-14 flex items-center px-4 border-b border-wm-border">
        <RouterLink to="/" class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-wm-primary to-wm-accent flex items-center justify-center">
            <span class="text-white font-bold text-sm">W</span>
          </div>
          <span class="font-semibold text-wm-text">WeMood Admin</span>
        </RouterLink>
      </div>

      <!-- navigatoin -->
      <nav class="flex-1 p-3 space-y-1">
        <RouterLink
            to="/"
            :class="[
            'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
            route.path === '/' ? 'bg-wm-primary/20 text-wm-primary-hover' : 'text-wm-text-muted hover:text-wm-text hover:bg-wm-surface-light'
          ]"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Dashboard
        </RouterLink>

        <RouterLink
            to="/articles"
            :class="[
            'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
            route.path.startsWith('/articles') ? 'bg-wm-primary/20 text-wm-primary-hover' : 'text-wm-text-muted hover:text-wm-text hover:bg-wm-surface-light'
          ]"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Artikel
        </RouterLink>
      </nav>

      <!-- User -->
      <div class="p-3 border-t border-wm-border">
        <div class="flex items-center gap-2 px-3 py-2">
          <div class="w-8 h-8 rounded-full bg-wm-primary/20 flex items-center justify-center">
            <svg class="w-4 h-4 text-wm-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <span class="text-sm text-wm-text">{{ auth.user?.username }}</span>
        </div>
        <button
            @click="logout"
            class="w-full flex items-center gap-2 px-3 py-2 mt-1 rounded-lg text-sm text-wm-text-muted hover:text-wm-danger hover:bg-wm-danger/10 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Abmelden
        </button>
      </div>
    </aside>



    <main class="flex-1 bg-wm-bg">
      <RouterView />
    </main>
  </div>
</template>