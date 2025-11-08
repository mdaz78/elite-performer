'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { seedDatabase } from '@/src/db/seed'

export default function ReviewPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to tasks page which has the review section
    router.push('/tasks')
  }, [router])

  return null
}
