'use client'

import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { cn } from '@/lib/utils'

// ── Types ──────────────────────────────────────────────────────────────────

interface Props {
  collectUrl: string
  restaurantName: string
}

interface RenderOpts {
  bgImageEl:      HTMLImageElement | null
  bgKey:          string
  logoEl:         HTMLImageElement | null
  qrColor:        string
  topText:        string
  showTopText:    boolean
  showBottomText: boolean
  restaurantName: string
  collectUrl:     string
}

// ── Config ─────────────────────────────────────────────────────────────────

// Preview canvas is rendered at 2× for retina sharpness, displayed at half size
const PW = 600; const PH = 800   // internal resolution (3:4)
const DW = 1200; const DH = 1600  // PNG download
const A6W = 1240; const A6H = 1748 // A6 @ 300dpi

const BG_PRESETS = [
  { key: '#ffffff',      label: 'Blanc',       swatch: '#ffffff',                                     dark: false },
  { key: '#0f172a',      label: 'Nuit',        swatch: '#0f172a',                                     dark: true  },
  { key: '#4f46e5',      label: 'Indigo',      swatch: '#4f46e5',                                     dark: true  },
  { key: '#dc2626',      label: 'Rouge',       swatch: '#dc2626',                                     dark: true  },
  { key: '#16a34a',      label: 'Vert',        swatch: '#16a34a',                                     dark: true  },
  { key: '#92400e',      label: 'Ambre',       swatch: '#92400e',                                     dark: true  },
  { key: 'grad-warm',    label: 'Coucher',     swatch: 'linear-gradient(135deg,#f59e0b,#ef4444)',     dark: true  },
  { key: 'grad-cool',    label: 'Océan',       swatch: 'linear-gradient(135deg,#4f46e5,#06b6d4)',     dark: true  },
  { key: 'grad-night',   label: 'Nuit',        swatch: 'linear-gradient(135deg,#0f172a,#312e81)',     dark: true  },
  { key: 'grad-rose',    label: 'Rose',        swatch: 'linear-gradient(135deg,#f43f5e,#a855f7)',     dark: true  },
  { key: 'grad-forest',  label: 'Forêt',       swatch: 'linear-gradient(135deg,#166534,#4ade80)',     dark: true  },
  { key: 'grad-sunset',  label: 'Bordeaux',    swatch: 'linear-gradient(135deg,#7f1d1d,#f59e0b)',     dark: true  },
]

const GRADIENTS: Record<string, [string, string]> = {
  'grad-warm':   ['#f59e0b', '#ef4444'],
  'grad-cool':   ['#4f46e5', '#06b6d4'],
  'grad-night':  ['#0f172a', '#312e81'],
  'grad-rose':   ['#f43f5e', '#a855f7'],
  'grad-forest': ['#166534', '#4ade80'],
  'grad-sunset': ['#7f1d1d', '#f59e0b'],
}

// ── Pure canvas functions ──────────────────────────────────────────────────

async function drawBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  bgKey: string,
  bgImageEl: HTMLImageElement | null,
) {
  if (bgImageEl) {
    const iW = bgImageEl.naturalWidth; const iH = bgImageEl.naturalHeight
    const iA = iW / iH; const cA = w / h
    let sx = 0, sy = 0, sw = iW, sh = iH
    if (iA > cA) { sw = iH * cA; sx = (iW - sw) / 2 }
    else          { sh = iW / cA; sy = (iH - sh) / 2 }
    ctx.drawImage(bgImageEl, sx, sy, sw, sh, 0, 0, w, h)
    // Overlay semi-transparent dark layer for text readability
    ctx.fillStyle = 'rgba(0,0,0,0.15)'
    ctx.fillRect(0, 0, w, h)
  } else if (GRADIENTS[bgKey]) {
    const [c1, c2] = GRADIENTS[bgKey]
    const g = ctx.createLinearGradient(0, 0, w, h)
    g.addColorStop(0, c1); g.addColorStop(1, c2)
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
  } else {
    ctx.fillStyle = bgKey
    ctx.fillRect(0, 0, w, h)
  }
}

