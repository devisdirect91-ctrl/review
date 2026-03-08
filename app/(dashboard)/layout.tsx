import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import { RestaurantProvider } from '@/lib/context/restaurant-context'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: restaurant } = await supabase
    .from('establishments')
    .select('id, name, short_code, google_review_url')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .single()

  const restaurantCtx = restaurant ?? null

  return (
    <RestaurantProvider restaurant={restaurantCtx}>
      <div className="min-h-screen bg-slate-50">
        <Sidebar restaurant={restaurantCtx} userEmail={user.email ?? ''} />

        {/* Offset desktop → ml-60 ; mobile → pas d'offset (sidebar absente) */}
        <main className="md:ml-60 min-h-screen">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </RestaurantProvider>
  )
}
