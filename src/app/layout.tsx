import type { Metadata } from 'next'
import { Header } from '@/src/components'
import { DatabaseSeeder } from './DatabaseSeeder'
import '@/src/index.css'

export const metadata: Metadata = {
  title: 'Elite Performer',
  description: '180-Day Transformation Tracker',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <DatabaseSeeder />
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main>{children}</main>
        </div>
      </body>
    </html>
  )
}
