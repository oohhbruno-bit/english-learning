import { Router } from 'express'
import { prisma } from '../index'
import { AuthRequest } from '../middleware/auth'
import { asyncHandler, AppError } from '../middleware/errorHandler'

export const lessonsRouter = Router()

// GET /api/lessons/:id - Get lesson details with content
lessonsRouter.get('/:id', asyncHandler(async (req: AuthRequest, res) => {
  const lesson = await prisma.lesson.findUnique({
    where: { id: req.params.id },
    include: {
      course: {
        select: { id: true, level: true, title: true },
      },
    },
  })

  if (!lesson) {
    throw new AppError(404, 'Lição não encontrada')
  }

  // Get user progress for this lesson
  const progress = await prisma.userProgress.findUnique({
    where: {
      userId_lessonId: {
        userId: req.user!.id,
        lessonId: lesson.id,
      },
    },
  })

  // Parse content JSON
  const content = lesson.content as any

  res.json({
    data: {
      id: lesson.id,
      courseId: lesson.courseId,
      course: lesson.course,
      title: lesson.title,
      description: lesson.description,
      order: lesson.order,
      xpReward: lesson.xpReward,
      content: {
        vocabulary: content?.vocabulary || [],
        grammar: content?.grammar || [],
        exercises: content?.exercises || [],
        dialogue: content?.dialogue || null,
        culturalNote: content?.culturalNote || null,
      },
      progress: progress ? {
        status: progress.status,
        score: progress.score,
        completedExercises: progress.completedExercises,
        timeSpent: progress.timeSpent,
        completedAt: progress.completedAt,
      } : null,
    },
    success: true,
  })
}))