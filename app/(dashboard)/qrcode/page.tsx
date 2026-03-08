import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ReviewBoostCard from './ReviewBoostCard'

export default async function QrCodePage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: restaurant } = await supabase
    .from('establishments')
    .select('name, short_code')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .single()

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const collectUrl = restaurant
    ? `${baseUrl}/r/${restaurant.short_code}`
    : null

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">QR Code</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Votre QR code de collecte d&apos;avis.
        </p>
      </div>

      {restaurant && collectUrl ? (
        <ReviewBoostCard
          collectUrl={collectUrl}
          restaurantName={restaurant.name}
        />
      ) : (
        /* Aucun restaurant configuré */
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-6 py-16 text-center space-y-4">
          <div className="text-5xl">🏪</div>
          <h3 className="font-semibold text-slate-800">Aucun établissement configuré</h3>
          <p className="text-slate-400 text-sm max-w-xs mx-auto">
            Ajoutez votre restaurant pour générer votre QR code.
          </p>
          <Link
            href="/settings"
            className="inline-block mt-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl
                       text-sm font-semibold hover:bg-indigo-700 transition-colors"
          >
            Configurer mon établissement →
          </Link>
        </div>
      )}

    </div>
  )
}
