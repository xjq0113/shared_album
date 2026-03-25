'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/Header'
import { PhotoGrid } from '@/components/PhotoGrid'
import { createBrowserClientComponent } from '@/lib/supabase-client'

interface Photo {
  id: string
  album_id: string
  uploader_id: string
  file_path: string
  file_url: string
  created_at: string
}

interface AlbumData {
  album: { id: string; title: string; owner_id: string; created_at: string }
  members: Array<{ id: string; user_id: string; role: string; joined_at: string }>
  photos: Photo[]
  isOwner: boolean
}

export default function AlbumDetailPage() {
  const params = useParams()
  const albumId = params.id as string

  const [albumData, setAlbumData] = useState<AlbumData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [showInviteLink, setShowInviteLink] = useState(false)
  const [inviteLink, setInviteLink] = useState<string | null>(null)
  const [inviteLoading, setInviteLoading] = useState(false)
  const [isDeletingAlbum, setIsDeletingAlbum] = useState(false)
  const [user, setUser] = useState<any>(null)

  const supabase = createBrowserClientComponent()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = `/login?redirect=/albums/${albumId}`
        return
      }
      setUser(user)
      await fetchAlbumData(user.id)
    }
    init()
  }, [albumId])

  const fetchAlbumData = async (userId: string) => {
    try {
      setIsLoading(true)

      const { data: album, error: albumError } = await supabase
        .from('albums')
        .select('*')
        .eq('id', albumId)
        .single()

      if (albumError) {
        if (albumError.code === 'PGRST116') setError('Album not found')
        else setError('Failed to load album')
        return
      }

      const { data: members } = await supabase
        .from('album_members')
        .select('*')
        .eq('album_id', albumId)

      const { data: photos } = await supabase
        .from('photos')
        .select('*')
        .eq('album_id', albumId)
        .order('created_at', { ascending: false })

      setAlbumData({
        album,
        members: members || [],
        photos: photos || [],
        isOwner: album.owner_id === userId,
      })
    } catch (err) {
      setError('Failed to load album. Please try again.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user) return
    setIsUploading(true)

    try {
      for (const file of Array.from(e.target.files)) {
        const fileExt = file.name.split('.').pop()
        const filePath = `${albumId}/${crypto.randomUUID()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('photos')
          .upload(filePath, file)

        if (uploadError) {
          setError(uploadError.message)
          return
        }

        const { data: { publicUrl } } = supabase.storage
          .from('photos')
          .getPublicUrl(filePath)

        const { error: dbError } = await supabase
          .from('photos')
          .insert({
            album_id: albumId,
            uploader_id: user.id,
            file_path: filePath,
            file_url: publicUrl,
          })

        if (dbError) {
          setError(dbError.message)
          return
        }
      }
      await fetchAlbumData(user.id)
    } catch (err) {
      setError('Upload failed. Please try again.')
      console.error(err)
    } finally {
      setIsUploading(false)
      e.target.value = ''
    }
  }

  const handleDeletePhoto = async (photoId: string, filePath: string) => {
    await supabase.storage.from('photos').remove([filePath])
    await supabase.from('photos').delete().eq('id', photoId)
    setAlbumData(prev => prev ? {
      ...prev,
      photos: prev.photos.filter(p => p.id !== photoId),
    } : prev)
  }

  const handleDeletePhotos = async (photosToDelete: Photo[]) => {
    const filePaths = photosToDelete.map(p => p.file_path)
    const ids = new Set(photosToDelete.map(p => p.id))
    await supabase.storage.from('photos').remove(filePaths)
    await supabase.from('photos').delete().in('id', Array.from(ids))
    setAlbumData(prev => prev ? {
      ...prev,
      photos: prev.photos.filter(p => !ids.has(p.id)),
    } : prev)
  }

  const handleDeleteAlbum = async () => {
    if (!window.confirm('Delete this album? All photos and members will be removed. This cannot be undone.')) return
    setIsDeletingAlbum(true)
    try {
      const { data: photos } = await supabase
        .from('photos')
        .select('file_path')
        .eq('album_id', albumId)

      if (photos && photos.length > 0) {
        const filePaths = photos.map((p: any) => p.file_path)
        await supabase.storage.from('photos').remove(filePaths)
      }

      await supabase.from('albums').delete().eq('id', albumId)
      window.location.href = '/'
    } catch (err) {
      setError('Failed to delete album.')
      console.error(err)
      setIsDeletingAlbum(false)
    }
  }

  const handleGenerateInvite = async () => {
    if (!user) return
    setInviteLoading(true)
    try {
      const token = crypto.randomUUID()
      const expiredAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

      const { error } = await supabase
        .from('invites')
        .insert({
          album_id: albumId,
          token,
          created_by: user.id,
          expired_at: expiredAt,
        })

      if (error) {
        setError(error.message)
        return
      }

      setInviteLink(`${window.location.origin}/invite/${token}`)
    } catch (err) {
      setError('Failed to generate invite link')
      console.error(err)
    } finally {
      setInviteLoading(false)
    }
  }

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-600">Loading...</p>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Link href="/" className="text-indigo-600 hover:text-indigo-700">Back to Albums</Link>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (!albumData) return null

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

          {/* Album Header */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{albumData.album.title}</h1>
                <p className="text-gray-600">
                  {albumData.members.length} members &bull; {albumData.photos.length} photos
                </p>
              </div>
              <div className="flex gap-3 items-center">
                {albumData.isOwner && (
                  <>
                    {/* Invite button */}
                    <div className="relative">
                      <button
                        onClick={() => setShowInviteLink(!showInviteLink)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-5 rounded-lg transition-colors"
                      >
                        Invite Members
                      </button>
                      {showInviteLink && (
                        <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg p-4 w-80 z-10">
                          {inviteLink ? (
                            <div className="space-y-3">
                              <p className="text-sm text-gray-600">Invite link (expires in 7 days):</p>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={inviteLink}
                                  readOnly
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                />
                                <button
                                  onClick={() => { navigator.clipboard.writeText(inviteLink); alert('Copied!') }}
                                  className="bg-gray-200 hover:bg-gray-300 text-gray-900 px-3 py-2 rounded-lg text-sm"
                                >
                                  Copy
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={handleGenerateInvite}
                              disabled={inviteLoading}
                              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg text-sm"
                            >
                              {inviteLoading ? 'Generating...' : 'Generate Invite Link'}
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Delete album button */}
                    <button
                      onClick={handleDeleteAlbum}
                      disabled={isDeletingAlbum}
                      className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-medium py-2 px-5 rounded-lg transition-colors"
                    >
                      {isDeletingAlbum ? 'Deleting...' : 'Delete Album'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Upload */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Upload Photos</h2>
            <label className="border-2 border-dashed border-gray-300 rounded-lg p-8 w-full text-center hover:border-indigo-500 transition-colors cursor-pointer block">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                disabled={isUploading}
                className="hidden"
              />
              <p className="text-gray-600">{isUploading ? 'Uploading...' : 'Select photos to upload'}</p>
              <p className="text-sm text-gray-500 mt-1">Drag and drop or click to select</p>
            </label>
          </div>

          {/* Members */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Members</h2>
            <div className="flex flex-wrap gap-4">
              {albumData.members.map((member) => (
                <div key={member.id} className="flex items-center gap-2 bg-gray-50 rounded-full px-4 py-2">
                  <div className="bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full w-8 h-8 flex items-center justify-center text-white font-bold text-sm">
                    U
                  </div>
                  <span className="text-sm text-gray-700 capitalize">{member.role}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Photos */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Photos</h2>
            <PhotoGrid
              photos={albumData.photos}
              canDelete={true}
              onDeletePhoto={handleDeletePhoto}
              onDeletePhotos={handleDeletePhotos}
            />
          </div>

        </div>
      </main>
    </>
  )
}
