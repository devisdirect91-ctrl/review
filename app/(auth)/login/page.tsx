'use client'

import { useFormState } from 'react-dom'
import Link from 'next/link'
import { loginAction } from './actions'
import SubmitButton from '@/components/ui/SubmitButton'

export default function LoginPage() {
  const [state, action] = useFormState(loginAction, { error: null })

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      {/* En-tête */}
      <div className="mb-8">
        <Link href="/" className="text-2xl font-bold text-indigo-600 block mb-6">
          ReviewBoost
        </Link>
        <h1 className="text-xl font-semibold text-gray-900">Connexion</h1>
        <p className="text-sm text-gray-500 mt-1">
          Accédez à votre tableau de bord
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

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Mot de passe
            </label>
          </div>
          <input
            id="password"
            type="password"
            name="password"
            required
            autoComplete="current-password"
            className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg
              focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none
              placeholder:text-gray-400 transition-shadow"
            placeholder="••••••••"
          />
        </div>

        <SubmitButton label="Se connecter" loadingLabel="Connexion en cours…" />
      </form>

      {/* Lien signup */}
      <p className="mt-6 text-center text-sm text-gray-500">
        Pas encore de compte ?{' '}
        <Link href="/signup" className="text-indigo-600 font-medium hover:underline">
          Créer un compte
        </Link>
      </p>
    </div>
  )
}
