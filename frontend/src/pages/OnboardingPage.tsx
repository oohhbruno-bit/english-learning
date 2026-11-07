'use client'

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, ChevronRight, Target, BookOpen, Trophy, Flame, Brain, ArrowRight } from 'lucide-react'
import { useUIStore } from "../stores/uiStore";
import { cn } from "../lib/utils";
import { Button } from "../components/ui/Button";

const steps = [
  {
    id: 'welcome',
    title: 'Bem-vindo ao English Zero!',
    subtitle: 'Sua jornada para fluência em inglês começa aqui',
    icon: '🎯',
    content: (
      <div className="text-center space-y-4">
        <p className="text-lg text-gray-600">
          Preparamos um caminho personalizado do zero ao avançado,
          com lições estruturadas, exercícios interativos e gamificação
          para manter você motivado.
        </p>
        <div className="grid grid-cols-3 gap-4 mt-6">
          <FeatureIcon icon={<BookOpen className="w-6 h-6" />} label="Lições CEFR" desc="A1 a C2" />
          <FeatureIcon icon={<Brain className="w-6 h-6" />} label="Exercícios" desc="Interativos" />
          <FeatureIcon icon={<Trophy className="w-6 h-6" />} label="Gamificação" desc="XP & Streak" />
        </div>
      </div>
    ),
  },
  {
    id: 'goal',
    title: 'Qual seu objetivo?',
    subtitle: 'Isso nos ajuda a personalizar sua experiência',
    icon: '🎯',
    content: (
      <GoalSelector />
    ),
  },
  {
    id: 'level',
    title: 'Qual seu nível atual?',
    subtitle: 'Se não tem certeza, comece do início',
    icon: '📊',
    content: (
      <LevelSelector />
    ),
  },
  {
    id: 'daily',
    title: 'Quanto tempo por dia?',
    subtitle: 'Consistência é a chave do sucesso',
    icon: '⏱️',
    content: (
      <DailyTimeSelector />
    ),
  },
  {
    id: 'complete',
    title: 'Tudo pronto! 🎉',
    subtitle: 'Vamos começar sua primeira lição',
    icon: '🚀',
    content: (
      <div className="text-center space-y-4">
        <div className="w-24 h-24 mx-auto rounded-full bg-primary-100 flex items-center justify-center">
          <span className="text-4xl">🎉</span>
        </div>
        <p className="text-lg text-gray-600">
          Seu plano personalizado está pronto. Vamos começar com a
          primeira lição do nível iniciante?
        </p>
        <div className="p-4 rounded-xl bg-primary-50 border border-primary-200">
          <p className="font-medium text-primary-900">Sugestão: Curso A1 - Iniciante Completo</p>
          <p className="text-sm text-primary-700 mt-1">20 lições • ~15 horas • 500 XP</p>
        </div>
      </div>
    ),
  },
]

function FeatureIcon({ icon, label, desc }: { icon: React.ReactNode; label: string; desc: string }) {
  return (
    <div className="p-4 rounded-xl bg-gray-50">
      <div className="w-10 h-10 mx-auto mb-2 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">
        {icon}
      </div>
      <p className="font-medium text-gray-900 text-sm">{label}</p>
      <p className="text-xs text-gray-500">{desc}</p>
    </div>
  )
}

function GoalSelector() {
  const goals = [
    { id: 'travel', label: 'Viagens', desc: 'Comunicação básica para turismo', icon: '✈️' },
    { id: 'work', label: 'Trabalho/Carreira', desc: 'Inglês profissional e reuniões', icon: '💼' },
    { id: 'study', label: 'Estudos/Academico', desc: 'Textos, provas, intercâmbio', icon: '📚' },
    { id: 'daily', label: 'Dia a dia', desc: 'Conversação geral e cultura', icon: '🗣️' },
    { id: 'exam', label: 'Certificação', desc: 'IELTS, TOEFL, Cambridge', icon: '📜' },
    { id: 'fun', label: 'Diversão', desc: 'Séries, jogos, internet', icon: '🎮' },
  ]

  return (
    <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Selecione seu objetivo">
      {goals.map((goal) => (
        <button
          key={goal.id}
          role="radio"
          className={cn(
            'p-4 rounded-xl border-2 text-left transition-all hover:border-primary-300',
            'bg-gray-50 border-gray-200'
          )}
        >
          <span className="text-2xl mb-2 block">{goal.icon}</span>
          <p className="font-medium text-gray-900">{goal.label}</p>
          <p className="text-sm text-gray-500">{goal.desc}</p>
        </button>
      ))}
    </div>
  )
}

