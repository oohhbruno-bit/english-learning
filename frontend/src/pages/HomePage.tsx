'use client'

import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, Flame, Target, Trophy, BookOpen, CheckCircle2, Lock, Clock, TrendingUp } from 'lucide-react'
import { api } from '../lib/api'
import { useAuthStore } from '../stores/authStore'
import { Button } from '../components/ui/Button'
import { cn, getLevelLabel, getLevelColor, formatNumber, getStreakEmoji } from '../lib/utils'
import { CEFRLevel } from '../types'

// Mock data for courses - in real app this would come from API
const mockCourses = [
  {
    id: '1',
    level: 'A1' as CEFRLevel,
    title: 'Iniciante Completo',
    description: 'Fundamentos do inglês: alfabeto, saudações, verbos básicos, vocabulário essencial',
    totalLessons: 20,
    estimatedHours: 15,
    thumbnail: null,
  },
  {
    id: '2',
    level: 'A2' as CEFRLevel,
    title: 'Básico',
    description: 'Tempos verbais presentes, passado simples, futuro, comparações, conversação básica',
    totalLessons: 25,
    estimatedHours: 20,
    thumbnail: null,
  },
  {
    id: '3',
    level: 'B1' as CEFRLevel,
    title: 'Intermediário',
    description: 'Present perfect, condicionais, phrasal verbs, expressões idiomáticas, textos',
    totalLessons: 30,
    estimatedHours: 30,
    thumbnail: null,
  },
  {
    id: '4',
    level: 'B2' as CEFRLevel,
    title: 'Intermediário Avançado',
    description: 'Voz passiva, reported speech, nuances gramaticais, inglês acadêmico/profissional',
    totalLessons: 25,
    estimatedHours: 35,
    thumbnail: null,
  },
  {
    id: '5',
    level: 'C1' as CEFRLevel,
    title: 'Avançado',
    description: 'Estruturas complexas, vocabulário sofisticado, fluência nativa, preparação para exames',
    totalLessons: 20,
    estimatedHours: 40,
    thumbnail: null,
  },
  {
    id: '6',
    level: 'C2' as CEFRLevel,
    title: 'Proficiência',
    description: 'Domínio total: sotaques, gírias, linguagem técnica, certificação Cambridge/IELTS',
    totalLessons: 15,
    estimatedHours: 50,
    thumbnail: null,
  },
]

