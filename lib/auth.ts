import { Database } from '@/types/database'
import { SupabaseClient } from '@supabase/supabase-js'

export async function getCurrentUser(supabase: SupabaseClient<Database>) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function getSession(supabase: SupabaseClient<Database>) {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session
}
