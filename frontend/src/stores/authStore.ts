import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { User, AuthTokens, CEFRLevel } from '../types'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isInitialized: boolean

  // Actions
  setUser: (user: User) => void
  setTokens: (tokens: AuthTokens) => void
  updateUser: (updates: Partial<User>) => void
  updateXP: (xp: number) => void
  updateStreak: (streak: number, longestStreak?: number) => void
  updateLevel: (level: CEFRLevel) => void
  clearAuth: () => void
  initialize: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isInitialized: false,

      setUser: (user) => set({ user, isAuthenticated: true }),

      setTokens: (tokens) => set({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        isAuthenticated: true,
      }),

      updateUser: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null,
      })),

      updateXP: (xp) => set((state) => ({
        user: state.user ? { ...state.user, xp } : null,
      })),

      updateStreak: (streak, longestStreak) => set((state) => ({
        user: state.user ? {
          ...state.user,
          streak,
          longestStreak: longestStreak ?? Math.max(state.user.longestStreak, streak),
        } : null,
      })),

      updateLevel: (level) => set((state) => ({
        user: state.user ? { ...state.user, level } : null,
      })),

      clearAuth: () => set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
      }),

      initialize: () => {
        set({ isInitialized: true })
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.initialize()
      },
    }
  )
)