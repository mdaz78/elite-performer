import { auth } from './auth'
import { redirect } from 'next/navigation'

export async function getServerSession() {
  return await auth()
}

export async function requireAuth() {
  const session = await getServerSession()

  if (!session?.user) {
    redirect('/auth/login')
  }

  return session
}

export async function getCurrentUserId(): Promise<string> {
  const session = await requireAuth()
  return session.user.id
}
