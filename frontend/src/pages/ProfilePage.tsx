'use client'

import { useState } from 'react'
import { Camera, Edit, Calendar, Flame, Trophy, Star, Target, BookOpen, Settings, ChevronRight } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { useUIStore } from '../stores/uiStore'
import { cn, getLevelColor, getLevelLabel, formatNumber, formatDate, getStreakEmoji, getInitials } from '../lib/utils'
import { CEFRLevel } from '../types'
import { Button } from '../components/ui/Button'

// Mock achievements
const allAchievements = [
  { id: '1', key: 'first_lesson', name: 'Primeiros Passos', description: 'Complete sua primeira lição', icon: '🎯', category: 'lessons' as const, requirement: { type: 'lessons_completed' as const, value: 1 }, xpReward: 50, rarity: 'common' as const },
  { id: '2', key: 'streak_3', name: 'Em Chamas', description: 'Mantenha um streak de 3 dias', icon: '🔥', category: 'streak' as const, requirement: { type: 'streak_days' as const, value: 3 }, xpReward: 100, rarity: 'common' as const },
  { id: '3', key: 'streak_7', name: 'Semana Perfeita', description: 'Mantenha um streak de 7 dias', icon: '⭐', category: 'streak' as const, requirement: { type: 'streak_days' as const, value: 7 }, xpReward: 250, rarity: 'rare' as const },
  { id: '4', key: 'streak_30', name: 'Dedicado', description: 'Mantenha um streak de 30 dias', icon: '🌟', category: 'streak' as const, requirement: { type: 'streak_days' as const, value: 30 }, xpReward: 1000, rarity: 'epic' as const },
  { id: '5', key: 'xp_1000', name: 'Acumulador', description: 'Alcance 1.000 XP total', icon: '💎', category: 'xp' as const, requirement: { type: 'total_xp' as const, value: 1000 }, xpReward: 200, rarity: 'rare' as const },
  { id: '6', key: 'perfect_5', name: 'Perfeccionista', description: 'Complete 5 lições com 100% de precisão', icon: '💯', category: 'perfect' as const, requirement: { type: 'perfect_lessons' as const, value: 5 }, xpReward: 500, rarity: 'epic' as const },
  { id: '7', key: 'course_a1', name: 'Iniciante Graduado', description: 'Complete o curso A1', icon: '🎓', category: 'lessons' as const, requirement: { type: 'lessons_completed' as const, value: 20 }, xpReward: 500, rarity: 'rare' as const },
  { id: '8', key: 'legendary', name: 'Lenda Viva', description: 'Alcance nível C2', icon: '👑', category: 'special' as const, requirement: { type: 'level_up' as const, value: 6 }, xpReward: 5000, rarity: 'legendary' as const },
]

// Mock user achievements (unlocked)
const unlockedAchievements = ['1', '2', '3', '5']

