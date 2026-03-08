'use client'

import { useState, useTransition } from 'react'
import { deleteAccount } from './actions'

export default function DangerZone() {
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteAccount()
      // deleteAccount redirige si succès — si on arrive ici c'est une erreur
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="space-y-4">
      {!confirming ? (
        <button
          onClick={() => setConfirming(true)}
          className="px-5 py-2.5 border border-red-200 text-red-600 rounded-xl text-sm
                     font-semibold hover:bg-red-50 transition-colors"
        >
          Supprimer mon compte
        </button>
      ) : (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
          <p className="text-sm text-red-800 font-medium">
            Cette action est irréversible. Toutes vos données (restaurant, feedbacks) seront
            définitivement supprimées.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold
                         hover:bg-red-700 disabled:opacity-60 disabled:cursor-wait transition-colors"
            >
              {isPending ? 'Suppression…' : 'Oui, supprimer définitivement'}
            </button>
            <button
              onClick={() => setConfirming(false)}
              disabled={isPending}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm
                         font-medium hover:bg-slate-50 transition-colors"
            >
              Annuler
            </button>
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      )}
    </div>
  )
}
