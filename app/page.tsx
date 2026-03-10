import Link from 'next/link'
import { Plus_Jakarta_Sans } from 'next/font/google'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
})

// ── Data ────────────────────────────────────────────────────────────────────

const RESULTS = [
  { value: '3×', label: 'plus d\'avis Google en moyenne', color: '#16a34a' },
  { value: '0', label: 'avis négatifs rendus publics', color: '#2563eb' },
  { value: '5 min', label: 'pour être opérationnel', color: '#9333ea' },
]

const STEPS = [
  {
    num: '1',
    title: 'Posez le QR code',
    desc: 'Imprimez et placez votre QR code sur les tables, au comptoir ou sur les tickets.',
    outcome: 'Vos clients le scannent spontanément',
  },
  {
    num: '2',
    title: 'Le client note son expérience',
    desc: 'Une interface simple, aucune app à télécharger. La note prend 10 secondes.',
    outcome: 'Taux de participation très élevé',
  },
  {
    num: '3',
    title: 'Tri automatique et intelligent',
    desc: 'Note ≥ 4 → redirigé vers Google. Note < 4 → message privé pour vous.',
    outcome: 'Seuls les contents parlent sur Google',
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
    <div className={jakarta.variable} style={{ fontFamily: 'var(--font-jakarta)', background: '#fff', color: '#0f172a' }}>

      {/* ══ HEADER ══════════════════════════════════════════════════════════ */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid #f1f5f9',
      }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto',
          padding: '0 1.5rem', height: 64,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Link href="/" style={{ fontWeight: 700, fontSize: '1.125rem', color: '#0f172a', textDecoration: 'none' }}>
            Review<span style={{ color: '#4f46e5' }}>Boost</span>
          </Link>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <a href="#how" style={navLink}>Comment ça marche</a>
            <a href="#pricing" style={navLink}>Tarifs</a>
            <Link href="/login" style={navLink}>Connexion</Link>
            <Link href="/signup" style={btnPrimary}>Essai gratuit →</Link>
          </nav>
        </div>
      </header>

      <main>

        {/* ══ HERO ════════════════════════════════════════════════════════ */}
        <section style={{ padding: '5rem 1.5rem 4rem', maxWidth: 1100, margin: '0 auto' }}>

          {/* Tag */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: '#f0fdf4', border: '1px solid #bbf7d0',
            borderRadius: 100, padding: '0.375rem 0.875rem',
            fontSize: '0.8125rem', fontWeight: 600, color: '#16a34a',
            marginBottom: '2rem',
          }}>
            <span>✓</span> 200+ restaurateurs font confiance à ReviewBoost
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '4rem', alignItems: 'center' }}>
            <div style={{ maxWidth: 600 }}>
              <h1 style={{
                fontSize: 'clamp(2.25rem, 5vw, 3.5rem)',
                fontWeight: 800, lineHeight: 1.1,
                letterSpacing: '-0.03em',
                margin: '0 0 1.25rem',
              }}>
                Plus d&apos;avis Google.<br />
                <span style={{ color: '#4f46e5' }}>Sans effort,</span> sans risque.
              </h1>

              <p style={{
                fontSize: '1.1875rem', color: '#475569',
                lineHeight: 1.7, margin: '0 0 2.5rem', fontWeight: 400,
              }}>
                Un QR code sur vos tables suffit.{' '}
                <strong style={{ color: '#0f172a', fontWeight: 600 }}>
                  Vos clients satisfaits laissent un avis Google.
                </strong>{' '}
                Les mécontents vous écrivent en privé — jamais en public.
              </p>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <Link href="/signup" style={{ ...btnPrimary, padding: '0.875rem 1.75rem', fontSize: '1rem' }}>
                  Commencer gratuitement →
                </Link>
                <a href="#how" style={{ ...btnSecondary, padding: '0.875rem 1.75rem', fontSize: '1rem' }}>
                  Voir comment ça marche
                </a>
              </div>

              <p style={{ marginTop: '1rem', fontSize: '0.8125rem', color: '#94a3b8' }}>
                14 jours d&apos;essai gratuit · Sans carte bancaire
              </p>
            </div>

            {/* Visual: Two-path diagram */}
            <div style={{
              background: '#f8fafc', border: '1px solid #e2e8f0',
              borderRadius: 16, padding: '2rem',
              minWidth: 280, fontSize: '0.875rem',
            }}>
              <p style={{ fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
                Ce que vit votre client
              </p>

              {/* QR scan */}
              <div style={flowBox('#f1f5f9', '#0f172a')}>
                📱 Scanne le QR code
              </div>
              <div style={flowArrow}>↓</div>
              <div style={flowBox('#ede9fe', '#7c3aed')}>
                ⭐ Note son expérience
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
                <div>
                  <div style={flowArrow}>↙</div>
                  <div style={flowBox('#f0fdf4', '#16a34a')}>
                    😍 Ravi<br />
                    <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>→ Avis Google</span>
                  </div>
                </div>
                <div>
                  <div style={flowArrow}>↘</div>
                  <div style={flowBox('#fff7ed', '#ea580c')}>
                    😞 Déçu<br />
                    <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>→ Message privé</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ RESULTS ═════════════════════════════════════════════════════ */}
        <section style={{ background: '#f8fafc', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{
            maxWidth: 1100, margin: '0 auto', padding: '3rem 1.5rem',
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem',
          }}>
            {RESULTS.map(({ value, label, color }) => (
              <div key={label} style={{ padding: '1.75rem', textAlign: 'center' }}>
                <div style={{
                  fontSize: 'clamp(2.25rem, 4vw, 3rem)',
                  fontWeight: 800, color, lineHeight: 1,
                  marginBottom: '0.5rem', letterSpacing: '-0.03em',
                }}>
                  {value}
                </div>
                <p style={{ fontSize: '0.9375rem', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
                  {label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ══ HOW IT WORKS ══════════════════════════════════════════════════ */}
        <section id="how" style={{ padding: '6rem 1.5rem' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ marginBottom: '3.5rem' }}>
              <p style={sectionLabel}>Comment ça marche</p>
              <h2 style={sectionTitle}>3 étapes, zéro complexité</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
              {STEPS.map(({ num, title, desc, outcome }) => (
                <div key={num} style={{
                  padding: '2rem', border: '1px solid #e2e8f0', borderRadius: 12,
                  background: '#fff', position: 'relative',
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: '#4f46e5', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: '0.9375rem', marginBottom: '1.25rem',
                  }}>
                    {num}
                  </div>
                  <h3 style={{ fontWeight: 700, fontSize: '1.0625rem', margin: '0 0 0.625rem', color: '#0f172a' }}>
                    {title}
                  </h3>
                  <p style={{ fontSize: '0.9375rem', color: '#64748b', lineHeight: 1.65, margin: '0 0 1.25rem' }}>
                    {desc}
                  </p>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    fontSize: '0.8125rem', fontWeight: 600, color: '#16a34a',
                  }}>
                    <span>✓</span> {outcome}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ SPLIT OUTCOME ═══════════════════════════════════════════════ */}
        <section style={{ background: '#f8fafc', padding: '6rem 1.5rem', borderTop: '1px solid #f1f5f9' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ marginBottom: '3.5rem' }}>
              <p style={sectionLabel}>Le résultat concret</p>
              <h2 style={sectionTitle}>Votre e-réputation, maîtrisée</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

              {/* Good path */}
              <div style={{
                padding: '2rem', borderRadius: 12,
                background: '#f0fdf4', border: '1px solid #bbf7d0',
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>😍</div>
                <h3 style={{ fontWeight: 700, fontSize: '1.125rem', color: '#0f172a', margin: '0 0 0.75rem' }}>
                  Client satisfait (note ≥ 4)
                </h3>
                <p style={{ color: '#15803d', fontSize: '0.9375rem', lineHeight: 1.65, margin: '0 0 1.25rem' }}>
                  Il est redirigé directement vers votre fiche Google. Un avis 5 étoiles de plus,
                  automatiquement, sans aucune friction.
                </p>
                <div style={{
                  background: '#fff', border: '1px solid #bbf7d0', borderRadius: 8, padding: '1rem',
                  fontSize: '0.875rem', color: '#166534', fontWeight: 500,
                }}>
                  ★★★★★ &nbsp;Nouveau sur votre fiche Google
                </div>
              </div>

              {/* Bad path */}
              <div style={{
                padding: '2rem', borderRadius: 12,
                background: '#fff7ed', border: '1px solid #fed7aa',
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>😞</div>
                <h3 style={{ fontWeight: 700, fontSize: '1.125rem', color: '#0f172a', margin: '0 0 0.75rem' }}>
                  Client déçu (note &lt; 4)
                </h3>
                <p style={{ color: '#9a3412', fontSize: '0.9375rem', lineHeight: 1.65, margin: '0 0 1.25rem' }}>
                  Il vous envoie un message privé. Vous gérez le problème directement — aucun avis
                  négatif ne vient nuire à votre réputation en ligne.
                </p>
                <div style={{
                  background: '#fff', border: '1px solid #fed7aa', borderRadius: 8, padding: '1rem',
                  fontSize: '0.875rem', color: '#9a3412', fontWeight: 500,
                }}>
                  📨 &nbsp;Message privé reçu dans votre tableau de bord
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ══ PRICING ═════════════════════════════════════════════════════ */}
        <section id="pricing" style={{ padding: '6rem 1.5rem' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ marginBottom: '3.5rem' }}>
              <p style={sectionLabel}>Tarif</p>
              <h2 style={sectionTitle}>Un prix simple. Tout inclus.</h2>
              <p style={{ color: '#64748b', fontSize: '1.0625rem', marginTop: '0.5rem' }}>
                Pas d&apos;options cachées, pas de paliers inutiles.
              </p>
            </div>

            <div style={{
              maxWidth: 440, display: 'grid', gridTemplateColumns: '1fr auto', gap: '3rem', alignItems: 'start',
            }}>
              {/* Card */}
              <div style={{
                border: '2px solid #4f46e5', borderRadius: 16, padding: '2.25rem',
                background: '#fff', position: 'relative', gridColumn: '1 / -1', maxWidth: 440,
              }}>
                <div style={{
                  position: 'absolute', top: -14, left: 24,
                  background: '#4f46e5', color: '#fff',
                  padding: '0.25rem 0.875rem', borderRadius: 100,
                  fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em',
                }}>
                  TOUT INCLUS
                </div>

                <div style={{ marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.375rem' }}>
                    <span style={{ fontSize: '3.5rem', fontWeight: 800, letterSpacing: '-0.04em', color: '#0f172a' }}>
                      39€
                    </span>
                    <span style={{ color: '#94a3b8', fontSize: '1rem' }}>/mois</span>
                  </div>
                  <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: '0.25rem 0 0' }}>
                    par établissement
                  </p>
                </div>

                <ul style={{ listStyle: 'none', margin: '0 0 2rem', padding: 0 }}>
                  {FEATURES.map((f) => (
                    <li key={f} style={{
                      display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                      padding: '0.625rem 0', borderBottom: '1px solid #f1f5f9',
                      fontSize: '0.9375rem', color: '#334155',
                    }}>
                      <span style={{ color: '#4f46e5', fontWeight: 700, flexShrink: 0, marginTop: 1 }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link href="/signup" style={{ ...btnPrimary, display: 'flex', justifyContent: 'center', width: '100%', padding: '0.9375rem' }}>
                  Commencer — 14 jours gratuits →
                </Link>
                <p style={{ textAlign: 'center', marginTop: '0.875rem', fontSize: '0.8125rem', color: '#94a3b8' }}>
                  Sans carte bancaire · Annulable à tout moment
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ══ CTA FINAL ═══════════════════════════════════════════════════ */}
        <section style={{
          background: '#4f46e5', padding: '5rem 1.5rem', textAlign: 'center',
        }}>
          <div style={{ maxWidth: 640, margin: '0 auto' }}>
            <h2 style={{
              fontSize: 'clamp(1.875rem, 4vw, 2.75rem)',
              fontWeight: 800, color: '#fff',
              lineHeight: 1.15, letterSpacing: '-0.025em',
              margin: '0 0 1.25rem',
            }}>
              Votre restaurant mérite plus d&apos;étoiles Google.
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1.125rem', margin: '0 0 2.5rem', lineHeight: 1.65 }}>
              Rejoignez 200+ restaurateurs qui collectent des avis automatiquement, chaque jour.
            </p>
            <Link href="/signup" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '1rem 2.25rem',
              background: '#fff', color: '#4f46e5',
              fontWeight: 700, fontSize: '1rem',
              borderRadius: 10, textDecoration: 'none',
              transition: 'all 0.2s',
            }}>
              Créer mon compte gratuitement →
            </Link>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8125rem', marginTop: '1rem' }}>
              14 jours d&apos;essai · Sans carte bancaire
            </p>
          </div>
        </section>

      </main>

      {/* ══ FOOTER ══════════════════════════════════════════════════════════ */}
      <footer style={{ background: '#0f172a', padding: '2rem 1.5rem' }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '1rem',
        }}>
          <span style={{ fontWeight: 700, fontSize: '1rem', color: '#e2e8f0' }}>
            Review<span style={{ color: '#818cf8' }}>Boost</span>
            <span style={{ color: '#334155', marginLeft: '1rem', fontWeight: 400, fontSize: '0.875rem' }}>© 2026</span>
          </span>
          <nav style={{ display: 'flex', gap: '1.5rem' }}>
            {['CGV', 'Confidentialité', 'Contact'].map((item) => (
              <Link key={item} href="#" style={{ color: '#475569', fontSize: '0.875rem', textDecoration: 'none' }}>
                {item}
              </Link>
            ))}
          </nav>
        </div>
      </footer>

    </div>
  )
}

// ── Style constants ──────────────────────────────────────────────────────────

const navLink: React.CSSProperties = {
  padding: '0.5rem 0.75rem',
  fontSize: '0.875rem', fontWeight: 500, color: '#475569',
  textDecoration: 'none',
}

const btnPrimary: React.CSSProperties = {
  padding: '0.625rem 1.25rem',
  background: '#4f46e5', color: '#fff',
  fontWeight: 700, fontSize: '0.875rem',
  borderRadius: 8, textDecoration: 'none',
  display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
}

const btnSecondary: React.CSSProperties = {
  padding: '0.625rem 1.25rem',
  background: '#fff', color: '#0f172a',
  fontWeight: 600, fontSize: '0.875rem',
  border: '1px solid #e2e8f0',
  borderRadius: 8, textDecoration: 'none',
  display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
}

const sectionLabel: React.CSSProperties = {
  fontSize: '0.8125rem', fontWeight: 700,
  letterSpacing: '0.08em', textTransform: 'uppercase',
  color: '#4f46e5', margin: '0 0 0.625rem',
}

const sectionTitle: React.CSSProperties = {
  fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
  fontWeight: 800, letterSpacing: '-0.025em',
  color: '#0f172a', margin: 0, lineHeight: 1.15,
}

function flowBox(bg: string, color: string): React.CSSProperties {
  return {
    background: bg, border: `1px solid ${color}22`,
    borderRadius: 8, padding: '0.625rem 0.875rem',
    fontSize: '0.875rem', fontWeight: 600, color,
    textAlign: 'center',
  }
}

const flowArrow: React.CSSProperties = {
  textAlign: 'center', color: '#cbd5e1',
  fontSize: '1.25rem', lineHeight: 1.5, display: 'block',
}