export function ProfilePage() {
  const { user, updateUser } = useAuthStore()
  const { openModal } = useUIStore()
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'stats'>('overview')
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [editName, setEditName] = useState(user?.name || '')

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Carregando perfil...</p>
      </div>
    )
  }

  const levelProgress = getLevelProgress(user.xp, user.level)
  const nextLevel = getNextLevel(user.level)
  const currentLevelXP = getCurrentLevelXP(user.level)
  const nextLevelXP = nextLevel ? getCurrentLevelXP(nextLevel) : currentLevelXP
  const xpInCurrentLevel = user.xp - currentLevelXP
  const xpNeededForNext = nextLevelXP - currentLevelXP

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in">
      {/* Profile Header */}
      <div className="card p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className={cn(
              'w-28 h-28 rounded-2xl flex items-center justify-center text-4xl font-bold',
              getLevelColor(user.level).replace('bg-', 'bg-').replace('500', '100'),
              getLevelColor(user.level).replace('bg-', 'text-')
            )}>
              {user.avatar ? (
                <img src={user.avatar} alt="" className="w-28 h-28 rounded-2xl" />
              ) : (
                getInitials(user.name)
              )}
            </div>
            <button
              onClick={() => setShowEditProfile(true)}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700 transition-colors shadow-lg"
              aria-label="Editar avatar"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* Info */}
          <div className="flex-1 text-center lg:text-left">
            {showEditProfile ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="input text-center text-xl font-bold"
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                />
                <Button variant="ghost" size="sm" onClick={() => { setShowEditProfile(false); setEditName(user.name) }}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button size="sm" onClick={handleSaveName}>Salvar</Button>
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                <p className="text-gray-500 mt-1">{user.email}</p>
                <div className="flex items-center justify-center lg:justify-start gap-3 mt-3">
                  <span className={cn(
                    'px-4 py-1.5 rounded-full text-lg font-bold uppercase',
                    getLevelColor(user.level).replace('bg-', 'bg-').replace('500', '100'),
                    getLevelColor(user.level).replace('bg-', 'text-')
                  )}>
                    {getLevelLabel(user.level)}
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => setShowEditProfile(true)}>
                    <Edit className="w-4 h-4" />
                    Editar
                  </Button>
                </div>
              </>
            )}

            {/* Level Progress */}
            <div className="mt-4 max-w-xs lg:max-w-none">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-500">Progresso para {nextLevel ? getLevelLabel(nextLevel) : 'Máximo'}</span>
                <span className="font-medium text-gray-900">{levelProgress}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    getLevelColor(user.level).replace('bg-', 'bg-')
                  )}
                  style={{ width: `${levelProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1 text-center lg:text-left">
                {formatNumber(xpInCurrentLevel)} / {formatNumber(xpNeededForNext)} XP neste nível
              </p>
            </div>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-3 gap-4 text-center lg:grid-cols-3 lg:gap-6">
            <StatCard icon={Flame} value={user.streak} label="Streak Atual" subtitle={`${getStreakEmoji(user.streak)} Recorde: ${user.longestStreak} dias`} color="orange" />
            <StatCard icon={Star} value={formatNumber(user.xp)} label="XP Total" subtitle={`Nível ${user.level}`} color="warning" />
            <StatCard icon={Trophy} value={unlockedAchievements.length} label="Conquistas" subtitle={`${allAchievements.length} disponíveis`} color="primary" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card overflow-hidden">
        <div className="border-b border-gray-100">
          <nav className="flex -mb-px" aria-label="Abas do perfil">
            {[
              { id: 'overview', label: 'Visão Geral', icon: BookOpen },
              { id: 'achievements', label: 'Conquistas', icon: Trophy },
              { id: 'stats', label: 'Estatísticas', icon: Target },
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    'flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-all',
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && <OverviewTab user={user} />}
          {activeTab === 'achievements' && <AchievementsTab />}
          {activeTab === 'stats' && <StatsTab />}
        </div>
      </div>
    </div>
  )

  function handleSaveName() {
    if (editName.trim() && editName.trim() !== user.name) {
      updateUser({ name: editName.trim() })
      // In real app: await api.updateProfile({ name: editName.trim() })
    }
    setShowEditProfile(false)
  }
}

function StatCard({ icon: Icon, value, label, subtitle, color }: {
  icon: any
  value: string | number
  label: string
  subtitle: string
  color: string
}) {
  const colors = {
    orange: 'bg-orange-50 text-orange-700',
    warning: 'bg-yellow-50 text-yellow-700',
    primary: 'bg-primary-50 text-primary-700',
  }
  return (
    <div className="p-4 rounded-xl" style={{ background: colors[color as keyof typeof colors] }}>
      <Icon className="w-6 h-6 mx-auto mb-2" />
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs font-medium text-gray-700">{label}</p>
      <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
    </div>
  )
}

function OverviewTab({ user }: { user: any }) {
  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickStat label="Lições Concluídas" value="12" icon="✅" />
        <QuickStat label="Tempo Total" value="8h 30m" icon="⏱️" />
        <QuickStat label="Palavras Aprendidas" value="342" icon="📚" />
        <QuickStat label="Precisão Média" value="87%" icon="🎯" />
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-primary-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          Atividade Recente
        </h3>
        <div className="space-y-3">
          {[
            { lesson: 'Liçao 5: Presente Simples', course: 'A1 - Iniciante', time: '2 horas atrás', xp: 25, score: 92 },
            { lesson: 'Liçao 4: Artigos', course: 'A1 - Iniciante', time: 'Ontem', xp: 25, score: 88 },
            { lesson: 'Liçao 3: Verbo To Be', course: 'A1 - Iniciante', time: '2 dias atrás', xp: 25, score: 95 },
          ].map((activity, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-gray-50">
              <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                <span className="text-primary-600 font-medium">✓</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{activity.lesson}</p>
                <p className="text-sm text-gray-500">{activity.course} • {activity.time}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary-600">+{activity.xp} XP</p>
                <p className="text-xs text-success-600">{activity.score}% precisão</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Goal */}
      <div className="p-4 rounded-xl bg-primary-50 border border-primary-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-primary-900 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Meta Semanal
          </h3>
          <span className="text-sm text-primary-700">5h / 5h</span>
        </div>
        <div className="h-3 bg-primary-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-primary-600" style={{ width: '100%' }} />
        </div>
        <p className="text-sm text-primary-700 mt-2 text-center">Parabéns! Meta semanal atingida 🎉</p>
      </div>
    </div>
  )
}

function QuickStat({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="card p-4 text-center">
      <span className="text-3xl mb-2 block">{icon}</span>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  )
}

function AchievementsTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Suas Conquistas</h3>
        <span className="badge badge-primary">{unlockedAchievements.length}/{allAchievements.length} desbloqueadas</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {allAchievements.map((achievement) => {
          const unlocked = unlockedAchievements.includes(achievement.id)
          const rarityColors = {
            common: 'bg-gray-100 border-gray-200',
            rare: 'bg-blue-50 border-blue-200',
            epic: 'bg-purple-50 border-purple-200',
            legendary: 'bg-yellow-50 border-yellow-200',
          }
          return (
            <div
              key={achievement.id}
              className={cn(
                'card p-4 text-center relative overflow-hidden transition-all',
                unlocked ? '' : 'opacity-60 grayscale',
                rarityColors[achievement.rarity]
              )}
            >
              {!unlocked && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-4xl">🔒</span>
                </div>
              )}
              <div className="relative z-10">
                <span className="text-4xl mb-3 block">{achievement.icon}</span>
                <h4 className="font-semibold text-gray-900 mb-1">{achievement.name}</h4>
                <p className="text-sm text-gray-500 mb-2">{achievement.description}</p>
                <div className="flex items-center justify-center gap-2 text-xs">
                  <span className={cn(
                    'px-2 py-0.5 rounded-full',
                    achievement.rarity === 'common' && 'bg-gray-100 text-gray-700',
                    achievement.rarity === 'rare' && 'bg-blue-100 text-blue-700',
                    achievement.rarity === 'epic' && 'bg-purple-100 text-purple-700',
                    achievement.rarity === 'legendary' && 'bg-yellow-100 text-yellow-700'
                  )}>
                    {achievement.rarity}
                  </span>
                  <span className="text-primary-600 font-medium">+{achievement.xpReward} XP</span>
                </div>
                {unlocked && (
                  <div className="mt-2 text-xs text-success-600">✓ Desbloqueada</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function StatsTab() {
  // Mock detailed stats
  const stats = [
    { category: 'Vocabulário', learned: 342, mastered: 128, total: 2000 },
    { category: 'Gramática', learned: 15, mastered: 8, total: 50 },
    { category: 'Listening', exercises: 45, avgScore: 82 },
    { category: 'Speaking', exercises: 12, avgScore: 75 },
    { category: 'Reading', exercises: 38, avgScore: 88 },
    { category: 'Writing', exercises: 22, avgScore: 79 },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="card p-5">
            <h4 className="font-semibold text-gray-900 mb-3">{stat.category}</h4>
            {stat.learned !== undefined ? (
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Aprendido</span>
                  <span className="font-medium">{stat.learned}/{stat.total}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-primary-500" style={{ width: `${(stat.learned / stat.total) * 100}%` }} />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Dominado</span>
                  <span className="font-medium text-success-600">{stat.mastered}</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-900">{stat.avgScore}%</p>
                  <p className="text-sm text-gray-500">Precisão média</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">{stat.exercises} exercícios</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Study Heatmap (simplified) */}
      <div className="card p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Atividade Recente (últimas 4 semanas)</h3>
        <div className="flex gap-1 overflow-x-auto pb-2">
          {Array.from({ length: 28 }, (_, i) => {
            const intensity = Math.random()
            const colors = ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39']
            const colorIndex = intensity > 0.8 ? 4 : intensity > 0.6 ? 3 : intensity > 0.4 ? 2 : intensity > 0.2 ? 1 : 0
            return (
              <div
                key={i}
                className="w-3 h-3 rounded-sm flex-shrink-0"
                style={{ backgroundColor: colors[colorIndex] }}
                title={`${28 - i} dias atrás`}
              />
            )
          })}
        </div>
        <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
          <span>Menos</span>
          <div className="flex gap-1">
            {['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'].map((color, i) => (
              <div key={i} className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
            ))}
          </div>
          <span>Mais</span>
        </div>
      </div>
    </div>
  )
}

function getLevelProgress(xp: number, level: CEFRLevel): number {
  const levelXP: Record<CEFRLevel, number> = { A1: 100, A2: 300, B1: 600, B2: 1000, C1: 1500, C2: 2100 }
  const current = levelXP[level] || 0
  const next = levelXP[getNextLevel(level)] || current
  if (next === current) return 100
  return Math.min(100, Math.max(0, Math.round(((xp - current) / (next - current)) * 100)))
}

function getNextLevel(level: CEFRLevel): CEFRLevel | null {
  const order: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
  const index = order.indexOf(level)
  if (index === -1 || index === order.length - 1) return null
  return order[index + 1]
}

function getCurrentLevelXP(level: CEFRLevel): number {
  const levelXP: Record<CEFRLevel, number> = { A1: 0, A2: 100, B1: 400, B2: 1000, C1: 2000, C2: 3500 }
  return levelXP[level] || 0
}