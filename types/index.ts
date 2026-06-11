export type UserRole = 'advertiser' | 'media_owner' | 'admin'
export type ScreenType = 'billboard' | 'mall' | 'transit' | 'airport' | 'retail'
export type ScreenStatus = 'pending' | 'active' | 'suspended'
export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed'
export type PaymentStatus = 'pending' | 'paid' | 'refunded'
export type PayoutStatus = 'pending' | 'processing' | 'completed'
export type NotificationType = 'booking' | 'payment' | 'approval' | 'system'

export interface Profile {
  id: string
  full_name: string | null
  company_name: string | null
  phone: string | null
  role: UserRole
  avatar_url: string | null
  is_verified: boolean
  created_at: string
}

export interface Screen {
  id: string
  owner_id: string
  name: string
  description: string | null
  screen_type: ScreenType
  status: ScreenStatus
  width_meters: number | null
  height_meters: number | null
  resolution_width: number | null
  resolution_height: number | null
  latitude: number
  longitude: number
  address: string
  city: string
  area: string | null
  operating_hours_start: string
  operating_hours_end: string
  price_per_day: number
  price_per_week: number | null
  price_per_month: number | null
  is_featured: boolean
  created_at: string
  screen_images?: ScreenImage[]
  profiles?: Profile
}

export interface ScreenImage {
  id: string
  screen_id: string
  url: string
  is_primary: boolean
  created_at: string
}

export interface Booking {
  id: string
  reference: string
  advertiser_id: string
  screen_id: string
  status: BookingStatus
  start_date: string
  end_date: string
  total_days: number
  amount_subtotal: number
  platform_fee: number
  amount_total: number
  creative_url: string | null
  creative_format: string | null
  payment_status: PaymentStatus
  payment_reference: string | null
  notes: string | null
  created_at: string
  screens?: Screen
  profiles?: Profile
}

export interface Payment {
  id: string
  booking_id: string
  advertiser_id: string
  amount: number
  currency: string
  method: 'mpesa' | 'card'
  provider_reference: string | null
  status: 'pending' | 'completed' | 'failed'
  created_at: string
}

export interface Payout {
  id: string
  media_owner_id: string
  booking_id: string
  gross_amount: number
  platform_fee: number
  net_amount: number
  status: PayoutStatus
  payout_method: string | null
  payout_reference: string | null
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: NotificationType
  is_read: boolean
  created_at: string
}
