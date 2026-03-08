import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// ── Helpers ────────────────────────────────────────────────────────────────

function ratingEmoji(rating: number) {
  if (rating >= 4) return '😍'
  if (rating === 3) return '😐'
  return '😞'
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

// ── Page ───────────────────────────────────────────────────────────────────

export default async function FeedbacksPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Restaurant de l'utilisateur
  const { data: restaurant } = await supabase
    .from('establishments')
    .select('id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .single()

  const { data: rows } = restaurant
    ? await supabase
        .from('feedbacks')
        .select('id, rating, comment, customer_email, redirected_to_google, created_at')
        .eq('establishment_id', restaurant.id)
        .order('created_at', { ascending: false })
    : { data: [] }

  const list = rows ?? []

  // Stats calculées côté serveur
  const total     = list.length
  const positifs  = list.filter((f) => f.rating >= 4).length
  const negatifs  = list.filter((f) => f.rating <= 2).length
  const pctPos    = total > 0 ? Math.round((positifs / total) * 100) : 0
  const pctNeg    = total > 0 ? Math.round((negatifs / total) * 100) : 0

  const stats = [
    { icon: '💬', label: 'Total',    value: String(total), color: 'text-slate-900' },
    { icon: '😍', label: 'Positifs', value: `${pctPos}%`,  color: 'text-green-600' },
    { icon: '😞', label: 'Négatifs', value: `${pctNeg}%`,  color: 'text-red-500'   },
  ]

  return (
    <div className="space-y-6">

      {/* Header */}
      <h1 className="text-2xl font-bold text-slate-900">Feedbacks reçus</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map(({ icon, label, value, color }) => (
          <div
            key={label}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-2"
          >
            <span className="text-2xl leading-none">{icon}</span>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
            <p className="text-sm text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Liste */}
      {list.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

          {/* ── Desktop : tableau ─────────────────────────── */}
          <table className="w-full text-sm hidden md:table">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {['Date', 'Avis', 'Commentaire', 'Email', 'Google'].map((th) => (
                  <th
                    key={th}
                    className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide"
                  >
                    {th}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.map((fb) => (
                <tr key={fb.id} className="hover:bg-slate-50 transition-colors">

                  {/* Date */}
                  <td className="px-6 py-4 text-xs text-slate-400 whitespace-nowrap">
                    {formatDate(fb.created_at)}
                  </td>

                  {/* Emoji + note */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-xl">{ratingEmoji(fb.rating)}</span>
                    <span className="text-xs text-slate-400 ml-1">{fb.rating}/5</span>
                  </td>

                  {/* Commentaire tronqué */}
                  <td className="px-6 py-4 max-w-xs">
                    {fb.comment ? (
                      <span className="block truncate text-slate-700">{fb.comment}</span>
                    ) : (
                      <span className="text-slate-300 italic">—</span>
                    )}
                  </td>

                  {/* Email */}
                  <td className="px-6 py-4 max-w-[160px]">
                    {fb.customer_email ? (
                      <span className="block truncate text-xs text-slate-500">
                        {fb.customer_email}
                      </span>
                    ) : (
                      <span className="text-slate-300 text-xs">—</span>
                    )}
                  </td>

                  {/* Badge Google */}
                  <td className="px-6 py-4">
                    {fb.redirected_to_google ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                                       bg-green-50 border border-green-100 text-green-700
                                       text-xs font-medium whitespace-nowrap">
                        ⭐ Google
                      </span>
                    ) : (
                      <span className="text-slate-300 text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ── Mobile : cards ────────────────────────────── */}
          <ul className="divide-y divide-slate-100 md:hidden">
            {list.map((fb) => (
              <li key={fb.id} className="px-4 py-4 flex items-start gap-3">

                {/* Emoji */}
                <span className="text-2xl leading-none mt-0.5 shrink-0">
                  {ratingEmoji(fb.rating)}
                </span>

                {/* Contenu */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-slate-600">
                      {fb.rating}/5
                    </span>
                    <span className="text-xs text-slate-400">{formatDate(fb.created_at)}</span>
                    {fb.redirected_to_google && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                                       bg-green-50 border border-green-100 text-green-700
                                       text-xs font-medium">
                        ⭐ Google
                      </span>
                    )}
                  </div>

                  {fb.comment && (
                    <p
                      className="text-sm text-slate-700 overflow-hidden"
                      style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      } as React.CSSProperties}
                    >
                      {fb.comment}
                    </p>
                  )}

                  {fb.customer_email && (
                    <p className="text-xs text-slate-400 truncate">{fb.customer_email}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>

        </div>
      )}
    </div>
  )
}

// ── Empty state ────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-6 py-16 text-center">
      <div className="text-5xl mb-4">📭</div>
      <h3 className="font-semibold text-slate-800">Aucun feedback pour l&apos;instant</h3>
      <p className="text-slate-400 text-sm mt-2 max-w-xs mx-auto">
        Partagez votre QR code ou lien de collecte pour commencer à recevoir des avis.
      </p>
    </div>
  )
}
