'use server'

import { createClient } from '@/lib/supabase/server'

export async function submitPositiveFeedback(restaurantId: string, rating: 4 | 5 = 5): Promise<string> {
  const supabase = createClient()

  const { data, error } = await supabase.from('feedbacks').insert({
    establishment_id: restaurantId,
    rating,
    redirected_to_google: false,
  }).select('id').single()

  if (error) throw new Error(error.message)
  return data.id
}

export async function markRedirectedToGoogle(feedbackId: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('feedbacks')
    .update({ redirected_to_google: true })
    .eq('id', feedbackId)

  if (error) throw new Error(error.message)
}

export async function submitNegativeFeedback(
  restaurantId: string,
  rating: 1 | 2 | 3,
  comment?: string,
  email?: string,
) {
  const supabase = createClient()

  const { error } = await supabase.from('feedbacks').insert({
    establishment_id: restaurantId,
    rating,
    comment: comment?.trim() || null,
    customer_email: email?.trim() || null,
    redirected_to_google: false,
  })

  if (error) throw new Error(error.message)
}
