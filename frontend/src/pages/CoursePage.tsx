'use client'

import { useParams, Link } from 'react-router-dom'
import { ChevronLeft, Play, CheckCircle2, Lock, Clock, BookOpen, Flag, Star } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { cn, getLevelColor, getLevelLabel } from '../lib/utils'
import { CEFRLevel } from '../types'
import { Button } from '../components/ui/Button'

// Mock course data
const courseData: Record<string, any> = {
  '1': {
    id: '1',
    level: 'A1' as CEFRLevel,
    title: 'Iniciante Completo',
    description: 'Fundamentos do inglês: alfabeto, saudações, verbos básicos, vocabulário essencial',
    totalLessons: 20,
    estimatedHours: 15,
    xpReward: 500,
    lessons: Array.from({ length: 20 }, (_, i) => ({
      id: `1-${i + 1}`,
      title: `Liçao ${i + 1}: ${[
        'Alfabeto e Pronúncia',
        'Saudações e Despedidas',
        'Verbo To Be - Afirmativo',
        'Verbo To Be - Negativo e Interrogativo',
        'Artigos A/An e The',
        'Substantivos no Plural',
        'Pronomes Pessoais',
        'Verbo To Have',
        'Números 1-20',
        'Cores',
        'Dias da Semana e Meses',
        'Família e Relacionamentos',
        'Adjetivos Básicos',
        'Preposições de Lugar',
        'Presente Simples - Verbos Regulares',
        'Presente Simples - Negativo/Interrogativo',
        'Rotina Diária',
        'Comida e Bebida',
        'Roupas e Acessórios',
        'Revisão Final A1',
      ][i]}`,
      xpReward: 25,
      duration: 15,
      status: i < 9 ? 'completed' : i === 9 ? 'in_progress' : 'not_started',
      score: i < 9 ? 85 + (i % 10) : 0,
    })),
  },
  '2': {
    id: '2',
    level: 'A2' as CEFRLevel,
    title: 'Básico',
    description: 'Tempos verbais presentes e passados, futuro simples, comparativos, conversação básica',
    totalLessons: 25,
    estimatedHours: 20,
    xpReward: 800,
    lessons: Array.from({ length: 25 }, (_, i) => ({
      id: `2-${i + 1}`,
      title: `Liçao ${i + 1}: Tópico ${i + 1}`,
      xpReward: 30,
      duration: 20,
      status: i < 3 ? 'completed' : i === 3 ? 'in_progress' : 'not_started',
      score: i < 3 ? 80 + (i % 10) : 0,
    })),
  },
}

