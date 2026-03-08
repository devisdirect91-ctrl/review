'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { generateShortCode } from '@/lib/utils'

// ── Types ──────────────────────────────────────────────────────────────────

export type ActionState = { success?: true; error?: string } | null

// ── Sauvegarder le restaurant (insert ou update) ───────────────────────────

export async function saveRestaurant(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const name            = (formData.get('name') as string).trim()
  const googleReviewUrl = (formData.get('google_review_url') as string).trim()

  if (!name) return { error: 'Le nom de l\'établissement est requis.' }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié.' }

  // Vérifie si un établissement existe déjà
  const { data: existing } = await supabase
    .from('establishments')
    .select('id')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  if (existing) {
    const { error } = await supabase
      .from('establishments')
      .update({
        name,
        google_review_url: googleReviewUrl || null,
      })
      .eq('id', existing.id)

    if (error) return { error: error.message }
  } else {
    const { error } = await supabase
      .from('establishments')
      .insert({
        user_id: user.id,
        name,
        google_review_url: googleReviewUrl || null,
        short_code: generateShortCode(),
      })

    if (error) return { error: error.message }
  }

  revalidatePath('/settings')
  revalidatePath('/dashboard')
  return { success: true }
}

// ── Supprimer le compte ────────────────────────────────────────────────────

export async function deleteAccount(): Promise<ActionState> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié.' }

  // Suppression via le client admin (service role) — cascade sur les données
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const { error } = await admin.auth.admin.deleteUser(user.id)
  if (error) return { error: error.message }

  // Invalide la session côté client
  await supabase.auth.signOut()

  redirect('/login')
}
