import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Article, ArticleCreate, ArticleUpdate } from '@/types'
import api from '@/api/client'

export const useArticlesStore = defineStore('articles', () => {
  const articles = ref<Article[]>([])
  const current = ref<Article | null>(null)
  const total = ref(0)
  const loading = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)

  async function fetchAll(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const res = await api.getArticles(0, 500)
      articles.value = res.articles
      total.value = res.total
    } catch (e: any) {
      error.value = e.response?.data?.detail || 'Fehler beim Laden'
    } finally {
      loading.value = false
    }
  }

  async function fetchOne(id: number): Promise<Article | null> {
    loading.value = true
    error.value = null
    try {
      current.value = await api.getArticle(id)
      return current.value
    } catch (e: any) {
      error.value = e.response?.data?.detail || 'Artikel nicht gefunden'
      return null
    } finally {
      loading.value = false
    }
  }

  async function create(data: ArticleCreate): Promise<Article | null> {
    saving.value = true
    error.value = null
    try {
      const article = await api.createArticle(data)
      articles.value.unshift(article)
      total.value++
      return article
    } catch (e: any) {
      error.value = e.response?.data?.detail || 'Fehler beim Erstellen'
      return null
    } finally {
      saving.value = false
    }
  }

  async function update(id: number, data: ArticleUpdate): Promise<Article | null> {
    saving.value = true
    error.value = null
    try {
      const article = await api.updateArticle(id, data)
      const idx = articles.value.findIndex(a => a.id === id)
      if (idx !== -1) articles.value[idx] = article
      if (current.value?.id === id) current.value = article
      return article
    } catch (e: any) {
      error.value = e.response?.data?.detail || 'Fehler beim Speichern'
      return null
    } finally {
      saving.value = false
    }
  }

  async function recreate(id: number, data: ArticleCreate): Promise<Article | null> {
    saving.value = true
    error.value = null
    try {
      const article = await api.recreateArticle(id, data)
      articles.value = articles.value.filter(a => a.id !== id)
      articles.value.unshift(article)
      current.value = article
      return article
    } catch (e: any) {
      const backup = sessionStorage.getItem('article_backup')
      if (backup) {
        error.value = 'Artikel wurde gelöscht, aber erstellung schlug fehl!! ' +
            'Der Inhalt wurde gesichert. Artikel muss manuell neu erstellt werden ' +
            'Details: ' + (e.response?.data?.detail || e.message)
      } else {
        error.value = e.response?.data?.detail || 'Fehler beim Neu-Erstellen'
      }
      return null
    } finally {
      saving.value = false
    }
  }

  async function remove(id: number): Promise<boolean> {
    saving.value = true
    error.value = null
    try {
      await api.deleteArticle(id)
      articles.value = articles.value.filter(a => a.id !== id)
      total.value--
      if (current.value?.id === id) current.value = null
      return true
    } catch (e: any) {
      error.value = e.response?.data?.detail || 'Fehler beim Löschen'
      return false
    } finally {
      saving.value = false
    }
  }

  return { articles, current, total, loading, saving, error, fetchAll, fetchOne, create, update, recreate, remove }
})
