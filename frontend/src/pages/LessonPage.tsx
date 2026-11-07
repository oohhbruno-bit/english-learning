'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Play, Pause, Volume2, Check, X, Flag, Star, Brain, MessageSquare, ArrowRight } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { useUIStore } from '../stores/uiStore'
import { api } from '../lib/api'
import { cn, getLevelColor, formatTime } from '../lib/utils'
import { CEFRLevel, Exercise, ExerciseType } from '../types'
import { Button } from '../components/ui/Button'

// Mock lesson data
const mockLessons: Record<string, any> = {
  '1-1': {
    id: '1-1',
    courseId: '1',
    title: 'Liçao 1: Alfabeto e Pronúncia',
    description: 'Aprenda o alfabeto inglês e os sons básicos',
    order: 1,
    xpReward: 25,
    content: {
      vocabulary: [
        { id: 'v1', word: 'Hello', translation: 'Olá', pronunciation: '/həˈloʊ/', partOfSpeech: 'interjection', exampleSentence: 'Hello, how are you?', exampleTranslation: 'Olá, como você está?' },
        { id: 'v2', word: 'Goodbye', translation: 'Tchau', pronunciation: '/ɡʊdˈbaɪ/', partOfSpeech: 'interjection', exampleSentence: 'Goodbye, see you later!', exampleTranslation: 'Tchau, até logo!' },
        { id: 'v3', word: 'Please', translation: 'Por favor', pronunciation: '/pliːz/', partOfSpeech: 'adverb', exampleSentence: 'Please sit down.', exampleTranslation: 'Por favor, sente-se.' },
        { id: 'v4', word: 'Thank you', translation: 'Obrigado', pronunciation: '/θæŋk juː/', partOfSpeech: 'phrase', exampleSentence: 'Thank you for your help.', exampleTranslation: 'Obrigado pela sua ajuda.' },
      ],
      grammar: [
        {
          id: 'g1',
          title: 'O Alfabeto Inglês',
          explanation: 'O inglês usa o mesmo alfabeto latino do português, mas com 26 letras. A pronúncia é diferente!',
          examples: [
            { sentence: 'A - /eɪ/', translation: 'Som "ei"', highlight: 'A' },
            { sentence: 'B - /biː/', translation: 'Som "bi"', highlight: 'B' },
            { sentence: 'C - /siː/', translation: 'Som "si"', highlight: 'C' },
          ],
          rules: ['Vogais: A, E, I, O, U', 'Consoantes: todas as outras', 'Y às vezes é vogal'],
        },
      ],
      exercises: [
        {
          id: 'ex1',
          type: 'multiple_choice',
          question: 'Como se pronuncia a letra "A" em inglês?',
          instruction: 'Selecione a opção correta',
          options: [
            { id: '1', text: '/eɪ/ (som "ei")', isCorrect: true },
            { id: '2', text: '/aː/ (som "a")', isCorrect: false },
            { id: '3', text: '/æ/ (som "ae")', isCorrect: false },
            { id: '4', text: '/ʌ/ (som "u")', isCorrect: false },
          ],
          correctAnswer: '1',
          explanation: 'A letra A em inglês tem o som /eɪ/, como em "day" ou "say".',
          xpReward: 5,
          difficulty: 1,
        },
        {
          id: 'ex2',
          type: 'multiple_choice',
          question: 'Qual das seguintes saudações significa "Olá"?',
          instruction: 'Escolha a tradução correta',
          options: [
            { id: '1', text: 'Goodbye', isCorrect: false },
            { id: '2', text: 'Hello', isCorrect: true },
            { id: '3', text: 'Please', isCorrect: false },
            { id: '4', text: 'Thank you', isCorrect: false },
          ],
          correctAnswer: '2',
          explanation: 'Hello é a saudação padrão para "Olá" em inglês.',
          xpReward: 5,
          difficulty: 1,
        },
        {
          id: 'ex3',
          type: 'fill_blank',
          question: 'Complete: "_____ you for your help."',
          instruction: 'Digite a palavra que falta',
          correctAnswer: ['Thank', 'thank'],
          explanation: 'Thank you = Obrigado. É a forma educada de agradecer.',
          xpReward: 5,
          difficulty: 2,
        },
        {
          id: 'ex4',
          type: 'translation',
          question: 'Traduza para o inglês: "Por favor, sente-se."',
          instruction: 'Digite a tradução',
          correctAnswer: ['Please sit down', 'Please sit down.'],
          explanation: 'Please = Por favor. Sit down = Sente-se.',
          xpReward: 10,
          difficulty: 2,
        },
        {
          id: 'ex5',
          type: 'matching',
          question: 'Associe as palavras às suas traduções',
          instruction: 'Arraste ou clique para conectar',
          options: [
            { id: '1', text: 'Hello', isCorrect: false },
            { id: '2', text: 'Goodbye', isCorrect: false },
            { id: '3', text: 'Please', isCorrect: false },
            { id: '4', text: 'Thank you', isCorrect: false },
          ],
          correctAnswer: ['Hello-Olá', 'Goodbye-Tchau', 'Please-Por favor', 'Thank you-Obrigado'],
          explanation: 'Vocabulário básico de saudações e cortesia.',
          xpReward: 10,
          difficulty: 2,
        },
      ],
    },
  },
  '1-2': {
    id: '1-2',
    courseId: '1',
    title: 'Liçao 2: Saudações e Despedidas',
    description: 'Aprenda a cumprimentar e se despedir em diferentes situações',
    order: 2,
    xpReward: 25,
    content: {
      vocabulary: [],
      grammar: [],
      exercises: [],
    },
  },
}

