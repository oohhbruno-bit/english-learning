'use client'

import { Link, useLocation } from 'react-router-dom'
import { Menu, X, User, Trophy, BarChart2, Settings, LogOut, ChevronDown, Bell, Flame, Target, BookOpen } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useUIStore } from '../../stores/uiStore'
import { useLogout } from '../../hooks/useAuth'
import { cn, getLevelLabel, getLevelColor, formatNumber, getStreakEmoji } from '../../lib/utils'
import { CEFRLevel } from '../../types'

export function Header() {
  const location = useLocation()
  const { user, isAuthenticated, logout: storeLogout } = useAuthStore()
  const { isSidebarOpen, toggleSidebar, closeModal, toasts, removeToast, theme, setTheme } = useUIStore()
  const logoutMutation = useLogout()

  const handleLogout = async () => {
    await logoutMutation.mutateAsync()
    closeModal()
  }

  const navigation = [
    { href: '/', label: 'Início', icon: BookOpen },
    { href: '/courses', label: 'Cursos', icon: BookOpen },
    { href: '/leaderboard', label: 'Ranking', icon: Trophy },
    { href: '/profile', label: 'Perfil', icon: User },
  ]

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Left side - Logo and navigation */}
          <div className="flex items-center gap-8">
            {/* Mobile menu button */}
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label={isSidebarOpen ? 'Fechar menu' : 'Abrir menu'}
            >
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2" aria-label="English Zero - Início">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <span className="hidden sm:block font-bold text-xl text-gray-900">English Zero</span>
            </Link>

            {/* Desktop navigation */}
            <nav className="hidden lg:flex items-center gap-1" aria-label="Navegação principal">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.href ||
                  (item.href !== '/' && location.pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    )}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className="w-5 h-5" aria-hidden="true" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Right side - User stats and profile */}
          <div className="flex items-center gap-3">
            {/* User stats - only show when authenticated and not on auth pages */}
            {isAuthenticated && user && !['/login', '/register'].includes(location.pathname) && (
              <div className="hidden md:flex items-center gap-4">
                {/* XP */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50">
                  <span className="text-primary-700 font-medium text-sm">
                    {formatNumber(user.xp)} XP
                  </span>
                </div>

                {/* Streak */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50">
                  <span className="text-lg">{getStreakEmoji(user.streak)}</span>
                  <span className="text-orange-700 font-medium text-sm">
                    {user.streak} dias
                  </span>
                </div>

                {/* Level badge */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50">
                  <span className={cn(
                    'px-2 py-0.5 rounded-full text-xs font-bold uppercase',
                    getLevelColor(user.level as CEFRLevel).replace('bg-', 'bg-').replace('500', '100'),
                    getLevelColor(user.level as CEFRLevel).replace('bg-', 'text-')
                  )}>
                    {user.level}
                  </span>
                </div>
              </div>
            )}

            {/* Theme toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors lg:hidden"
              aria-label={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Notifications */}
            <button
              className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors hidden sm:flex"
              aria-label="Notificações"
            >
              <Bell className="w-5 h-5" aria-hidden="true" />
              {toasts.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {toasts.length > 9 ? '9+' : toasts.length}
                </span>
              )}
            </button>

            {/* User menu */}
            {isAuthenticated && user && (
              <div className="relative">
                <button
                  onClick={() => useUIStore.getState().openModal('user-menu')}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Menu do usuário"
                  aria-expanded="false"
                  aria-haspopup="true"
                >
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                    {user.avatar ? (
                      <img src={user.avatar} alt="" className="w-8 h-8 rounded-full" />
                    ) : (
                      <span className="text-primary-700 font-medium text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700">
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-500 hidden sm:block" aria-hidden="true" />
                </button>

                {/* User dropdown menu */}
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 animate-in hidden" id="user-menu">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={cn(
                        'px-2 py-0.5 rounded-full text-xs font-bold uppercase',
                        getLevelColor(user.level as CEFRLevel).replace('bg-', 'bg-').replace('500', '100'),
                        getLevelColor(user.level as CEFRLevel).replace('bg-', 'text-')
                      )}>
                        {getLevelLabel(user.level as CEFRLevel)}
                      </span>
                    </div>
                  </div>

                  <Link
                    to="/profile"
                    className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={closeModal}
                  >
                    <User className="w-5 h-5" aria-hidden="true" />
                    Meu Perfil
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={closeModal}
                  >
                    <Settings className="w-5 h-5" aria-hidden="true" />
                    Configurações
                  </Link>
                  <hr className="my-2 border-gray-100" />
                  <button
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                    className="flex items-center gap-3 w-full px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-5 h-5" aria-hidden="true" />
                    {logoutMutation.isPending ? 'Saindo...' : 'Sair'}
                  </button>
                </div>
              </div>
            )}

            {/* Login/Register buttons for unauthenticated users */}
            {!isAuthenticated && ['/login', '/register'].includes(location.pathname) === false && (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login" className="btn-ghost text-sm">
                  Entrar
                </Link>
                <Link to="/register" className="btn-primary text-sm">
                  Começar Grátis
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}