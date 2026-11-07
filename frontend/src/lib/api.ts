import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import type { ApiResponse, AuthTokens, LoginCredentials, RegisterData } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

class ApiClient {
  private client: AxiosInstance
  private accessToken: string | null = null
  private refreshToken: string | null = null
  private isRefreshing = false
  private refreshSubscribers: ((token: string) => void)[] = []

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    })

    this.setupInterceptors()
    this.loadTokensFromStorage()
  }

  private loadTokensFromStorage(): void {
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('accessToken')
      this.refreshToken = localStorage.getItem('refreshToken')
    }
  }

  private saveTokensToStorage(tokens: AuthTokens): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', tokens.accessToken)
      localStorage.setItem('refreshToken', tokens.refreshToken)
    }
    this.accessToken = tokens.accessToken
    this.refreshToken = tokens.refreshToken
  }

  private clearTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    }
    this.accessToken = null
    this.refreshToken = null
  }

  private setupInterceptors(): void {
    // Request interceptor - add auth header
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (this.accessToken && config.headers) {
          config.headers.Authorization = `Bearer ${this.accessToken}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor - handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

        if (error.response?.status === 401 && !originalRequest._retry && this.refreshToken) {
          originalRequest._retry = true

          if (this.isRefreshing) {
            return new Promise((resolve) => {
              this.refreshSubscribers.push((token: string) => {
                originalRequest.headers!.Authorization = `Bearer ${token}`
                resolve(this.client(originalRequest))
              })
            })
          }

          this.isRefreshing = true

          try {
            const tokens = await this.refreshAccessToken()
            this.refreshSubscribers.forEach(cb => cb(tokens.accessToken))
            this.refreshSubscribers = []

            originalRequest.headers!.Authorization = `Bearer ${tokens.accessToken}`
            return this.client(originalRequest)
          } catch (refreshError) {
            this.refreshSubscribers = []
            this.logout()
            window.location.href = '/login'
            return Promise.reject(refreshError)
          } finally {
            this.isRefreshing = false
          }
        }

        return Promise.reject(error)
      }
    )
  }

  private async refreshAccessToken(): Promise<AuthTokens> {
    const response = await axios.post<ApiResponse<AuthTokens>>(
      `${API_BASE_URL}/auth/refresh`,
      { refreshToken: this.refreshToken }
    )
    const tokens = response.data.data
    this.saveTokensToStorage(tokens)
    return tokens
  }

  // Auth methods
  async login(credentials: LoginCredentials): Promise<AuthTokens> {
    const response = await this.client.post<ApiResponse<AuthTokens>>('/auth/login', credentials)
    this.saveTokensToStorage(response.data.data)
    return response.data.data
  }

  async register(data: RegisterData): Promise<AuthTokens> {
    const response = await this.client.post<ApiResponse<AuthTokens>>('/auth/register', data)
    this.saveTokensToStorage(response.data.data)
    return response.data.data
  }

  async logout(): Promise<void> {
    try {
      await this.client.post('/auth/logout')
    } finally {
      this.clearTokens()
    }
  }

  async getCurrentUser() {
    const response = await this.client.get<ApiResponse<any>>('/auth/me')
    return response.data.data
  }

  // Courses
  async getCourses() {
    const response = await this.client.get<ApiResponse<any[]>>('/courses')
    return response.data.data
  }

  async getCourse(id: string) {
    const response = await this.client.get<ApiResponse<any>>(`/courses/${id}`)
    return response.data.data
  }

  // Lessons
  async getLessons(courseId: string) {
    const response = await this.client.get<ApiResponse<any[]>>(`/courses/${courseId}/lessons`)
    return response.data.data
  }

  async getLesson(id: string) {
    const response = await this.client.get<ApiResponse<any>>(`/lessons/${id}`)
    return response.data.data
  }

  // Progress
  async getUserProgress(courseId?: string) {
    const params = courseId ? { courseId } : {}
    const response = await this.client.get<ApiResponse<any[]>>('/progress', { params })
    return response.data.data
  }

  async getLessonProgress(lessonId: string) {
    const response = await this.client.get<ApiResponse<any>>(`/progress/lesson/${lessonId}`)
    return response.data.data
  }

  async startLesson(lessonId: string) {
    const response = await this.client.post<ApiResponse<any>>(`/progress/lesson/${lessonId}/start`)
    return response.data.data
  }

  async completeExercise(lessonId: string, exerciseId: string, answer: any, isCorrect: boolean, timeSpent: number) {
    const response = await this.client.post<ApiResponse<any>>(`/progress/lesson/${lessonId}/exercise`, {
      exerciseId,
      answer,
      isCorrect,
      timeSpent,
    })
    return response.data.data
  }

  async completeLesson(lessonId: string, score: number, timeSpent: number) {
    const response = await this.client.post<ApiResponse<any>>(`/progress/lesson/${lessonId}/complete`, {
      score,
      timeSpent,
    })
    return response.data.data
  }

  // Achievements
  async getAchievements() {
    const response = await this.client.get<ApiResponse<any[]>>('/achievements')
    return response.data.data
  }

  async getUserAchievements() {
    const response = await this.client.get<ApiResponse<any[]>>('/achievements/user')
    return response.data.data
  }

  // Leaderboard
  async getLeaderboard(period: 'daily' | 'weekly' | 'monthly' | 'all' = 'weekly', limit = 10) {
    const response = await this.client.get<ApiResponse<any[]>>('/leaderboard', {
      params: { period, limit },
    })
    return response.data.data
  }

  // Daily Goals
  async getDailyGoal() {
    const response = await this.client.get<ApiResponse<any>>('/daily-goal')
    return response.data.data
  }

  async updateDailyGoal(targetXP: number) {
    const response = await this.client.put<ApiResponse<any>>('/daily-goal', { targetXP })
    return response.data.data
  }

  // User Profile
  async updateProfile(data: Partial<{ name: string; avatar: string; level: string }>) {
    const response = await this.client.put<ApiResponse<any>>('/users/profile', data)
    return response.data.data
  }

  async getUserStats() {
    const response = await this.client.get<ApiResponse<any>>('/users/stats')
    return response.data.data
  }

  // Helper to check if authenticated
  isAuthenticated(): boolean {
    return !!this.accessToken
  }

  getAccessToken(): string | null {
    return this.accessToken
  }
}

export const api = new ApiClient()