export function CoursePage() {
  const { courseId } = useParams<{ courseId: string }>()
  const course = courseData[courseId || '1']
  const { user } = useAuthStore()

  if (!course) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900">Curso não encontrado</h1>
        <Link to="/courses" className="text-primary-600 hover:underline mt-4 inline-block">
          Voltar aos cursos
        </Link>
      </div>
    )
  }

  const completedLessons = course.lessons.filter((l: any) => l.status === 'completed').length
  const inProgressLesson = course.lessons.find((l: any) => l.status === 'in_progress')
  const totalXP = course.lessons.reduce((sum: number, l: any) => sum + l.xpReward, 0)
  const earnedXP = course.lessons
    .filter((l: any) => l.status === 'completed')
    .reduce((sum: number, l: any) => sum + l.xpReward, 0)
  const progress = Math.round((completedLessons / course.totalLessons) * 100)

  return (
    <div className="space-y-6 animate-in">
      {/* Back button & Header */}
      <div className="flex items-start justify-between gap-4">
        <Link to="/courses" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ChevronLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Voltar</span>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={cn(
              'px-3 py-1 rounded-full text-sm font-bold uppercase',
              getLevelColor(course.level).replace('bg-', 'bg-').replace('500', '100'),
              getLevelColor(course.level).replace('bg-', 'text-')
            )}>
              {course.level}
            </span>
            <span className="text-sm text-gray-500">{getLevelLabel(course.level)}</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
          <p className="text-gray-600 mt-1">{course.description}</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="hidden lg:block text-right">
            <p className="text-2xl font-bold text-primary-600">{earnedXP}/{totalXP} XP</p>
            <p className="text-sm text-gray-500">{progress}% concluído</p>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Seu Progresso</h2>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              <span>{completedLessons}/{course.totalLessons} lições</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>~{course.estimatedHours}h total</span>
            </div>
          </div>
        </div>

        <div className="h-4 bg-gray-100 rounded-full overflow-hidden mb-4">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              getLevelColor(course.level).replace('bg-', 'bg-')
            )}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatItem icon={CheckCircle2} value={completedLessons} label="Concluídas" color="success" />
          <StatItem icon={Flag} value={course.totalLessons - completedLessons - (inProgressLesson ? 1 : 0)} label="Restantes" color="primary" />
          <StatItem icon={Star} value={earnedXP} label="XP Ganho" color="warning" />
          <StatItem icon={Clock} value={`${Math.round(course.estimatedHours * (progress / 100))}h`} label="Estudado" color="orange" />
        </div>

        {/* Continue/Start Button */}
        <div className="mt-6">
          {inProgressLesson ? (
            <Link to={`/lessons/${inProgressLesson.id}`}>
              <Button className="w-full sm:w-auto" size="lg">
                <Play className="w-5 h-5" />
                Continuar: {inProgressLesson.title}
              </Button>
            </Link>
          ) : completedLessons === course.totalLessons ? (
            <Button variant="success" className="w-full sm:w-auto" size="lg">
              <CheckCircle2 className="w-5 h-5" />
              Curso Concluído! Parabéns!
            </Button>
          ) : (
            <Link to={`/lessons/${course.lessons[completedLessons].id}`}>
              <Button className="w-full sm:w-auto" size="lg">
                <Play className="w-5 h-5" />
                Iniciar Próxima Lição
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Lessons List */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Lições do Curso</h2>
        <div className="space-y-2">
          {course.lessons.map((lesson: any, index: number) => (
            <LessonRow
              key={lesson.id}
              lesson={lesson}
              index={index + 1}
              courseLevel={course.level}
              isCurrent={lesson.status === 'in_progress'}
              isLocked={lesson.status === 'not_started' && index > completedLessons}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function StatItem({ icon: Icon, value, label, color }: { icon: any; value: any; label: string; color: string }) {
  const colors = {
    success: 'bg-success-50 text-success-700',
    primary: 'bg-primary-50 text-primary-700',
    warning: 'bg-yellow-50 text-yellow-700',
    orange: 'bg-orange-50 text-orange-700',
  }
  return (
    <div className="text-center p-3 rounded-xl" style={{ background: colors[color as keyof typeof colors] }}>
      <Icon className="w-5 h-5 mx-auto mb-1" />
      <p className="text-lg font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  )
}

function LessonRow({ lesson, index, courseLevel, isCurrent, isLocked }: {
  lesson: any
  index: number
  courseLevel: CEFRLevel
  isCurrent: boolean
  isLocked: boolean
}) {
  const statusIcons = {
    completed: <CheckCircle2 className="w-5 h-5 text-success-500" />,
    in_progress: <span className="w-5 h-5 text-primary-500 animate-pulse">▶</span>,
    not_started: isLocked ? <Lock className="w-5 h-5 text-gray-300" /> : <span className="w-5 h-5 text-gray-300">{index}</span>,
  }

  return (
    <div className={cn(
      'card p-4 flex items-center gap-4 transition-all',
      isCurrent && 'ring-2 ring-primary-200 bg-primary-50',
      isLocked && 'opacity-50'
    )}>
      <div className={cn(
        'w-10 h-10 rounded-lg flex items-center justify-center font-medium flex-shrink-0',
        lesson.status === 'completed' && 'bg-success-50 text-success-600',
        lesson.status === 'in_progress' && 'bg-primary-50 text-primary-600 animate-pulse',
        lesson.status === 'not_started' && !isLocked && 'bg-gray-100 text-gray-400',
        isLocked && 'bg-gray-50 text-gray-300'
      )}>
        {statusIcons[lesson.status as keyof typeof statusIcons]}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900 truncate">{lesson.title}</h3>
        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {lesson.duration} min
          </span>
          <span className="flex items-center gap-1 text-primary-600 font-medium">
            <Star className="w-3.5 h-3.5" />
            +{lesson.xpReward} XP
          </span>
          {lesson.status === 'completed' && lesson.score && (
            <span className="flex items-center gap-1 text-success-600">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {lesson.score}% precisão
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {lesson.status === 'completed' && (
          <Link to={`/lessons/${lesson.id}`}><Button variant="ghost" size="sm">Revisar</Button></Link>
        )}
        {lesson.status === 'in_progress' && (
          <Link to={`/lessons/${lesson.id}`}><Button size="sm">Continuar</Button></Link>
        )}
        {lesson.status === 'not_started' && !isLocked && (
          <Link to={`/lessons/${lesson.id}`}><Button variant="secondary" size="sm">Iniciar</Button></Link>
        )}
        {isLocked && (
          <Button variant="ghost" size="sm" disabled>
            <Lock className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  )
}