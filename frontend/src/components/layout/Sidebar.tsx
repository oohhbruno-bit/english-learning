'use client'

import { Link, useLocation } from 'react-router-dom'
import { X, BookOpen, Trophy, User, BarChart2, Settings, Flame, Target, Award, ChevronRight, CheckCircle2, Lock } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useUIStore } from '../../stores/uiStore'
import { cn, getLevelLabel, getLevelColor, formatNumber, getStreakEmoji } from '../../lib/utils'
import { CEFRLevel } from '../../types'

const navigation = [
  { href: '/', label: 'Início', icon: BookOpen },
  { href: '/courses', label: 'Meus Cursos', icon: BookOpen },
  { href: '/leaderboard', label: 'Ranking', icon: Trophy },
  { href: '/profile', label: 'Perfil', icon: User },
  { href: '/settings', label: 'Configurações', icon: Settings },
]

export function Sidebar() {
  const location = useLocation()
  const { user, isAuthenticated } = useAuthStore()
  const { isSidebarOpen, setSidebarOpen, closeModal } = useUIStore()

  if (!isAuthenticated) return null

  return (
    <>
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 transform transition-transform duration-300 ease-in-out flex flex-col',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
        aria-label="Menu lateral"
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100">
          <h2 className="font-bold text-lg text-gray-900">Menu</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User progress summary */}
        {user && (
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
                {user.avatar ? (
                  <img src={user.avatar} alt="" className="w-12 h-12 rounded-xl" />
                ) : (
                  <span className="text-primary-700 font-bold text-xl">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{user.name}</p>
                <p className="text-sm text-gray-500 truncate">{user.email}</p>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-primary-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-primary-700">{formatNumber(user.xp)}</p>
                <p className="text-xs text-primary-600">XP Total</p>
              </div>
              <div className="bg-orange-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-orange-700">{user.streak}</p>
                <p className="text-xs text-orange-600">Streak</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-purple-700">{user.level}</p>
                <p className="text-xs text-purple-600">Nível</p>
              </div>
            </div>

            {/* Level progress */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-500">Progresso para {getNextLevelLabel(user.level as CEFRLevel)}</span>
                <span className="text-primary-700 font-medium">{getLevelProgress(user.xp, user.level as CEFRLevel)}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    getLevelColor(user.level as CEFRLevel).replace('bg-', 'bg-')
                  )}
                  style={{ width: `${getLevelProgress(user.xp, user.level as CEFRLevel)}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto" aria-label="Navegação">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.href ||
              (item.href !== '/' && location.pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                <span className="truncate">{item.label}</span>
              </Link>
            )
          })}

          {/* Course progress section */}
          {user && (
            <>
              <hr className="my-4 border-gray-100" />
              <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Progresso dos Cursos
              </h3>
              <CourseProgressList />
            </>
          )}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100">
          <div className="text-center text-xs text-gray-400">
            <p>English Zero v1.0.0</p>
            <p className="mt-1">Aprenda inglês do zero</p>
          </div>
        </div>
      </aside>
    </>
  )
}

function getNextLevelLabel(level: CEFRLevel): string {
  const levels: Record<CEFRLevel, string> = {
    A1: 'A2', A2: 'B1', B1: 'B2', B2: 'C1', C1: 'C2', C2: 'Máximo'
  }
  return levels[level] || 'Máximo'
}

function getLevelProgress(xp: number, level: CEFRLevel): number {
  const levelXP: Record<CEFRLevel, number> = {
    A1: 100, A2: 300, B1: 600, B2: 1000, C1: 1500, C2: 2100
  }
  const current = levelXP[level] || 0
  const next = levelXP[getNextLevel(level)] || current
  if (next === current) return 100
  return Math.min(100, Math.max(0, ((xp - current) / (next - current)) * 100))
}

function getNextLevel(level: CEFRLevel): CEFRLevel | null {
  const order: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
  const index = order.indexOf(level)
  if (index === -1 || index === order.length - 1) return null
  return order[index + 1]
}

function CourseProgressList() {
  // Mock data - in real app, this would come from a query
  const courses = [
    { id: '1', level: 'A1' as CEFRLevel, title: 'Iniciante Completo', progress: 45, lessons: 20, completed: 9 },
    { id: '2', level: 'A2' as CEFRLevel, title: 'Básico', progress: 12, lessons: 25, completed: 3 },
    { id: '3', level: 'B1' as CEFRLevel, title: 'Intermediário', progress: 0, lessons: 30, completed: 0, locked: true },
  ]

  return (
    <div className="space-y-2">
      {courses.map((course) => (
        <Link
          key={course.id}
          to={`/courses/${course.id}`}
          onClick={() => useUIStore.getState().setSidebarOpen(false)}
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group',
            course.locked ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-50'
          )}
        >
          <div className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0',
            getLevelColor(course.level).replace('bg-', 'bg-').replace('500', '100'),
            getLevelColor(course.level).replace('bg-', 'text-')
          )}>
            {course.level}
            {course.locked && <Lock className="w-4 h-4 ml-1" aria-hidden="true" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate group-hover:text-primary-600 transition-colors">
              {course.title}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${course.progress}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 w-10 text-right">{course.progress}%</span>
            </div>
          </div>
          {course.locked ? (
            <Lock className="w-5 h-5 text-gray-300" aria-hidden="true" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 transition-colors" aria-hidden="true" />
          )}
        </Link>
      ))}
    </div>
  )
}