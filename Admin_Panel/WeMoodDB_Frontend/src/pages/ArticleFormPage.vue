<!-- Formular zum Erstellen und Bearbeiten von Artikeln mit Validierung, Quellenverwaltung und KI-Analyse-Overlay. -->
<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useArticlesStore } from '@/stores/articles'
import { useUIStore } from '@/stores/ui'

const props = defineProps<{ id?: string }>()
const router = useRouter()
const store = useArticlesStore()
const ui = useUIStore()

const isEdit = computed(() => !!props.id)
const articleId = computed(() => props.id ? Number(props.id) : null)

const form = reactive({
  title: '',
  content: '',
  sources: [''] as string[],
  url: '',
  publication_date: '',
  literature: '',
  fazit: '',
  videos: ''
})

const contentChanged = ref(false)
const originalContent = ref('')

/** Lädt bei Bearbeitung den bestehenden Artikel, setzt bei Neuanlage das heutige Datum. */
onMounted(async () => {
  if (isEdit.value && articleId.value) {
    const article = await store.fetchOne(articleId.value)
    if (article) {
      form.title = article.title
      form.content = article.content
      form.sources = article.sources && article.sources.length > 0
          ? [...article.sources]
          : ['']
      form.url = article.url || ''
      form.publication_date = article.publication_date || ''
      form.literature = article.literature || ''
      form.fazit = article.fazit || ''
      form.videos = article.videos || ''
      originalContent.value = article.content
    }
  } else {
    form.publication_date = new Date().toISOString().split('T')[0]
  }
})

/** Erkennt Inhaltsänderungen im Edit-Modus für die Recreate-Logik. */
watch(() => form.content, (newVal) => {
  if (isEdit.value) {
    contentChanged.value = newVal !== originalContent.value
  }
})

/** Fügt ein leeres Quellen-Eingabefeld hinzu. */
function addSource(): void {
  form.sources.push('')
}

/** Entfernt eine Quelle oder leert das letzte verbleibende Feld. */
function removeSource(index: number): void {
  if (form.sources.length > 1) {
    form.sources.splice(index, 1)
  } else {
    form.sources[0] = ''
  }
}

const errors = reactive({ title: '', content: '' })

/** Validiert Titel und Inhalt gegen Mindestlängen. */
function validate(): boolean {
  errors.title = form.title.length < 5 ? 'Mindestens 5 Zeichen' : ''
  errors.content = form.content.length < 50 ? 'Mindestens 50 Zeichen' : ''
  return !errors.title && !errors.content
}

/** Erstellt, aktualisiert oder recreated den Artikel je nach Modus und Inhaltsänderung. */
async function submit() {
  if (!validate()) return

  const cleanedSources = form.sources
      .map(s => s.trim())
      .filter(s => s.length > 0)

  const data = {
    title: form.title,
    content: form.content,
    sources: cleanedSources.length > 0 ? cleanedSources : undefined,
    url: form.url || undefined,
    publication_date: form.publication_date || undefined,
    literature: form.literature || undefined,
    fazit: form.fazit || undefined,
    videos: form.videos || undefined
  }

  let article

  if (isEdit.value && articleId.value) {
    if (contentChanged.value) {
      const confirmed = confirm(
          'ACHTUNG: Der Inhalt wurde geändert!\n\n' +
          '• Der alte Artikel wird GELÖSCHT\n' +
          '• Ein neuer Artikel wird erstellt\n' +
          '• Die KI analysiert den Inhalt neu\n' +
          '• Der Artikel bekommt eine NEUE ID\n\n' +
          'Falls ein Fehler auftritt, wird der Inhalt gesichert.\n\n' +
          'Fortfahren?'
      )
      if (!confirmed) return
      article = await store.recreate(articleId.value, data)
    } else {
      article = await store.update(articleId.value, {
        title: form.title,
        sources: cleanedSources.length > 0 ? cleanedSources : undefined,
        url: form.url || undefined,
        publication_date: form.publication_date || undefined,
        literature: form.literature || undefined,
        fazit: form.fazit || undefined,
        videos: form.videos || undefined
      })
    }
  } else {
    article = await store.create(data)
  }

  if (article) {
    ui.success(isEdit.value ? 'Artikel aktualisiert' : 'Artikel erstellt')
    router.push(`/articles/${article.id}`)
  } else {
    ui.error(store.error || 'Fehler beim Speichern')
  }
}
</script>

