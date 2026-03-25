'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/Header'
import { createBrowserClientComponent } from '@/lib/supabase-client'

export default function CreateAlbumPage() {
  const [title, setTitle] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [user, setUser] = useState<any>(null)

  const supabase = createBrowserClientComponent()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/login?redirect=/albums/new'
        return
      }
      setUser(user)
      setAuthChecked(true)
    }
    checkAuth()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    if (!title.trim()) {
      setError('Album name cannot be empty')
      setIsLoading(false)
      return
    }

    try {
      const { data: album, error: albumError } = await supabase
        .from('albums')
        .insert({ title: title.trim(), owner_id: user.id })
        .select()
        .single()

      if (albumError) {
        setError(albumError.message)
        return
      }

      const { error: memberError } = await supabase
        .from('album_members')
        .insert({ album_id: album.id, user_id: user.id, role: 'owner' })

      if (memberError) {
        setError(memberError.message)
        return
      }

      window.location.href = `/albums/${album.id}`
    } catch (err) {
      setError('Failed to create album. Please try again.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  if (!authChecked) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-600">Loading...</p>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Album</h1>
            <p className="text-gray-600 mb-8">Give your shared album a name</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Album Name
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Summer Trip 2026"
                  maxLength={100}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">{title.length}/100</p>
              </div>

              {error && (
                <div className="p-4 bg-red-50 text-red-800 rounded-lg">{error}</div>
              )}

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  {isLoading ? 'Creating...' : 'Create Album'}
                </button>
                <Link
                  href="/"
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium py-2 px-4 rounded-lg transition-colors text-center"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
