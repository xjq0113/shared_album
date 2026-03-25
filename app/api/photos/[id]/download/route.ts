export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase'
import { NextResponse, NextRequest } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const photoId = params.id

    const { data: photo, error: photoError } = await supabase
      .from('photos')
      .select('*')
      .eq('id', photoId)
      .single()

    if (photoError || !photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 })
    }

    const { data: membership } = await supabase
      .from('album_members')
      .select('*')
      .eq('album_id', photo.album_id)
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { data: fileData, error: downloadError } = await supabase.storage
      .from('photos')
      .download(photo.file_path)

    if (downloadError) {
      return NextResponse.json({ error: 'Download failed' }, { status: 500 })
    }

    return new NextResponse(fileData, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename="${photo.file_path.split('/').pop()}"`,
      },
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