function LevelSelector() {
  const levels = [
    { id: 'A1', label: 'A1 - Iniciante', desc: 'Nunca estudei inglês ou sei pouquíssimo', color: 'green' },
    { id: 'A2', label: 'A2 - Básico', desc: 'Sei saudações, verbo to be, vocabulário básico', color: 'lime' },
    { id: 'B1', label: 'B1 - Intermediário', desc: 'Consigo me comunicar em situações simples', color: 'yellow' },
    { id: 'B2', label: 'B2 - Intermediário Avançado', desc: 'Tenho boa base, quero fluência', color: 'orange' },
    { id: 'C1', label: 'C1 - Avançado', desc: 'Quase fluente, quero aperfeiçoar', color: 'red' },
    { id: 'C2', label: 'C2 - Proficiência', desc: 'Nível nativo, preparação para exames', color: 'purple' },
  ]

  const colorMap = {
    green: 'bg-green-100 text-green-700 border-green-200',
    lime: 'bg-lime-100 text-lime-700 border-lime-200',
    yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    orange: 'bg-orange-100 text-orange-700 border-orange-200',
    red: 'bg-red-100 text-red-700 border-red-200',
    purple: 'bg-purple-100 text-purple-700 border-purple-200',
  }

  return (
    <div className="space-y-3" role="radiogroup" aria-label="Selecione seu nível">
      {levels.map((level) => (
        <button
          key={level.id}
          role="radio"
          className={cn(
            'w-full p-4 rounded-xl border-2 text-left transition-all',
            colorMap[level.color as keyof typeof colorMap]
          )}
        >
          <div className="flex items-center gap-4">
            <span className="text-2xl">{level.id === 'A1' ? '🌱' : level.id === 'A2' ? '🌿' : level.id === 'B1' ? '🌳' : level.id === 'B2' ? '🌲' : level.id === 'C1' ? '🏔️' : '🏆'}</span>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{level.label}</p>
              <p className="text-sm text-gray-600">{level.desc}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </button>
      ))}
    </div>
  )
}

function DailyTimeSelector() {
  const options = [
    { value: 5, label: '5 min', desc: 'Rápido - para dias corridos', icon: '⚡' },
    { value: 10, label: '10 min', desc: 'Equilibrado - recomendado', icon: '⏱️' },
    { value: 15, label: '15 min', desc: 'Focado - progresso acelerado', icon: '🎯' },
    { value: 20, label: '20+ min', desc: 'Intensivo - imersão total', icon: '🔥' },
  ]

  return (
    <div className="space-y-3" role="radiogroup" aria-label="Selecione o tempo diário">
      {options.map((opt) => (
        <button
          key={opt.value}
          role="radio"
          className={cn(
            'w-full p-5 rounded-xl border-2 flex items-center gap-4 transition-all',
            'bg-gray-50 border-gray-200 hover:border-primary-300'
          )}
        >
          <span className="text-3xl">{opt.icon}</span>
          <div className="flex-1">
            <p className="text-xl font-bold text-gray-900">{opt.label} por dia</p>
            <p className="text-gray-600">{opt.desc}</p>
          </div>
          <div className="text-right text-sm text-gray-500">
            <p>~{opt.value * 7} min/semana</p>
            <p>~{Math.round(opt.value * 30 / 60)}h/mês</p>
          </div>
        </button>
      ))}
    </div>
  )
}

export function OnboardingPage() {
  const navigate = useNavigate()
  const { setHasSeenOnboarding } = useUIStore()
  const [currentStep, setCurrentStep] = useState(0)
  const [completed, setCompleted] = useState(false)

  const step = steps[currentStep]
  const isLastStep = currentStep === steps.length - 1
  const progress = ((currentStep + 1) / steps.length) * 100

  const handleNext = () => {
    if (isLastStep) {
      setHasSeenOnboarding(true)
      setCompleted(true)
      // Redirect to first lesson after a moment
      setTimeout(() => navigate('/lessons/1-1'), 1500)
    } else {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  if (completed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md text-center animate-in">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-5xl">🚀</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Vamos lá!</h1>
          <p className="text-gray-600 mt-2">Redirecionando para sua primeira lição...</p>
          <div className="mt-6 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-primary-600 animate-pulse" style={{ width: '100%' }} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-100 z-50">
        <div
          className="h-full bg-primary-600 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step Indicator */}
      <div className="fixed top-4 left-4 right-4 z-40 flex justify-center">
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
          {steps.map((s, i) => (
            <div
              key={s.id}
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all',
                i < currentStep
                  ? 'bg-success-500 text-white'
                  : i === currentStep
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-200 text-gray-400'
              )}
            >
              {i < currentStep ? <Check className="w-5 h-5" /> : i + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 pt-24 pb-16">
        <div className="w-full max-w-2xl animate-in">
          {/* Step Header */}
          <div className="text-center mb-8">
            <span className="text-4xl mb-4 block">{step.icon}</span>
            <h1 className="text-3xl font-bold text-gray-900">{step.title}</h1>
            <p className="text-gray-600 mt-2">{step.subtitle}</p>
          </div>

          {/* Step Content */}
          <div className="card p-6 lg:p-8">
            {step.content}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="opacity-0 invisible"
            >
              Voltar
            </Button>
            <div className="flex-1 text-center text-sm text-gray-500">
              Passo {currentStep + 1} de {steps.length}
            </div>
            <Button
              onClick={handleNext}
              size="lg"
              className="w-full sm:w-auto"
            >
              {isLastStep ? 'Começar Agora' : 'Continuar'}
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Skip Option */}
          <p className="text-center text-sm text-gray-400 mt-6">
            <button
              onClick={() => { setHasSeenOnboarding(true); navigate('/lessons/1-1') }}
              className="text-primary-600 hover:underline"
            >
              Pular onboarding
            </button>
          </p>
        </div>
      </main>
    </div>
  )
}