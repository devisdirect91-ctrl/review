'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { logout } from '@/app/(dashboard)/actions'
import type { RestaurantCtx } from '@/lib/context/restaurant-context'

const NAV = [
  { href: '/dashboard', icon: '📊', label: 'Dashboard' },
  { href: '/feedbacks', icon: '💬', label: 'Feedbacks' },
  { href: '/qrcode',   icon: '📱', label: 'QR Code' },
  { href: '/settings', icon: '⚙️', label: 'Paramètres' },
]

interface Props {
  restaurant: RestaurantCtx
  userEmail: string
}

export default function Sidebar({ restaurant, userEmail }: Props) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems = (
    <ul className="flex-1 space-y-1 px-3 py-4">
      {NAV.map(({ href, icon, label }) => {
        const active = pathname === href || pathname.startsWith(href + '/')
        return (
          <li key={href}>
            <Link
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              )}
            >
              <span className="text-base leading-none">{icon}</span>
              {label}
            </Link>
          </li>
        )
      })}
    </ul>
  )

  const restaurantBadge = (
    <div className="mx-3 mb-4 px-3 py-2.5 rounded-lg bg-slate-800">
      <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-0.5">
        Établissement
      </p>
      <p className="text-sm text-white font-semibold truncate">
        {restaurant?.name ?? '—'}
      </p>
    </div>
  )

  const logoutButton = (
    <div className="px-3 pb-4">
      <form action={logout}>
        <button
          type="submit"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                     font-medium text-slate-400 hover:text-red-400 hover:bg-slate-800
                     transition-colors text-left"
        >
          <span className="text-base leading-none">🚪</span>
          Déconnexion
        </button>
      </form>
      <p className="mt-2 px-3 text-xs text-slate-600 truncate">{userEmail}</p>
    </div>
  )

  return (
    <>
      {/* ── Desktop sidebar ──────────────────────────────────── */}
      <aside className="hidden md:flex flex-col fixed inset-y-0 left-0 w-60 bg-slate-900">
        {/* Logo */}
        <div className="flex items-center gap-2 px-6 h-16 shrink-0 border-b border-slate-800">
          <span className="text-xl">⭐</span>
          <span className="font-bold text-white text-lg">ReviewBoost</span>
        </div>

        {/* Nav */}
        {navItems}

        {/* Restaurant badge + logout */}
        {restaurantBadge}
        {logoutButton}
      </aside>

      {/* ── Mobile header ────────────────────────────────────── */}
      <header className="md:hidden sticky top-0 z-30 flex items-center justify-between
                         h-14 px-4 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">⭐</span>
          <span className="font-bold text-white">ReviewBoost</span>
        </div>
        <button
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Menu"
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          {mobileOpen ? (
            // X
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            // Hamburger
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </header>

      {/* Mobile menu (slide-down) */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-x-0 top-14 z-20 bg-slate-900 border-b border-slate-800
                        flex flex-col shadow-xl">
          {navItems}
          {restaurantBadge}
          {logoutButton}
        </div>
      )}
    </>
  )
}
