'use client'

import { useEffect } from 'react'
import { seedDatabase } from '@/src/db/seed'

export function DatabaseSeeder() {
  useEffect(() => {
    // Seed database on first load (force reseed to add all courses)
    seedDatabase(true).catch(console.error)
  }, [])

  return null
}
