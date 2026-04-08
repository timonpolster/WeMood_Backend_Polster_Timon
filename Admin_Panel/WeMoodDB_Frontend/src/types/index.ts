// Auth
export interface TokenResponse {
    access_token: string
    token_type: string
}

export interface UserInfo {
    username: string
    is_active: boolean
}

// article
export type Sentiment = 'positive' | 'neutral' | 'negative' | 'concern'

export interface AIAnalysis {
  tags: string[]
  scientific_disciplines: string[]
  summary: string
  sentiment: Sentiment
  category: string
  confidence_score: number
}

export interface Article {
    id: number
    title: string
    content: string
    sources: string[] | null
    url: string | null
    publication_date: string | null
    literature: string | null
    fazit: string | null
    videos: string | null
    ai_analysis: AIAnalysis | null
    created_at: string
    updated_at: string
}

export interface ArticleCreate {
    title: string
    content: string
    sources?: string[]
    url?: string
    publication_date?: string
    literature?: string
    fazit?: string
    videos?: string
}

export interface ArticleUpdate {
    title?: string
    sources?: string[]
    url?: string
    publication_date?: string
    literature?: string
    fazit?: string
    videos?: string
}

export interface ArticleListResponse {
  articles: Article[]
  total: number
  skip: number
  limit: number
}

// Ui
export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
}