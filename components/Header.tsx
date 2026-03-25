'use client'

import Link from 'next/link'

interface HeaderProps {
  onLogout?: () => void
  userEmail?: string
}

export function Header({ onLogout, userEmail }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-indigo-600">📷</span>
          <span className="text-xl font-bold text-gray-900">Shared Album</span>
        </Link>

        {onLogout && (
          <div className="flex items-center gap-4">
            {userEmail && (
              <span className="text-sm text-gray-500">{userEmail}</span>
            )}
            <button
              onClick={onLogout}
              className="text-gray-600 hover:text-gray-900 font-medium text-sm"
            >
              Sign Out
            </button>
          </div>
        )}
      </nav>
    </header>
  )
}
