'use client'

import { createContext, useContext } from 'react'

export type RestaurantCtx = {
  id: string
  name: string
  short_code: string
  google_review_url: string | null
} | null

const RestaurantContext = createContext<RestaurantCtx>(null)

export function RestaurantProvider({
  restaurant,
  children,
}: {
  restaurant: RestaurantCtx
  children: React.ReactNode
}) {
  return (
    <RestaurantContext.Provider value={restaurant}>
      {children}
    </RestaurantContext.Provider>
  )
}

export function useRestaurant() {
  return useContext(RestaurantContext)
}
