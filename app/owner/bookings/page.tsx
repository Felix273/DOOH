"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import AppShell from "@/app/components/AppShell"
import { createClient } from "@/lib/supabase/client"
import { formatCurrency, formatDate } from "@/lib/utils"

type Relation<T> = T | T[] | null | undefined
type OwnerBooking = {
  id: string
  reference: string
  status: string
  start_date: string
  end_date: string
  amount_total: number
  payment_status: string
  creative_url: string | null
  notes: string | null
  created_at: string
  screens?: Relation<{ name: string; city: string }>
  profiles?: Relation<{ company_name: string | null; full_name: string | null }>
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

export default function OwnerBookingsPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [bookings, setBookings] = useState<OwnerBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")

  const loadBookings = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push("/login")
      return
    }

    const { data: screens } = await supabase
      .from("screens")
      .select("id")
      .eq("owner_id", user.id)

    const screenIds = screens?.map(screen => screen.id) ?? []
    if (screenIds.length === 0) {
      setBookings([])
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from("bookings")
      .select("id, reference, status, start_date, end_date, amount_total, payment_status, creative_url, notes, created_at, screens(name, city), profiles(company_name, full_name)")
      .in("screen_id", screenIds)
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

  const updateStatus = async (id: string, status: "approved" | "rejected" | "completed") => {
    setMessage("")
    const { error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", id)

    if (error) {
      setMessage(error.message)
      return
    }

    await loadBookings()
  }

  return (
    <AppShell
      eyebrow="Media Owner"
      title="Booking requests"
      description="Review advertiser campaign requests for your screens and approve or reject pending bookings."
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
          <h2 className="t-heading" style={{ marginBottom: 8 }}>No booking requests yet</h2>
          <p className="t-body" style={{ margin: "0 auto", maxWidth: 460 }}>
            Once advertisers request your screens, you can review their dates and creative details here.
          </p>
        </div>
      ) : (
        <div className="card" style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Advertiser</th>
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
                const advertiser = firstRelation(booking.profiles)

                return (
                  <tr key={booking.id}>
                    <td style={{ color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>{booking.reference}</td>
                    <td>{advertiser?.company_name ?? advertiser?.full_name ?? "Advertiser"}</td>
                    <td>{screen?.name ?? "Screen"}<br /><span style={{ color: "var(--text-muted)", fontSize: 12 }}>{screen?.city ?? ""}</span></td>
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
                      {booking.status === "pending" ? (
                        <div style={{ display: "flex", gap: 8 }}>
                          <button className="btn btn-primary btn-sm" onClick={() => updateStatus(booking.id, "approved")}>Approve</button>
                          <button className="btn btn-secondary btn-sm" onClick={() => updateStatus(booking.id, "rejected")}>Reject</button>
                        </div>
                      ) : booking.status === "approved" && booking.end_date <= new Date().toISOString().slice(0, 10) ? (
                        <button className="btn btn-secondary btn-sm" onClick={() => updateStatus(booking.id, "completed")}>Mark complete</button>
                      ) : null}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  )
}
