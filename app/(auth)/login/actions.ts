'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export type LoginState = {
  error: string | null
}

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email et mot de passe requis.' }
  }

  const supabase = createClient()

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    if (error.message === 'Invalid login credentials') {
      return { error: 'Email ou mot de passe incorrect.' }
    }
    return { error: error.message }
  }

  redirect('/dashboard')
}
