import { type Session } from 'next-auth'
import { auth } from '@/src/lib/auth'
import { prisma } from '@/src/lib/prisma'

export async function createContext() {
  const session = await auth()

  return {
    session,
    prisma,
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>
