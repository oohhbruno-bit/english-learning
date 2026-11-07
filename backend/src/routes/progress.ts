import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../index'
import { AuthRequest } from '../middleware/auth'
import { asyncHandler, AppError } from '../middleware/errorHandler'

export const progressRouter = Router()

// Validation schemas
const startLessonSchema = z.object({})
const completeExerciseSchema = z.object({
  exerciseId: z.string(),
  answer: z.any(),
  isCorrect: z.boolean(),
  timeSpent: z.number().int().min(0),
})
const completeLessonSchema = z.object({
  score: z.number().int().min(0).max(100),
  timeSpent: z.number().int().min(0),
})

// GET /api/progress - Get user progress for all courses
progressRouter.get('/', asyncHandler(async (req: AuthRequest, res) => {
  const { courseId } = req.query

  const where: any = { userId: req.user!.id }
  if (courseId) where.courseId = courseId

  const progress = await prisma.userProgress.findMany({
    where,
    include: {
      lesson: {
        select: { id: true, title: true, order: true, xpReward: true },
      },
      course: {
        select: { id: true, level: true, title: true },
      },
    },
    orderBy: { lastAttemptAt: 'desc' },
  })

  res.json({
    data: progress,
    success: true,
  })
}))

// GET /api/progress/lesson/:lessonId - Get progress for specific lesson
progressRouter.get('/lesson/:lessonId', asyncHandler(async (req: AuthRequest, res) => {
  const progress = await prisma.userProgress.findUnique({
    where: {
      userId_lessonId: {
        userId: req.user!.id,
        lessonId: req.params.lessonId,
      },
    },
  })

  if (!progress) {
    return res.json({
      data: null,
      success: true,
    })
  }

  res.json({
    data: progress,
    success: true,
  })
}))

// POST /api/progress/lesson/:lessonId/start - Start a lesson
progressRouter.post('/lesson/:lessonId/start', asyncHandler(async (req: AuthRequest, res) => {
  const lesson = await prisma.lesson.findUnique({
    where: { id: req.params.lessonId },
  })

  if (!lesson) {
    throw new AppError(404, 'Lição não encontrada')
  }

  const progress = await prisma.userProgress.upsert({
    where: {
      userId_lessonId: {
        userId: req.user!.id,
        lessonId: req.params.lessonId,
      },
    },
    create: {
      userId: req.user!.id,
      lessonId: req.params.lessonId,
      courseId: lesson.courseId,
      status: 'IN_PROGRESS',
    },
    update: {
      status: 'IN_PROGRESS',
      lastAttemptAt: new Date(),
    },
  })

  res.json({
    data: progress,
    success: true,
  })
}))

// POST /api/progress/lesson/:lessonId/exercise - Complete an exercise
progressRouter.post('/lesson/:lessonId/exercise', asyncHandler(async (req: AuthRequest, res) => {
  const { exerciseId, answer, isCorrect, timeSpent } = completeExerciseSchema.parse(req.body)

  const lesson = await prisma.lesson.findUnique({
    where: { id: req.params.lessonId },
  })

  if (!lesson) {
    throw new AppError(404, 'Lição não encontrada')
  }

  const progress = await prisma.userProgress.upsert({
    where: {
      userId_lessonId: {
        userId: req.user!.id,
        lessonId: req.params.lessonId,
      },
    },
    create: {
      userId: req.user!.id,
      lessonId: req.params.lessonId,
      courseId: lesson.courseId,
      status: 'IN_PROGRESS',
      completedExercises: isCorrect ? [exerciseId] : [],
    },
    update: {
      status: 'IN_PROGRESS',
      completedExercises: {
        push: isCorrect ? exerciseId : undefined,
      },
      lastAttemptAt: new Date(),
    },
  })

  // Calculate XP earned
  const xpEarned = isCorrect ? 5 : 0 // Simplified - in real app, get from exercise

  res.json({
    data: {
      progress,
      xpEarned,
      isCorrect,
    },
    success: true,
  })
}))

