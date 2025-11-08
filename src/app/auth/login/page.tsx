'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password')
      } else {
        router.push('/')
        router.refresh()
      }
    } catch {
      setError('An error occurred during login')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    setIsLoading(true)
    await signIn(provider, { callbackUrl: '/' })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background dark:bg-background-dark py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-text-primary dark:text-text-primary-dark">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-text-secondary dark:text-text-secondary-dark">
            Or{' '}
            <Link href="/auth/signup" className="font-medium text-accent-blue dark:text-accent-blue-dark hover:text-accent-blue/90 dark:hover:text-accent-blue-dark/90 transition-colors duration-200">
              create a new account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800 transition-colors duration-200">
              <div className="text-sm text-red-800 dark:text-red-300">{error}</div>
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 bg-surface dark:bg-surface-dark text-text-primary dark:text-text-primary-dark border border-border dark:border-border-dark placeholder-text-tertiary dark:placeholder-text-tertiary-dark rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-colors duration-200"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 bg-surface dark:bg-surface-dark text-text-primary dark:text-text-primary-dark border border-border dark:border-border-dark placeholder-text-tertiary dark:placeholder-text-tertiary-dark rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-colors duration-200"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-accent-blue dark:bg-accent-blue-dark hover:bg-accent-blue/90 dark:hover:bg-accent-blue-dark/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border dark:border-border-dark" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background dark:bg-background-dark text-text-tertiary dark:text-text-tertiary-dark">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            {process.env.NEXT_PUBLIC_GOOGLE_ENABLED && (
              <button
                onClick={() => handleOAuthSignIn('google')}
                disabled={isLoading}
                className="w-full inline-flex justify-center py-2 px-4 border border-border dark:border-border-dark rounded-md shadow-sm bg-surface dark:bg-surface-dark text-sm font-medium text-text-secondary dark:text-text-secondary-dark hover:bg-background dark:hover:bg-background-dark disabled:opacity-50 transition-colors duration-200"
              >
                Google
              </button>
            )}
            {process.env.NEXT_PUBLIC_GITHUB_ENABLED && (
              <button
                onClick={() => handleOAuthSignIn('github')}
                disabled={isLoading}
                className="w-full inline-flex justify-center py-2 px-4 border border-border dark:border-border-dark rounded-md shadow-sm bg-surface dark:bg-surface-dark text-sm font-medium text-text-secondary dark:text-text-secondary-dark hover:bg-background dark:hover:bg-background-dark disabled:opacity-50 transition-colors duration-200"
              >
                GitHub
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
