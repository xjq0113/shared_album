import { createClient } from '@/lib/supabase'
import { NextResponse, NextRequest } from 'next/server'
import { generateInviteToken } from '@/lib/utils'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const albumId = params.id

    const { data: album, error: albumError } = await supabase
      .from('albums')
      .select('*')
      .eq('id', albumId)
      .eq('owner_id', user.id)
      .single()

    if (albumError || !album) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const token = generateInviteToken()
    const expiredAt = new Date()
    expiredAt.setDate(expiredAt.getDate() + 7)

    const { error: inviteError } = await supabase
      .from('invites')
      .insert({ album_id: albumId, token, created_by: user.id, expired_at: expiredAt.toISOString() })
      .select()
      .single()

    if (inviteError) {
      return NextResponse.json({ error: inviteError.message }, { status: 500 })
    }

    return NextResponse.json({
      token,
      url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/invite/${token}`,
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
