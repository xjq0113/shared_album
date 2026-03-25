export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase'
import { NextResponse, NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const albumId = formData.get('albumId') as string

    if (!file || !albumId) {
      return NextResponse.json({ error: 'File and album ID are required' }, { status: 400 })
    }

    const { data: membership } = await supabase
      .from('album_members')
      .select('*')
      .eq('album_id', albumId)
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const timestamp = Date.now()
    const fileName = `${timestamp}-${file.name}`
    const filePath = `albums/${albumId}/${fileName}`

    const arrayBuffer = await file.arrayBuffer()
    const { error: uploadError } = await supabase.storage
      .from('photos')
      .upload(filePath, arrayBuffer, { contentType: file.type, upsert: false })

    if (uploadError) {
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }

    const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(filePath)

    const { data: photo, error: photoError } = await supabase
      .from('photos')
      .insert({ album_id: albumId, uploader_id: user.id, file_path: filePath, file_url: publicUrl })
      .select()
      .single()

    if (photoError) {
      await supabase.storage.from('photos').remove([filePath])
      return NextResponse.json({ error: photoError.message }, { status: 500 })
    }

    return NextResponse.json(photo, { status: 201 })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
