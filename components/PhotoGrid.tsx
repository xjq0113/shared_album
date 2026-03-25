'use client'

import Image from 'next/image'
import { useState } from 'react'

interface Photo {
  id: string
  album_id: string
  uploader_id: string
  file_url: string
  file_path: string
  created_at: string
}

interface PhotoGridProps {
  photos: Photo[]
  canDelete?: boolean
  onDeletePhoto?: (photoId: string, filePath: string) => Promise<void>
  onDeletePhotos?: (photos: Photo[]) => Promise<void>
}

export function PhotoGrid({ photos, canDelete, onDeletePhoto, onDeletePhotos }: PhotoGridProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isSelecting, setIsSelecting] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAll = () => setSelectedIds(new Set(photos.map(p => p.id)))
  const deselectAll = () => setSelectedIds(new Set())

  const downloadFile = async (url: string, filename: string) => {
    const response = await fetch(url)
    const blob = await response.blob()
    const objectUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = objectUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    window.URL.revokeObjectURL(objectUrl)
    document.body.removeChild(link)
  }

  const handleDownloadSingle = async (photo: Photo) => {
    setIsDownloading(true)
    try {
      await downloadFile(photo.file_url, photo.file_path.split('/').pop() || 'photo.jpg')
    } catch (err) {
      console.error('Download failed:', err)
    } finally {
      setIsDownloading(false)
    }
  }

  const handleDownloadSelected = async () => {
    setIsDownloading(true)
    try {
      const selected = photos.filter(p => selectedIds.has(p.id))
      for (const photo of selected) {
        await downloadFile(photo.file_url, photo.file_path.split('/').pop() || 'photo.jpg')
      }
    } catch (err) {
      console.error('Download failed:', err)
    } finally {
      setIsDownloading(false)
    }
  }

  const handleDeleteSingle = async (photo: Photo) => {
    if (!onDeletePhoto) return
    if (!window.confirm('Delete this photo?')) return
    setIsDeleting(true)
    try {
      await onDeletePhoto(photo.id, photo.file_path)
      setSelectedPhoto(null)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteSelected = async () => {
    if (!onDeletePhotos) return
    if (!window.confirm(`Delete ${selectedIds.size} photo(s)?`)) return
    setIsDeleting(true)
    try {
      const selected = photos.filter(p => selectedIds.has(p.id))
      await onDeletePhotos(selected)
      setSelectedIds(new Set())
      setIsSelecting(false)
    } finally {
      setIsDeleting(false)
    }
  }

  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-gray-500 text-lg">No photos yet. Upload some!</p>
      </div>
    )
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          {canDelete && (
            <button
              onClick={() => {
                setIsSelecting(!isSelecting)
                if (isSelecting) deselectAll()
              }}
              className="text-sm px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isSelecting ? 'Cancel' : 'Select'}
            </button>
          )}
          {isSelecting && (
            <>
              <button onClick={selectAll} className="text-sm text-indigo-600 hover:underline">All</button>
              <button onClick={deselectAll} className="text-sm text-gray-500 hover:underline">None</button>
              <span className="text-sm text-gray-600">{selectedIds.size} selected</span>
            </>
          )}
        </div>

        {isSelecting && selectedIds.size > 0 && (
          <div className="flex gap-2">
            <button
              onClick={handleDownloadSelected}
              disabled={isDownloading}
              className="text-sm px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
            >
              {isDownloading ? 'Downloading...' : `Download (${selectedIds.size})`}
            </button>
            {canDelete && onDeletePhotos && (
              <button
                onClick={handleDeleteSelected}
                disabled={isDeleting}
                className="text-sm px-3 py-1.5 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                {isDeleting ? 'Deleting...' : `Delete (${selectedIds.size})`}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className={`aspect-square relative rounded-lg overflow-hidden cursor-pointer bg-gray-100 transition-all ${
              selectedIds.has(photo.id)
                ? 'ring-2 ring-indigo-500 ring-offset-2'
                : 'hover:shadow-lg'
            }`}
            onClick={() => {
              if (isSelecting) toggleSelect(photo.id)
              else setSelectedPhoto(photo)
            }}
          >
            <Image
              src={photo.file_url}
              alt="photo"
              fill
              className="object-cover hover:scale-105 transition-transform"
            />
            {isSelecting && (
              <div className={`absolute top-2 left-2 w-5 h-5 rounded-full border-2 flex items-center justify-center shadow ${
                selectedIds.has(photo.id)
                  ? 'bg-indigo-500 border-indigo-500'
                  : 'bg-white border-gray-400'
              }`}>
                {selectedIds.has(photo.id) && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Photo Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center p-4 z-50"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-h-[85vh] max-w-[90vw] flex flex-col bg-black rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedPhoto.file_url}
              alt="preview"
              className="max-h-[calc(85vh-60px)] max-w-full object-contain"
            />
            <div className="flex items-center justify-between px-4 py-3 bg-gray-900 text-white">
              <span className="text-sm text-gray-400">
                {new Date(selectedPhoto.created_at).toLocaleDateString('en-US')}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDownloadSingle(selectedPhoto)}
                  disabled={isDownloading}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 px-4 py-2 rounded text-sm transition-colors"
                >
                  {isDownloading ? 'Downloading...' : 'Download'}
                </button>
                {canDelete && onDeletePhoto && (
                  <button
                    onClick={() => handleDeleteSingle(selectedPhoto)}
                    disabled={isDeleting}
                    className="bg-red-500 hover:bg-red-600 disabled:bg-gray-600 px-4 py-2 rounded text-sm transition-colors"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </button>
                )}
                <button
                  className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm transition-colors"
                  onClick={() => setSelectedPhoto(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
