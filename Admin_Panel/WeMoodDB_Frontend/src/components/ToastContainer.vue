<!-- Toast-Benachrichtigungskomponente: Zeigt Erfolgs-, Fehler-, Warn- und Info-Meldungen als Overlay an. -->
<script setup lang="ts">
import { useUIStore } from '@/stores/ui'
const ui = useUIStore()

/** SVG-Pfade für die Toast-Icons nach Typ. */
const icons: Record<string, string> = {
  success: 'M5 13l4 4L19 7',
  error: 'M6 18L18 6M6 6l12 12',
  warning: 'M12 9v2m0 4h.01M12 3l9 16H3l9-16z',
  info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
}

/** Tailwind-Klassen für die farbliche Unterscheidung nach Typ. */
const colors: Record<string, string> = {
  success: 'bg-wm-success/20 border-wm-success/50 text-wm-success',
  error: 'bg-wm-danger/20 border-wm-danger/50 text-wm-danger',
  warning: 'bg-wm-warning/20 border-wm-warning/50 text-wm-warning',
  info: 'bg-wm-primary/20 border-wm-primary/50 text-wm-primary'
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      <TransitionGroup name="fade">
        <div
            v-for="toast in ui.toasts"
            :key="toast.id"
            :class="['flex items-center gap-3 px-4 py-3 rounded-lg border', colors[toast.type]]"
        >
          <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="icons[toast.type]" />
          </svg>
          <span class="text-sm text-wm-text flex-1">{{ toast.message }}</span>
          <button @click="ui.remove(toast.id)" class="text-wm-text-muted hover:text-wm-text">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>