import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

// ── Helpers ────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60_000)
  const hours = Math.floor(mins / 60)
  const days  = Math.floor(hours / 24)
  if (mins  <  1) return "à l'instant"
  if (mins  < 60) return `il y a ${mins} min`
  if (hours < 24) return `il y a ${hours}h`
  if (days  ===1) return 'hier'
  if (days  < 30) return `il y a ${days} j`
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

function ratingEmoji(rating: number) {
  if (rating >= 4) return '😍'
  if (rating >= 3) return '😐'
  return '😞'
}

// ── Page ───────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Restaurant de l'utilisateur
  const { data: restaurant } = await supabase
    .from('establishments')
    .select('id, name, google_review_url')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .single()

  // Cas : aucun établissement configuré
  if (!restaurant) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
        <div className="text-5xl">🏪</div>
        <h1 className="text-xl font-bold text-slate-800">Aucun établissement configuré</h1>
        <p className="text-slate-500 text-sm max-w-xs">
          Ajoutez votre restaurant pour commencer à collecter des avis.
        </p>
        <Link
          href="/settings"
          className="mt-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold
                     hover:bg-indigo-700 transition-colors"
        >
          Configurer mon établissement →
        </Link>
      </div>
    )
  }

  // Début du mois courant
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  // Requêtes parallèles
  const [
    { count: feedbacksThisMonth },
    { count: scansThisMonth },
    { data: recentFeedbacks },
  ] = await Promise.all([
    // Feedbacks ce mois
    supabase
      .from('feedbacks')
      .select('*', { count: 'exact', head: true })
      .eq('establishment_id', restaurant.id)
      .gte('created_at', startOfMonth.toISOString()),

    // Scans ce mois (feedbacks = proxy : chaque avis implique un scan)
    supabase
      .from('feedbacks')
      .select('*', { count: 'exact', head: true })
      .eq('establishment_id', restaurant.id)
      .gte('created_at', startOfMonth.toISOString()),

    // 5 derniers feedbacks
    supabase
      .from('feedbacks')
      .select('id, rating, comment, redirected_to_google, created_at')
      .eq('establishment_id', restaurant.id)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const stats = [
    {
      icon: '⭐',
      label: 'Note Google',
      value: restaurant.google_review_url ? null : '—',
      sub: restaurant.google_review_url ? (
        <a
          href={restaurant.google_review_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-500 hover:underline text-xs"
        >
          Voir sur Google →
        </a>
      ) : (
        <Link href="/settings" className="text-xs text-slate-400 hover:text-indigo-500 transition-colors">
          Non configuré · Ajouter →
        </Link>
      ),
    },
    {
      icon: '💬',
      label: 'Feedbacks ce mois',
      value: feedbacksThisMonth ?? 0,
      sub: <span className="text-xs text-slate-400">depuis le 1er</span>,
    },
    {
      icon: '📱',
      label: 'Scans QR ce mois',
      value: scansThisMonth ?? 0,
      sub: <span className="text-xs text-slate-400">depuis le 1er</span>,
    },
  ]

  return (
    <div className="space-y-8">

      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Bonjour, {restaurant.name}&nbsp;👋
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          Voici un aperçu de votre activité.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map(({ icon, label, value, sub }) => (
          <div
            key={label}
            className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl leading-none">{icon}</span>
            </div>
            <div>
              {value !== null ? (
                <p className="text-3xl font-bold text-slate-900">{value}</p>
              ) : (
                <p className="text-3xl font-bold text-slate-300">—</p>
              )}
              <p className="text-sm font-medium text-slate-600 mt-0.5">{label}</p>
            </div>
            <div>{sub}</div>
          </div>
        ))}
      </div>

      {/* Derniers feedbacks */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Derniers feedbacks</h2>
          <Link
            href="/feedbacks"
            className="text-sm text-indigo-500 hover:text-indigo-700 font-medium transition-colors"
          >
            Voir tous →
          </Link>
        </div>

        {recentFeedbacks && recentFeedbacks.length > 0 ? (
          <ul className="divide-y divide-slate-100">
            {recentFeedbacks.map((fb) => (
              <li key={fb.id} className="flex items-start gap-4 px-6 py-4">
                {/* Emoji */}
                <span className="text-2xl leading-none mt-0.5 shrink-0">
                  {ratingEmoji(fb.rating)}
                </span>

                {/* Contenu */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-slate-400">{timeAgo(fb.created_at)}</span>
                    {fb.redirected_to_google && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                                       bg-green-50 text-green-700 text-xs font-medium border border-green-100">
                        ⭐ Google
                      </span>
                    )}
                  </div>
                  {fb.comment ? (
                    <p className="text-sm text-slate-700 mt-1 truncate">
                      {fb.comment}
                    </p>
                  ) : (
                    <p className="text-sm text-slate-300 mt-1 italic">Aucun commentaire</p>
                  )}
                </div>

                {/* Note chiffrée */}
                <span className="text-xs font-semibold text-slate-400 shrink-0 mt-1">
                  {fb.rating}/5
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-6 py-12 text-center">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-slate-500 text-sm">Aucun feedback pour l&apos;instant.</p>
            <p className="text-slate-400 text-xs mt-1">
              Partagez votre QR code pour commencer à collecter des avis.
            </p>
          </div>
        )}
      </div>

    </div>
  )
}
