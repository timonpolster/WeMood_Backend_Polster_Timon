<!-- Artikelübersicht mit Tabelle, clientseitiger Suche und Lösch-Funktion. -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useArticlesStore } from '@/stores/articles'
import { useUIStore } from '@/stores/ui'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

const store = useArticlesStore()
const ui = useUIStore()

const search = ref('')

onMounted(() => {
  if (store.articles.length === 0) store.fetchAll()
})

/** Filtert Artikel clientseitig nach Titel, Inhalt und Tags. */
const filtered = computed(() => {
  if (!search.value) return store.articles
  const q = search.value.toLowerCase()
  return store.articles.filter(a =>
      a.title.toLowerCase().includes(q) ||
      a.content.toLowerCase().includes(q) ||
      a.ai_analysis?.tags.some(t => t.toLowerCase().includes(q))
  )
})

/** Löscht einen Artikel nach Bestätigung durch den Benutzer. */
async function deleteArticle(id: number, title: string) {
  if (!confirm(`"${title}" wirklich löschen?`)) return
  const ok = await store.remove(id)
  if (ok) ui.success('Artikel gelöscht')
  else ui.error(store.error || 'Fehler')
}

/** Formatiert einen ISO-Datumsstring in deutsches Kurzformat. */
function formatDate(d: string) {
  return format(new Date(d), 'dd.MM.yy', { locale: de })
}

/** CSS-Klassen-Mapping für Sentiment-Badges. */
const sentimentColors: Record<string, string> = {
  positive: 'badge-success',
  neutral: 'badge-neutral',
  negative: 'badge-danger',
  concern: 'badge-warning'
}
</script>

<template>
  <div class="p-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-wm-text">Artikel</h1>
        <p class="text-sm text-wm-text-muted">{{ store.total }} Einträge</p>
      </div>
      <RouterLink to="/articles/new" class="btn-primary">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Neuer Artikel
      </RouterLink>
    </div>

    <!-- suche -->
    <div class="mb-4">
      <input
          v-model="search"
          type="text"
          class="input max-w-md"
          placeholder="Suchen nach Titel, Inhalt oder Tags..."
      />
    </div>

    <!-- Laden -->
    <div v-if="store.loading" class="card p-12 text-center text-wm-text-muted">
      Lade Artikel...
    </div>

    <div v-else-if="filtered.length === 0" class="card p-12 text-center">
      <p class="text-wm-text-muted mb-4">
        {{ search ? 'Keine Ergebnisse' : 'Noch keine Artikel' }}
      </p>
      <RouterLink v-if="!search" to="/articles/new" class="btn-primary">
        Ersten Artikel erstellen
      </RouterLink>
    </div>

    <div v-else class="card overflow-hidden">
      <table class="w-full text-sm">
        <thead>
        <tr class="border-b border-wm-border bg-wm-surface-light">
          <th class="text-left px-4 py-3 text-wm-text-muted font-medium">Titel</th>
          <th class="text-left px-4 py-3 text-wm-text-muted font-medium hidden md:table-cell">Kategorie</th>
          <th class="text-left px-4 py-3 text-wm-text-muted font-medium hidden sm:table-cell">Sentiment</th>
          <th class="text-left px-4 py-3 text-wm-text-muted font-medium">Datum</th>
          <th class="px-4 py-3"></th>
        </tr>
        </thead>
        <tbody class="divide-y divide-wm-border/50">
        <tr v-for="a in filtered" :key="a.id" class="hover:bg-wm-surface-light/30">
          <td class="px-4 py-3">
            <RouterLink :to="`/articles/${a.id}`" class="font-medium text-wm-text hover:text-wm-primary">
              {{ a.title }}
            </RouterLink>
            <div class="flex flex-wrap gap-1 mt-1">
                <span v-for="tag in (a.ai_analysis?.tags || []).slice(0, 3)" :key="tag" class="tag">
                  {{ tag }}
                </span>
            </div>
          </td>
          <td class="px-4 py-3 hidden md:table-cell">
            <span class="badge-neutral">{{ a.ai_analysis?.category || '-' }}</span>
          </td>
          <td class="px-4 py-3 hidden sm:table-cell">
              <span v-if="a.ai_analysis" :class="sentimentColors[a.ai_analysis.sentiment]">
                {{ a.ai_analysis.sentiment }}
              </span>
            <span v-else class="text-wm-text-dim">-</span>
          </td>
          <td class="px-4 py-3 text-wm-text-muted">{{ formatDate(a.created_at) }}</td>
          <td class="px-4 py-3">
            <div class="flex gap-1 justify-end">
              <RouterLink :to="`/articles/${a.id}/edit`" class="btn-ghost p-1.5" title="Bearbeiten">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </RouterLink>
              <button @click="deleteArticle(a.id, a.title)" class="btn-ghost p-1.5 text-wm-danger" title="Löschen">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>