'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'An error occurred during registration')
        setIsLoading(false)
        return
      }

      // Auto-login after successful registration
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Registration successful but login failed. Please try logging in.')
      } else {
        router.push('/')
        router.refresh()
      }
    } catch {
      setError('An error occurred during registration')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    setIsLoading(true)
    await signIn(provider, { callbackUrl: '/' })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-0 dark:bg-neutral-0 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-h1 text-neutral-800 dark:text-neutral-800">
            Create your account
          </h2>
          <p className="mt-2 text-center text-body-sm text-neutral-600 dark:text-neutral-600">
            Or{' '}
            <Link href="/auth/login" className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-500 transition-colors duration-[150ms]">
              sign in to your existing account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded bg-error-500/10 dark:bg-error-500/20 p-4 border border-error-500/20 dark:border-error-500/30">
              <div className="text-body-sm text-error-600 dark:text-error-500">{error}</div>
            </div>
          )}
          <div className="rounded-md shadow-sm space-y-px">
            <div>
              <label htmlFor="name" className="sr-only">
                Full name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className="relative block w-full h-11 px-4 py-3 bg-neutral-0 dark:bg-neutral-50 text-neutral-900 dark:text-neutral-900 border-[1.5px] border-neutral-300 dark:border-neutral-200 placeholder-neutral-400 dark:placeholder-neutral-400 rounded-t focus:outline-none focus:ring-[3px] focus:ring-primary-100 dark:focus:ring-primary-900/20 focus:border-primary-500 dark:focus:border-primary-400 text-body transition-all duration-[150ms]"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
              />
            </div>
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
                className="relative block w-full h-11 px-4 py-3 bg-neutral-0 dark:bg-neutral-50 text-neutral-900 dark:text-neutral-900 border-[1.5px] border-neutral-300 dark:border-neutral-200 border-t-0 placeholder-neutral-400 dark:placeholder-neutral-400 focus:outline-none focus:ring-[3px] focus:ring-primary-100 dark:focus:ring-primary-900/20 focus:border-primary-500 dark:focus:border-primary-400 text-body transition-all duration-[150ms]"
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
                autoComplete="new-password"
                required
                minLength={8}
                className="relative block w-full h-11 px-4 py-3 bg-neutral-0 dark:bg-neutral-50 text-neutral-900 dark:text-neutral-900 border-[1.5px] border-neutral-300 dark:border-neutral-200 border-t-0 placeholder-neutral-400 dark:placeholder-neutral-400 rounded-b focus:outline-none focus:ring-[3px] focus:ring-primary-100 dark:focus:ring-primary-900/20 focus:border-primary-500 dark:focus:border-primary-400 text-body transition-all duration-[150ms]"
                placeholder="Password (min. 8 characters)"
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
              className="w-full flex justify-center h-10 px-6 rounded bg-primary-500 dark:bg-primary-500 text-body-sm font-semibold text-white shadow-sm hover:bg-primary-600 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-[150ms]"
            >
              {isLoading ? 'Creating account...' : 'Sign up'}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200 dark:border-neutral-200" />
            </div>
            <div className="relative flex justify-center text-body-sm">
              <span className="px-2 bg-neutral-0 dark:bg-neutral-0 text-neutral-500 dark:text-neutral-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            {process.env.NEXT_PUBLIC_GOOGLE_ENABLED && (
              <button
                onClick={() => handleOAuthSignIn('google')}
                disabled={isLoading}
                className="w-full inline-flex justify-center h-10 px-4 border-[1.5px] border-neutral-300 dark:border-neutral-200 rounded bg-neutral-0 dark:bg-neutral-50 text-body-sm font-medium text-neutral-900 dark:text-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-100 disabled:opacity-50 transition-all duration-[150ms]"
              >
                Google
              </button>
            )}
            {process.env.NEXT_PUBLIC_GITHUB_ENABLED && (
              <button
                onClick={() => handleOAuthSignIn('github')}
                disabled={isLoading}
                className="w-full inline-flex justify-center h-10 px-4 border-[1.5px] border-neutral-300 dark:border-neutral-200 rounded bg-neutral-0 dark:bg-neutral-50 text-body-sm font-medium text-neutral-900 dark:text-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-100 disabled:opacity-50 transition-all duration-[150ms]"
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
