import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../index'
import { AuthRequest } from '../middleware/auth'
import { asyncHandler, AppError } from '../middleware/errorHandler'

export const usersRouter = Router()

// Validation schemas
const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  avatar: z.string().url().optional().nullable(),
  dailyGoalXP: z.number().int().min(10).max(500).optional(),
})

const updateSettingsSchema = z.object({
  dailyGoalXP: z.number().int().min(10).max(500).optional(),
  notifications: z.object({
    dailyReminder: z.boolean().optional(),
    streakAlert: z.boolean().optional(),
    weeklyReport: z.boolean().optional(),
    achievementUnlock: z.boolean().optional(),
    leaderboardChanges: z.boolean().optional(),
  }).optional(),
  learning: z.object({
    audioSpeed: z.number().optional(),
    autoPlayAudio: z.boolean().optional(),
    strictMode: z.boolean().optional(),
    srsEnabled: z.boolean().optional(),
  }).optional(),
})

// GET /api/users/profile - Get current user profile
usersRouter.get('/profile', asyncHandler(async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
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

  // Get stats
  const [
    completedLessons,
    totalTimeSpent,
    avgScore,
    totalXPEarned,
  ] = await Promise.all([
    prisma.userProgress.count({
      where: { userId: req.user!.id, status: { in: ['COMPLETED', 'MASTERED'] } },
    }),
    prisma.userProgress.aggregate({
      where: { userId: req.user!.id },
      _sum: { timeSpent: true },
    }),
    prisma.userProgress.aggregate({
      where: { userId: req.user!.id, score: { gt: 0 } },
      _avg: { score: true },
    }),
    prisma.userProgress.aggregate({
      where: { userId: req.user!.id },
      _sum: { score: true }, // This isn't right, but placeholder
    }),
  ])

  // Get recent activity
  const recentProgress = await prisma.userProgress.findMany({
    where: { userId: req.user!.id },
    orderBy: { lastAttemptAt: 'desc' },
    take: 10,
    include: {
      lesson: { select: { title: true, order: true } },
      course: { select: { level: true, title: true } },
    },
  })

  // Get unlocked achievements count
  const achievementsCount = await prisma.userAchievement.count({
    where: { userId: req.user!.id },
  })

  res.json({
    data: {
      ...user,
      stats: {
        completedLessons,
        totalTimeSpent: totalTimeSpent._sum.timeSpent || 0,
        avgScore: Math.round(avgScore._avg.score || 0),
        achievementsUnlocked: achievementsCount,
      },
      recentActivity: recentProgress.map(p => ({
        id: p.id,
        lessonTitle: p.lesson.title,
        lessonOrder: p.lesson.order,
        courseLevel: p.course.level,
        courseTitle: p.course.title,
        status: p.status,
        score: p.score,
        timeSpent: p.timeSpent,
        lastAttemptAt: p.lastAttemptAt,
      })),
    },
    success: true,
  })
}))

// GET /api/users/stats - Get detailed user statistics
usersRouter.get('/stats', asyncHandler(async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
  })

  if (!user) {
    throw new AppError(404, 'Usuário não encontrado')
  }

  // Get progress by course
  const courseProgress = await prisma.course.findMany({
    where: { isPublished: true },
    include: {
      lessons: {
        select: { id: true },
      },
      progress: {
        where: { userId: req.user!.id },
        select: { status: true, score: true, timeSpent: true },
      },
    },
  })

  const coursesWithStats = courseProgress.map(course => {
    const lessons = course.lessons.length
    const completed = course.progress.filter(p => p.status === 'COMPLETED' || p.status === 'MASTERED').length
    const mastered = course.progress.filter(p => p.status === 'MASTERED').length
    const avgScore = course.progress.length > 0
      ? Math.round(course.progress.reduce((sum, p) => sum + p.score, 0) / course.progress.length)
      : 0
    const totalTime = course.progress.reduce((sum, p) => sum + p.timeSpent, 0)

    return {
      id: course.id,
      level: course.level,
      title: course.title,
      totalLessons: lessons,
      completedLessons: completed,
      masteredLessons: mastered,
      progress: lessons > 0 ? Math.round((completed / lessons) * 100) : 0,
      avgScore,
      timeSpent: totalTime,
    }
  })

  // Get vocabulary stats (mock for now)
  const vocabStats = {
    learned: 342,
    mastered: 128,
    total: 2000,
  }

  // Get skill breakdown (mock)
  const skills = [
    { category: 'Vocabulário', learned: 342, mastered: 128, total: 2000 },
    { category: 'Gramática', learned: 15, mastered: 8, total: 50 },
    { category: 'Listening', exercises: 45, avgScore: 82 },
    { category: 'Speaking', exercises: 12, avgScore: 75 },
    { category: 'Reading', exercises: 38, avgScore: 88 },
    { category: 'Writing', exercises: 22, avgScore: 79 },
  ]

  res.json({
    data: {
      user: {
        level: user.level,
        xp: user.xp,
        streak: user.streak,
        longestStreak: user.longestStreak,
      },
      courses: coursesWithStats,
      vocabulary: vocabStats,
      skills,
    },
    success: true,
  })
}))

// PUT /api/users/profile - Update profile
usersRouter.put('/profile', asyncHandler(async (req: AuthRequest, res) => {
  const data = updateProfileSchema.parse(req.body)

  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data,
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      level: true,
      xp: true,
      streak: true,
      dailyGoalXP: true,
    },
  })

  res.json({
    data: user,
    message: 'Perfil atualizado com sucesso',
    success: true,
  })
}))

// PUT /api/users/daily-goal - Update daily goal
usersRouter.put('/daily-goal', asyncHandler(async (req: AuthRequest, res) => {
  const { targetXP } = z.object({ targetXP: z.number().int().min(10).max(500) }).parse(req.body)

  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: { dailyGoalXP: targetXP },
    select: { dailyGoalXP: true },
  })

  res.json({
    data: user,
    message: 'Meta diária atualizada',
    success: true,
  })
}))

// GET /api/users/daily-goal - Get today's daily goal
usersRouter.get('/daily-goal', asyncHandler(async (req: AuthRequest, res) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let dailyGoal = await prisma.dailyGoal.findUnique({
    where: {
      userId_date: {
        userId: req.user!.id,
        date: today,
      },
    },
  })

  if (!dailyGoal) {
    // Create default daily goal
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } })
    dailyGoal = await prisma.dailyGoal.create({
      data: {
        userId: req.user!.id,
        date: today,
        targetXP: user?.dailyGoalXP || 50,
      },
    })
  }

  res.json({
    data: dailyGoal,
    success: true,
  })
}))