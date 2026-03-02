import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required')
}

const adapter = new PrismaMariaDb(process.env.DATABASE_URL)

export const prisma = new PrismaClient({ adapter })