async function generateQR(
  url: string,
  size: number,
  color: string,
  logoEl: HTMLImageElement | null,
): Promise<HTMLCanvasElement> {
  const qc = document.createElement('canvas')
  await QRCode.toCanvas(qc, url, {
    width: size,
    margin: 2,
    errorCorrectionLevel: 'H',
    color: { dark: color, light: '#ffffff' },
  })
  if (logoEl) {
    const ctx = qc.getContext('2d')!
    const ls = size * 0.22
    const cx = size / 2; const cy = size / 2
    const r  = ls / 2 + size * 0.026
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.fillStyle = '#ffffff'
    ctx.fill()
    ctx.drawImage(logoEl, cx - ls / 2, cy - ls / 2, ls, ls)
  }
  return qc
}

async function renderCard(canvas: HTMLCanvasElement, w: number, h: number, opts: RenderOpts) {
  const { bgImageEl, bgKey, logoEl, qrColor, topText, showTopText, showBottomText, restaurantName, collectUrl } = opts

  canvas.width = w; canvas.height = h
  const ctx = canvas.getContext('2d')!

  await drawBackground(ctx, w, h, bgKey, bgImageEl)

  // Text color: white on dark/gradient/image, dark on white
  const isLightBg = bgKey === '#ffffff' && !bgImageEl
  const tc = isLightBg ? '#0f172a' : '#ffffff'

  // Layout: QR is 55% of width so the background breathes
  const qrSize  = Math.round(w * 0.55)
  const qrX     = Math.round((w - qrSize) / 2)
  const topH    = showTopText    ? Math.round(w * 0.21) : Math.round(w * 0.04)
  const botH    = showBottomText ? Math.round(w * 0.24) : Math.round(w * 0.04)
  const totalH  = topH + qrSize + botH
  const originY = Math.round((h - totalH) / 2)

  // QR
  const qrCanvas = await generateQR(collectUrl, qrSize, qrColor, logoEl)

  // White floating card behind QR with shadow
  if (bgKey !== '#ffffff' || bgImageEl) {
    const pad = Math.round(qrSize * 0.04)
    ctx.shadowColor = 'rgba(0,0,0,0.25)'
    ctx.shadowBlur  = Math.round(w * 0.06)
    ctx.shadowOffsetY = Math.round(w * 0.02)
    ctx.fillStyle = 'rgba(255,255,255,0.97)'
    ctx.beginPath()
    ctx.roundRect(qrX - pad, originY + topH - pad, qrSize + pad * 2, qrSize + pad * 2, Math.round(pad * 2.5))
    ctx.fill()
    ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0
  }

  ctx.drawImage(qrCanvas, qrX, originY + topH)

  // Helpers
  function shadow(size: number) {
    if (!bgImageEl) return
    ctx.shadowColor = 'rgba(0,0,0,0.75)'; ctx.shadowBlur = Math.round(size * 0.55)
  }
  function noShadow() { ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0 }

  function fitText(text: string, maxFs: number, weight: string, maxW: number) {
    let fs = maxFs
    ctx.font = `${weight} ${fs}px -apple-system,'Helvetica Neue',Arial,sans-serif`
    while (ctx.measureText(text).width > maxW && fs > 8) {
      fs--
      ctx.font = `${weight} ${fs}px -apple-system,'Helvetica Neue',Arial,sans-serif`
    }
    return fs
  }

  // ── TOP TEXT ──────────────────────────────────────────────────────────────
  if (showTopText) {
    const topMid = originY + topH / 2
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'

    // Stars row — always gold
    const starFs = Math.round(w * 0.075)
    ctx.fillStyle = '#f59e0b'
    shadow(starFs)
    ctx.font = `${starFs}px Arial`
    ctx.fillText('★  ★  ★  ★  ★', w / 2, topMid - Math.round(w * 0.058))
    noShadow()

    // Main phrase — bold
    const phraseFs = fitText(topText || 'Votre avis compte !', Math.round(w * 0.058), '800', w * 0.84)
    ctx.fillStyle = tc
    shadow(phraseFs)
    ctx.fillText(topText || 'Votre avis compte !', w / 2, topMid + Math.round(w * 0.042))
    noShadow()
  }

  // ── BOTTOM TEXT ───────────────────────────────────────────────────────────
  if (showBottomText && restaurantName) {
    const botStartY = originY + topH + qrSize
    const botMid    = botStartY + botH / 2

    // Decorative separator line
    const lineHalf = Math.round(w * 0.10)
    ctx.strokeStyle = isLightBg ? 'rgba(15,23,42,0.18)' : 'rgba(255,255,255,0.45)'
    ctx.lineWidth   = Math.round(w * 0.004)
    ctx.beginPath()
    ctx.moveTo(w / 2 - lineHalf, botStartY + Math.round(botH * 0.15))
    ctx.lineTo(w / 2 + lineHalf, botStartY + Math.round(botH * 0.15))
    ctx.stroke()

    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'

    // Restaurant name — bold & large
    const nameFs = fitText(restaurantName, Math.round(w * 0.068), '800', w * 0.84)
    ctx.fillStyle = tc
    shadow(nameFs)
    ctx.fillText(restaurantName, w / 2, botMid + Math.round(w * 0.005))
    noShadow()

  }
}

