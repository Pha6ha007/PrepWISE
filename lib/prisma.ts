import { PrismaClient } from '@prisma/client'

/**
 * Prisma Client Singleton для Next.js
 *
 * В dev режиме Next.js делает hot-reload, что создавало бы множество
 * PrismaClient instances и исчерпывало бы connection pool.
 *
 * Этот паттерн предотвращает эту проблему используя глобальный singleton.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