export function LessonPage() {
  const { lessonId } = useParams<{ lessonId: string }>()
  const navigate = useNavigate()
  const { user, updateXP, updateStreak } = useAuthStore()
  const { addToast } = useUIStore()

  const lesson = mockLessons[lessonId || '1-1'] || mockLessons['1-1']
  const exercises = lesson?.content?.exercises || []

  // Lesson state
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [showResult, setShowResult] = useState(false)
  const [exerciseResults, setExerciseResults] = useState<Record<string, { correct: boolean; xpEarned: number }>>({})
  const [lessonCompleted, setLessonCompleted] = useState(false)
  const [totalXPEarned, setTotalXPEarned] = useState(0)
  const [startTime] = useState(Date.now())
  const [exerciseStartTime, setExerciseStartTime] = useState(Date.now())
  const [audioPlaying, setAudioPlaying] = useState<string | null>(null)

  const currentExercise = exercises[currentExerciseIndex]
  const isLastExercise = currentExerciseIndex === exercises.length - 1
  const completedExercises = Object.keys(exerciseResults).length
  const correctExercises = Object.values(exerciseResults).filter(r => r.correct).length

  // Handle answer submission
  const handleSubmitAnswer = useCallback(async (answer: any) => {
    if (!currentExercise || showResult) return

    const timeSpent = Math.floor((Date.now() - exerciseStartTime) / 1000)
    let isCorrect = false

    // Check answer based on exercise type
    switch (currentExercise.type) {
      case 'multiple_choice':
        isCorrect = answer === currentExercise.correctAnswer
        break
      case 'fill_blank':
      case 'translation':
        const correctAnswers = Array.isArray(currentExercise.correctAnswer)
          ? currentExercise.correctAnswer
          : [currentExercise.correctAnswer]
        isCorrect = correctAnswers.some(ca =>
          ca.toLowerCase().trim() === answer.toLowerCase().trim()
        )
        break
      case 'matching':
        // Simplified for demo
        isCorrect = true
        break
      default:
        isCorrect = true
    }

    const xpEarned = isCorrect ? currentExercise.xpReward : 0

    setAnswers(prev => ({ ...prev, [currentExercise.id]: answer }))
    setExerciseResults(prev => ({
      ...prev,
      [currentExercise.id]: { correct: isCorrect, xpEarned }
    }))
    setTotalXPEarned(prev => prev + xpEarned)
    setShowResult(true)

    // In real app: await api.completeExercise(lessonId!, currentExercise.id, answer, isCorrect, timeSpent)
  }, [currentExercise, exerciseStartTime, showResult])

  const handleNextExercise = useCallback(() => {
    if (isLastExercise) {
      completeLesson()
    } else {
      setCurrentExerciseIndex(prev => prev + 1)
      setShowResult(false)
      setExerciseStartTime(Date.now())
    }
  }, [isLastExercise])

  const completeLesson = useCallback(async () => {
    const score = exercises.length > 0
      ? Math.round((correctExercises / exercises.length) * 100)
      : 0
    const timeSpent = Math.floor((Date.now() - startTime) / 1000)

    setLessonCompleted(true)

    // Update user XP and streak
    if (user) {
      updateXP(user.xp + totalXPEarned)
      // In real app, check if streak should increase
    }

    // In real app: await api.completeLesson(lessonId!, score, timeSpent)

    addToast({
      type: 'success',
      title: 'Lição Concluída!',
      message: `Você ganhou ${totalXPEarned} XP! Precisão: ${score}%`,
    })
  }, [exercises.length, correctExercises, startTime, totalXPEarned, user, updateXP, addToast])

  const handleExitLesson = useCallback(() => {
    navigate(`/courses/${lesson?.courseId}`)
  }, [navigate, lesson?.courseId])

  if (!lesson) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900">Lição não encontrada</h1>
        <Button onClick={() => navigate('/courses')} variant="primary" className="mt-4">
          Voltar aos cursos
        </Button>
      </div>
    )
  }

  // Lesson completed view
  if (lessonCompleted) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-in">
        <div className="text-center py-8">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-success-100 flex items-center justify-center">
            <Check className="w-12 h-12 text-success-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Lição Concluída!</h1>
          <p className="text-gray-600 mt-2">{lesson.title}</p>
        </div>

        <div className="card p-6">
          <div className="grid grid-cols-3 gap-4 text-center mb-6">
            <div className="p-4 rounded-xl bg-primary-50">
              <p className="text-3xl font-bold text-primary-600">+{totalXPEarned}</p>
              <p className="text-sm text-primary-700">XP Ganho</p>
            </div>
            <div className="p-4 rounded-xl bg-success-50">
              <p className="text-3xl font-bold text-success-600">{correctExercises}/{exercises.length}</p>
              <p className="text-sm text-success-700">Corretas</p>
            </div>
            <div className="p-4 rounded-xl bg-warning-50">
              <p className="text-3xl font-bold text-warning-600">{Math.round((correctExercises / exercises.length) * 100)}%</p>
              <p className="text-sm text-warning-700">Precisão</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleExitLesson} className="flex-1" size="lg">
              Voltar ao Curso
            </Button>
            <Button onClick={() => {
              // Go to next lesson
              const currentCourse = mockLessons[lessonId!]
              const nextOrder = currentCourse.order + 1
              const nextLessonId = `${lessonId!.split('-')[0]}-${nextOrder}`
              if (mockLessons[nextLessonId]) {
                navigate(`/lessons/${nextLessonId}`)
              } else {
                handleExitLesson()
              }
            }} variant="primary" className="flex-1" size="lg">
              Próxima Lição
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Exercise view
  const progress = ((currentExerciseIndex) / exercises.length) * 100

  return (
    <div className="max-w-3xl mx-auto space-y-4 animate-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={handleExitLesson}>
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Curso</span>
        </Button>
        <div className="flex-1 text-center">
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden max-w-xs mx-auto">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-300',
                getLevelColor('A1').replace('bg-', 'bg-')
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Exercício {currentExerciseIndex + 1} de {exercises.length}
          </p>
        </div>
        <div className="w-20" />
      </div>

      {/* Exercise Card */}
      <div className="card p-6">
        {currentExercise && (
          <ExerciseComponent
            exercise={currentExercise}
            onSubmit={handleSubmitAnswer}
            showResult={showResult}
            result={exerciseResults[currentExercise.id]}
            correctAnswer={currentExercise.correctAnswer}
            explanation={currentExercise.explanation}
            userAnswer={answers[currentExercise.id]}
            audioPlaying={audioPlaying}
            onAudioToggle={setAudioPlaying}
          />
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
          <Button
            variant="ghost"
            onClick={() => currentExerciseIndex > 0 && (setCurrentExerciseIndex(prev => prev - 1), setShowResult(false), setExerciseStartTime(Date.now()))}
            disabled={currentExerciseIndex === 0}
          >
            Anterior
          </Button>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>{currentExerciseIndex + 1}/{exercises.length}</span>
            <Flag className="w-4 h-4" />
            <span>+{currentExercise?.xpReward || 0} XP</span>
          </div>

          <Button
            onClick={handleNextExercise}
            disabled={!showResult}
            className="flex-1 sm:flex-none sm:ml-auto"
          >
            {isLastExercise ? 'Finalizar' : 'Próximo'}
            {!isLastExercise && <ArrowRight className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Vocabulary Sidebar (on desktop) */}
      {lesson.content.vocabulary.length > 0 && (
        <div className="hidden lg:block">
          <div className="card p-4 sticky top-24">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary-600" />
              Vocabulário desta Lição
            </h3>
            <div className="space-y-3">
              {lesson.content.vocabulary.slice(0, 8).map((vocab: any) => (
                <div key={vocab.id} className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{vocab.word}</p>
                      <p className="text-sm text-gray-500">{vocab.translation}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setAudioPlaying(vocab.id)}>
                      <Volume2 className="w-4 h-4" />
                    </Button>
                  </div>
                  {vocab.exampleSentence && (
                    <p className="text-xs text-gray-400 mt-1 italic">"{vocab.exampleSentence}"</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ExerciseComponent({
  exercise,
  onSubmit,
  showResult,
  result,
  correctAnswer,
  explanation,
  userAnswer,
  audioPlaying,
  onAudioToggle,
}: {
  exercise: Exercise
  onSubmit: (answer: any) => void
  showResult: boolean
  result?: { correct: boolean; xpEarned: number }
  correctAnswer: string | string[]
  explanation?: string
  userAnswer?: any
  audioPlaying: string | null
  onAudioToggle: (id: string | null) => void
}) {
  const [inputValue, setInputValue] = useState('')

  const isCorrect = result?.correct
  const isAnswered = showResult

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isAnswered && inputValue.trim()) {
      onSubmit(inputValue.trim())
    }
  }

  const renderExercise = () => {
    switch (exercise.type) {
      case 'multiple_choice':
        return (
          <div className="space-y-3">
            {exercise.options?.map((option) => (
              <button
                key={option.id}
                onClick={() => !isAnswered && onSubmit(option.id)}
                className={cn(
                  'w-full p-4 rounded-lg border-2 text-left transition-all',
                  isAnswered
                    ? option.isCorrect
                      ? 'border-success-500 bg-success-50'
                      : option.id === userAnswer
                      ? 'border-danger-500 bg-danger-50'
                      : 'border-gray-200 bg-gray-50'
                    : 'border-gray-200 hover:border-primary-300 hover:bg-primary-50'
                )}
                disabled={isAnswered}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                    isAnswered
                      ? option.isCorrect
                        ? 'border-success-500 bg-success-500'
                        : option.id === userAnswer
                        ? 'border-danger-500 bg-danger-500'
                        : 'border-gray-300'
                      : 'border-gray-300'
                  )}>
                    {isAnswered && option.isCorrect && <Check className="w-4 h-4 text-white" />}
                    {isAnswered && option.id === userAnswer && !option.isCorrect && <X className="w-4 h-4 text-white" />}
                  </div>
                  <span className="text-gray-900">{option.text}</span>
                </div>
              </button>
            ))}
          </div>
        )

      case 'fill_blank':
      case 'translation':
        return (
          <div className="space-y-3">
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={exercise.type === 'fill_blank' ? 'Digite a palavra que falta...' : 'Digite a tradução...'}
              className={cn(
                'input text-lg text-center font-medium',
                isAnswered && (isCorrect ? 'border-success-500 bg-success-50' : 'border-danger-500 bg-danger-50')
              )}
              disabled={isAnswered}
              autoFocus
            />
            {isAnswered && (
              <p className={cn('text-sm text-center', isCorrect ? 'text-success-600' : 'text-danger-500')}>
                {isCorrect
                  ? `Correto! ${explanation || ''}`
                  : `Errado. A resposta correta: ${Array.isArray(correctAnswer) ? correctAnswer.join(' ou ') : correctAnswer}`}
              </p>
            )}
          </div>
        )

      case 'matching':
        return (
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 text-center mb-4">Funcionalidade de arrastar e soltar em desenvolvimento</p>
            <div className="grid grid-cols-2 gap-3">
              {exercise.options?.map((option) => (
                <div key={option.id} className="p-3 rounded-lg bg-white border border-gray-200 text-center">
                  {option.text}
                </div>
              ))}
            </div>
          </div>
        )

      default:
        return (
          <div className="text-center py-8 text-gray-500">
            Tipo de exercício não suportado: {exercise.type}
          </div>
        )
    }
  }

  return (
    <div>
      {/* Question */}
      <div className="mb-6">
        {exercise.instruction && (
          <p className="text-sm text-gray-500 mb-2">{exercise.instruction}</p>
        )}
        <p className="text-xl font-semibold text-gray-900">{exercise.question}</p>
      </div>

      {/* Exercise Content */}
      <div className="mb-6">
        {renderExercise()}
      </div>

      {/* Result Feedback */}
      {isAnswered && explanation && (
        <div className={cn(
          'p-4 rounded-lg border',
          isCorrect
            ? 'bg-success-50 border-success-200 text-success-800'
            : 'bg-danger-50 border-danger-200 text-danger-800'
        )}>
          <div className="flex items-start gap-2">
            {isCorrect ? (
              <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
            ) : (
              <X className="w-5 h-5 flex-shrink-0 mt-0.5" />
            )}
            <p className="text-sm">{explanation}</p>
          </div>
        </div>
      )}

      {/* XP Earned */}
      {isAnswered && result && (
        <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-primary-50 border border-primary-200">
          <Star className="w-5 h-5 text-warning-500" />
          <span className="font-medium text-primary-700">
            {result.correct ? `+${result.xpEarned} XP ganho!` : 'Nenhum XP (resposta incorreta)'}
          </span>
        </div>
      )}
    </div>
  )
}