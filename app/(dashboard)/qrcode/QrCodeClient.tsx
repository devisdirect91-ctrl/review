'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { cn } from '@/lib/utils'

interface Props {
  collectUrl: string
  restaurantName: string
}

const DEFAULT_DARK   = '#0f172a'
const DEFAULT_LIGHT  = '#ffffff'
const DEFAULT_PHRASE = 'VOTRE AVIS COMPTE'
const LOGO_RATIO     = 0.26
const BANNER_RATIO   = 0.22   // hauteur bannière = 22% de la largeur du QR

const PHRASE_PRESETS = [
  'VOTRE AVIS COMPTE',
  'DONNEZ VOTRE AVIS',
  'PARTAGEZ VOTRE EXPÉRIENCE',
  'NOTEZ-NOUS !',
  'UN MOT SUR VOTRE REPAS ?',
]

// ── Rendu composite : bannière restaurant + QR + logo ─────────────────────

async function renderToCanvas(
  canvas: HTMLCanvasElement,
  url: string,
  qrSize: number,
  dark: string,
  light: string,
  logoDataUrl: string | null,
  phrase: string,
) {
  const bannerH = Math.round(qrSize * BANNER_RATIO)
  const totalH  = bannerH + qrSize

  // 1. QR sur canvas temporaire
  const tempQr = document.createElement('canvas')
  await QRCode.toCanvas(tempQr, url, {
    width: qrSize,
    margin: 2,
    errorCorrectionLevel: 'H',
    color: { dark, light },
  })

  // 2. Canvas final
  canvas.width  = qrSize
  canvas.height = totalH
  const ctx = canvas.getContext('2d')!

  // Fond global
  ctx.fillStyle = light
  ctx.fillRect(0, 0, qrSize, totalH)

  // ── Bannière ─────────────────────────────────────────────────────────────

  // Dégradé bordeaux
  const grad = ctx.createLinearGradient(0, 0, 0, bannerH)
  grad.addColorStop(0, '#5c1414')
  grad.addColorStop(1, '#7f1d1d')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, qrSize, bannerH)

  const gold        = '#c9993a'
  const lineMargin  = Math.round(qrSize * 0.055)
  const lineThick   = Math.max(1, Math.round(qrSize / 180))
  const lineY1      = Math.round(bannerH * 0.17)
  const lineY2      = bannerH - lineY1

  // Lignes dorées
  ctx.strokeStyle = gold
  ctx.lineWidth   = lineThick
  ctx.beginPath(); ctx.moveTo(lineMargin, lineY1); ctx.lineTo(qrSize - lineMargin, lineY1); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(lineMargin, lineY2); ctx.lineTo(qrSize - lineMargin, lineY2); ctx.stroke()

  // Losanges aux coins des lignes
  const ds = lineThick * 3.5
  function diamond(x: number, y: number) {
    ctx.fillStyle = gold
    ctx.beginPath()
    ctx.moveTo(x, y - ds); ctx.lineTo(x + ds, y)
    ctx.lineTo(x, y + ds); ctx.lineTo(x - ds, y)
    ctx.closePath(); ctx.fill()
  }
  diamond(lineMargin, lineY1); diamond(qrSize - lineMargin, lineY1)
  diamond(lineMargin, lineY2); diamond(qrSize - lineMargin, lineY2)

  // Texte centré, auto-sizing
  const maxW    = qrSize - lineMargin * 5
  const centerY = (lineY1 + lineY2) / 2
  const text    = (phrase.trim() || DEFAULT_PHRASE).toUpperCase()

  let fontSize = Math.round((lineY2 - lineY1) * 0.50)
  ctx.textAlign    = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = `bold ${fontSize}px Georgia, 'Times New Roman', serif`

  while (ctx.measureText(text).width > maxW && fontSize > 6) {
    fontSize--
    ctx.font = `bold ${fontSize}px Georgia, 'Times New Roman', serif`
  }

  // Légère ombre portée dorée pour la profondeur
  ctx.shadowColor   = 'rgba(0,0,0,0.4)'
  ctx.shadowBlur    = Math.round(fontSize * 0.15)
  ctx.shadowOffsetY = Math.round(fontSize * 0.05)
  ctx.fillStyle = gold
  ctx.fillText(text, qrSize / 2, centerY)
  ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0

  // ── QR ───────────────────────────────────────────────────────────────────
  ctx.drawImage(tempQr, 0, bannerH)

  // ── Logo ─────────────────────────────────────────────────────────────────
  if (!logoDataUrl) return

  const logoSize = Math.round(qrSize * LOGO_RATIO)
  const logoX    = Math.round((qrSize - logoSize) / 2)
  const logoY    = bannerH + Math.round((qrSize - logoSize) / 2)
  const pad      = Math.round(logoSize * 0.12)

  ctx.fillStyle = light
  ctx.beginPath()
  ctx.roundRect(logoX - pad, logoY - pad, logoSize + pad * 2, logoSize + pad * 2, pad)
  ctx.fill()

  const img = new Image()
  await new Promise<void>((resolve, reject) => {
    img.onload = () => { ctx.drawImage(img, logoX, logoY, logoSize, logoSize); resolve() }
    img.onerror = reject
    img.src = logoDataUrl
  })
}

