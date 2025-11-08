'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { pageTransitionVariants } from '@/src/lib/animations'
import { usePathname } from 'next/navigation'
import { useRef, useEffect } from 'react'

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isFirstMount = useRef(true)
  const prevPathname = useRef<string | null>(null)

  useEffect(() => {
    // Mark as mounted after first render
    if (isFirstMount.current) {
      isFirstMount.current = false
    }
    prevPathname.current = pathname
  }, [pathname])

  // On first mount, don't animate - just show the content immediately
  // Only animate when pathname actually changes (not on initial load)
  const isPathnameChange = prevPathname.current !== null && prevPathname.current !== pathname
  const shouldAnimate = !isFirstMount.current && isPathnameChange

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.main
        key={pathname}
        variants={pageTransitionVariants}
        initial={shouldAnimate ? "initial" : false}
        animate="animate"
        exit="exit"
      >
        {children}
      </motion.main>
    </AnimatePresence>
  )
}
