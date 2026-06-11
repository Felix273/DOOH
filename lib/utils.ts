import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'KES') {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

export function calculateBookingAmount(pricePerDay: number, totalDays: number) {
  const subtotal = pricePerDay * totalDays
  const platformFee = subtotal * 0.12
  const total = subtotal + platformFee
  return { subtotal, platformFee, total }
}

export function generateBookingReference() {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `DOOH-${timestamp}-${random}`
}

export function getScreenTypeLabel(type: string) {
  const labels: Record<string, string> = {
    billboard: 'Billboard',
    mall: 'Mall Screen',
    transit: 'Transit',
    airport: 'Airport',
    retail: 'Retail Media',
  }
  return labels[type] || type
}

export function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800',
    approved: 'bg-green-100 text-green-800',
    active: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800',
    completed: 'bg-blue-100 text-blue-800',
    suspended: 'bg-red-100 text-red-800',
    paid: 'bg-green-100 text-green-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}
