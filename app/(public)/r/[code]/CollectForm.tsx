'use client'

import { useState } from 'react'
import { submitPositiveFeedback, submitNegativeFeedback } from './actions'

type Step = 'initial' | 'positive' | 'negative' | 'thanks'

interface Props {
  restaurantId: string
  googleReviewUrl: string | null
}

const LABELS = ['', 'Très mauvais', 'Mauvais', 'Correct', 'Bien', 'Excellent']

export default function CollectForm({ restaurantId, googleReviewUrl }: Props) {
  const [step, setStep] = useState<Step>('initial')
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  function handleStarClick(star: number) {
    setRating(star)
    if (star >= 4) {
      setStep('positive')
    } else {
      setStep('negative')
    }
  }

  async function handleGoogleRedirect() {
    setLoading(true)
    try {
      await submitPositiveFeedback(restaurantId, rating as 4 | 5)
    } finally {
      if (googleReviewUrl) window.location.href = googleReviewUrl
      setLoading(false)
    }
  }

  async function handleNegativeSubmit() {
    setLoading(true)
    try {
      await submitNegativeFeedback(restaurantId, rating as 1 | 2 | 3, comment, email)
      setStep('thanks')
    } catch {
      setStep('thanks')
    } finally {
      setLoading(false)
    }
  }

  // ── Initial ────────────────────────────────────────────────
  if (step === 'initial') {
    const active = hovered || rating
    return (
      <div className="space-y-6">
        <p className="text-center text-gray-600 text-lg">
          Comment s&apos;est passée votre expérience&nbsp;?
        </p>
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => handleStarClick(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              className="text-5xl transition-transform duration-100 hover:scale-110 active:scale-95"
              aria-label={`${star} étoile${star > 1 ? 's' : ''}`}
            >
              <span className={active >= star ? 'text-yellow-400' : 'text-gray-200'}>★</span>
            </button>
          ))}
        </div>
        {active > 0 && (
          <p className="text-center text-sm text-gray-500">{LABELS[active]}</p>
        )}
      </div>
    )
  }

  // ── Positive ───────────────────────────────────────────────
  if (step === 'positive') {
    return (
      <div className="space-y-6 text-center">
        <div className="text-5xl">🎉</div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Merci beaucoup&nbsp;!</h2>
          <p className="text-gray-500 mt-2 text-sm leading-relaxed">
            Partagez votre expérience sur Google,<br />
            ça nous aide énormément&nbsp;!
          </p>
        </div>

        {googleReviewUrl ? (
          <div className="flex flex-col gap-3">
            <button
              onClick={handleGoogleRedirect}
              disabled={loading}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold
                         hover:bg-indigo-700 active:scale-95 transition-all
                         disabled:opacity-60 disabled:cursor-wait"
            >
              ⭐ Laisser un avis Google
            </button>
            <button
              onClick={() => setStep('thanks')}
              disabled={loading}
              className="w-full py-2 text-gray-400 text-sm hover:text-gray-600 transition-colors"
            >
              Non merci
            </button>
          </div>
        ) : (
          <button
            onClick={() => setStep('thanks')}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold
                       hover:bg-indigo-700 active:scale-95 transition-all"
          >
            Terminer
          </button>
        )}
      </div>
    )
  }

  // ── Negative ───────────────────────────────────────────────
  if (step === 'negative') {
    return (
      <div className="space-y-5">
        <div className="text-center">
          <div className="text-4xl mb-2">😔</div>
          <h2 className="text-xl font-bold text-gray-900">Nous sommes désolés</h2>
          <p className="text-gray-500 mt-1 text-sm">Aidez-nous à nous améliorer&nbsp;:</p>
        </div>

        <div className="space-y-3">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            placeholder="Décrivez ce qui s'est mal passé..."
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm
                       focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                       outline-none resize-none placeholder:text-gray-300"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Votre email (optionnel)"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm
                       focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                       outline-none placeholder:text-gray-300"
          />
        </div>

        <button
          onClick={handleNegativeSubmit}
          disabled={loading}
          className="w-full py-3 bg-gray-800 text-white rounded-xl font-semibold
                     hover:bg-gray-900 active:scale-95 transition-all
                     disabled:opacity-60 disabled:cursor-wait"
        >
          {loading ? 'Envoi…' : 'Envoyer'}
        </button>

        {googleReviewUrl && (
          <>
            <div className="flex items-center gap-3 pt-1">
              <div className="flex-1 border-t border-gray-200" />
              <span className="text-xs text-gray-400 shrink-0">ou</span>
              <div className="flex-1 border-t border-gray-200" />
            </div>
            <a
              href={googleReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center text-sm text-indigo-500 hover:text-indigo-700
                         hover:underline transition-colors"
            >
              Laisser un avis sur Google →
            </a>
          </>
        )}
      </div>
    )
  }

  // ── Thanks ─────────────────────────────────────────────────
  return (
    <div className="text-center space-y-4 py-4">
      <div className="text-5xl">✅</div>
      <h2 className="text-xl font-bold text-gray-900">Merci pour votre retour&nbsp;!</h2>
      <p className="text-gray-500 text-sm">Votre avis nous aide à nous améliorer chaque jour.</p>
    </div>
  )
}
