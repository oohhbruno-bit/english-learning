import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '../index'
import { generateTokens, verifyRefreshToken, AuthRequest } from '../middleware/auth'
import { asyncHandler, AppError } from '../middleware/errorHandler'

export const authRouter = Router()

// Validation schemas
const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
})

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
})

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token é obrigatório'),
})

// POST /api/auth/register
authRouter.post('/register', asyncHandler(async (req, res) => {
  const data = registerSchema.parse(req.body)

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  })

  if (existingUser) {
    throw new AppError(409, 'E-mail já cadastrado')
  }

  // Hash password
  const passwordHash = await bcrypt.hash(data.password, 12)

  // Create user
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash,
    },
  })

  // Create default achievements for user
  await createDefaultAchievements(user.id)

  // Generate tokens
  const tokens = generateTokens({ id: user.id, email: user.email })

  // Create session
  await prisma.session.create({
    data: {
      userId: user.id,
      token: tokens.refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  })

  res.status(201).json({
    data: tokens,
    message: 'Conta criada com sucesso!',
    success: true,
  })
}))

// POST /api/auth/login
authRouter.post('/login', asyncHandler(async (req, res) => {
  const data = loginSchema.parse(req.body)

  // Find user
  const user = await prisma.user.findUnique({
    where: { email: data.email.toLowerCase() },
  })

  if (!user) {
    throw new AppError(401, 'Credenciais inválidas')
  }

  // Verify password
  const isValid = await bcrypt.compare(data.password, user.passwordHash)
  if (!isValid) {
    throw new AppError(401, 'Credenciais inválidas')
  }

  // Generate tokens
  const tokens = generateTokens({ id: user.id, email: user.email })

  // Create session
  await prisma.session.create({
    data: {
      userId: user.id,
      token: tokens.refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  })

  // Update last active date
  await prisma.user.update({
    where: { id: user.id },
    data: { lastActiveDate: new Date() },
  })

  res.json({
    data: tokens,
    message: 'Login realizado com sucesso!',
    success: true,
  })
}))

// POST /api/auth/refresh
authRouter.post('/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = refreshSchema.parse(req.body)

  // Verify refresh token
  const decoded = verifyRefreshToken(refreshToken)
  if (!decoded) {
    throw new AppError(401, 'Refresh token inválido ou expirado')
  }

  // Check if session exists and is valid
  const session = await prisma.session.findUnique({
    where: { token: refreshToken },
  })

  if (!session || session.expiresAt < new Date()) {
    throw new AppError(401, 'Sessão expirada')
  }

  // Generate new tokens
  const tokens = generateTokens({ id: decoded.id, email: decoded.email })

  // Update session with new refresh token
  await prisma.session.update({
    where: { id: session.id },
    data: {
      token: tokens.refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  })

  res.json({
    data: tokens,
    success: true,
  })
}))

// POST /api/auth/logout
authRouter.post('/logout', asyncHandler(async (req: AuthRequest, res) => {
  const authHeader = req.headers.authorization
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1]
    // Delete session
    await prisma.session.deleteMany({
      where: { token },
    })
  }

  res.json({
    message: 'Logout realizado com sucesso',
    success: true,
  })
}))

// GET /api/auth/me
authRouter.get('/me', asyncHandler(async (req: AuthRequest, res) => {
  if (!req.user) {
    throw new AppError(401, 'Não autenticado')
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      level: true,
      xp: true,
      streak: true,
      longestStreak: true,
      dailyGoalXP: true,
      lastActiveDate: true,
      createdAt: true,
    },
  })

  if (!user) {
    throw new AppError(404, 'Usuário não encontrado')
  }

  res.json({
    data: user,
    success: true,
  })
}))

// Helper function to create default achievements
async function createDefaultAchievements(userId: string) {
  const achievements = [
    {
      key: 'first_lesson',
      name: 'Primeiros Passos',
      description: 'Complete sua primeira lição',
      icon: '🎯',
      category: 'LESSONS',
      requirement: JSON.stringify({ type: 'lessons_completed', value: 1 }),
      xpReward: 50,
      rarity: 'COMMON',
    },
    {
      key: 'streak_3',
      name: 'Em Chamas',
      description: 'Mantenha um streak de 3 dias',
      icon: '🔥',
      category: 'STREAK',
      requirement: JSON.stringify({ type: 'streak_days', value: 3 }),
      xpReward: 100,
      rarity: 'COMMON',
    },
    {
      key: 'streak_7',
      name: 'Semana Perfeita',
      description: 'Mantenha um streak de 7 dias',
      icon: '⭐',
      category: 'STREAK',
      requirement: JSON.stringify({ type: 'streak_days', value: 7 }),
      xpReward: 250,
      rarity: 'RARE',
    },
    {
      key: 'streak_30',
      name: 'Dedicado',
      description: 'Mantenha um streak de 30 dias',
      icon: '🌟',
      category: 'STREAK',
      requirement: JSON.stringify({ type: 'streak_days', value: 30 }),
      xpReward: 1000,
      rarity: 'EPIC',
    },
    {
      key: 'xp_1000',
      name: 'Acumulador',
      description: 'Alcance 1.000 XP total',
      icon: '💎',
      category: 'XP',
      requirement: JSON.stringify({ type: 'total_xp', value: 1000 }),
      xpReward: 200,
      rarity: 'RARE',
    },
    {
      key: 'perfect_5',
      name: 'Perfeccionista',
      description: 'Complete 5 lições com 100% de precisão',
      icon: '💯',
      category: 'PERFECT',
      requirement: JSON.stringify({ type: 'perfect_lessons', value: 5 }),
      xpReward: 500,
      rarity: 'EPIC',
    },
    {
      key: 'course_a1',
      name: 'Iniciante Graduado',
      description: 'Complete o curso A1',
      icon: '🎓',
      category: 'LESSONS',
      requirement: JSON.stringify({ type: 'lessons_completed', value: 20 }),
      xpReward: 500,
      rarity: 'RARE',
    },
    {
      key: 'legendary',
      name: 'Lenda Viva',
      description: 'Alcance nível C2',
      icon: '👑',
      category: 'SPECIAL',
      requirement: JSON.stringify({ type: 'level_up', value: 6 }),
      xpReward: 5000,
      rarity: 'LEGENDARY',
    },
  ]

  for (const ach of achievements) {
    await prisma.achievement.upsert({
      where: { key: ach.key },
      update: {},
      create: ach,
    })
  }
}