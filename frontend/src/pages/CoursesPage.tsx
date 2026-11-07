'use client'

import { Link } from 'react-router-dom'
import { CheckCircle2, Lock, Clock, BookOpen, TrendingUp } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { cn, getLevelColor, getLevelLabel } from '../lib/utils'
import { CEFRLevel } from '../types'
import { Button } from '../components/ui/Button'

const courses = [
  {
    id: '1',
    level: 'A1' as CEFRLevel,
    title: 'Iniciante Completo',
    description: 'Fundamentos do inglês: alfabeto, saudações, verbos básicos (to be, to have), vocabulário essencial do dia a dia, números, cores, família.',
    totalLessons: 20,
    estimatedHours: 15,
    xpReward: 500,
    skills: ['Listening', 'Speaking', 'Reading', 'Writing'],
  },
  {
    id: '2',
    level: 'A2' as CEFRLevel,
    title: 'Básico',
    description: 'Tempos verbais presentes e passados, futuro simples, comparativos, superlativos, conversação básica em situações cotidianas (compras, restaurantes, viagens).',
    totalLessons: 25,
    estimatedHours: 20,
    xpReward: 800,
    skills: ['Listening', 'Speaking', 'Reading', 'Writing', 'Grammar'],
  },
  {
    id: '3',
    level: 'B1' as CEFRLevel,
    title: 'Intermediário',
    description: 'Present perfect, condicionais (zero, first, second), phrasal verbs comuns, expressões idiomáticas, compreensão de textos e áudios mais longos.',
    totalLessons: 30,
    estimatedHours: 30,
    xpReward: 1200,
    skills: ['Listening', 'Speaking', 'Reading', 'Writing', 'Grammar', 'Vocabulary'],
  },
  {
    id: '4',
    level: 'B2' as CEFRLevel,
    title: 'Intermediário Avançado',
    description: 'Voz passiva, reported speech, third conditional, wish/if only, nuances gramaticais avançadas, inglês acadêmico e profissional, preparação para exames.',
    totalLessons: 25,
    estimatedHours: 35,
    xpReward: 1800,
    skills: ['Listening', 'Speaking', 'Reading', 'Writing', 'Grammar', 'Vocabulary', 'Academic'],
  },
  {
    id: '5',
    level: 'C1' as CEFRLevel,
    title: 'Avançado',
    description: 'Estruturas complexas, inversão, elipse, vocabulário sofisticado, fluência próxima à nativa, preparação para Cambridge C1 Advanced, IELTS 7.0+.',
    totalLessons: 20,
    estimatedHours: 40,
    xpReward: 2500,
    skills: ['Listening', 'Speaking', 'Reading', 'Writing', 'Grammar', 'Vocabulary', 'Academic', 'Professional'],
  },
  {
    id: '6',
    level: 'C2' as CEFRLevel,
    title: 'Proficiência',
    description: 'Domínio total da língua: sotaques regionais, gírias, linguagem técnica e acadêmica especializada, certificação Cambridge C2 Proficiency, IELTS 8.0+.',
    totalLessons: 15,
    estimatedHours: 50,
    xpReward: 3500,
    skills: ['Listening', 'Speaking', 'Reading', 'Writing', 'Grammar', 'Vocabulary', 'Academic', 'Professional', 'Native-like'],
  },
]

// Mock progress data
const mockProgress: Record<string, { status: string; progress: number }> = {
  '1': { status: 'completed', progress: 100 },
  '2': { status: 'in_progress', progress: 35 },
  '3': { status: 'not_started', progress: 0 },
  '4': { status: 'not_started', progress: 0 },
  '5': { status: 'not_started', progress: 0 },
  '6': { status: 'not_started', progress: 0 },
}

