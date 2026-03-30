import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required')
}

const dbUrl = new URL(process.env.DATABASE_URL)

const poolMax = parseInt(process.env.DB_POOL_MAX || '10', 10)
const poolMin = parseInt(process.env.DB_POOL_MIN || '2', 10)

const adapter = new PrismaMariaDb({
  host: dbUrl.hostname,
  port: parseInt(dbUrl.port, 10) || 3306,
  user: decodeURIComponent(dbUrl.username),
  password: decodeURIComponent(dbUrl.password),
  database: dbUrl.pathname.slice(1),

  connectionLimit: poolMax,
  minimumIdle: poolMin,
  idleTimeout: 300,
  acquireTimeout: 10_000,
  connectTimeout: 10_000,
  leakDetectionTimeout: 30_000,
})

export const prisma = new PrismaClient({ adapter })