<template>
  <div class="p-6 max-w-3xl">
    <RouterLink
        :to="isEdit && articleId ? `/articles/${articleId}` : '/articles'"
        class="inline-flex items-center gap-1 text-sm text-wm-text-muted hover:text-wm-text mb-4"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      Zurück
    </RouterLink>

    <h1 class="text-2xl font-bold text-wm-text mb-6">
      {{ isEdit ? 'Artikel bearbeiten' : 'Neuer Artikel' }}
    </h1>

    <div v-if="isEdit && store.loading" class="card p-12 text-center text-wm-text-muted">
      Lade...
    </div>

    <form v-else @submit.prevent="submit" class="space-y-6">
      <div class="card p-6 space-y-4">
        <div>
          <label class="label">Titel *</label>
          <input
              v-model="form.title"
              type="text"
              :class="['input', errors.title && 'input-error']"
              placeholder="z.B. Angststörungen verstehen"
          />
          <p v-if="errors.title" class="text-xs text-wm-danger mt-1">{{ errors.title }}</p>
        </div>

        <div>
          <label class="label">
            Inhalt *
            <span v-if="isEdit && contentChanged" class="text-wm-warning ml-2">
              (geändert - wird neu analysiert)
            </span>
          </label>
          <textarea
              v-model="form.content"
              :class="['input min-h-[250px] font-mono text-sm', errors.content && 'input-error']"
              placeholder="Artikeltext hier einfügen..."
          />
          <div class="flex justify-between text-xs mt-1">
            <span v-if="errors.content" class="text-wm-danger">{{ errors.content }}</span>
            <span v-else class="text-wm-text-dim">Min. 50 Zeichen</span>
            <span :class="form.content.length < 50 ? 'text-wm-warning' : 'text-wm-text-dim'">
              {{ form.content.length }}
            </span>
          </div>
        </div>
      </div>

      <!-- Quellen -->
      <div class="card p-6 space-y-3">
        <div class="flex items-center justify-between">
          <label class="label mb-0">Quellen</label>
          <button
              type="button"
              @click="addSource"
              class="inline-flex items-center gap-1 text-sm text-wm-primary hover:text-wm-primary/80 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Quelle hinzufügen
          </button>
        </div>

        <div
            v-for="(_, index) in form.sources"
            :key="index"
            class="flex items-center gap-2"
        >
          <input
              v-model="form.sources[index]"
              type="text"
              class="input flex-1"
              :placeholder="`Quelle ${index + 1}, z.B. Psychologie Heute, S. 12-15`"
          />
          <button
              type="button"
              @click="removeSource(index)"
              class="p-2 text-wm-text-muted hover:text-wm-danger transition-colors rounded-lg hover:bg-wm-danger/10"
              :title="form.sources.length > 1 ? 'Quelle entfernen' : 'Quelle leeren'"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p class="text-xs text-wm-text-dim">
          Mehrere Quellen können einzeln hinzugefügt werden.
        </p>
      </div>

      <!-- Metadaten -->
      <div class="card p-6 space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="label">URL</label>
            <input v-model="form.url" type="url" class="input" placeholder="https://..." />
          </div>
          <div>
            <label class="label">Publikationsdatum</label>
            <input v-model="form.publication_date" type="date" class="input" />
          </div>
        </div>
      </div>

      <div class="card p-6 space-y-4">
        <h2 class="text-lg font-semibold text-wm-text">Zusätzliche Inhalte</h2>

        <div>
          <label class="label">Literatur</label>
          <textarea
              v-model="form.literature"
              class="input min-h-[120px] text-sm"
              placeholder="Weiterführende Literaturhinweise..."
          />
        </div>

        <div>
          <label class="label">Fazit</label>
          <textarea
              v-model="form.fazit"
              class="input min-h-[120px] text-sm"
              placeholder="Schlussfolgerung / Fazit des Artikels..."
          />
        </div>

        <div>
          <label class="label">Videos</label>
          <textarea
              v-model="form.videos"
              class="input min-h-[100px] text-sm"
              placeholder="YouTube-Links, ein Link pro Zeile..."
          />
          <p class="text-xs text-wm-text-dim mt-1">
            Ein Link pro Zeile einfügen.
          </p>
        </div>
      </div>

      <!-- KI Info -->
      <div class="card p-4 bg-wm-primary/5 border-wm-primary/20">
        <div class="flex gap-3">
          <svg class="w-5 h-5 text-wm-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <div>
            <h3 class="font-medium text-wm-text">Automatische KI-Analyse</h3>
            <p class="text-sm text-wm-text-muted mt-1">
              {{ isEdit && !contentChanged
                ? 'Nur Metadaten werden aktualisiert. Für neue KI-Analyse den Inhalt ändern.'
                : 'Der Inhalt wird von von der KI analysiert.'
              }}
            </p>
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-3">
        <RouterLink
            :to="isEdit && articleId ? `/articles/${articleId}` : '/articles'"
            class="btn-secondary"
        >
          Abbrechen
        </RouterLink>
        <button type="submit" :disabled="store.saving" class="btn-primary">
          <template v-if="store.saving">
            <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            {{ isEdit && contentChanged ? 'Analysiere...' : 'Speichere...' }}
          </template>
          <template v-else>
            {{ isEdit ? 'Speichern' : 'Erstellen & Analysieren' }}
          </template>
        </button>
      </div>
    </form>

    <Teleport to="body">
      <Transition name="fade">
        <div v-if="store.saving && (!isEdit || contentChanged)" class="fixed inset-0 bg-wm-bg/80 z-50 flex items-center justify-center">
          <div class="card p-8 text-center max-w-xs">
            <svg class="w-10 h-10 animate-spin mx-auto text-wm-primary" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <h3 class="font-semibold text-wm-text mt-4">KI analysiert...</h3>
            <p class="text-sm text-wm-text-muted mt-1">Dies kann einige Sekunden dauern</p>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>