'use client'

import { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { useAuthStore } from '../stores/authStore'
import { api } from '../lib/api'

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  }))

  const { accessToken, refreshToken, isAuthenticated, initialize } = useAuthStore()

  // Initialize auth store on mount
  useEffect(() => {
    initialize()
    // Set tokens on api client if they exist in store
    if (accessToken && refreshToken) {
      // The api client loads from localStorage on construction
    }
  }, [initialize, accessToken, refreshToken])

  // Sync auth state with api client
  useEffect(() => {
    if (isAuthenticated && accessToken) {
      // Api client already has tokens from localStorage
    }
  }, [isAuthenticated, accessToken])

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}