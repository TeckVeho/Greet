import cors from 'cors'
import 'dotenv/config'
import express from 'express'
import { authRouter, companyRouter, favoriteRouter, reviewRouter, userRouter } from './routes'
var corsOptions = {
  origin: process.env.CORS_ORIGIN ?? '*',
  optionsSuccessStatus: 200,
}
const app = express()
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000

app.use(express.json())
app.use(cors(corsOptions))

app.use('/api/auth', authRouter)
app.use('/api/users', userRouter)
app.use('/api/companies', companyRouter)
app.use('/api/favorites', favoriteRouter)
app.use('/api/reviews', reviewRouter)

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running: http://localhost:${PORT}`)
})
