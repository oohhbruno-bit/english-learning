import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import { PrismaClient } from '@prisma/client'
import { authRouter } from './routes/auth'
import { coursesRouter } from './routes/courses'
import { lessonsRouter } from './routes/lessons'
import { progressRouter } from './routes/progress'
import { achievementsRouter } from './routes/achievements'
import { leaderboardRouter } from './routes/leaderboard'
import { usersRouter } from './routes/users'
import { errorHandler } from './middleware/errorHandler'
import { authMiddleware } from './middleware/auth'

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

const app = express()
const PORT = process.env.PORT || 4000

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}))

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Muitas requisições, tente novamente mais tarde' },
})
app.use('/api/', limiter)

// Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Logging
app.use(morgan('dev'))

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Public routes
app.use('/api/auth', authRouter)

// Protected routes
app.use('/api/courses', authMiddleware, coursesRouter)
app.use('/api/lessons', authMiddleware, lessonsRouter)
app.use('/api/progress', authMiddleware, progressRouter)
app.use('/api/achievements', authMiddleware, achievementsRouter)
app.use('/api/leaderboard', authMiddleware, leaderboardRouter)
app.use('/api/users', authMiddleware, usersRouter)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' })
})

// Error handler
app.use(errorHandler)

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Encerrando servidor...')
  await prisma.$disconnect()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('Encerrando servidor...')
  await prisma.$disconnect()
  process.exit(0)
})

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`)
  console.log(`📚 API: http://localhost:${PORT}/api`)
  console.log(`🏥 Health: http://localhost:${PORT}/api/health`)
})

export default app