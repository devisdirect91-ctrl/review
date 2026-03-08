'use server'

import { createClient } from '@/lib/supabase/server'
import { generateShortCode } from '@/lib/utils'
import { redirect } from 'next/navigation'

export type SignupState = {
  error: string | null
}

export async function signupAction(
  _prevState: SignupState,
  formData: FormData
): Promise<SignupState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const restaurantName = formData.get('restaurant_name') as string

  if (!email || !password || !restaurantName) {
    return { error: 'Tous les champs sont requis.' }
  }

  if (password.length < 8) {
    return { error: 'Le mot de passe doit contenir au moins 8 caractères.' }
  }

  const supabase = createClient()

  // 1. Créer le compte Supabase Auth
  const { data, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (signUpError) {
    if (signUpError.message.includes('already registered')) {
      return { error: 'Cet email est déjà utilisé. Essayez de vous connecter.' }
    }
    return { error: signUpError.message }
  }

  if (!data.user) {
    return { error: 'Une erreur est survenue lors de la création du compte.' }
  }

  // 2. Créer l'établissement avec un short_code unique
  let shortCode = generateShortCode()
  let attempts = 0

  while (attempts < 5) {
    const { error: insertError } = await supabase
      .from('establishments')
      .insert({
        user_id: data.user.id,
        name: restaurantName,
        short_code: shortCode,
      })

    if (!insertError) break

    // Collision sur le short_code → on retente
    if (insertError.code === '23505') {
      shortCode = generateShortCode()
      attempts++
    } else {
      return { error: 'Erreur lors de la création de votre établissement.' }
    }
  }

  redirect('/dashboard')
}
