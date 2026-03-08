'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { User } from '@supabase/supabase-js'

interface Props {
  user: User
}

const navLinks = [
  { href: '/dashboard', label: 'Tableau de bord' },
  { href: '/feedbacks', label: 'Avis' },
  { href: '/settings', label: 'Paramètres' },
]

export default function DashboardNav({ user }: Props) {
  const pathname = usePathname()

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="font-bold text-xl text-indigo-600">
              ReviewBoost
            </Link>
            <div className="flex gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    pathname === link.href
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{user.email}</span>
            <form action="/api/auth" method="post">
              <input type="hidden" name="action" value="logout" />
              <button
                type="submit"
                className="text-sm text-gray-600 hover:text-gray-900 font-medium"
              >
                Déconnexion
              </button>
            </form>
          </div>
        </div>
      </div>
    </nav>
  )
}
