export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { data: albums, error } = await supabase
      .from('album_members')
      .select(`album_id, albums:album_id(id, title, owner_id, created_at)`)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const albumsWithStats = await Promise.all(
      albums.map(async (item: any) => {
        const album = item.albums
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

    return NextResponse.json(albumsWithStats)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
