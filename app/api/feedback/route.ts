import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json()
  const { establishment_id, rating, comment, customer_name, customer_email } = body

  if (!establishment_id || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
  }

  const supabase = createClient()

  const { data, error } = await supabase
    .from('feedbacks')
    .insert({
      establishment_id,
      rating,
      comment: comment || null,
      customer_name: customer_name || null,
      customer_email: customer_email || null,
      redirected_to_google: false,
    })
    .select('id')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ id: data.id })
}

export async function PATCH(request: Request) {
  const body = await request.json()
  const { feedback_id } = body

  if (!feedback_id) {
    return NextResponse.json({ error: 'feedback_id requis' }, { status: 400 })
  }

  const supabase = createClient()

  const { error } = await supabase
    .from('feedbacks')
    .update({ redirected_to_google: true })
    .eq('id', feedback_id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
