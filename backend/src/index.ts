import cors from 'cors'
import 'dotenv/config'
import express from 'express'
import path from 'path'
import { prisma } from './prisma'
import {
  authRouter,
  companyRouter,
  favoriteRouter,
  restaurantRouter,
  reviewRouter,
  userRouter,
} from './routes'

const corsOptions = {
  origin: process.env.CORS_ORIGIN ?? '*',
  optionsSuccessStatus: 200,
}

const app = express()
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000

app.use(express.json())
app.use(cors(corsOptions))

// Serve uploaded images in development
if (process.env.NODE_ENV !== 'production') {
  app.use('/media', express.static(path.resolve(process.cwd(), 'media')))
}

app.use('/api/auth', authRouter)
app.use('/api/users', userRouter)
app.use('/api/companies', companyRouter)
app.use('/api/favorites', favoriteRouter)
app.use('/api/restaurants', restaurantRouter)
app.use('/api/reviews', reviewRouter)

const server = app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running: http://localhost:${PORT}`)
})

async function gracefulShutdown(signal: string) {
  // eslint-disable-next-line no-console
  console.log(`\n${signal} received — closing DB pool and HTTP server…`)
  server.close()
  await prisma.$disconnect()
  process.exit(0)
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'))
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
