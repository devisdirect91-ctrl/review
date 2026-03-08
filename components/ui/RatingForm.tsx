'use client'

import { useState } from 'react'

interface Props {
  restaurantId: string
  googleReviewUrl: string | null
}

export default function RatingForm({ restaurantId, googleReviewUrl }: Props) {
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const [step, setStep] = useState<'rating' | 'details' | 'done'>('rating')
  const [feedbackId, setFeedbackId] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ establishment_id: restaurantId, rating, comment }),
    })

    const data = await res.json()
    if (data.id) {
      setFeedbackId(data.id)
      setStep('done')

      // If rating >= 4, redirect to Google after marking as redirected
      if (rating >= 4 && googleReviewUrl) {
        await fetch('/api/feedback', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ feedback_id: data.id }),
        })
        window.location.href = googleReviewUrl
      }
    }
  }

  if (step === 'done') {
    return (
      <div className="text-center py-4">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Merci pour votre avis !</h2>
        <p className="text-gray-500">Votre retour nous aide à nous améliorer.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <p className="text-sm font-medium text-gray-700 mb-3 text-center">
          Comment évaluez-vous votre expérience ?
        </p>
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              className="text-4xl transition-transform hover:scale-110"
            >
              <span className={(hovered || rating) >= star ? 'text-yellow-400' : 'text-gray-200'}>
                ★
              </span>
            </button>
          ))}
        </div>
        {rating > 0 && (
          <p className="text-center text-sm text-gray-500 mt-2">
            {['', 'Très mauvais', 'Mauvais', 'Correct', 'Bien', 'Excellent'][rating]}
          </p>
        )}
      </div>

      {rating > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Un commentaire ? <span className="text-gray-400">(optionnel)</span>
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
            placeholder="Partagez votre expérience..."
          />
        </div>
      )}

      {rating > 0 && (
        <button
          type="submit"
          className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          Envoyer mon avis
          {rating >= 4 && googleReviewUrl && ' → Google'}
        </button>
      )}
    </form>
  )
}