// ── Component ──────────────────────────────────────────────────────────────

export default function QrCodeCard({ collectUrl, restaurantName }: Props) {
  const previewRef = useRef<HTMLCanvasElement>(null)

  // State
  const [bgKey,          setBgKey]          = useState('#ffffff')
  const [bgImageDataUrl, setBgImageDataUrl] = useState<string | null>(null)
  const [bgImageEl,      setBgImageEl]      = useState<HTMLImageElement | null>(null)
  const [logoDataUrl,    setLogoDataUrl]    = useState<string | null>(null)
  const [logoEl,         setLogoEl]         = useState<HTMLImageElement | null>(null)
  const [logoName,       setLogoName]       = useState<string | null>(null)
  const [qrColor,        setQrColor]        = useState('#0f172a')
  const [topText,        setTopText]        = useState('Votre avis compte !')
  const [bottomText,     setBottomText]     = useState(restaurantName)
  const [showTopText,    setShowTopText]    = useState(true)
  const [showBottomText, setShowBottomText] = useState(true)
  const [downloading,    setDownloading]    = useState<'png' | 'pdf' | 'qr' | null>(null)

  // Load bg image element
  useEffect(() => {
    if (!bgImageDataUrl) { setBgImageEl(null); return }
    const img = new Image()
    img.onload = () => setBgImageEl(img)
    img.src = bgImageDataUrl
  }, [bgImageDataUrl])

  // Load logo element
  useEffect(() => {
    if (!logoDataUrl) { setLogoEl(null); return }
    const img = new Image()
    img.onload = () => setLogoEl(img)
    img.src = logoDataUrl
  }, [logoDataUrl])

  // Build opts from current state
  function buildOpts(): RenderOpts {
    return {
      bgKey:          bgImageEl ? 'custom' : bgKey,
      bgImageEl,
      logoEl,
      qrColor,
      topText,
      showTopText,
      showBottomText,
      restaurantName: bottomText,
      collectUrl,
    }
  }

  // Re-render preview whenever state changes
  useEffect(() => {
    if (!previewRef.current) return
    renderCard(previewRef.current, PW, PH, buildOpts())
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bgKey, bgImageEl, logoEl, qrColor, topText, bottomText, showTopText, showBottomText])

  // ── Downloads ─────────────────────────────────────────────────────────────

  async function downloadPng() {
    setDownloading('png')
    try {
      const c = document.createElement('canvas')
      await renderCard(c, DW, DH, buildOpts())
      const a = document.createElement('a')
      a.download = `carte-${restaurantName.toLowerCase().replace(/\s+/g, '-')}.png`
      a.href = c.toDataURL('image/png'); a.click()
    } finally { setDownloading(null) }
  }

  async function downloadPdf() {
    setDownloading('pdf')
    try {
      const c = document.createElement('canvas')
      await renderCard(c, A6W, A6H, buildOpts())
      const { jsPDF } = await import('jspdf')
      const pdf = new jsPDF({ format: 'a6', unit: 'mm', orientation: 'portrait' })
      pdf.addImage(c.toDataURL('image/png'), 'PNG', 0, 0, 105, 148)
      pdf.save(`carte-${restaurantName.toLowerCase().replace(/\s+/g, '-')}.pdf`)
    } finally { setDownloading(null) }
  }

  async function downloadQrOnly() {
    setDownloading('qr')
    try {
      const qc = await generateQR(collectUrl, 1000, qrColor, logoEl)
      const a = document.createElement('a')
      a.download = `qrcode-${restaurantName.toLowerCase().replace(/\s+/g, '-')}.png`
      a.href = qc.toDataURL('image/png'); a.click()
    } finally { setDownloading(null) }
  }

  // ── File handlers ─────────────────────────────────────────────────────────

  function handleBgUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    const r = new FileReader()
    r.onload = ev => { setBgImageDataUrl(ev.target?.result as string) }
    r.readAsDataURL(file); e.target.value = ''
  }

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    setLogoName(file.name)
    const r = new FileReader()
    r.onload = ev => setLogoDataUrl(ev.target?.result as string)
    r.readAsDataURL(file); e.target.value = ''
  }

  // ── Toggle component ──────────────────────────────────────────────────────

  function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
    return (
      <button
        onClick={onToggle}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 text-xs font-semibold transition-all shrink-0',
          on
            ? 'bg-indigo-600 border-indigo-600 text-white'
            : 'bg-white border-slate-300 text-slate-500 hover:border-slate-400'
        )}
      >
        <span className={cn('w-2 h-2 rounded-full shrink-0', on ? 'bg-white' : 'bg-slate-300')} />
        {on ? 'Affiché' : 'Masqué'}
      </button>
    )
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* Two-column layout: preview | options */}
      <div className="grid grid-cols-1 lg:grid-cols-[auto,1fr] gap-6 items-start">

        {/* ── Preview ─────────────────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest self-start">
            Aperçu
          </p>

          {/* Card shadow wrapper */}
          <div className="relative">
            {/* Multiple shadows for depth effect */}
            <div className="absolute inset-0 translate-y-4 blur-2xl bg-black/20 rounded-3xl" />
            <canvas
              ref={previewRef}
              width={PW}
              height={PH}
              className="relative block rounded-2xl border border-white/20 shadow-2xl"
              style={{ width: 300, height: 400 }}
            />
          </div>

          <p className="text-xs text-slate-400">Format carte A6 — prêt à imprimer</p>
        </div>

        {/* ── Customization panel ──────────────────────────────────────── */}
        <div className="space-y-4 min-w-0">

          {/* FOND */}
          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-800">🎨 Fond de carte</h3>

            {/* Color + gradient grid */}
            <div className="grid grid-cols-6 gap-2">
              {BG_PRESETS.map(({ key, label, swatch }) => (
                <button
                  key={key}
                  title={label}
                  onClick={() => { setBgKey(key); setBgImageDataUrl(null) }}
                  className={cn(
                    'aspect-square rounded-xl border-2 transition-all duration-150',
                    bgKey === key && !bgImageEl
                      ? 'border-indigo-500 scale-110 shadow-lg shadow-indigo-200'
                      : 'border-transparent hover:border-slate-300 hover:scale-105'
                  )}
                  style={{ background: swatch }}
                />
              ))}
            </div>

            {/* Image upload / preview */}
            {bgImageDataUrl ? (
              <div className={cn(
                'flex items-center gap-3 p-3 rounded-xl border-2 transition-colors',
                bgImageEl ? 'border-indigo-300 bg-indigo-50/40' : 'border-slate-100 bg-slate-50'
              )}>
                <img
                  src={bgImageDataUrl} alt=""
                  className="w-10 h-14 object-cover rounded-lg border border-slate-200 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700">Image personnalisée</p>
                  <p className="text-xs text-slate-400 mt-0.5">Recadrée automatiquement en 3:4</p>
                </div>
                <button
                  onClick={() => { setBgImageDataUrl(null); setBgImageEl(null) }}
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <label className="flex items-center gap-3 p-3 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-colors group">
                <div className="w-10 h-14 rounded-lg bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center text-xl transition-colors shrink-0">
                  📸
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700 group-hover:text-indigo-600 transition-colors">
                    Image de fond personnalisée
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">JPG, PNG, WebP — recadrée en 3:4</p>
                </div>
                <input type="file" accept="image/*" onChange={handleBgUpload} className="sr-only" />
              </label>
            )}
          </section>

          {/* QR CODE */}
          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-800">◻ QR Code</h3>

            {/* QR color */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-500">Couleur des points</p>
              <div className="flex items-center gap-3 flex-wrap">
                <label className="relative cursor-pointer">
                  <div
                    className="w-10 h-10 rounded-xl border-2 border-slate-200 shadow-sm hover:scale-105 transition-transform"
                    style={{ background: qrColor }}
                  />
                  <input
                    type="color" value={qrColor}
                    onChange={e => setQrColor(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </label>
                {/* Quick swatches */}
                <div className="flex gap-2">
                  {['#0f172a', '#ffffff', '#4f46e5', '#dc2626', '#c9993a'].map(c => (
                    <button
                      key={c}
                      onClick={() => setQrColor(c)}
                      className={cn(
                        'w-8 h-8 rounded-lg border-2 transition-all',
                        qrColor === c ? 'border-indigo-500 scale-110' : 'border-slate-200 hover:scale-105'
                      )}
                      style={{ background: c }}
                    />
                  ))}
                </div>
                <code className="text-xs font-mono text-slate-400 uppercase">{qrColor}</code>
              </div>
            </div>

            {/* Logo */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-500">Logo au centre du QR</p>
              {logoDataUrl ? (
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                    <img src={logoDataUrl} alt="Logo" className="w-7 h-7 object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{logoName}</p>
                    <p className="text-xs text-slate-400">Affiché dans un cercle blanc</p>
                  </div>
                  <button
                    onClick={() => { setLogoDataUrl(null); setLogoEl(null); setLogoName(null) }}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <label className="flex items-center gap-3 p-3 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-colors group">
                  <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center text-lg transition-colors shrink-0">
                    ✦
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700 group-hover:text-indigo-600 transition-colors">
                      Ajouter un logo
                    </p>
                    <p className="text-xs text-slate-400">PNG avec fond transparent recommandé</p>
                  </div>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="sr-only" />
                </label>
              )}
            </div>
          </section>

          {/* TEXTES */}
          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-5">
            <h3 className="text-sm font-semibold text-slate-800">✏️ Textes</h3>

            {/* Top text */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-medium text-slate-700">Texte au-dessus du QR</p>
                <Toggle on={showTopText} onToggle={() => setShowTopText(v => !v)} />
              </div>
              {showTopText && (
                <div className="relative">
                  <input
                    type="text"
                    value={topText}
                    onChange={e => setTopText(e.target.value.slice(0, 40))}
                    placeholder="Votre avis compte !"
                    className="w-full px-3 py-2 pr-12 border border-slate-200 rounded-xl text-sm
                               focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-300 tabular-nums">
                    {topText.length}/40
                  </span>
                </div>
              )}
            </div>

            {/* Bottom text */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-medium text-slate-700">Texte en bas du QR</p>
                <Toggle on={showBottomText} onToggle={() => setShowBottomText(v => !v)} />
              </div>
              {showBottomText && (
                <div className="relative">
                  <input
                    type="text"
                    value={bottomText}
                    onChange={e => setBottomText(e.target.value.slice(0, 40))}
                    placeholder={restaurantName}
                    className="w-full px-3 py-2 pr-12 border border-slate-200 rounded-xl text-sm
                               focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-300 tabular-nums">
                    {bottomText.length}/40
                  </span>
                </div>
              )}
            </div>
          </section>

        </div>
      </div>

      {/* ── Download buttons ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={downloadPng} disabled={!!downloading}
          className="flex flex-col items-center justify-center gap-1 py-4 rounded-xl
                     bg-slate-900 text-white hover:bg-slate-700
                     disabled:opacity-60 disabled:cursor-wait transition-colors"
        >
          <span className="text-xl">{downloading === 'png' ? '⏳' : '🖼️'}</span>
          <span className="text-sm font-semibold">Carte PNG</span>
          <span className="text-xs text-slate-400">1200 × 1600 px</span>
        </button>

        <button
          onClick={downloadPdf} disabled={!!downloading}
          className="flex flex-col items-center justify-center gap-1 py-4 rounded-xl
                     bg-indigo-600 text-white hover:bg-indigo-700
                     disabled:opacity-60 disabled:cursor-wait transition-colors"
        >
          <span className="text-xl">{downloading === 'pdf' ? '⏳' : '📄'}</span>
          <span className="text-sm font-semibold">Carte PDF</span>
          <span className="text-xs text-indigo-300">Format A6</span>
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

      {/* Hint */}
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
        <span className="text-lg shrink-0 mt-0.5">💡</span>
        <p className="text-sm text-amber-800 leading-relaxed">
          Le <strong>PDF A6</strong> est prêt pour l&apos;impression sur chevalet de table.
          Utilisez <strong>PNG</strong> pour afficher sur un écran ou envoyer par email.
        </p>
      </div>

    </div>
  )
}
