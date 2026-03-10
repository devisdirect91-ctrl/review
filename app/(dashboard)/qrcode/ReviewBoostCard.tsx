'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { cn } from '@/lib/utils'

interface Props {
  collectUrl: string
  restaurantName: string
}

interface RenderOpts {
  color1:  string
  color2:  string
  logoEl:  HTMLImageElement | null
  bgEl:    HTMLImageElement | null
  topText: string
  scanText: string
}

// ── Canvas dimensions ─────────────────────────────────────────────────────────
const PW = 550; const PH = 850
const DW = 1299; const DH = 2008

// ── Defaults ──────────────────────────────────────────────────────────────────
const DEF_COLOR1   = '#FF6B35'
const DEF_COLOR2   = '#E63946'
const DEF_TOP_TEXT = 'VOTRE AVIS COMPTE\u00A0!'
const DEF_SCAN     = 'Scannez-moi\u00A0!'
const C_GOLD       = '#FFD700'

// ── Preset palettes ───────────────────────────────────────────────────────────
const PALETTES = [
  { name: 'Orange', c1: '#FF6B35', c2: '#E63946' },
  { name: 'Bleu',   c1: '#3B82F6', c2: '#1D4ED8' },
  { name: 'Vert',   c1: '#10B981', c2: '#047857' },
  { name: 'Violet', c1: '#8B5CF6', c2: '#6D28D9' },
  { name: 'Rose',   c1: '#EC4899', c2: '#BE185D' },
  { name: 'Noir',   c1: '#374151', c2: '#111827' },
]

// ── Pure canvas renderer ──────────────────────────────────────────────────────

