import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getCollectUrl } from '@/lib/utils'
import RestaurantForm from './RestaurantForm'
import DangerZone from './DangerZone'

// ── Bloc card réutilisable ─────────────────────────────────────────────────

function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
      <div>
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        {description && (
          <p className="text-sm text-slate-400 mt-0.5">{description}</p>
        )}
      </div>
      {children}
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────

export default async function SettingsPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: restaurant } = await supabase
    .from('establishments')
    .select('name, short_code, google_review_url')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .single()

  const collectUrl = restaurant ? getCollectUrl(restaurant.short_code) : null

  return (
    <div className="space-y-6 max-w-xl">

      <h1 className="text-2xl font-bold text-slate-900">Paramètres</h1>

      {/* ── 1. Informations restaurant ──────────────────────────────── */}
      <Section
        title="Informations restaurant"
        description="Ces informations apparaissent sur votre page de collecte."
      >
        <RestaurantForm
          name={restaurant?.name ?? ''}
          googleReviewUrl={restaurant?.google_review_url ?? ''}
        />
      </Section>

      {/* ── 2. Mon QR Code ─────────────────────────────────────────── */}
      <Section title="Mon QR Code">
        {restaurant ? (
          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                Code unique
              </p>
              <code className="inline-block px-3 py-1.5 bg-slate-100 rounded-lg text-sm
                               font-mono text-slate-800 tracking-widest">
                {restaurant.short_code}
              </code>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                Lien de collecte
              </p>
              <a
                href={collectUrl!}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-indigo-500 hover:text-indigo-700 hover:underline
                           break-all transition-colors"
              >
                {collectUrl}
              </a>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-400">
            Configurez votre restaurant ci-dessus pour générer votre QR code.
          </p>
        )}
      </Section>

      {/* ── 3. Compte ───────────────────────────────────────────────── */}
      <Section title="Compte">
        <div>
          <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
            Adresse email
          </label>
          <input
            type="email"
            value={user.email ?? ''}
            disabled
            readOnly
            className="w-full px-4 py-2.5 border border-slate-100 rounded-xl text-sm
                       bg-slate-50 text-slate-400 cursor-not-allowed"
          />
          <p className="mt-1.5 text-xs text-slate-400">
            L&apos;email ne peut pas être modifié.
          </p>
        </div>
      </Section>

      {/* ── 4. Zone danger ──────────────────────────────────────────── */}
      <Section
        title="Zone danger"
        description="Actions irréversibles — procédez avec précaution."
      >
        <DangerZone />
      </Section>

    </div>
  )
}
