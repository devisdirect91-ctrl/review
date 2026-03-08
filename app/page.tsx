import Link from 'next/link'

// ── Data ────────────────────────────────────────────────────────────────────

const HOW_IT_WORKS = [
  {
    step: '1',
    emoji: '📱',
    title: 'Posez le QR code',
    desc: 'Imprimez votre QR code unique et placez-le sur vos tables, au comptoir ou sur vos tickets.',
  },
  {
    step: '2',
    emoji: '😍',
    title: 'Les contents → Google',
    desc: 'Vos clients satisfaits sont guidés directement vers votre fiche Google pour y laisser un avis 5 étoiles.',
  },
  {
    step: '3',
    emoji: '😞',
    title: 'Les mécontents → vous',
    desc: 'Les clients insatisfaits vous écrivent en privé. Vous gérez le problème avant qu\'il devienne public.',
  },
]

const FEATURES = [
  'QR code personnalisé à votre établissement',
  'Collecte d\'avis illimitée',
  'Redirection intelligente vers Google',
  'Tableau de bord en temps réel',
  'Feedbacks privés des clients mécontents',
  'Support réactif par email',
]

// ── Page ────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">

      {/* ══════════════════════════════════════════════ HEADER */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <span>⭐</span>
            <span>
              Review<span className="text-indigo-600">Boost</span>
            </span>
          </Link>
          <nav className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-slate-600
                         hover:text-slate-900 transition-colors"
            >
              Connexion
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600
                         rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Inscription
            </Link>
          </nav>
        </div>
      </header>

      <main>

        {/* ══════════════════════════════════════════════ HERO */}
        <section className="relative overflow-hidden pt-20 pb-28 sm:pt-32 sm:pb-40 px-4">

          {/* Fond décoratif */}
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 -z-10 h-96
                       bg-gradient-to-b from-indigo-50/70 to-transparent"
          />
          <div
            aria-hidden
            className="absolute top-24 left-1/2 -translate-x-1/2 -z-10
                       w-[600px] h-[600px] rounded-full
                       bg-indigo-100/40 blur-3xl"
          />

          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8
                            rounded-full bg-indigo-50 border border-indigo-100
                            text-indigo-700 text-sm font-medium">
              <span>⭐⭐⭐⭐⭐</span>
              <span>Adopté par plus de 200 restaurateurs</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight mb-6">
              Transformez vos clients satisfaits{' '}
              <span className="relative whitespace-nowrap">
                <span className="relative text-indigo-600">en avis 5 étoiles</span>
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-500 max-w-xl mx-auto mb-10 leading-relaxed">
              Un QR code sur vos tables.{' '}
              <strong className="text-slate-700 font-semibold">Les contents vont sur Google.</strong>{' '}
              Les mécontents vous parlent en privé.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/signup"
                className="px-8 py-4 bg-indigo-600 text-white text-base font-semibold
                           rounded-xl hover:bg-indigo-700 active:scale-95
                           transition-all shadow-lg shadow-indigo-200"
              >
                Commencer gratuitement →
              </Link>
              <Link
                href="#how"
                className="px-8 py-4 text-base font-semibold text-slate-700
                           rounded-xl border border-slate-200 hover:bg-slate-50
                           transition-colors"
              >
                Comment ça marche
              </Link>
            </div>

            <p className="mt-4 text-sm text-slate-400">
              Sans engagement · Annulable à tout moment
            </p>
          </div>
        </section>

        {/* ══════════════════════════════════════════════ HOW IT WORKS */}
        <section id="how" className="py-24 px-4 bg-slate-50">
          <div className="max-w-5xl mx-auto">

            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-indigo-600 uppercase tracking-widest mb-3">
                Comment ça marche
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold">
                Simple comme un scan de QR code
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {HOW_IT_WORKS.map(({ step, emoji, title, desc }) => (
                <div
                  key={step}
                  className="relative bg-white rounded-2xl p-8 shadow-sm border border-slate-100"
                >
                  {/* Numéro d'étape */}
                  <div className="absolute -top-4 left-8 w-8 h-8 rounded-full
                                  bg-indigo-600 text-white text-sm font-bold
                                  flex items-center justify-center shadow-md">
                    {step}
                  </div>

                  <div className="text-5xl mb-5 mt-2">{emoji}</div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>

            {/* Connecteur visuel desktop */}
            <div
              aria-hidden
              className="hidden md:flex items-center justify-center gap-0 -mt-[calc(50%+1rem)]
                         pointer-events-none select-none"
            />
          </div>
        </section>

        {/* ══════════════════════════════════════════════ PRICING */}
        <section id="pricing" className="py-24 px-4">
          <div className="max-w-5xl mx-auto">

            <div className="text-center mb-16">
              <p className="text-sm font-semibold text-indigo-600 uppercase tracking-widest mb-3">
                Tarif
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold">
                Un prix. Tout inclus.
              </h2>
              <p className="text-slate-500 mt-3 text-lg">
                Pas de surprise, pas d&apos;options cachées.
              </p>
            </div>

            {/* Card unique centrée */}
            <div className="max-w-sm mx-auto">
              <div className="relative bg-white rounded-3xl border-2 border-indigo-200
                              shadow-2xl shadow-indigo-100 p-8 text-center">

                {/* Badge populaire */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2
                                px-4 py-1 bg-indigo-600 text-white text-xs font-bold
                                rounded-full uppercase tracking-wide shadow">
                  Tout inclus
                </div>

                <div className="mt-4 mb-6">
                  <div className="flex items-end justify-center gap-1">
                    <span className="text-5xl font-extrabold text-slate-900">39€</span>
                    <span className="text-slate-400 text-lg mb-1.5">/mois</span>
                  </div>
                  <p className="text-slate-400 text-sm mt-1">par établissement</p>
                </div>

                {/* Features */}
                <ul className="space-y-3 text-left mb-8">
                  {FEATURES.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm text-slate-700">
                      <span className="mt-0.5 text-indigo-500 shrink-0 font-bold">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/signup"
                  className="block w-full py-3.5 bg-indigo-600 text-white font-semibold
                             rounded-xl hover:bg-indigo-700 active:scale-95
                             transition-all shadow-md shadow-indigo-200"
                >
                  Commencer maintenant →
                </Link>

                <p className="mt-4 text-xs text-slate-400">
                  14 jours d&apos;essai gratuit · Sans carte bancaire
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* ══════════════════════════════════════════════ CTA FINAL */}
        <section className="py-20 px-4 bg-indigo-600">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Prêt à booster vos avis Google&nbsp;?
            </h2>
            <p className="text-indigo-200 text-lg mb-8">
              Rejoignez les restaurateurs qui ont déjà automatisé leur réputation en ligne.
            </p>
            <Link
              href="/signup"
              className="inline-block px-8 py-4 bg-white text-indigo-700 font-semibold
                         rounded-xl hover:bg-indigo-50 active:scale-95
                         transition-all shadow-xl"
            >
              Créer mon compte gratuitement →
            </Link>
          </div>
        </section>

      </main>

      {/* ══════════════════════════════════════════════ FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-10 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row
                        items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-2 text-slate-300">
            <span>⭐</span>
            <span className="font-semibold">
              Review<span className="text-indigo-400">Boost</span>
            </span>
            <span className="text-slate-600 mx-1">·</span>
            <span>© 2026</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="#" className="hover:text-slate-200 transition-colors">
              CGV
            </Link>
            <Link href="#" className="hover:text-slate-200 transition-colors">
              Politique de confidentialité
            </Link>
            <Link href="#" className="hover:text-slate-200 transition-colors">
              Contact
            </Link>
          </nav>
        </div>
      </footer>

    </div>
  )
}
