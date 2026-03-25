'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/Header'
import { AlbumCard } from '@/components/AlbumCard'
import { createBrowserClientComponent } from '@/lib/supabase-client'

interface Album {
  id: string
  title: string
  owner_id: string
  created_at: string
  member_count: number
  photo_count: number
}

export default function Home() {
  const [albums, setAlbums] = useState<Album[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  const supabase = createBrowserClientComponent()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/login'
        return
      }
      setUser(user)
      await fetchAlbums(user.id)
    }
    init()
  }, [])

  const fetchAlbums = async (userId: string) => {
    try {
      setIsLoading(true)

      const { data: memberEntries, error } = await supabase
        .from('album_members')
        .select('album_id, albums:album_id(id, title, owner_id, created_at)')
        .eq('user_id', userId)

      if (error) {
        console.error('Failed to fetch albums:', error)
        return
      }

      const albumsWithStats = await Promise.all(
        (memberEntries || []).map(async (entry: any) => {
          const album = entry.albums
          const [{ count: memberCount }, { count: photoCount }] = await Promise.all([
            supabase.from('album_members').select('*', { count: 'exact', head: true }).eq('album_id', album.id),
            supabase.from('photos').select('*', { count: 'exact', head: true }).eq('album_id', album.id),
          ])
          return {
            id: album.id,
            title: album.title,
            owner_id: album.owner_id,
            created_at: album.created_at,
            member_count: memberCount || 0,
            photo_count: photoCount || 0,
          }
        })
      )

      setAlbums(albumsWithStats)
    } catch (error) {
      console.error('Failed to fetch albums:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  if (!user) return null

  return (
    <>
      <Header onLogout={handleLogout} userEmail={user.email} />
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Albums</h1>
            <Link
              href="/albums/new"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              + New Album
            </Link>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-gray-600">Loading...</p>
            </div>
          ) : albums.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-gray-600 text-lg mb-4">No albums yet. Create your first one!</p>
              <Link
                href="/albums/new"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                Create Album
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {albums.map((album) => (
                <AlbumCard
                  key={album.id}
                  id={album.id}
                  title={album.title}
                  memberCount={album.member_count}
                  photoCount={album.photo_count}
                  createdAt={album.created_at}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
