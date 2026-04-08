<!-- Dashboard mit Sentiment-Statistiken, Schnellaktionen und den neuesten Artikeln. -->
<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useArticlesStore } from '@/stores/articles'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

const store = useArticlesStore()

onMounted(() => {
  if (store.articles.length === 0) store.fetchAll()
})

/** Die 5 neuesten Artikel für die Vorschau. */
const recent = computed(() => store.articles.slice(0, 5))

/** Zählt die Artikel pro Sentiment-Kategorie. */
const stats = computed(() => {
  const s = { positive: 0, neutral: 0, negative: 0, concern: 0 }
  store.articles.forEach(a => {
    if (a.ai_analysis) s[a.ai_analysis.sentiment]++
  })
  return s
})

/** Formatiert einen ISO-Datumsstring in deutsches Kurzformat. */
function formatDate(d: string) {
  return format(new Date(d), 'dd.MM.yy', { locale: de })
}
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold text-wm-text mb-6">Dashboard</h1>

    <!-- Einzelheiten -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div class="card p-4">
        <div class="text-2xl font-bold text-wm-text">{{ store.total }}</div>
        <div class="text-sm text-wm-text-muted">Artikel gesamt</div>
      </div>
      <div class="card p-4">
        <div class="text-2xl font-bold text-wm-success">{{ stats.positive }}</div>
        <div class="text-sm text-wm-text-muted">Positiv</div>
      </div>
      <div class="card p-4">
        <div class="text-2xl font-bold text-wm-text-muted">{{ stats.neutral }}</div>
        <div class="text-sm text-wm-text-muted">Neutral</div>
      </div>
      <div class="card p-4">
        <div class="text-2xl font-bold text-wm-warning">{{ stats.negative + stats.concern }}</div>
        <div class="text-sm text-wm-text-muted">Negativ/Besorgt</div>
      </div>
    </div>


    <div class="flex gap-3 mb-8">
      <RouterLink to="/articles/new" class="btn-primary">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Neuer Artikel
      </RouterLink>
      <RouterLink to="/articles" class="btn-secondary">Alle Artikel</RouterLink>
    </div>

    <!-- artikel -->
    <div class="card">
      <div class="p-4 border-b border-wm-border flex justify-between items-center">
        <h2 class="font-semibold text-wm-text">Neueste Artikel</h2>
        <RouterLink to="/articles" class="text-sm text-wm-primary hover:text-wm-primary-hover">
          Alle anzeigen →
        </RouterLink>
      </div>

      <div v-if="store.loading" class="p-8 text-center text-wm-text-muted">Lade...</div>

      <div v-else-if="recent.length === 0" class="p-8 text-center">
        <p class="text-wm-text-muted mb-4">Noch keine Artikel</p>
        <RouterLink to="/articles/new" class="btn-primary">Ersten Artikel erstellen</RouterLink>
      </div>

      <div v-else class="divide-y divide-wm-border/50">
        <RouterLink
          v-for="a in recent"
          :key="a.id"
          :to="`/articles/${a.id}`"
          class="block p-4 hover:bg-wm-surface-light/50 transition-colors"
        >
          <div class="flex justify-between items-start gap-4">
            <div class="min-w-0">
              <h3 class="font-medium text-wm-text truncate">{{ a.title }}</h3>
              <p class="text-sm text-wm-text-muted mt-1 line-clamp-1">
                {{ a.ai_analysis?.summary || a.content.slice(0, 100) + '...' }}
              </p>
            </div>
            <span class="text-xs text-wm-text-dim whitespace-nowrap">{{ formatDate(a.created_at) }}</span>
          </div>
        </RouterLink>
      </div>
    </div>
  </div>
</template>