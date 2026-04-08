<!-- Detailansicht eines Artikels mit KI-Analyse, Metadaten, Inhalt, Fazit, Literatur und Videos. -->
<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useArticlesStore } from '@/stores/articles'
import { useUIStore } from '@/stores/ui'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

const props = defineProps<{ id: string }>()
const router = useRouter()
const store = useArticlesStore()
const ui = useUIStore()

onMounted(() => store.fetchOne(Number(props.id)))

/** Löscht den aktuellen Artikel nach Bestätigung und leitet zur Übersicht weiter. */
async function deleteArticle() {
  if (!store.current || !confirm('Artikel wirklich löschen?')) return
  const ok = await store.remove(store.current.id)
  if (ok) {
    ui.success('Artikel gelöscht')
    router.push('/articles')
  } else {
    ui.error(store.error || 'Fehler')
  }
}

/** Formatiert einen ISO-Datumsstring in deutsches Langformat. */
function formatDate(d: string | null) {
  if (!d) return '-'
  return format(new Date(d), 'dd. MMMM yyyy', { locale: de })
}

/** Deutsche Labels für Sentiment-Werte. */
const sentimentLabels: Record<string, string> = {
  positive: 'Positiv',
  neutral: 'Neutral',
  negative: 'Negativ',
  concern: 'Besorgt'
}

/** Parst das Videos-Feld (zeilengetrennt) in eine Liste von URLs. */
const parsedVideoLinks = computed<string[]>(() => {
  if (!store.current?.videos) return []
  return store.current.videos
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
})
</script>

<template>
  <div class="p-6 max-w-4xl">
    <RouterLink to="/articles" class="inline-flex items-center gap-1 text-sm text-wm-text-muted hover:text-wm-text mb-4">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      Zurück
    </RouterLink>

    <div v-if="store.loading" class="card p-12 text-center text-wm-text-muted">Lade...</div>

    <div v-else-if="store.error" class="card p-12 text-center text-wm-danger">{{ store.error }}</div>

    <template v-else-if="store.current">

      <div class="card p-6 mb-6">
        <div class="flex justify-between items-start gap-4 mb-4">
          <div>
            <span class="text-xs text-wm-text-dim font-mono">#{{ store.current.id }}</span>
            <h1 class="text-2xl font-bold text-wm-text mt-1">{{ store.current.title }}</h1>
          </div>
          <div class="flex gap-2">
            <RouterLink :to="`/articles/${store.current.id}/edit`" class="btn-secondary">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Bearbeiten
            </RouterLink>
            <button @click="deleteArticle" class="btn-danger">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        <div class="flex flex-wrap gap-4 text-sm text-wm-text-muted">
          <span>Erstellt: {{ formatDate(store.current.created_at) }}</span>
          <a v-if="store.current.url" :href="store.current.url" target="_blank" class="text-wm-accent hover:underline">
            Link öffnen ↗
          </a>
        </div>

        <div
            v-if="store.current.sources && store.current.sources.length > 0"
            class="mt-3"
        >
          <h3 class="text-sm font-medium text-wm-text-muted mb-1">Quellen</h3>
          <ul class="space-y-1">
            <li
                v-for="(src, idx) in store.current.sources"
                :key="idx"
                class="text-sm text-wm-text flex items-start gap-2"
            >
              <span class="text-wm-text-dim select-none">{{ idx + 1 }}.</span>
              <span>{{ src }}</span>
            </li>
          </ul>
        </div>
      </div>

      <div v-if="store.current.ai_analysis" class="card mb-6">
        <div class="p-4 border-b border-wm-border bg-wm-primary/5">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-wm-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span class="font-semibold text-wm-text">KI-Analyse</span>
            <span class="ml-auto text-sm text-wm-text-muted">
              {{ Math.round(store.current.ai_analysis.confidence_score * 100) }}% Konfidenz
            </span>
          </div>
        </div>

        <div class="p-6 space-y-4">
          <div>
            <h3 class="text-sm font-medium text-wm-text-muted mb-1">Zusammenfassung</h3>
            <p class="text-wm-text">{{ store.current.ai_analysis.summary }}</p>
          </div>

          <div class="grid grid-cols-3 gap-4">
            <div class="p-3 rounded-lg bg-wm-surface-light">
              <div class="text-xs text-wm-text-muted">Sentiment</div>
              <div class="font-medium text-wm-text">{{ sentimentLabels[store.current.ai_analysis.sentiment] }}</div>
            </div>
            <div class="p-3 rounded-lg bg-wm-surface-light">
              <div class="text-xs text-wm-text-muted">Kategorie</div>
              <div class="font-medium text-wm-text">{{ store.current.ai_analysis.category }}</div>
            </div>
            <div class="p-3 rounded-lg bg-wm-surface-light">
              <div class="text-xs text-wm-text-muted">Tags</div>
              <div class="font-medium text-wm-text">{{ store.current.ai_analysis.tags.length }}</div>
            </div>
          </div>

          <div>
            <h3 class="text-sm font-medium text-wm-text-muted mb-2">Disziplinen</h3>
            <div class="flex flex-wrap gap-2">
              <span v-for="d in store.current.ai_analysis.scientific_disciplines" :key="d" class="badge-neutral">
                {{ d }}
              </span>
            </div>
          </div>

          <div>
            <h3 class="text-sm font-medium text-wm-text-muted mb-2">Semantische Tags</h3>
            <div class="flex flex-wrap gap-1">
              <span v-for="t in store.current.ai_analysis.tags" :key="t" class="tag">{{ t }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="card p-6 mb-6">
        <h2 class="font-semibold text-wm-text mb-4">Artikelinhalt</h2>
        <p class="text-wm-text-muted whitespace-pre-wrap leading-relaxed">{{ store.current.content }}</p>
      </div>

      <div v-if="store.current.fazit" class="card p-6 mb-6">
        <h2 class="font-semibold text-wm-text mb-4">Fazit</h2>
        <p class="text-wm-text-muted whitespace-pre-wrap leading-relaxed">{{ store.current.fazit }}</p>
      </div>

      <div v-if="store.current.literature" class="card p-6 mb-6">
        <h2 class="font-semibold text-wm-text mb-4">Literatur</h2>
        <p class="text-wm-text-muted whitespace-pre-wrap leading-relaxed">{{ store.current.literature }}</p>
      </div>

      <div v-if="parsedVideoLinks.length > 0" class="card p-6 mb-6">
        <h2 class="font-semibold text-wm-text mb-4">Videos</h2>
        <ul class="space-y-2">
          <li v-for="(link, idx) in parsedVideoLinks" :key="idx">
            <a
                :href="link"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 text-sm text-wm-accent hover:underline break-all"
            >
              <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ link }}
            </a>
          </li>
        </ul>
      </div>

    </template>
  </div>
</template>