async function renderCard(
  canvas: HTMLCanvasElement,
  w: number,
  h: number,
  collectUrl: string,
  opts: RenderOpts,
) {
  canvas.width  = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  const s   = w / PW

  function vGrad(y0: number, y1: number) {
    const g = ctx.createLinearGradient(0, y0, 0, y1)
    g.addColorStop(0, opts.color1)
    g.addColorStop(1, opts.color2)
    return g
  }
  function textShadow(fs: number) {
    ctx.shadowColor   = 'rgba(0,0,0,0.40)'
    ctx.shadowBlur    = Math.round(fs * 0.4)
    ctx.shadowOffsetY = Math.round(fs * 0.05)
  }
  function noShadow() { ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0 }

  // ── 1. Background ─────────────────────────────────────────────────────────
  if (opts.bgEl) {
    const img = opts.bgEl
    const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight)
    const sw = img.naturalWidth  * scale
    const sh = img.naturalHeight * scale
    ctx.drawImage(img, (w - sw) / 2, (h - sh) / 2, sw, sh)
    // overlay gradient for readability
    const overlay = ctx.createLinearGradient(0, 0, 0, h)
    overlay.addColorStop(0, opts.color1 + 'BB')
    overlay.addColorStop(1, opts.color2 + 'BB')
    ctx.fillStyle = overlay
    ctx.fillRect(0, 0, w, h)
  } else {
    ctx.fillStyle = vGrad(0, h)
    ctx.fillRect(0, 0, w, h)
  }

  // ── 2. Titre principal (centré entre le haut et le QR) ───────────────────
  const titleTxt  = opts.topText || DEF_TOP_TEXT
  const maxTitleW = w * 0.88
  let tfs = Math.round(58 * s)
  ctx.font = `900 ${tfs}px -apple-system,'Helvetica Neue',Arial,sans-serif`
  while (ctx.measureText(titleTxt).width > maxTitleW && tfs > 20) {
    tfs--
    ctx.font = `900 ${tfs}px -apple-system,'Helvetica Neue',Arial,sans-serif`
  }

  // ── 3. QR code — position calculée d'abord ────────────────────────────────
  const qrSize = Math.round(w * 0.68)
  const qrPad  = Math.round(16 * s)
  const contW  = qrSize + qrPad * 2
  const contH  = qrSize + qrPad * 2
  const contX  = Math.round((w - contW) / 2)

  const starsFs    = Math.round(50 * s)
  const starsGap   = Math.round(20 * s)
  const scanFs     = Math.round(46 * s)
  const scanGap    = Math.round(16 * s)
  const contY      = Math.round(h * 0.27)

  // Titre centré verticalement entre y=0 et contY
  const titleY = Math.round((contY - tfs) / 2)
  ctx.textAlign    = 'center'
  ctx.textBaseline = 'top'
  ctx.fillStyle    = 'white'
  textShadow(tfs)
  ctx.fillText(titleTxt, w / 2, titleY)
  noShadow()

  // Generate QR on temp canvas
  const qrCanvas = document.createElement('canvas')
  await QRCode.toCanvas(qrCanvas, collectUrl, {
    width: qrSize, margin: 1, errorCorrectionLevel: 'H',
    color: { dark: '#000000', light: '#ffffff' },
  })

  // Logo overlay in QR center
  if (opts.logoEl) {
    const qCtx = qrCanvas.getContext('2d')!
    const ls = qrSize * 0.22
    const cx = qrSize / 2; const cy = qrSize / 2
    const r  = ls / 2 + qrSize * 0.03
    qCtx.fillStyle = 'white'
    qCtx.beginPath()
    qCtx.arc(cx, cy, r, 0, Math.PI * 2)
    qCtx.fill()
    qCtx.drawImage(opts.logoEl, cx - ls / 2, cy - ls / 2, ls, ls)
  }

  // White card container + shadow
  ctx.shadowColor   = 'rgba(0,0,0,0.25)'
  ctx.shadowBlur    = Math.round(22 * s)
  ctx.shadowOffsetY = Math.round(8 * s)
  ctx.fillStyle     = 'white'
  ctx.beginPath()
  ctx.roundRect(contX, contY, contW, contH, Math.round(18 * s))
  ctx.fill()
  noShadow()
  ctx.drawImage(qrCanvas, contX + qrPad, contY + qrPad, qrSize, qrSize)

  // ── 5. Stars ──────────────────────────────────────────────────────────────
  const starsY = contY + contH + starsGap
  ctx.font         = `${starsFs}px Arial`
  ctx.textAlign    = 'center'
  ctx.textBaseline = 'top'
  ctx.fillStyle    = C_GOLD
  textShadow(starsFs)
  ctx.fillText('★  ★  ★  ★  ★', w / 2, starsY)
  noShadow()

  // ── 6. Scan CTA ───────────────────────────────────────────────────────────
  const scanY = starsY + starsFs + scanGap
  ctx.font         = `bold ${scanFs}px -apple-system,'Helvetica Neue',Arial,sans-serif`
  ctx.textBaseline = 'top'
  ctx.fillStyle    = 'white'
  textShadow(scanFs)
  ctx.fillText(opts.scanText || DEF_SCAN, w / 2, scanY)
  noShadow()
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ReviewBoostCard({ collectUrl, restaurantName }: Props) {
  const previewRef = useRef<HTMLCanvasElement>(null)

  // Customization state
  const [color1,       setColor1]       = useState(DEF_COLOR1)
  const [color2,       setColor2]       = useState(DEF_COLOR2)
  const [logoDataUrl,  setLogoDataUrl]  = useState<string | null>(null)
  const [logoEl,       setLogoEl]       = useState<HTMLImageElement | null>(null)
  const [logoName,     setLogoName]     = useState<string | null>(null)
  const [bgDataUrl,    setBgDataUrl]    = useState<string | null>(null)
  const [bgEl,         setBgEl]         = useState<HTMLImageElement | null>(null)
  const [bgName,       setBgName]       = useState<string | null>(null)
  const [topText,      setTopText]      = useState(DEF_TOP_TEXT)
  const [scanText,     setScanText]     = useState(DEF_SCAN)

  // UI state
  const [downloading, setDownloading] = useState<'png' | 'pdf' | 'qr' | null>(null)
  const [copied,      setCopied]      = useState(false)

  // Load logo HTMLImageElement when dataUrl changes
  useEffect(() => {
    if (!logoDataUrl) { setLogoEl(null); return }
    const img = new Image()
    img.onload = () => setLogoEl(img)
    img.src = logoDataUrl
  }, [logoDataUrl])

  // Load bg HTMLImageElement when dataUrl changes
  useEffect(() => {
    if (!bgDataUrl) { setBgEl(null); return }
    const img = new Image()
    img.onload = () => setBgEl(img)
    img.src = bgDataUrl
  }, [bgDataUrl])

  const buildOpts = useCallback((): RenderOpts => ({
    color1, color2, logoEl, bgEl, topText, scanText,
  }), [color1, color2, logoEl, bgEl, topText, scanText])

  // Re-draw preview on any change
  useEffect(() => {
    if (!previewRef.current) return
    renderCard(previewRef.current, PW, PH, collectUrl, buildOpts())
  }, [collectUrl, buildOpts])

  // Hi-res render for downloads
  const buildHiRes = useCallback(async (tw: number, th: number) => {
    const c = document.createElement('canvas')
    await renderCard(c, tw, th, collectUrl, buildOpts())
    return c
  }, [collectUrl, buildOpts])

  async function downloadPng() {
    setDownloading('png')
    try {
      const c = await buildHiRes(DW, DH)
      const a = document.createElement('a')
      a.download = `carte-avis-${restaurantName.toLowerCase().replace(/\s+/g, '-')}.png`
      a.href = c.toDataURL('image/png'); a.click()
    } finally { setDownloading(null) }
  }

  async function downloadPdf() {
    setDownloading('pdf')
    try {
      const dpiW = Math.round(55 * 300 / 25.4)
      const dpiH = Math.round(85 * 300 / 25.4)
      const c = await buildHiRes(dpiW, dpiH)
      const { jsPDF } = await import('jspdf')
      const pdf = new jsPDF({ format: [55, 85], unit: 'mm', orientation: 'portrait' })
      pdf.addImage(c.toDataURL('image/png'), 'PNG', 0, 0, 55, 85)
      pdf.save(`carte-avis-${restaurantName.toLowerCase().replace(/\s+/g, '-')}.pdf`)
    } finally { setDownloading(null) }
  }

  async function downloadQrOnly() {
    setDownloading('qr')
    try {
      const size = 1000
      const qrCanvas = document.createElement('canvas')
      await QRCode.toCanvas(qrCanvas, collectUrl, {
        width: size, margin: 2, errorCorrectionLevel: 'H',
        color: { dark: '#000000', light: '#ffffff' },
      })
      if (logoEl) {
        const qCtx = qrCanvas.getContext('2d')!
        const ls = size * 0.22
        const cx = size / 2; const cy = size / 2
        const r  = ls / 2 + size * 0.03
        qCtx.fillStyle = 'white'
        qCtx.beginPath(); qCtx.arc(cx, cy, r, 0, Math.PI * 2); qCtx.fill()
        qCtx.drawImage(logoEl, cx - ls / 2, cy - ls / 2, ls, ls)
      }
      const a = document.createElement('a')
      a.download = `qrcode-${restaurantName.toLowerCase().replace(/\s+/g, '-')}.png`
      a.href = qrCanvas.toDataURL('image/png'); a.click()
    } finally { setDownloading(null) }
  }

  async function copyUrl() {
    await navigator.clipboard.writeText(collectUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    setLogoName(file.name)
    const r = new FileReader()
    r.onload = ev => setLogoDataUrl(ev.target?.result as string)
    r.readAsDataURL(file); e.target.value = ''
  }

  function removeLogo() { setLogoDataUrl(null); setLogoEl(null); setLogoName(null) }

  function handleBgUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    setBgName(file.name)
    const r = new FileReader()
    r.onload = ev => setBgDataUrl(ev.target?.result as string)
    r.readAsDataURL(file); e.target.value = ''
  }

  function removeBg() { setBgDataUrl(null); setBgEl(null); setBgName(null) }

  const displayW = 240
  const displayH = Math.round(displayW * PH / PW)

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* Two-column layout on lg+ */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">

        {/* ── Preview ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-3 lg:sticky lg:top-6 shrink-0">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest self-start">
            Aperçu — 55 × 85 mm
          </p>
          <div className="relative">
            <div className="absolute inset-0 translate-y-5 blur-3xl bg-orange-300/40 rounded-3xl" style={{ background: `${color1}40` }} />
            <canvas
              ref={previewRef}
              width={PW} height={PH}
              className="relative block rounded-2xl shadow-2xl border border-white/20"
              style={{ width: displayW, height: displayH }}
            />
          </div>
          <p className="text-xs text-slate-400">Carte de visite — prête à imprimer</p>
        </div>

        {/* ── Customization panel ──────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* COULEURS */}
          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-800">🎨 Fond de la carte</h3>

            {/* Option A — Dégradé */}
            <div className="rounded-xl border-2 border-slate-800 bg-slate-50 p-4 space-y-3">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Dégradé de couleur</p>

              {/* Palettes rapides */}
              <div>
                <p className="text-xs text-slate-400 mb-2">Palettes rapides</p>
                <div className="grid grid-cols-6 gap-2">
                  {PALETTES.map(({ name, c1, c2 }) => (
                    <button
                      key={name}
                      title={name}
                      onClick={() => { setColor1(c1); setColor2(c2) }}
                      className={cn(
                        'h-9 rounded-xl border-2 transition-all duration-150',
                        color1 === c1 && color2 === c2 && !bgDataUrl
                          ? 'border-slate-800 scale-110 shadow-md'
                          : 'border-transparent hover:scale-105 hover:border-slate-300'
                      )}
                      style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}
                    />
                  ))}
                </div>
              </div>

              {/* Color pickers */}
              <div className="grid grid-cols-2 gap-3">
                {([
                  { label: 'Couleur principale', value: color1, set: setColor1 },
                  { label: 'Couleur secondaire', value: color2, set: setColor2 },
                ] as const).map(({ label, value, set }) => (
                  <div key={label} className="space-y-1.5">
                    <p className="text-xs text-slate-500">{label}</p>
                    <div className="flex items-center gap-2">
                      <label className="relative cursor-pointer shrink-0">
                        <div
                          className="w-9 h-9 rounded-xl border-2 border-slate-200 shadow-sm hover:scale-105 transition-transform"
                          style={{ background: value }}
                        />
                        <input
                          type="color" value={value}
                          onChange={e => set(e.target.value)}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                      </label>
                      <code className="text-xs text-slate-400 font-mono uppercase">{value}</code>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Séparateur OU */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">ou</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* Option B — Image de fond */}
            <div className={cn(
              'rounded-xl border-2 p-4 space-y-3 transition-all duration-150',
              bgDataUrl ? 'border-slate-800 bg-slate-50' : 'border-slate-100'
            )}>
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Image de fond</p>
              <p className="text-xs text-slate-400">Couvre toute la carte. Le dégradé reste superposé en transparence pour la lisibilité.</p>

              {bgDataUrl ? (
                <div className="flex items-center gap-4 p-3 bg-white rounded-xl border border-slate-200">
                  <div className="w-12 h-12 rounded-xl border-2 border-slate-200 overflow-hidden shrink-0 shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={bgDataUrl} alt="Fond" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{bgName}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Image de fond active</p>
                  </div>
                  <button
                    onClick={removeBg}
                    className="shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg
                               text-red-500 hover:bg-red-50 border border-red-200 transition-colors"
                  >
                    Supprimer
                  </button>
                </div>
              ) : (
                <label className="flex items-center gap-4 px-4 py-4 border-2 border-dashed border-slate-200
                                  rounded-xl cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/40
                                  transition-colors group">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 group-hover:bg-indigo-100
                                  flex items-center justify-center text-xl transition-colors shrink-0">
                    🖼️
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700 group-hover:text-indigo-600 transition-colors">
                      Importer une image de fond
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">PNG, JPG, WebP</p>
                  </div>
                  <input type="file" accept="image/*" onChange={handleBgUpload} className="sr-only" />
                </label>
              )}
            </div>
          </section>

          {/* LOGO */}
          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
            <h3 className="text-sm font-semibold text-slate-800">📷 Logo au centre du QR</h3>
            <p className="text-xs text-slate-400">PNG avec fond transparent recommandé. Le logo s&apos;affiche dans un cercle blanc.</p>

            {logoDataUrl ? (
              <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
                <div className="w-12 h-12 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={logoDataUrl} alt="Logo" className="w-8 h-8 object-contain" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{logoName}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Affiché au centre du QR code</p>
                </div>
                <button
                  onClick={removeLogo}
                  className="shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg
                             text-red-500 hover:bg-red-50 border border-red-200 transition-colors"
                >
                  Supprimer
                </button>
              </div>
            ) : (
              <label className="flex items-center gap-4 px-4 py-4 border-2 border-dashed border-slate-200
                                rounded-xl cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/40
                                transition-colors group">
                <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-indigo-100
                                flex items-center justify-center text-xl transition-colors shrink-0">
                  📷
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700 group-hover:text-indigo-600 transition-colors">
                    Importer un logo
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">PNG, JPG, WebP, SVG</p>
                </div>
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="sr-only" />
              </label>
            )}
          </section>

          {/* TEXTES */}
          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-800">✏️ Textes</h3>

            <div className="space-y-3">
              {([
                { label: 'Titre principal',        value: topText,  set: setTopText,  placeholder: DEF_TOP_TEXT, max: 40 },
                { label: 'Appel à l\'action',      value: scanText, set: setScanText, placeholder: DEF_SCAN,    max: 30 },
              ] as const).map(({ label, value, set, placeholder, max }) => (
                <div key={label} className="space-y-1.5">
                  <p className="text-xs font-medium text-slate-600">{label}</p>
                  <div className="relative">
                    <input
                      type="text"
                      value={value}
                      onChange={e => set(e.target.value.slice(0, max))}
                      placeholder={placeholder}
                      className="w-full px-3 py-2 pr-12 border border-slate-200 rounded-xl text-sm
                                 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-300 tabular-nums">
                      {value.length}/{max}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* URL */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-3">
            <code className="flex-1 text-sm text-slate-600 truncate min-w-0">{collectUrl}</code>
            <button
              onClick={copyUrl}
              className="shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                         bg-slate-100 hover:bg-slate-200 text-slate-700"
            >
              {copied ? '✓ Copié !' : 'Copier'}
            </button>
          </div>

          {/* Downloads */}
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={downloadPng} disabled={!!downloading}
              className="flex flex-col items-center justify-center gap-1 py-4 rounded-xl
                         bg-slate-900 text-white hover:bg-slate-700
                         disabled:opacity-60 disabled:cursor-wait transition-colors"
            >
              <span className="text-xl">{downloading === 'png' ? '⏳' : '🖼️'}</span>
              <span className="text-sm font-semibold">Carte PNG</span>
              <span className="text-xs text-slate-400">1300 × 2008 px</span>
            </button>
            <button
              onClick={downloadPdf} disabled={!!downloading}
              className="flex flex-col items-center justify-center gap-1 py-4 rounded-xl
                         bg-orange-500 text-white hover:bg-orange-600
                         disabled:opacity-60 disabled:cursor-wait transition-colors"
            >
              <span className="text-xl">{downloading === 'pdf' ? '⏳' : '📄'}</span>
              <span className="text-sm font-semibold">Carte PDF</span>
              <span className="text-xs text-orange-200">55 × 85 mm</span>
            </button>
            <button
              onClick={downloadQrOnly} disabled={!!downloading}
              className="flex flex-col items-center justify-center gap-1 py-4 rounded-xl
                         border-2 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50
                         disabled:opacity-60 disabled:cursor-wait transition-colors"
            >
              <span className="text-xl">{downloading === 'qr' ? '⏳' : '◻'}</span>
              <span className="text-sm font-semibold">QR seul</span>
              <span className="text-xs text-slate-400">1000 × 1000 px</span>
            </button>
          </div>

          <div className="flex items-start gap-3 bg-orange-50 border border-orange-100 rounded-xl px-4 py-3">
            <span className="text-lg shrink-0 mt-0.5">💡</span>
            <p className="text-sm text-orange-800 leading-relaxed">
              Envoyez le <strong>PDF 55 × 85 mm</strong> à votre imprimeur — format et résolution prêts pour l&apos;impression professionnelle.
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