export function CoursesPage() {
  const { user } = useAuthStore()

  return (
    <div className="space-y-8 animate-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Meus Cursos</h1>
        <p className="text-gray-600 mt-1">Escolha seu nível e comece a aprender hoje mesmo</p>
      </div>

      {/* CEFR Level Guide */}
      <div className="card p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Níveis CEFR - Quadro Europeu Comum</h3>
        <div className="flex flex-wrap gap-2">
          {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((level, index) => (
            <Link
              key={level}
              to={`/courses/${index + 1}`}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all border',
                index <= 1
                  ? 'bg-primary-50 text-primary-700 border-primary-200'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
              )}
            >
              {level} - {getLevelLabel(level as CEFRLevel).split(' - ')[1]}
            </Link>
          ))}
        </div>
      </div>

      {/* Courses Grid */}
      <div className="space-y-6">
        {courses.map((course, index) => {
          const progress = mockProgress[course.id] || { status: 'not_started', progress: 0 }
          const isLocked = index > 0 && mockProgress[courses[index - 1].id]?.status !== 'completed'
          const prevCourse = index > 0 ? courses[index - 1] : null

          return (
            <Link
              key={course.id}
              to={`/courses/${course.id}`}
              className={cn(
                'card-hover relative overflow-hidden group block',
                isLocked && 'opacity-50 pointer-events-none'
              )}
            >
              {isLocked && (
                <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-10">
                  <div className="text-center p-4">
                    <Lock className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-600">Complete <span className="font-medium">{prevCourse?.title}</span> para desbloquear</p>
                  </div>
                </div>
              )}

              <div className="relative z-10 p-6 lg:pl-20">
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  {/* Level Badge & Info */}
                  <div className="flex items-center gap-4 lg:w-48 flex-shrink-0">
                    <div className={cn(
                      'w-16 h-16 rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0',
                      getLevelColor(course.level).replace('bg-', 'bg-').replace('500', '100'),
                      getLevelColor(course.level).replace('bg-', 'text-')
                    )}>
                      {course.level}
                    </div>
                    <div className="text-center lg:text-left">
                      <div className="flex items-center justify-center lg:justify-start gap-1 mb-1">
                        {progress.status === 'completed' && (
                          <CheckCircle2 className="w-5 h-5 text-success-500" />
                        )}
                        {progress.status === 'in_progress' && (
                          <TrendingUp className="w-5 h-5 text-primary-500" />
                        )}
                      </div>
                      <span className={cn(
                        'text-xs font-medium px-2 py-0.5 rounded-full',
                        progress.status === 'completed' && 'bg-success-50 text-success-700',
                        progress.status === 'in_progress' && 'bg-primary-50 text-primary-700',
                        progress.status === 'not_started' && 'bg-gray-50 text-gray-600',
                      )}>
                        {progress.status === 'completed' ? 'Concluído' :
                         progress.status === 'in_progress' ? 'Em andamento' : 'Não iniciado'}
                      </span>
                    </div>
                  </div>

                  {/* Course Details */}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                      {course.title}
                    </h2>
                    <p className="text-gray-600 mt-1 line-clamp-2">{course.description}</p>

                    {/* Skills tags */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      {course.skills.map((skill) => (
                        <span key={skill} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 hidden lg:flex">
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      <span>{course.totalLessons} lições</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>~{course.estimatedHours}h</span>
                    </div>
                    <div className="flex items-center gap-1 text-primary-600 font-medium">
                      <TrendingUp className="w-4 h-4" />
                      <span>+{course.xpReward} XP</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="lg:w-48 flex-shrink-0">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-500">Progresso</span>
                      <span className="font-medium text-gray-900">{progress.progress}%</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-500',
                          getLevelColor(course.level).replace('bg-', 'bg-')
                        )}
                        style={{ width: `${progress.progress}%` }}
                      />
                    </div>
                    {progress.status === 'in_progress' && (
                      <Button variant="primary" className="w-full mt-3" size="sm">
                        Continuar
                      </Button>
                    )}
                    {progress.status === 'completed' && (
                      <Button variant="ghost" className="w-full mt-3" size="sm">
                        Revisar
                      </Button>
                    )}
                    {progress.status === 'not_started' && !isLocked && (
                      <Button variant="secondary" className="w-full mt-3" size="sm">
                        Iniciar
                      </Button>
                    )}
                    {isLocked && (
                      <Button variant="ghost" className="w-full mt-3" size="sm" disabled>
                        Bloqueado
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Decorative accent */}
              <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: getLevelColor(course.level).replace('bg-', 'bg-').replace('500', '500') }} />
            </Link>
          )
        })}
      </div>

      {/* Info */}
      <div className="card p-6 bg-primary-50 border-primary-200">
        <h3 className="font-semibold text-primary-900 mb-2">Como funciona a progressão</h3>
        <ul className="space-y-2 text-primary-700 text-sm">
          <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Complete todas as lições de um nível para desbloquear o próximo</li>
          <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Cada lição dá XP e conta para seu streak diário</li>
          <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Alcance 80%+ em cada lição para marcar como "Mastered"</li>
          <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Revise lições anteriores a qualquer momento para manter o conhecimento fresco</li>
        </ul>
      </div>
    </div>
  )
}