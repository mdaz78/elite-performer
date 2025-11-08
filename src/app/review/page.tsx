'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ReviewPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to tasks page which has the review section
    router.push('/tasks')
  }, [router])

  return null
}
