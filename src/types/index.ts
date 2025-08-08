export interface User {
  id: string
  name?: string | null
  email: string
  role: 'BUYER' | 'SELLER' | 'ADMIN'
  image?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Listing {
  id: string
  title: string
  description: string
  category: 'WATCH' | 'BAG' | 'JEWELRY'
  brand?: string | null
  model?: string | null
  year?: number | null
  condition: 'NEW' | 'EXCELLENT' | 'GOOD' | 'FAIR'
  startingPrice: number
  reservePrice?: number | null
  currentPrice: number
  images: string // JSON string for SQLite
  status: 'ACTIVE' | 'SOLD' | 'EXPIRED' | 'CANCELLED'
  endDate: Date
  createdAt: Date
  updatedAt: Date
  sellerId: string
  seller: User
  bids: Bid[]
}

export interface Bid {
  id: string
  amount: number
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED'
  createdAt: Date
  updatedAt: Date
  bidderId: string
  bidder: User
  listingId: string
  listing: Listing
}

export interface Message {
  id: string
  content: string
  isRead: boolean
  createdAt: Date
  senderId: string
  sender: User
  listingId: string
  listing: Listing
}

export interface Review {
  id: string
  rating: number
  comment?: string | null
  createdAt: Date
  reviewerId: string
  reviewer: User
  listingId: string
  listing: Listing
}

export interface Notification {
  id: string
  title: string
  message: string
  isRead: boolean
  type: string
  createdAt: Date
  userId: string
  user: User
}
