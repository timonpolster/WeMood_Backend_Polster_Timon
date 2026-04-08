import axios, { type AxiosInstance, type AxiosError } from 'axios'
import type { TokenResponse, UserInfo, Article, ArticleCreate, ArticleUpdate, ArticleListResponse } from '@/types'

const API_URL = import.meta.env.VITE_API_URL || 'https://164-92-243-35.sslip.io'

/** Zentraler API-Client für die Kommunikation mit dem WeMood Backend. */
class ApiClient {
  private client: AxiosInstance
  private token: string | null = null

  constructor() {
    this.client = axios.create({
      baseURL: `${API_URL}/api/v1`,
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000,
    })

    // load token
    this.token = sessionStorage.getItem('token')

    // Authentication hinzufügen
    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`
      }
      return config
    })

    this.client.interceptors.response.use(
        (response) => response,
        (error: AxiosError) => {
          if (error.response?.status === 401) {
            this.clearToken()
            window.location.href = '/login'
          }
          return Promise.reject(error)
        }
    )
  }

  /** Speichert den JWT-Token in SessionStorage und im Client. */
  setToken(token: string): void {
    this.token = token
    sessionStorage.setItem('token', token)
  }

  /** Entfernt den JWT-Token aus SessionStorage und Client. */
  clearToken(): void {
    this.token = null
    sessionStorage.removeItem('token')
  }

  /** Prüft ob ein Token vorhanden ist. */
  hasToken(): boolean {
    return !!this.token
  }

  /** Authentifiziert den Benutzer und speichert den erhaltenen Token. */
  async login(username: string, password: string): Promise<TokenResponse> {
    const formData = new URLSearchParams()
    formData.append('username', username)
    formData.append('password', password)

    const { data } = await this.client.post<TokenResponse>('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
    this.setToken(data.access_token)
    return data
  }

  /** Meldet den Benutzer ab und entfernt den Token. */
  logout(): void {
    this.clearToken()
  }

  /** Ruft die Informationen des aktuell eingeloggten Benutzers ab. */
  async getMe(): Promise<UserInfo> {
    const { data } = await this.client.get<UserInfo>('/auth/me')
    return data
  }

  /** Ruft eine paginierte Liste aller Artikel ab. */
  async getArticles(skip = 0, limit = 100): Promise<ArticleListResponse> {
    const { data } = await this.client.get<ArticleListResponse>('/articles/', { params: { skip, limit } })
    return data
  }

  /** Ruft einen einzelnen Artikel per ID ab. */
  async getArticle(id: number): Promise<Article> {
    const { data } = await this.client.get<Article>(`/articles/${id}`)
    return data
  }

  /** Erstellt einen neuen Artikel mit automatischer KI-Analyse. */
  async createArticle(payload: ArticleCreate): Promise<Article> {
    const { data } = await this.client.post<Article>('/articles/', payload)
    return data
  }

  /** Aktualisiert die Metadaten eines bestehenden Artikels. */
  async updateArticle(id: number, payload: ArticleUpdate): Promise<Article> {
    const { data } = await this.client.put<Article>(`/articles/${id}`, payload)
    return data
  }

  /** Löscht einen Artikel permanent. */
  async deleteArticle(id: number): Promise<void> {
    await this.client.delete(`/articles/${id}`)
  }

  /** Löscht einen Artikel und erstellt ihn neu mit erneuter KI-Analyse. Sichert den Inhalt als Backup in SessionStorage. */
  async recreateArticle(id: number, payload: ArticleCreate): Promise<Article> {

    sessionStorage.setItem('article_backup', JSON.stringify({ id, payload, timestamp: Date.now() }))

    try {
      await this.deleteArticle(id)
      const newArticle = await this.createArticle(payload)
      sessionStorage.removeItem('article_backup')
      return newArticle
    } catch (error) {
      console.error('recreateArticle failed - backup available in sessionStorage under "article_backup"')
      throw error
    }
  }
}

export const api = new ApiClient()
export default api