import 'dotenv/config'
import express from 'express'
import { authRouter } from './routes/auth'
import { companyRouter } from './routes/companies'
import { userRouter } from './routes/user'
import { favoriteRouter } from './routes/favorites'

const app = express()
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000

app.use(express.json())

app.use('/api/auth', authRouter)
app.use('/api/users', userRouter)
app.use('/api/companies', companyRouter)
app.use('/api/favorites', favoriteRouter)

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running: http://localhost:${PORT}`)
})
