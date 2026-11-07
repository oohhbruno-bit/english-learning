'use client'

import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { useUIStore } from '../../stores/uiStore'

export function ProtectedRoute() {
  const { isAuthenticated, isInitialized, user } = useAuthStore()
  const { hasSeenOnboarding } = useUIStore()
  const location = useLocation()

  // Still initializing auth
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Authenticated but hasn't seen onboarding - redirect to onboarding
  if (!hasSeenOnboarding && user) {
    return <Navigate to="/onboarding" replace />
  }

  return <Outlet />
}