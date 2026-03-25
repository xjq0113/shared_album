import { createClient } from '@/lib/supabase'
import { NextResponse, NextRequest } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const token = params.token

    const { data: invite, error: inviteError } = await supabase
      .from('invites')
      .select('*')
      .eq('token', token)
      .single()

    if (inviteError || !invite) {
      return NextResponse.json({ error: 'Invite not found or expired' }, { status: 404 })
    }

    if (new Date(invite.expired_at) < new Date()) {
      return NextResponse.json({ error: 'Invite link has expired' }, { status: 400 })
    }

    const { data: existingMember } = await supabase
      .from('album_members')
      .select('*')
      .eq('album_id', invite.album_id)
      .eq('user_id', user.id)
      .single()

    if (existingMember) {
      return NextResponse.json({ album_id: invite.album_id })
    }

    const { error: memberError } = await supabase
      .from('album_members')
      .insert({ album_id: invite.album_id, user_id: user.id, role: 'member' })

    if (memberError) {
      return NextResponse.json({ error: memberError.message }, { status: 500 })
    }

    await supabase
      .from('invites')
      .update({ used_count: invite.used_count + 1 })
      .eq('id', invite.id)

    return NextResponse.json({ album_id: invite.album_id })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
