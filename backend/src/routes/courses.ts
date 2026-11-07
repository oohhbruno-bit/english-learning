import { Router } from 'express'
import { prisma } from '../index'
import { AuthRequest } from '../middleware/auth'
import { asyncHandler, AppError } from '../middleware/errorHandler'

export const coursesRouter = Router()

// GET /api/courses - List all courses
coursesRouter.get('/', asyncHandler(async (req: AuthRequest, res) => {
  const courses = await prisma.course.findMany({
    where: { isPublished: true },
    orderBy: { order: 'asc' },
    include: {
      _count: {
        select: { lessons: true },
      },
      progress: {
        where: { userId: req.user!.id },
        select: { status: true, score: true },
      },
    },
  })

  const coursesWithProgress = courses.map(course => {
    const userProgress = course.progress[0]
    const completedLessons = course.progress.filter(p => p.status === 'COMPLETED' || p.status === 'MASTERED').length
    const progress = course._count.lessons > 0
      ? Math.round((completedLessons / course._count.lessons) * 100)
      : 0

    return {
      id: course.id,
      level: course.level,
      title: course.title,
      description: course.description,
      totalLessons: course._count.lessons,
      estimatedHours: course.estimatedHours,
      thumbnail: course.thumbnail,
      progress,
      status: userProgress?.status || 'NOT_STARTED',
      score: userProgress?.score || 0,
    }
  })

  res.json({
    data: coursesWithProgress,
    success: true,
  })
}))

// GET /api/courses/:id - Get course details
coursesRouter.get('/:id', asyncHandler(async (req: AuthRequest, res) => {
  const course = await prisma.course.findUnique({
    where: { id: req.params.id },
    include: {
      lessons: {
        where: { isPublished: true },
        orderBy: { order: 'asc' },
        select: {
          id: true,
          title: true,
          description: true,
          order: true,
          xpReward: true,
        },
      },
      progress: {
        where: { userId: req.user!.id },
        select: { status: true, score: true, completedExercises: true },
      },
    },
  })

  if (!course) {
    throw new AppError(404, 'Curso não encontrado')
  }

  const userProgress = course.progress[0]
  const lessonsWithStatus = await Promise.all(
    course.lessons.map(async (lesson) => {
      const lessonProgress = await prisma.userProgress.findUnique({
        where: {
          userId_lessonId: {
            userId: req.user!.id,
            lessonId: lesson.id,
          },
        },
      })
      return {
        ...lesson,
        status: lessonProgress?.status || 'NOT_STARTED',
        score: lessonProgress?.score || 0,
      }
    })
  )

  res.json({
    data: {
      id: course.id,
      level: course.level,
      title: course.title,
      description: course.description,
      totalLessons: course.lessons.length,
      estimatedHours: course.estimatedHours,
      lessons: lessonsWithStatus,
      userProgress: userProgress ? {
        status: userProgress.status,
        score: userProgress.score,
      } : null,
    },
    success: true,
  })
}))