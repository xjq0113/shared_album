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

    const { title } = await request.json()

    if (!title || title.trim().length === 0) {
      return NextResponse.json({ error: 'Album title cannot be empty' }, { status: 400 })
    }

    const { data: album, error: albumError } = await supabase
      .from('albums')
      .insert({ title: title.trim(), owner_id: user.id })
      .select()
      .single()

    if (albumError) {
      return NextResponse.json({ error: albumError.message }, { status: 500 })
    }

    const { error: memberError } = await supabase
      .from('album_members')
      .insert({ album_id: album.id, user_id: user.id, role: 'owner' })

    if (memberError) {
      return NextResponse.json({ error: memberError.message }, { status: 500 })
    }

    return NextResponse.json(album, { status: 201 })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
