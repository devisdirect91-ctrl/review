'use client'

import { useFormState } from 'react-dom'
import Link from 'next/link'
import Image from 'next/image'
import { signupAction } from './actions'
import SubmitButton from '@/components/ui/SubmitButton'

export default function SignupPage() {
  const [state, action] = useFormState(signupAction, { error: null })

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      {/* En-tête */}
      <div className="mb-8">
        <Link href="/" className="flex items-center gap-2.5 mb-6">
          <Image src="/logo.png" alt="QResto" width={36} height={36} />
          <span className="text-2xl font-bold text-gray-900 tracking-tight">QResto</span>
        </Link>
        <h1 className="text-xl font-semibold text-gray-900">Créer un compte</h1>
        <p className="text-sm text-gray-500 mt-1">
          Commencez à collecter vos avis Google en 2 minutes
        </p>
      </div>

      {/* Erreur globale */}
      {state.error && (
        <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd"/>
          </svg>
          {state.error}
        </div>
      )}

      {/* Formulaire */}
      <form action={action} className="space-y-5">
        {/* Nom du restaurant */}
        <div>
          <label htmlFor="restaurant_name" className="block text-sm font-medium text-gray-700 mb-1.5">
            Nom du restaurant
          </label>
          <input
            id="restaurant_name"
            type="text"
            name="restaurant_name"
            required
            autoComplete="organization"
            className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg
              focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none
              placeholder:text-gray-400 transition-shadow"
            placeholder="Le Petit Bistro"
          />
          <p className="mt-1.5 text-xs text-gray-400">
            Vous pourrez ajouter d&apos;autres établissements plus tard.
          </p>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
            Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            required
            autoComplete="email"
            className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg
              focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none
              placeholder:text-gray-400 transition-shadow"
            placeholder="vous@exemple.com"
          />
        </div>

        {/* Mot de passe */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            name="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg
              focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none
              placeholder:text-gray-400 transition-shadow"
            placeholder="8 caractères minimum"
          />
        </div>

        <SubmitButton label="Créer mon compte" loadingLabel="Création en cours…" />
      </form>

      {/* Conditions d'utilisation */}
      <p className="mt-4 text-center text-xs text-gray-400">
        En créant un compte, vous acceptez nos{' '}
        <span className="underline cursor-pointer">conditions d&apos;utilisation</span>.
      </p>

      {/* Lien login */}
      <div className="mt-6 pt-6 border-t border-gray-100 text-center">
        <p className="text-sm text-gray-500">
          Déjà un compte ?{' '}
          <Link href="/login" className="text-indigo-600 font-medium hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}
