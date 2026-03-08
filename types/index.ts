export interface Establishment {
  id: string
  user_id: string
  name: string
  short_code: string
  google_review_url: string | null
  current_rating: number | null
  total_reviews: number
  created_at: string
}

export interface Feedback {
  id: string
  establishment_id: string
  rating: number
  comment: string | null
  customer_email: string | null
  redirected_to_google: boolean
  created_at: string
}

export interface Scan {
  id: string
  establishment_id: string
  scanned_at: string
}

export type FeedbackWithEstablishment = Feedback & {
  establishment: Pick<Establishment, 'name' | 'short_code'>
}

export type EstablishmentWithStats = Establishment & {
  feedbacks: { count: number }[]
  scans: { count: number }[]
}
