import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import CollectForm from './CollectForm'

interface Props {
  params: { code: string }
}

export default async function CollectPage({ params }: Props) {
  const supabase = createClient()

  const { data: restaurant } = await supabase
    .from('establishments')
    .select('id, name, google_review_url')
    .eq('short_code', params.code)
    .single()

  if (!restaurant) notFound()

  return (
    <div className="w-full max-w-sm">
      <div className="bg-white rounded-3xl shadow-2xl p-8">
        {/* En-tête */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-50 mb-4">
            <span className="text-3xl">🍽️</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{restaurant.name}</h1>
        </div>

        {/* Formulaire client */}
        <CollectForm
          restaurantId={restaurant.id}
          googleReviewUrl={restaurant.google_review_url}
        />
      </div>

      <p className="text-center text-xs text-gray-400 mt-6">Propulsé par ReviewBoost</p>
    </div>
  )
}
