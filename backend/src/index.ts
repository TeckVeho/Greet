import 'dotenv/config'
import express from 'express'
import { authRouter, userRouter } from './routes'

const app = express()
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000

app.use(express.json())

app.use('/api/auth', authRouter)
app.use('/api/users', userRouter)

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running: http://localhost:${PORT}`)
})
