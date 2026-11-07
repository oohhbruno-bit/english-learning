import { Router } from 'express'
import { prisma } from '../index'
import { AuthRequest } from '../middleware/auth'
import { asyncHandler } from '../middleware/errorHandler'

export const achievementsRouter = Router()

// GET /api/achievements - Get all achievements
achievementsRouter.get('/', asyncHandler(async (req: AuthRequest, res) => {
  const achievements = await prisma.achievement.findMany({
    orderBy: [
      { rarity: 'desc' },
      { category: 'asc' },
      { name: 'asc' },
    ],
  })

  // Get user's unlocked achievements
  const userAchievements = await prisma.userAchievement.findMany({
    where: { userId: req.user!.id },
    select: { achievementId: true, unlockedAt: true },
  })

  const unlockedMap = new Map(userAchievements.map(ua => [ua.achievementId, ua.unlockedAt]))

  const achievementsWithStatus = achievements.map(ach => ({
    ...ach,
    unlocked: unlockedMap.has(ach.id),
    unlockedAt: unlockedMap.get(ach.id) || null,
  }))

  res.json({
    data: achievementsWithStatus,
    success: true,
  })
}))

// GET /api/achievements/user - Get user's unlocked achievements
achievementsRouter.get('/user', asyncHandler(async (req: AuthRequest, res) => {
  const userAchievements = await prisma.userAchievement.findMany({
    where: { userId: req.user!.id },
    include: { achievement: true },
    orderBy: { unlockedAt: 'desc' },
  })

  res.json({
    data: userAchievements.map(ua => ({
      ...ua.achievement,
      unlockedAt: ua.unlockedAt,
    })),
    success: true,
  })
}))