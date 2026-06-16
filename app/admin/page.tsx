"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import AppShell from "@/app/components/AppShell"
import { createClient } from "@/lib/supabase/client"
import { formatCurrency, formatDate, getScreenTypeLabel } from "@/lib/utils"

type AdminProfile = { role: string; full_name: string | null }
type Relation<T> = T | T[] | null | undefined
type ProfileSummary = { company_name: string | null; full_name: string | null }
type PendingScreen = {
  id: string
  name: string
  city: string
  area: string | null
  screen_type: string
  price_per_day: number
  profiles?: Relation<ProfileSummary>
}
type AdminBooking = {
  id: string
  reference: string
  status: string
  start_date: string
  end_date: string
  amount_total: number
  screens?: Relation<{ name: string; city: string }>
  profiles?: Relation<ProfileSummary>
}
type AdminPayment = {
  id: string
  amount: number
  method: string
  provider_reference: string | null
  status: string
  bookings?: Relation<{ reference: string; screens?: Relation<{ name: string; city: string }> }>
  profiles?: Relation<ProfileSummary>
}

function firstRelation<T>(relation: Relation<T>): T | null {
  if (!relation) return null
  return Array.isArray(relation) ? relation[0] ?? null : relation
}

export default function AdminPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [profile, setProfile] = useState<AdminProfile | null>(null)
  const [screens, setScreens] = useState<PendingScreen[]>([])
  const [bookings, setBookings] = useState<AdminBooking[]>([])
  const [payments, setPayments] = useState<AdminPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")

  const loadAdminData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push("/login")
      return
    }

    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData.session?.access_token
    if (!token) {
      router.push("/login")
      return
    }

    const response = await fetch("/api/admin/review", {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (response.status === 403) {
      router.push("/dashboard")
      return
    }

    if (!response.ok) {
      const data = await response.json().catch(() => null)
      setMessage(data?.error ?? "Could not load admin review queue")
      setLoading(false)
      return
    }

    const data = await response.json()
    setProfile(data.profile)
    setScreens(data.screens ?? [])
    setBookings(data.bookings ?? [])
    setPayments(data.payments ?? [])
    setLoading(false)
  }, [router, supabase])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      loadAdminData()
    }, 0)

    return () => window.clearTimeout(timeout)
  }, [loadAdminData])

  const updateScreenStatus = async (id: string, status: "active" | "suspended") => {
    setMessage("")
    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData.session?.access_token
    const response = await fetch("/api/admin/review", {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ type: "screen", id, status }),
    })
    if (!response.ok) {
      const data = await response.json().catch(() => null)
      setMessage(data?.error ?? "Could not update screen")
      return
    }
    await loadAdminData()
  }

  const updateBookingStatus = async (id: string, status: "approved" | "rejected") => {
    setMessage("")
    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData.session?.access_token
    const response = await fetch("/api/admin/review", {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ type: "booking", id, status }),
    })
    if (!response.ok) {
      const data = await response.json().catch(() => null)
      setMessage(data?.error ?? "Could not update booking")
      return
    }
    await loadAdminData()
  }

  const updatePaymentStatus = async (id: string, status: "completed" | "failed") => {
    setMessage("")
    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData.session?.access_token
    const response = await fetch("/api/payments", {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ paymentId: id, status }),
    })
    if (!response.ok) {
      const data = await response.json().catch(() => null)
      setMessage(data?.error ?? "Could not update payment")
      return
    }
    await loadAdminData()
  }

  if (loading) {
    return (
      <AppShell eyebrow="Admin" title="Loading admin console">
        <div className="card" style={{ padding: "var(--space-10)", color: "var(--text-muted)" }}>Loading...</div>
      </AppShell>
    )
  }

  return (
    <AppShell
      eyebrow="Admin"
      title="Approval console"
      description={`Welcome${profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}. Review pending screens and campaign booking requests.`}
    >
      {message && (
        <div style={{ padding: "10px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-default)", color: "var(--text-secondary)", marginBottom: 16 }}>
          {message}
        </div>
      )}

      <div className="responsive-grid responsive-grid-3" style={{ marginBottom: "var(--space-8)" }}>
        {[
          { label: "Pending Screens", value: screens.length },
          { label: "Pending Bookings", value: bookings.length },
          { label: "Pending Payments", value: payments.length },
        ].map(stat => (
          <div key={stat.label} className="stat-card">
            <p className="stat-card-label">{stat.label}</p>
            <p className="stat-card-value">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="responsive-grid responsive-grid-2">
        <section className="card" style={{ padding: "var(--space-6)" }}>
          <h2 className="t-heading" style={{ marginBottom: 16 }}>Pending screens</h2>
          {screens.length === 0 ? (
            <p className="t-body-sm">No screen approvals waiting.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {screens.map(screen => (
                <div key={screen.id} className="card" style={{ padding: "var(--space-4)" }}>
                  {(() => {
                    const owner = firstRelation(screen.profiles)

                    return (
                      <>
                  <div className="card-row">
                    <div>
                      <h3 className="t-subheading" style={{ color: "var(--text-primary)" }}>{screen.name}</h3>
                      <p className="t-body-sm">{screen.area ? `${screen.area}, ` : ""}{screen.city} · {getScreenTypeLabel(screen.screen_type)}</p>
                      <p className="t-body-sm">{owner?.company_name ?? owner?.full_name ?? "Media owner"}</p>
                    </div>
                    <strong style={{ color: "var(--text-primary)" }}>{formatCurrency(Number(screen.price_per_day))}/day</strong>
                  </div>
                  <div className="button-row">
                    <button className="btn btn-primary btn-sm" onClick={() => updateScreenStatus(screen.id, "active")}>Approve</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => updateScreenStatus(screen.id, "suspended")}>Suspend</button>
                  </div>
                      </>
                    )
                  })()}
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="card" style={{ padding: "var(--space-6)" }}>
          <h2 className="t-heading" style={{ marginBottom: 16 }}>Pending payments</h2>
          {payments.length === 0 ? (
            <p className="t-body-sm">No payment confirmations waiting.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {payments.map(payment => {
                const booking = firstRelation(payment.bookings)
                const screen = firstRelation(booking?.screens)
                const advertiser = firstRelation(payment.profiles)

                return (
                  <div key={payment.id} className="card" style={{ padding: "var(--space-4)" }}>
                    <div className="card-row">
                      <div>
                        <h3 className="t-subheading" style={{ color: "var(--text-primary)" }}>{booking?.reference ?? "Payment"}</h3>
                        <p className="t-body-sm">{screen?.name ?? "Screen"} · {screen?.city ?? "City"}</p>
                        <p className="t-body-sm">{advertiser?.company_name ?? advertiser?.full_name ?? "Advertiser"}</p>
                        <p className="t-body-sm">
                          {payment.provider_reference?.startsWith("BANK:")
                            ? "bank transfer"
                            : payment.method.replace("_", " ")}
                          {" · "}
                          {payment.provider_reference ?? "No reference"}
                        </p>
                      </div>
                      <strong style={{ color: "var(--text-primary)" }}>{formatCurrency(Number(payment.amount))}</strong>
                    </div>
                    <div className="button-row">
                      <button className="btn btn-primary btn-sm" onClick={() => updatePaymentStatus(payment.id, "completed")}>Mark paid</button>
                      <button className="btn btn-secondary btn-sm" onClick={() => updatePaymentStatus(payment.id, "failed")}>Reject</button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        <section className="card" style={{ padding: "var(--space-6)" }}>
          <h2 className="t-heading" style={{ marginBottom: 16 }}>Pending bookings</h2>
          {bookings.length === 0 ? (
            <p className="t-body-sm">No booking approvals waiting.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {bookings.map(booking => (
                <div key={booking.id} className="card" style={{ padding: "var(--space-4)" }}>
                  {(() => {
                    const screen = firstRelation(booking.screens)
                    const advertiser = firstRelation(booking.profiles)

                    return (
                      <>
                  <div className="card-row">
                    <div>
                      <h3 className="t-subheading" style={{ color: "var(--text-primary)" }}>{booking.reference}</h3>
                      <p className="t-body-sm">{screen?.name ?? "Screen"} · {screen?.city ?? "City"}</p>
                      <p className="t-body-sm">{formatDate(booking.start_date)} - {formatDate(booking.end_date)}</p>
                      <p className="t-body-sm">{advertiser?.company_name ?? advertiser?.full_name ?? "Advertiser"}</p>
                    </div>
                    <strong style={{ color: "var(--text-primary)" }}>{formatCurrency(Number(booking.amount_total))}</strong>
                  </div>
                  <div className="button-row">
                    <button className="btn btn-primary btn-sm" onClick={() => updateBookingStatus(booking.id, "approved")}>Approve</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => updateBookingStatus(booking.id, "rejected")}>Reject</button>
                  </div>
                      </>
                    )
                  })()}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  )
}
