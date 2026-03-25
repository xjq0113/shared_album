'use client'

import Link from 'next/link'

interface AlbumCardProps {
  id: string
  title: string
  memberCount: number
  photoCount: number
  createdAt: string
}

export function AlbumCard({
  id,
  title,
  memberCount,
  photoCount,
  createdAt,
}: AlbumCardProps) {
  const date = new Date(createdAt)

  return (
    <Link href={`/albums/${id}`}>
      <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex-1 break-words">
            {title}
          </h3>
          <span className="text-2xl ml-2">📂</span>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>👥 {memberCount} members</span>
          <span>🖼️ {photoCount} photos</span>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Created on {date.toLocaleDateString('en-US')}
          </p>
        </div>
      </div>
    </Link>
  )
}
