import { createClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const albumId = params.id

    const { data: membership } = await supabase
      .from('album_members')
      .select('*')
      .eq('album_id', albumId)
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { data: album, error: albumError } = await supabase
      .from('albums')
      .select('*')
      .eq('id', albumId)
      .single()

    if (albumError || !album) {
      return NextResponse.json({ error: 'Album not found' }, { status: 404 })
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

    return NextResponse.json({
      album,
      members: members || [],
      photos: photos || [],
      isOwner: album.owner_id === user.id,
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
