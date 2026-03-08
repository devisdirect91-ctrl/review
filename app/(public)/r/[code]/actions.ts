'use server'

import { createClient } from '@/lib/supabase/server'

export async function submitPositiveFeedback(restaurantId: string) {
  const supabase = createClient()

  const { error } = await supabase.from('feedbacks').insert({
    establishment_id: restaurantId,
    rating: 5,
    redirected_to_google: true,
  })

  if (error) throw new Error(error.message)
}

export async function submitNegativeFeedback(
  restaurantId: string,
  rating: 1 | 3,
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
