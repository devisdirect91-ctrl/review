import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { action, email, password, full_name } = await request.json()
  const supabase = createClient()

  if (action === 'login') {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return NextResponse.json({ error: error.message }, { status: 401 })
    return NextResponse.json({ ok: true })
  }

  if (action === 'signup') {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name } },
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true })
  }

  if (action === 'logout') {
    await supabase.auth.signOut()
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Action invalide' }, { status: 400 })
}
