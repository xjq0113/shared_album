'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createBrowserClientComponent } from '@/lib/supabase-client'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createBrowserClientComponent()
      const { error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        setError('Invalid email or password.')
      } else {
        const redirect = searchParams.get('redirect') ?? '/'
        window.location.href = redirect
      }
    } catch {
      setError('Sign in failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xl font-bold text-indigo-600">📷</span>
        <span className="text-xl font-bold text-gray-900">Shared Album</span>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign In</h1>
      <p className="text-gray-500 text-sm mb-8">
        Enter your email and password to access your albums.
      </p>

      <form onSubmit={handleSignIn} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {error && (
          <div className="p-4 rounded-lg text-sm bg-red-50 text-red-800">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <Suspense fallback={<div className="text-gray-600">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
