'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClientComponent } from '@/lib/supabase-client'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const supabase = createBrowserClientComponent()
        const params = new URL(window.location.href).searchParams
        const code = params.get('code')
        const token_hash = params.get('token_hash')
        const type = params.get('type')
        const next = params.get('next') ?? '/'

        let error = null

        if (code) {
          const { error: e } = await supabase.auth.exchangeCodeForSession(code)
          error = e
        } else if (token_hash && type) {
          const { error: e } = await supabase.auth.verifyOtp({
            token_hash,
            type: type as any,
          })
          error = e
        }

        if (error) {
          console.error('Auth error:', error)
          router.push('/login?error=auth_failed')
        } else {
          router.push(next)
        }
      } catch (err) {
        console.error('Callback error:', err)
        router.push('/login?error=callback_failed')
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-600">Signing in...</p>
    </div>
  )
}