export function HomePage() {
  const { user } = useAuthStore()

  // Fetch user progress (mock for now)
  const { data: progress } = useQuery({
    queryKey: ['user-progress'],
    queryFn: async () => {
      // In real app: return api.getUserProgress()
      return [
        { courseId: '1', status: 'completed' as const, score: 95 },
        { courseId: '2', status: 'in_progress' as const, score: 60 },
        { courseId: '3', status: 'not_started' as const, score: 0 },
      ]
    },
    enabled: !!user,
  })

  const getCourseStatus = (courseId: string) => {
    if (!progress) return 'not_started'
    const p = progress.find((p: any) => p.courseId === courseId)
    return p?.status || 'not_started'
  }

  const getCourseProgress = (courseId: string) => {
    if (!progress) return 0
    const p = progress.find((p: any) => p.courseId === courseId)
    return p?.score || 0
  }

  const currentCourse = user ? mockCourses.find(c => getCourseStatus(c.id) === 'in_progress') || mockCourses[0] : mockCourses[0]
  const currentProgress = user ? getCourseProgress(currentCourse.id) : 0

  return (
    <div className="space-y-8 animate-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 p-8 lg:p-12 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.03%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2v-4h4v-2h-4zm30 30v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V4h4V2H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />
        <div className="relative max-w-3xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
              {user ? `Olá, ${user.name.split(' ')[0]}!` : 'Bem-vindo ao English Zero'}
            </span>
            {user && (
              <span className={cn(
                'px-3 py-1 rounded-full text-sm font-bold uppercase',
                getLevelColor(user.level).replace('bg-', 'bg-').replace('500', '900/30'),
                getLevelColor(user.level).replace('bg-', 'text-').replace('500', '300')
              )}>
                {getLevelLabel(user.level)}
              </span>
            )}
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">
            {user
              ? `Continue sua jornada para o ${getNextLevelLabel(user.level)}`
              : 'Aprenda inglês do zero ao avançado'}
          </h1>
          <p className="text-lg text-primary-100 mb-6 max-w-xl">
            {user
              ? `Você está no nível ${user.level} com ${formatNumber(user.xp)} XP e ${user.streak} dias de streak. Vamos continuar?`
              : 'Lições estruturadas, exercícios interativos e gamificação para você dominar o inglês.'}
          </p>
          <div className="flex flex-wrap gap-3">
            {user ? (
              <Link to={`/courses/${currentCourse.id}`}>
                <Button size="lg" className="bg-white text-primary-700 hover:bg-primary-50">
                  Continuar {currentCourse.title}
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            ) : (
              <Link to="/register">
                <Button size="lg" className="bg-white text-primary-700 hover:bg-primary-50">
                  Começar Grátis
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            )}
            <Link to="/courses">
              <Button size="lg" variant="ghost" className="text-white hover:bg-white/10 border-white/20">
                Ver todos os cursos
              </Button>
            </Link>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tr from-primary-400/20 to-transparent rounded-bl-3xl" />
      </section>

      {/* Stats Bar */}
      {user && (
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={Flame}
            value={user.streak}
            label="Dias de Streak"
            subtitle={`${getStreakEmoji(user.streak)} ${user.longestStreak} dias (recorde)`}
            color="orange"
          />
          <StatCard
            icon={Target}
            value={formatNumber(user.xp)}
            label="XP Total"
            subtitle={`Nível ${user.level} • ${getLevelProgress(user.xp, user.level)}% para próximo`}
            color="primary"
          />
          <StatCard
            icon={Trophy}
            value={progress?.filter((p: any) => p.status === 'completed').length || 0}
            label="Cursos Concluídos"
            subtitle={`${progress?.length || 0} cursos disponíveis`}
            color="yellow"
          />
          <StatCard
            icon={TrendingUp}
            value={`${getStudyTimeThisWeek()}h`}
            label="Esta Semana"
            subtitle="Meta: 5h/semana"
            color="green"
          />
        </section>
      )}

      {/* Current Course Progress */}
      {user && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Continue estudando</h2>
              <p className="text-gray-500">{currentCourse.title} • Nível {currentCourse.level}</p>
            </div>
            <Link to={`/courses/${currentCourse.id}`} className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              Ver curso →
            </Link>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className={cn(
                  'w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold',
                  getLevelColor(currentCourse.level as CEFRLevel).replace('bg-', 'bg-').replace('500', '100'),
                  getLevelColor(currentCourse.level as CEFRLevel).replace('bg-', 'text-')
                )}>
                  {currentCourse.level}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{currentCourse.title}</h3>
                  <p className="text-sm text-gray-500">{currentCourse.totalLessons} lições • ~{currentCourse.estimatedHours}h</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{currentProgress}%</p>
                <p className="text-sm text-gray-500">Concluído</p>
              </div>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  getLevelColor(currentCourse.level as CEFRLevel).replace('bg-', 'bg-')
                )}
                style={{ width: `${currentProgress}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
              <span>Próxima lição: <span className="font-medium text-gray-900">Liçao {Math.floor(currentProgress / 5) + 1}</span></span>
              <Link to={`/courses/${currentCourse.id}`} className="text-primary-600 hover:text-primary-700 font-medium">
                Continuar <ArrowRight className="w-4 h-4 inline" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* All Courses */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Todos os níveis</h2>
            <p className="text-gray-500">Do iniciante absoluto à proficiência nativa</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockCourses.map((course, index) => {
            const status = getCourseStatus(course.id)
            const courseProgress = getCourseProgress(course.id)
            const isLocked = index > 0 && getCourseStatus(mockCourses[index - 1].id) !== 'completed' && !user

            return (
              <Link
                key={course.id}
                to={`/courses/${course.id}`}
                className={cn(
                  'card-hover p-6 relative overflow-hidden group',
                  isLocked && 'opacity-60 pointer-events-none'
                )}
              >
                {isLocked && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
                    <Lock className="w-8 h-8 text-gray-300" />
                  </div>
                )}

                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold',
                      getLevelColor(course.level).replace('bg-', 'bg-').replace('500', '100'),
                      getLevelColor(course.level).replace('bg-', 'text-')
                    )}>
                      {course.level}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{course.title}</h3>
                      <p className="text-sm text-gray-500">{course.totalLessons} lições • ~{course.estimatedHours}h</p>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>

                  {/* Progress bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-500">Progresso</span>
                      <span className="font-medium text-gray-900">{courseProgress}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-500',
                          getLevelColor(course.level).replace('bg-', 'bg-')
                        )}
                        style={{ width: `${courseProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* Status badge */}
                  <div className="flex items-center gap-2">
                    {status === 'completed' && (
                      <span className="flex items-center gap-1 text-sm text-success-600">
                        <CheckCircle2 className="w-4 h-4" />
                        Concluído
                      </span>
                    )}
                    {status === 'in_progress' && (
                      <span className="flex items-center gap-1 text-sm text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
                        Em andamento
                      </span>
                    )}
                    {status === 'not_started' && !isLocked && (
                      <span className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        Não iniciado
                      </span>
                    )}
                    {isLocked && (
                      <span className="flex items-center gap-1 text-sm text-gray-400">
                        <Lock className="w-4 h-4" />
                        Bloqueado
                      </span>
                    )}
                  </div>
                </div>

                {/* Hover effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
            )
          })}
        </div>
      </section>

      {/* Features */}
      <section className="pt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Por que aprender com English Zero?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            icon={BookOpen}
            title="Lições Estruturadas CEFR"
            description="Siga o padrão internacional do Quadro Europeu Comum de Referência (A1 a C2) com progressão lógica e conteúdo curado por especialistas."
          />
          <FeatureCard
            icon={CheckCircle2}
            title="Exercícios Interativos"
            description="Múltipla escolha, preenchimento, tradução, escuta e fala. Feedback imediato com explicações detalhadas para cada erro."
          />
          <FeatureCard
            icon={Trophy}
            title="Gamificação Completa"
            description="XP, streak diário, conquistas, ranking semanal e metas personalizadas. Aprenda se divertindo e mantenha a motivação."
          />
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section className="pt-8">
          <div className="card p-8 lg:p-12 text-center bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">Pronto para começar?</h2>
            <p className="text-gray-600 mb-6 max-w-xl mx-auto">Junte-se a milhares de estudantes que estão aprendendo inglês de forma eficaz e gratuita.</p>
            <Link to="/register">
              <Button size="xl" className="w-full sm:w-auto">
                Criar conta grátis
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}

function StatCard({ icon: Icon, value, label, subtitle, color }: {
  icon: React.ComponentType<{ className?: string }>
  value: string | number
  label: string
  subtitle: string
  color: 'primary' | 'orange' | 'yellow' | 'green'
}) {
  const colors = {
    primary: 'bg-primary-50 text-primary-700 border-primary-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    green: 'bg-green-50 text-green-700 border-green-200',
  }

  return (
    <div className={cn('card p-5 border', colors[color])}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        </div>
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', colors[color].replace('bg-', 'bg-').replace('text-', 'text-'))}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, description }: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}) {
  return (
    <div className="card-hover p-6 text-center">
      <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-primary-100 flex items-center justify-center">
        <Icon className="w-7 h-7 text-primary-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

function getNextLevelLabel(level: CEFRLevel): string {
  const levels: Record<CEFRLevel, string> = {
    A1: 'A2', A2: 'B1', B1: 'B2', B2: 'C1', C1: 'C2', C2: 'proficiência'
  }
  return levels[level] || 'proficiência'
}

function getLevelProgress(xp: number, level: CEFRLevel): number {
  const levelXP: Record<CEFRLevel, number> = {
    A1: 100, A2: 300, B1: 600, B2: 1000, C1: 1500, C2: 2100
  }
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

function getStudyTimeThisWeek(): number {
  // Mock - in real app, calculate from user activity
  return 3
}