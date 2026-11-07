import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../stores/authStore'
import { api, type LoginCredentials, type RegisterData } from '../lib/api'
import type { User } from '../types'

export function useLogin() {
  const queryClient = useQueryClient()
  const setUser = useAuthStore(state => state.setUser)
  const setTokens = useAuthStore(state => state.setTokens)

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => api.login(credentials),
    onSuccess: (tokens) => {
      setTokens(tokens)
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
  })
}

export function useRegister() {
  const queryClient = useQueryClient()
  const setUser = useAuthStore(state => state.setUser)
  const setTokens = useAuthStore(state => state.setTokens)

  return useMutation({
    mutationFn: (data: RegisterData) => api.register(data),
    onSuccess: (tokens) => {
      setTokens(tokens)
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  const clearAuth = useAuthStore(state => state.clearAuth)

  return useMutation({
    mutationFn: () => api.logout(),
    onSuccess: () => {
      clearAuth()
      queryClient.clear()
    },
  })
}

export function useCurrentUser() {
  const { isAuthenticated, user } = useAuthStore()

  return useQuery({
    queryKey: ['user'],
    queryFn: () => api.getCurrentUser(),
    enabled: isAuthenticated && !user,
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: false,
  })
}

export function useUser() {
  const { user } = useAuthStore()
  const { data, isLoading, error, refetch } = useCurrentUser()

  return {
    user: user || data,
    isLoading: isLoading && !user,
    error,
    refetch,
  }
}