// ── Composant ──────────────────────────────────────────────────────────────

export default function QrCodeClient({ collectUrl, restaurantName }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [phrase,      setPhrase]      = useState(DEFAULT_PHRASE)
  const [darkColor,   setDarkColor]   = useState(DEFAULT_DARK)
  const [lightColor,  setLightColor]  = useState(DEFAULT_LIGHT)
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null)
  const [logoFileName, setLogoFileName] = useState<string | null>(null)

  const [copied,     setCopied]     = useState(false)
  const [pngLoading, setPngLoading] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)

  const isCustomized =
    phrase !== DEFAULT_PHRASE ||
    darkColor !== DEFAULT_DARK ||
    lightColor !== DEFAULT_LIGHT ||
    !!logoDataUrl

  // Redessine à chaque changement
  useEffect(() => {
    if (!canvasRef.current) return
    renderToCanvas(canvasRef.current, collectUrl, 256, darkColor, lightColor, logoDataUrl, phrase)
  }, [collectUrl, phrase, darkColor, lightColor, logoDataUrl])

  const getHighResDataUrl = useCallback(async () => {
    const offscreen = document.createElement('canvas')
    await renderToCanvas(offscreen, collectUrl, 1024, darkColor, lightColor, logoDataUrl, phrase)
    return offscreen.toDataURL('image/png')
  }, [collectUrl, phrase, darkColor, lightColor, logoDataUrl])

  // ── Actions ───────────────────────────────────────────────────────────────

  async function copyUrl() {
    await navigator.clipboard.writeText(collectUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoFileName(file.name)
    const reader = new FileReader()
    reader.onload = (ev) => setLogoDataUrl(ev.target?.result as string)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  async function downloadPng() {
    setPngLoading(true)
    try {
      const dataUrl = await getHighResDataUrl()
      const link = document.createElement('a')
      link.download = `qrcode-${restaurantName.toLowerCase().replace(/\s+/g, '-')}.png`
      link.href = dataUrl
      link.click()
    } finally {
      setPngLoading(false)
    }
  }

  async function downloadPdf() {
    setPdfLoading(true)
    try {
      const dataUrl = await getHighResDataUrl()
      const { jsPDF } = await import('jspdf')
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const W = pdf.internal.pageSize.getWidth()

      // En-tête
      pdf.setFillColor(15, 23, 42)
      pdf.rect(0, 0, W, 28, 'F')
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(18)
      pdf.setFont('helvetica', 'bold')
      pdf.text(restaurantName, W / 2, 17, { align: 'center' })

      // Image composite (bannière + QR) — ratio hauteur = 1 + BANNER_RATIO
      const imgW = 100
      const imgH = Math.round(imgW * (1 + BANNER_RATIO))   // ~122 mm
      pdf.addImage(dataUrl, 'PNG', (W - imgW) / 2, 36, imgW, imgH)

      const afterImg = 36 + imgH + 8   // ~166 mm

      pdf.setTextColor(15, 23, 42)
      pdf.setFontSize(13)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Scannez pour donner votre avis', W / 2, afterImg, { align: 'center' })

      pdf.setFontSize(8)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(100, 116, 139)
      pdf.text(collectUrl, W / 2, afterImg + 9, { align: 'center' })

      pdf.setDrawColor(226, 232, 240)
      pdf.line(20, 260, W - 20, 260)
      pdf.setFontSize(8)
      pdf.setTextColor(148, 163, 184)
      pdf.text('Powered by ReviewBoost', W / 2, 267, { align: 'center' })

      pdf.save(`qrcode-${restaurantName.toLowerCase().replace(/\s+/g, '-')}.pdf`)
    } finally {
      setPdfLoading(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* ── Aperçu ───────────────────────────────────────────────────────── */}
      <div className="flex justify-center">
        <div className="inline-block rounded-2xl shadow-xl overflow-hidden border border-slate-200">
          <canvas ref={canvasRef} className="block" />
        </div>
      </div>

      {/* ── Panneau de personnalisation ──────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-100">

        {/* Phrase d'incitation */}
        <div className="p-5 space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Phrase d&apos;incitation</h3>
            <p className="text-xs text-slate-400 mt-0.5">Affichée dans la bannière au-dessus du QR code</p>
          </div>

          <div className="relative">
            <input
              type="text"
              value={phrase}
              onChange={(e) => setPhrase(e.target.value.slice(0, 35))}
              placeholder={DEFAULT_PHRASE}
              className="w-full px-4 py-2.5 pr-14 border border-slate-200 rounded-xl text-sm
                         font-bold uppercase tracking-widest text-center text-slate-800
                         focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none
                         placeholder:font-normal placeholder:tracking-normal placeholder:normal-case
                         placeholder:text-slate-300"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-300 tabular-nums">
              {phrase.length}/35
            </span>
          </div>

          {/* Suggestions */}
          <div className="flex gap-2 flex-wrap">
            {PHRASE_PRESETS.map((preset) => (
              <button
                key={preset}
                onClick={() => setPhrase(preset)}
                className={cn(
                  'px-2.5 py-1 text-xs rounded-lg border transition-colors',
                  phrase === preset
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-semibold'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
                )}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Couleurs */}
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">Couleurs du QR</h3>
            {(darkColor !== DEFAULT_DARK || lightColor !== DEFAULT_LIGHT) && (
              <button
                onClick={() => { setDarkColor(DEFAULT_DARK); setLightColor(DEFAULT_LIGHT) }}
                className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
              >
                ↩ Réinitialiser
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Points du QR', value: darkColor, set: setDarkColor },
              { label: 'Fond',         value: lightColor, set: setLightColor },
            ].map(({ label, value, set }) => (
              <div key={label} className="space-y-2">
                <p className="text-xs text-slate-500 font-medium">{label}</p>
                <div className="flex items-center gap-3">
                  <label className="relative cursor-pointer shrink-0">
                    <div
                      className="w-10 h-10 rounded-xl border-2 border-slate-200 shadow-sm
                                 transition-transform hover:scale-105"
                      style={{ background: value }}
                    />
                    <input
                      type="color" value={value}
                      onChange={(e) => set(e.target.value)}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    />
                  </label>
                  <code className="text-xs text-slate-400 font-mono uppercase">{value}</code>
                </div>
              </div>
            ))}
          </div>

          {/* Palettes rapides */}
          <div>
            <p className="text-xs text-slate-400 mb-2">Palettes rapides</p>
            <div className="flex gap-2 flex-wrap">
              {[
                { dark: '#0f172a', light: '#ffffff', label: 'Défaut' },
                { dark: '#4f46e5', light: '#eef2ff', label: 'Indigo' },
                { dark: '#059669', light: '#ecfdf5', label: 'Vert' },
                { dark: '#dc2626', light: '#fef2f2', label: 'Rouge' },
                { dark: '#92400e', light: '#fffbeb', label: 'Ambre' },
                { dark: '#1e293b', light: '#f8fafc', label: 'Slate' },
              ].map(({ dark, light, label }) => (
                <button
                  key={label}
                  onClick={() => { setDarkColor(dark); setLightColor(light) }}
                  title={label}
                  className="w-8 h-8 rounded-lg border-2 border-white shadow-md
                             hover:scale-110 transition-transform"
                  style={{ background: `linear-gradient(135deg, ${dark} 50%, ${light} 50%)` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Logo */}
        <div className="p-5 space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Logo central</h3>
            <p className="text-xs text-slate-400 mt-0.5">PNG avec fond transparent recommandé</p>
          </div>

          {logoDataUrl ? (
            <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
              <img
                src={logoDataUrl} alt="Logo"
                className="w-14 h-14 rounded-lg object-contain border border-slate-200 bg-white p-1 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">{logoFileName}</p>
                <p className="text-xs text-slate-400 mt-0.5">Affiché au centre du QR code</p>
              </div>
              <button
                onClick={() => { setLogoDataUrl(null); setLogoFileName(null) }}
                className="shrink-0 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <label className="flex items-center gap-4 px-4 py-4 border-2 border-dashed border-slate-200
                              rounded-xl cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/40
                              transition-colors group">
              <div className="w-12 h-12 rounded-xl bg-slate-100 group-hover:bg-indigo-100
                              flex items-center justify-center text-2xl transition-colors shrink-0">
                🖼️
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700 group-hover:text-indigo-600 transition-colors">
                  Choisir un logo
                </p>
                <p className="text-xs text-slate-400 mt-0.5">PNG, JPG, WebP, SVG</p>
              </div>
              <input
                type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={handleLogoUpload} className="sr-only"
              />
            </label>
          )}
        </div>
      </div>

      {/* ── URL + Copier ─────────────────────────────────────────────────── */}
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

      {/* ── Téléchargements ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={downloadPng} disabled={pngLoading}
          className="flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm
                     bg-slate-900 text-white hover:bg-slate-700
                     disabled:opacity-60 disabled:cursor-wait transition-colors"
        >
          {pngLoading ? <span className="animate-spin inline-block">⏳</span> : '🖼️'}
          Télécharger PNG
        </button>
        <button
          onClick={downloadPdf} disabled={pdfLoading}
          className="flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm
                     bg-indigo-600 text-white hover:bg-indigo-700
                     disabled:opacity-60 disabled:cursor-wait transition-colors"
        >
          {pdfLoading ? <span className="animate-spin inline-block">⏳</span> : '📄'}
          Télécharger PDF
        </button>
      </div>

      {isCustomized && (
        <p className="text-center text-xs text-indigo-500">
          ✦ Personnalisation appliquée au téléchargement
        </p>
      )}

      <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-4">
        <span className="text-xl shrink-0 mt-0.5">💡</span>
        <p className="text-sm text-amber-800 leading-relaxed">
          Imprimez et plastifiez ce QR code pour le placer sur vos tables.
          La bannière bordeaux et dorée est incluse dans le fichier téléchargé.
        </p>
      </div>

    </div>
  )
}
