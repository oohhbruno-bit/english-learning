'use client'

import { useState } from 'react'
import { Trophy, Flame, Star, ArrowUp, ArrowDown, Minus, User, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { cn, formatNumber, getLevelColor, getLevelLabel, getStreakEmoji } from '../lib/utils'
import { CEFRLevel } from '../types'
import { Button } from '../components/ui/Button'

// Mock leaderboard data
const mockLeaderboard = [
  { rank: 1, userId: '1', name: 'Maria Silva', avatar: null, level: 'B2' as CEFRLevel, xp: 15420, streak: 45, isCurrentUser: false },
  { rank: 2, userId: '2', name: 'João Santos', avatar: null, level: 'B1' as CEFRLevel, xp: 12890, streak: 32, isCurrentUser: false },
  { rank: 3, userId: '3', name: 'Ana Costa', avatar: null, level: 'B2' as CEFRLevel, xp: 11200, streak: 28, isCurrentUser: false },
  { rank: 4, userId: '4', name: 'Pedro Oliveira', avatar: null, level: 'A2' as CEFRLevel, xp: 8900, streak: 15, isCurrentUser: true },
  { rank: 5, userId: '5', name: 'Lucia Ferreira', avatar: null, level: 'B1' as CEFRLevel, xp: 8100, streak: 22, isCurrentUser: false },
  { rank: 6, userId: '6', name: 'Carlos Lima', avatar: null, level: 'A2' as CEFRLevel, xp: 7500, streak: 10, isCurrentUser: false },
  { rank: 7, userId: '7', name: 'Fernanda Alves', avatar: null, level: 'A1' as CEFRLevel, xp: 5200, streak: 7, isCurrentUser: false },
  { rank: 8, userId: '8', name: 'Roberto Souza', avatar: null, level: 'A1' as CEFRLevel, xp: 4800, streak: 5, isCurrentUser: false },
  { rank: 9, userId: '9', name: 'Juliana Rocha', avatar: null, level: 'A2' as CEFRLevel, xp: 4200, streak: 12, isCurrentUser: false },
  { rank: 10, userId: '10', name: 'Marcos Pereira', avatar: null, level: 'A1' as CEFRLevel, xp: 3900, streak: 3, isCurrentUser: false },
]

// Extended mock data for pagination
const allUsers = [
  ...mockLeaderboard,
  ...Array.from({ length: 40 }, (_, i) => ({
    rank: i + 11,
    userId: String(i + 11),
    name: `Usuário ${i + 11}`,
    avatar: null,
    level: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'][Math.floor(Math.random() * 6)] as CEFRLevel,
    xp: Math.floor(Math.random() * 3500) + 500,
    streak: Math.floor(Math.random() * 20),
    isCurrentUser: false,
  })),
]

export function LeaderboardPage() {
  const { user } = useAuthStore()
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'all'>('weekly')
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  const itemsPerPage = 10

  const currentUserEntry = allUsers.find(u => u.isCurrentUser)
  const paginatedUsers = allUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const totalPages = Math.ceil(allUsers.length / itemsPerPage)

  const periodLabels = {
    daily: 'Diário',
    weekly: 'Semanal',
    monthly: 'Mensal',
    all: 'Geral',
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Trophy className="text-warning-500" />
          Ranking
        </h1>
        <p className="text-gray-600 mt-1">Compita com outros estudantes e suba no ranking</p>
      </div>

      {/* Current User Stats Card */}
      {currentUserEntry && (
        <div className="card p-6 bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-white flex items-center justify-center shadow-md">
                <span className="text-2xl font-bold text-primary-600">#{currentUserEntry.rank}</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Sua Posição</h3>
                <p className="text-primary-700">#{currentUserEntry.rank} de {allUsers.length} no ranking {periodLabels[period].toLowerCase()}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-6 mt-4 lg:mt-0 lg:ml-auto">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{formatNumber(currentUserEntry.xp)}</p>
                <p className="text-sm text-primary-700">XP Total</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{currentUserEntry.streak}</p>
                <p className="text-sm text-primary-700">Streak Atual</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{currentUserEntry.level}</p>
                <p className="text-sm text-primary-700">Nível Atual</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Period Selector */}
      <div className="card p-2">
        <div className="flex gap-1" role="tablist">
          {(['daily', 'weekly', 'monthly', 'all'] as const).map((p) => (
            <button
              key={p}
              onClick={() => { setPeriod(p); setCurrentPage(1); }}
              role="tab"
              aria-selected={period === p}
              className={cn(
                'flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all',
                period === p
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              {periodLabels[p]}
            </button>
          ))}
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2" role="group" aria-label="Modo de visualização">
          <button
            onClick={() => setViewMode('table')}
            className={cn(
              'p-2 rounded-lg transition-colors',
              viewMode === 'table' ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:bg-gray-100'
            )}
            aria-label="Visualização em tabela"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18M3 18h18M3 6h18" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={cn(
              'p-2 rounded-lg transition-colors',
              viewMode === 'cards' ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:bg-gray-100'
            )}
            aria-label="Visualização em cards"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16v14H4V6zm0 0v14" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 6v14" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v14" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 6v14" />
            </svg>
          </button>
        </div>

        {/* Stats Summary */}
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>{allUsers.length} participantes</span>
          <span className="hidden sm:inline">•</span>
          <span>Top 10: {formatNumber(allUsers[0]?.xp || 0)} XP</span>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="card overflow-hidden">
        {viewMode === 'table' ? (
          <TableLeaderboard users={paginatedUsers} currentUserId={user?.id} />
        ) : (
          <CardLeaderboard users={paginatedUsers} currentUserId={user?.id} />
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Página {currentPage} de {totalPages} • {allUsers.length} usuários
            </p>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={cn(
                      'w-8 h-8 rounded-lg text-sm font-medium transition-colors',
                      currentPage === pageNum
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    )}
                  >
                    {pageNum}
                  </button>
                )
              })}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Rewards Info */}
      <div className="card p-6 bg-warning-50 border-warning-200">
        <h3 className="font-semibold text-warning-900 mb-4 flex items-center gap-2">
          <Star className="w-5 h-5" />
          Recompensas do Ranking {periodLabels[period]}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <RewardTier rank={1} xp={500} badge="🥇" color="warning" />
          <RewardTier rank={2} xp={300} badge="🥈" color="gray" />
          <RewardTier rank={3} xp={200} badge="🥉" color="orange" />
          <RewardTier rank={4} xp={100} badge="4-10" color="primary" />
          <RewardTier rank={11} xp={50} badge="11-50" color="green" />
          <RewardTier rank={51} xp={25} badge="51+" color="gray" />
        </div>
      </div>
    </div>
  )
}

