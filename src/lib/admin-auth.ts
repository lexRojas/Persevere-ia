import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function isAdminSession() {
  return Boolean(await getAdminSession())
}

export async function getAdminSession() {
  const session = await getServerSession(authOptions)
  return session?.user?.role === 'ADMIN' ? session : null
}
