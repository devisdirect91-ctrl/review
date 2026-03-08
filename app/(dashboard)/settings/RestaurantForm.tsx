'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { saveRestaurant, type ActionState } from './actions'

interface Props {
  name: string
  googleReviewUrl: string
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold
                 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-wait transition-colors"
    >
      {pending ? 'Sauvegarde…' : 'Sauvegarder'}
    </button>
  )
}

export default function RestaurantForm({ name, googleReviewUrl }: Props) {
  const [state, action] = useFormState<ActionState, FormData>(saveRestaurant, null)

  return (
    <form action={action} className="space-y-4">
      {/* Nom */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Nom de l&apos;établissement
        </label>
        <input
          type="text"
          name="name"
          required
          defaultValue={name}
          placeholder="Chez Marcel"
          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm
                     focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none
                     placeholder:text-slate-300"
        />
      </div>

      {/* URL Google */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          URL avis Google
        </label>
        <input
          type="url"
          name="google_review_url"
          defaultValue={googleReviewUrl}
          placeholder="https://maps.google.com/..."
          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm
                     focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none
                     placeholder:text-slate-300"
        />
        <p className="mt-1.5 text-xs text-slate-400">
          Collez le lien de votre page avis Google Maps.
        </p>
      </div>

      {/* Feedback */}
      {state?.success && (
        <p className="text-sm text-green-600 font-medium">✓ Modifications sauvegardées !</p>
      )}
      {state?.error && (
        <p className="text-sm text-red-500">{state.error}</p>
      )}

      <SubmitButton />
    </form>
  )
}
