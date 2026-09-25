"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import AppShell from "@/app/components/AppShell"
import { createClient } from "@/lib/supabase/client"
import { formatCurrency, formatDate } from "@/lib/utils"

type Relation<T> = T | T[] | null | undefined
type BookingScreen = { id: string; name: string; city: string; area: string | null }
type AdvertiserBooking = {
  id: string
  reference: string
  status: string
  start_date: string
  end_date: string
  amount_total: number
  payment_status: string
  creative_url: string | null
  created_at: string
  screens?: Relation<BookingScreen>
}

function firstRelation<T>(relation: Relation<T>): T | null {
  if (!relation) return null
  return Array.isArray(relation) ? relation[0] ?? null : relation
}

function statusClass(status: string) {
  if (status === "approved" || status === "paid") return "badge badge-live"
  if (status === "pending") return "badge badge-accent"
  return "badge badge-draft"
}

export default function AdvertiserBookingsPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [bookings, setBookings] = useState<AdvertiserBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")
  const [paymentForm, setPaymentForm] = useState({
    bookingId: "",
    method: "mpesa",
    reference: "",
  })

  const loadBookings = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push("/login")
      return
    }

    const { data } = await supabase
      .from("bookings")
      .select("id, reference, status, start_date, end_date, amount_total, payment_status, creative_url, created_at, screens(id, name, city, area)")
      .eq("advertiser_id", user.id)
      .order("created_at", { ascending: false })

    setBookings(data ?? [])
    setLoading(false)
  }, [router, supabase])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      loadBookings()
    }, 0)

    return () => window.clearTimeout(timeout)
  }, [loadBookings])

  const cancelBooking = async (id: string) => {
    setMessage("")
    const { error } = await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", id)

    if (error) {
      setMessage(error.message.includes("campaign start date") ? "Approved bookings can only be cancelled before the campaign starts." : "We could not cancel this booking. Please try again.")
      return
    }

    setMessage("Booking cancelled successfully.")
    await loadBookings()
  }

  const submitPayment = async (event: React.FormEvent) => {
    event.preventDefault()
    setMessage("")
    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData.session?.access_token

    const response = await fetch("/api/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bookingId: paymentForm.bookingId,
        method: paymentForm.method,
        reference: paymentForm.reference,
      }),
    })

    const data = await response.json().catch(() => null)
    if (!response.ok) {
      setMessage(data?.error ?? "Could not submit payment reference")
      return
    }

    setMessage("Payment reference submitted. Admin will verify and mark the booking paid.")
    setPaymentForm({ bookingId: "", method: "mpesa", reference: "" })
    await loadBookings()
  }

  return (
    <AppShell
      eyebrow="Advertiser"
      title="Your campaign bookings"
      description="Track booking requests, approvals, payment state, and campaign dates across your selected screens."
      actions={<Link href="/screens" className="btn btn-primary">Browse screens</Link>}
    >
      {message && (
        <div style={{ padding: "10px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-default)", color: "var(--text-secondary)", marginBottom: 16 }}>
          {message}
        </div>
      )}

      {loading ? (
        <div className="card" style={{ padding: "var(--space-10)", color: "var(--text-muted)" }}>Loading bookings...</div>
      ) : bookings.length === 0 ? (
        <div className="card" style={{ padding: "var(--space-16)", textAlign: "center" }}>
          <h2 className="t-heading" style={{ marginBottom: 8 }}>No bookings yet</h2>
          <p className="t-body" style={{ margin: "0 auto 24px", maxWidth: 460 }}>
            Browse active inventory and request your first DOOH placement.
          </p>
          <Link href="/screens" className="btn btn-primary">Browse screens</Link>
        </div>
      ) : (
        <>
          {bookings.some(booking => booking.status === "approved" && booking.payment_status === "pending") && (
            <form onSubmit={submitPayment} className="card" style={{ padding: "var(--space-5)", marginBottom: 16 }}>
              <h2 className="t-heading" style={{ marginBottom: 8 }}>Submit M-Pesa or bank payment</h2>
              <p className="t-body-sm" style={{ marginBottom: 16 }}>
                Pay using your agreed channel, then submit the transaction or bank reference for admin verification.
              </p>
              <div className="responsive-grid responsive-grid-3">
                <select
                  className="input"
                  value={paymentForm.bookingId}
                  onChange={event => setPaymentForm({ ...paymentForm, bookingId: event.target.value })}
                  required
                >
                  <option value="">Choose approved booking</option>
                  {bookings
                    .filter(booking => booking.status === "approved" && booking.payment_status === "pending")
                    .map(booking => (
                      <option key={booking.id} value={booking.id}>{booking.reference} · {formatCurrency(Number(booking.amount_total))}</option>
                    ))}
                </select>
                <select
                  className="input"
                  value={paymentForm.method}
                  onChange={event => setPaymentForm({ ...paymentForm, method: event.target.value })}
                >
                  <option value="mpesa">M-Pesa reference</option>
                  <option value="bank_transfer">Bank transfer reference</option>
                  <option value="card">Card/manual reference</option>
                </select>
                <input
                  className="input"
                  placeholder="Transaction/reference number"
                  value={paymentForm.reference}
                  onChange={event => setPaymentForm({ ...paymentForm, reference: event.target.value })}
                  required
                />
              </div>
              <button className="btn btn-primary" style={{ marginTop: 14 }}>Submit payment reference</button>
            </form>
          )}

          <div className="card" style={{ overflowX: "auto" }}>
            <table className="data-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Screen</th>
                <th>Dates</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Total</th>
                <th>Creative</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(booking => {
                const screen = firstRelation(booking.screens)

                return (
                  <tr key={booking.id}>
                    <td style={{ color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>{booking.reference}</td>
                    <td>
                      {screen ? (
                        <Link href={`/screens/${screen.id}`} style={{ color: "var(--text-primary)", textDecoration: "none" }}>
                          {screen.name}<br />
                          <span style={{ color: "var(--text-muted)", fontSize: 12 }}>{screen.area ? `${screen.area}, ` : ""}{screen.city}</span>
                        </Link>
                      ) : "Screen"}
                    </td>
                    <td>{formatDate(booking.start_date)} - {formatDate(booking.end_date)}</td>
                    <td><span className={statusClass(booking.status)}>{booking.status}</span></td>
                    <td><span className={statusClass(booking.payment_status)}>{booking.payment_status}</span></td>
                    <td style={{ color: "var(--text-primary)", fontWeight: 600 }}>{formatCurrency(Number(booking.amount_total))}</td>
                    <td>
                      {booking.creative_url
                        ? <a href={booking.creative_url} target="_blank" rel="noreferrer" style={{ color: "var(--accent)" }}>Open</a>
                        : <span style={{ color: "var(--text-muted)" }}>None</span>
                      }
                    </td>
                    <td>
                      {(booking.status === "pending" || (booking.status === "approved" && booking.start_date >= new Date().toISOString().slice(0, 10))) ? (
                        <button className="btn btn-secondary btn-sm" onClick={() => cancelBooking(booking.id)}>Cancel</button>
                      ) : null}
                    </td>
                  </tr>
                )
              })}
            </tbody>
            </table>
          </div>
        </>
      )}
    </AppShell>
  )
}
