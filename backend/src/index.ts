import cors from 'cors'
import 'dotenv/config'
import express from 'express'
import path from 'path'
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

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running: http://localhost:${PORT}`)
})
