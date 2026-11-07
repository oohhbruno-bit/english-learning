import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace('.0', '') + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace('.0', '') + 'K'
  }
  return num.toString()
}

export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`
  }
  return `${secs}s`
}

export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...options,
  })
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'agora mesmo'
  if (diffMins < 60) return `há ${diffMins} min`
  if (diffHours < 24) return `há ${diffHours}h`
  if (diffDays < 7) return `há ${diffDays} dia${diffDays > 1 ? 's' : ''}`
  return formatDate(d)
}

export function calculateXPForLevel(level: number): number {
  // Exponential XP curve: 100 * level^2
  return Math.floor(100 * Math.pow(level, 1.5))
}

export function getLevelFromXP(xp: number): { level: number; currentLevelXP: number; nextLevelXP: number; progress: number } {
  let level = 1
  let totalXP = 0

  while (true) {
    const nextLevelXP = calculateXPForLevel(level + 1)
    if (totalXP + nextLevelXP > xp) break
    totalXP += nextLevelXP
    level++
  }

  const currentLevelXP = calculateXPForLevel(level)
  const nextLevelXP = calculateXPForLevel(level + 1)
  const progress = ((xp - totalXP) / currentLevelXP) * 100

  return {
    level,
    currentLevelXP: xp - totalXP,
    nextLevelXP: currentLevelXP,
    progress: Math.min(100, Math.max(0, progress)),
  }
}

export function getStreakColor(streak: number): string {
  if (streak >= 365) return 'text-amber-500'
  if (streak >= 100) return 'text-orange-500'
  if (streak >= 30) return 'text-red-500'
  if (streak >= 7) return 'text-blue-500'
  if (streak >= 3) return 'text-green-500'
  return 'text-gray-500'
}

export function getStreakEmoji(streak: number): string {
  if (streak >= 365) return '🏆'
  if (streak >= 100) return '🔥'
  if (streak >= 30) return '⭐'
  if (streak >= 7) return '🌟'
  if (streak >= 3) return '✨'
  return '🌱'
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15)
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  if (password.length < 8) errors.push('Pelo menos 8 caracteres')
  if (!/[A-Z]/.test(password)) errors.push('Pelo menos uma maiúscula')
  if (!/[a-z]/.test(password)) errors.push('Pelo menos uma minúscula')
  if (!/[0-9]/.test(password)) errors.push('Pelo menos um número')
  return { valid: errors.length === 0, errors }
}
export function getLevelColor(level: string): string {
  const colors: Record<string, string> = {
    A1: 'bg-green-500',
    A2: 'bg-emerald-500',
    B1: 'bg-blue-500',
    B2: 'bg-indigo-500',
    C1: 'bg-purple-500',
    C2: 'bg-pink-500',
  }
  return colors[level] || 'bg-gray-500'
}

export function getLevelLabel(level: string): string {
  const labels: Record<string, string> = {
    A1: 'Iniciante',
    A2: 'Básico',
    B1: 'Intermediário',
    B2: 'Intermediário Alto',
    C1: 'Avançado',
    C2: 'Proficiente',
  }
  return labels[level] || level
}