function TableLeaderboard({ users, currentUserId }: { users: any[]; currentUserId?: string }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Usuário</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nível</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">XP</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Streak</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {users.map((entry, index) => (
            <tr
              key={entry.userId}
              className={cn(
                'hover:bg-gray-50 transition-colors',
                entry.isCurrentUser && 'bg-primary-50'
              )}
            >
              <td className="px-4 py-3">
                {entry.rank <= 3 ? (
                  <span className={cn(
                    'font-bold text-lg',
                    entry.rank === 1 && 'text-warning-500',
                    entry.rank === 2 && 'text-gray-400',
                    entry.rank === 3 && 'text-orange-500'
                  )}>
                    {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}
                  </span>
                ) : (
                  <span className="text-gray-500 font-medium">#{entry.rank}</span>
                )}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center font-medium',
                    entry.isCurrentUser ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'
                  )}>
                    {entry.avatar ? (
                      <img src={entry.avatar} alt="" className="w-10 h-10 rounded-full" />
                    ) : (
                      entry.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className={cn(
                      'font-medium text-gray-900',
                      entry.isCurrentUser && 'text-primary-700'
                    )}>
                      {entry.name} {entry.isCurrentUser && <span className="ml-1 text-xs text-primary-600">(você)</span>}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <span className={cn(
                  'px-2 py-1 rounded-full text-xs font-bold uppercase',
                  getLevelColor(entry.level).replace('bg-', 'bg-').replace('500', '100'),
                  getLevelColor(entry.level).replace('bg-', 'text-')
                )}>
                  {entry.level}
                </span>
              </td>
              <td className="px-4 py-3 text-right font-medium text-gray-900">
                {formatNumber(entry.xp)}
              </td>
              <td className="px-4 py-3 text-right">
                <span className="flex items-center justify-end gap-1 text-gray-600">
                  <Flame className="w-4 h-4 text-orange-500" />
                  {entry.streak}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function CardLeaderboard({ users, currentUserId }: { users: any[]; currentUserId?: string }) {
  return (
    <div className="p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {users.map((entry) => (
          <div
            key={entry.userId}
            className={cn(
              'card p-4 relative',
              entry.isCurrentUser && 'ring-2 ring-primary-200 bg-primary-50'
            )}
          >
            {entry.isCurrentUser && (
              <div className="absolute -top-2 -right-2 px-2 py-0.5 text-xs bg-primary-600 text-white rounded-full">
                Você
              </div>
            )}
            <div className="flex items-start gap-4">
              <div className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0',
                entry.rank <= 3
                  ? entry.rank === 1 ? 'bg-warning-100 text-warning-600' :
                    entry.rank === 2 ? 'bg-gray-100 text-gray-600' :
                    'bg-orange-100 text-orange-600'
                  : 'bg-gray-100 text-gray-600'
              )}>
                {entry.rank <= 3 ? (
                  entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'
                ) : (
                  `#${entry.rank}`
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center font-medium',
                    entry.isCurrentUser ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'
                  )}>
                    {entry.name.charAt(0).toUpperCase()}
                  </div>
                  <p className={cn(
                    'font-semibold text-gray-900 truncate',
                    entry.isCurrentUser && 'text-primary-700'
                  )}>
                    {entry.name}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className={cn(
                    'px-2 py-0.5 rounded-full text-xs font-medium',
                    getLevelColor(entry.level).replace('bg-', 'bg-').replace('500', '100'),
                    getLevelColor(entry.level).replace('bg-', 'text-')
                  )}>
                    {entry.level}
                  </span>
                  <span className="flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-orange-500" />
                    {entry.streak}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-gray-900">{formatNumber(entry.xp)}</p>
                <p className="text-xs text-gray-500">XP</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function RewardTier({ rank, xp, badge, color }: { rank: number; xp: number; badge: string; color: string }) {
  const colors = {
    warning: 'bg-warning-100 text-warning-800 border-warning-200',
    gray: 'bg-gray-100 text-gray-800 border-gray-200',
    orange: 'bg-orange-100 text-orange-800 border-orange-200',
    primary: 'bg-primary-100 text-primary-800 border-primary-200',
    green: 'bg-green-100 text-green-800 border-green-200',
  }
  return (
    <div className={cn('p-4 rounded-xl text-center border', colors[color as keyof typeof colors])}>
      <p className="text-2xl font-bold mb-1">#{badge}</p>
      <p className="text-sm font-medium">+{xp} XP</p>
      <p className="text-xs text-gray-500 mt-1">Ao finalizar no top</p>
    </div>
  )
}