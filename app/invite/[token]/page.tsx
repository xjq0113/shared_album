'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Header } from '@/components/Header'
import { createBrowserClientComponent } from '@/lib/supabase-client'

export default function InvitePage() {
  const params = useParams()
  const token = params.token as string

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [albumId, setAlbumId] = useState<string | null>(null)

  const supabase = createBrowserClientComponent()

  useEffect(() => {
    const handleInvite = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          window.location.href = `/login?redirect=/invite/${token}`
          return
        }

        const { data: invite, error: inviteError } = await supabase
          .from('invites')
          .select('*')
          .eq('token', token)
          .single()

        if (inviteError || !invite) {
          setError('Invalid or expired invite link')
          return
        }

        if (new Date(invite.expired_at) < new Date()) {
          setError('This invite link has expired')
          return
        }

        const { data: existingMember } = await supabase
          .from('album_members')
          .select('id')
          .eq('album_id', invite.album_id)
          .eq('user_id', user.id)
          .single()

        if (existingMember) {
          setAlbumId(invite.album_id)
          setTimeout(() => {
            window.location.href = `/albums/${invite.album_id}`
          }, 1500)
          return
        }

        const { error: joinError } = await supabase
          .from('album_members')
          .insert({ album_id: invite.album_id, user_id: user.id, role: 'member' })

        if (joinError) {
          setError(joinError.message)
          return
        }

        setAlbumId(invite.album_id)
        setTimeout(() => {
          window.location.href = `/albums/${invite.album_id}`
        }, 2000)
      } catch (err) {
        setError('Failed to process invite. Please try again.')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    handleInvite()
  }, [token])

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md text-center">
            {isLoading ? (
              <>
                <p className="text-gray-600 mb-4">Processing invite...</p>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              </>
            ) : error ? (
              <>
                <p className="text-red-600 mb-4">{error}</p>
                <a href="/" className="text-indigo-600 hover:text-indigo-700">
                  Back to Home
                </a>
              </>
            ) : albumId ? (
              <>
                <p className="text-green-600 mb-4">You have joined the album!</p>
                <p className="text-gray-600">Redirecting...</p>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </>
  )
}