// POST /api/progress/lesson/:lessonId/complete - Complete a lesson
progressRouter.post('/lesson/:lessonId/complete', asyncHandler(async (req: AuthRequest, res) => {
  const { score, timeSpent } = completeLessonSchema.parse(req.body)

  const lesson = await prisma.lesson.findUnique({
    where: { id: req.params.lessonId },
    include: { course: true },
  })

  if (!lesson) {
    throw new AppError(404, 'Lição não encontrada')
  }

  const status = score >= 80 ? 'MASTERED' : 'COMPLETED'

  const progress = await prisma.userProgress.upsert({
    where: {
      userId_lessonId: {
        userId: req.user!.id,
        lessonId: req.params.lessonId,
      },
    },
    create: {
      userId: req.user!.id,
      lessonId: req.params.lessonId,
      courseId: lesson.courseId,
      status,
      score,
      timeSpent,
      completedAt: new Date(),
    },
    update: {
      status,
      score,
      timeSpent: { increment: timeSpent },
      completedAt: new Date(),
      lastAttemptAt: new Date(),
    },
  })

  // Award XP
  const xpEarned = lesson.xpReward
  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: {
      xp: { increment: xpEarned },
    },
  })

  // Check for level up
  const newLevel = calculateLevel(user.xp)
  if (newLevel !== user.level) {
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { level: newLevel },
    })
  }

  // Update streak
  await updateStreak(req.user!.id)

  // Check achievements
  await checkAchievements(req.user!.id, lesson.courseId)

  res.json({
    data: {
      progress,
      xpEarned,
      newLevel: newLevel !== user.level ? newLevel : null,
      leveledUp: newLevel !== user.level,
    },
    success: true,
  })
}))

// Helper functions
function calculateLevel(xp: number): string {
  if (xp >= 3500) return 'C2'
  if (xp >= 2000) return 'C1'
  if (xp >= 1000) return 'B2'
  if (xp >= 400) return 'B1'
  if (xp >= 100) return 'A2'
  return 'A1'
}

async function updateStreak(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const lastActive = new Date(user.lastActiveDate)
  lastActive.setHours(0, 0, 0, 0)

  const diffDays = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24))

  let newStreak = user.streak
  let newLongestStreak = user.longestStreak

  if (diffDays === 1) {
    // Consecutive day
    newStreak += 1
    newLongestStreak = Math.max(newLongestStreak, newStreak)
  } else if (diffDays > 1) {
    // Streak broken
    newStreak = 1
  }
  // diffDays === 0 means already counted today

  await prisma.user.update({
    where: { id: userId },
    data: {
      streak: newStreak,
      longestStreak: newLongestStreak,
      lastActiveDate: new Date(),
    },
  })
}

async function checkAchievements(userId: string, courseId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return

  const achievements = await prisma.achievement.findMany({
    where: {
      userAchievements: { none: { userId } },
    },
  })

  const completedLessons = await prisma.userProgress.count({
    where: { userId, status: { in: ['COMPLETED', 'MASTERED'] } },
  })

  const perfectLessons = await prisma.userProgress.count({
    where: { userId, status: 'MASTERED' },
  })

  for (const ach of achievements) {
    const req = ach.requirement as any
    let unlocked = false

    switch (req.type) {
      case 'lessons_completed':
        unlocked = completedLessons >= req.value
        break
      case 'total_xp':
        unlocked = user.xp >= req.value
        break
      case 'streak_days':
        unlocked = user.streak >= req.value
        break
      case 'perfect_lessons':
        unlocked = perfectLessons >= req.value
        break
      case 'level_up':
        const levelOrder = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
        const currentLevelIndex = levelOrder.indexOf(user.level)
        unlocked = currentLevelIndex + 1 >= req.value
        break
    }

    if (unlocked) {
      await prisma.userAchievement.create({
        data: { userId, achievementId: ach.id },
      })
      await prisma.user.update({
        where: { id: userId },
        data: { xp: { increment: ach.xpReward } },
      })
    }
  }
}