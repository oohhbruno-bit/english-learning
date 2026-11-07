import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../index'
import { AuthRequest } from '../middleware/auth'
import { asyncHandler } from '../middleware/errorHandler'

export const leaderboardRouter = Router()

// GET /api/leaderboard - Get leaderboard
leaderboardRouter.get('/', asyncHandler(async (req: AuthRequest, res) => {
  const { period = 'weekly', limit = '10' } = req.query
  const periodValid = ['daily', 'weekly', 'monthly', 'all'].includes(period as string)
    ? period as string
    : 'weekly'
  const limitNum = Math.min(parseInt(limit as string) || 10, 100)

  // For now, compute from user data directly (in production, use LeaderboardSnapshot)
  const users = await prisma.user.findMany({
    orderBy: { xp: 'desc' },
    take: limitNum,
    select: {
      id: true,
      name: true,
      avatar: true,
      level: true,
      xp: true,
      streak: true,
    },
  })

  const leaderboard = users.map((user, index) => ({
    ...user,
    rank: index + 1,
    isCurrentUser: user.id === req.user!.id,
  }))

  // Get current user's rank if not in top
  let currentUserRank = leaderboard.find(u => u.isCurrentUser)?.rank
  if (!currentUserRank) {
    const higherCount = await prisma.user.count({
      where: { xp: { gt: req.user!.xp } },
    })
    currentUserRank = higherCount + 1
  }

  res.json({
    data: {
      entries: leaderboard,
      currentUserRank,
      period: periodValid,
      totalParticipants: await prisma.user.count(),
    },
    success: true,
  })
}))