"use client"
export const dynamic = 'force-dynamic'
import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { Screen, Profile } from "@/types"

type ScreenWithOwner = Screen & { profiles: Profile | null }
type PaymentReview = {
  id: string
  amount: number
  method: string
  provider_reference: string
  status: "pending" | "completed" | "failed"
  created_at: string
  bookings: { reference: string; screens: { name: string; city: string } | null } | null
  profiles: { company_name: string | null; full_name: string | null } | null
}
type Tab = "pending" | "active" | "suspended"

export default function AdminDashboardPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [screens, setScreens] = useState<ScreenWithOwner[]>([])
  const [payments, setPayments] = useState<PaymentReview[]>([])
  const [loading, setLoading] = useState(true)
  const [paymentsLoading, setPaymentsLoading] = useState(true)
  const [paymentActionLoading, setPaymentActionLoading] = useState<string | null>(null)
  const [paymentMessage, setPaymentMessage] = useState("")
  const [tab, setTab] = useState<Tab>("pending")
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchScreens = useCallback(async () => {
    const { data } = await supabase
      .from("screens")
      .select("*, profiles(*)")
      .order("created_at", { ascending: false })
    setScreens((data ?? []) as ScreenWithOwner[])
    setLoading(false)
  }, [supabase])

  const fetchPayments = useCallback(async () => {
    setPaymentsLoading(true)
    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData.session?.access_token

    if (!token) {
      setPaymentsLoading(false)
      return
    }

    const response = await fetch("/api/admin/review", {
      headers: { Authorization: `Bearer ${token}` },
    })
    const payload = await response.json()

    if (response.ok) {
      setPayments((payload.payments ?? []) as PaymentReview[])
    } else {
      setPaymentMessage(payload.error ?? "Could not load payment reviews.")
    }

    setPaymentsLoading(false)
  }, [supabase])

  const reviewPayment = async (paymentId: string, status: "completed" | "failed") => {
    setPaymentActionLoading(paymentId)
    setPaymentMessage("")

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token

      if (!token) {
        setPaymentMessage("Your session has expired. Please sign in again.")
        return
      }

      const response = await fetch("/api/payments", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ paymentId, status }),
      })
      const payload = await response.json()

      if (!response.ok) {
        setPaymentMessage(payload.error ?? "Could not update the payment.")
        return
      }

      setPaymentMessage(status === "completed"
        ? "Payment verified and booking marked paid."
        : "Payment marked as failed.")
      await fetchPayments()
    } catch {
      setPaymentMessage("Could not update the payment. Please try again.")
    } finally {
      setPaymentActionLoading(null)
    }
  }

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/login"); return }
      await fetchScreens()
      await fetchPayments()
    }
    void load()
  }, [fetchPayments, fetchScreens, router, supabase])

  async function updateScreenStatus(screenId: string, status: "active" | "suspended" | "pending") {
    setActionLoading(screenId)
    try {
      const { error } = await supabase.from("screens").update({ status }).eq("id", screenId)
      if (error) throw error
      await fetchScreens()
    } finally {
      setActionLoading(null)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const filtered = screens.filter(s => s.status === tab)
  const counts = {
    pending:   screens.filter(s => s.status === "pending").length,
    active:    screens.filter(s => s.status === "active").length,
    suspended: screens.filter(s => s.status === "suspended").length,
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "var(--text-muted)" }}>Loading...</p>
    </div>
  )

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)", padding: "var(--space-8)" }}>
      <div style={{ maxWidth: "var(--max-width)", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-10)" }}>
          <div>
            <p className="t-label-accent" style={{ marginBottom: 6 }}>Admin Panel</p>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text-primary)" }}>
              Platform Overview
            </h1>
          </div>
          <button onClick={handleSignOut} className="btn btn-secondary btn-sm">Sign out</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: "var(--space-10)" }}>
          {[
            { label: "Total Screens",  value: String(screens.length) },
            { label: "Pending Review", value: String(counts.pending), accent: counts.pending > 0 },
            { label: "Active Screens", value: String(counts.active) },
            { label: "Suspended",      value: String(counts.suspended) },
          ].map(stat => (
            <div key={stat.label} className="stat-card">
              <p className="stat-card-label">{stat.label}</p>
              <p className="stat-card-value" style={stat.accent ? { color: "var(--accent)" } : {}}>{stat.value}</p>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "var(--bg-overlay)", borderRadius: "var(--radius-md)", padding: 4, width: "fit-content" }}>
          {(["pending", "active", "suspended"] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: "8px 20px", borderRadius: "var(--radius-sm)", fontSize: 13, fontWeight: 500,
              cursor: "pointer", border: "none", textTransform: "capitalize", transition: "all 0.15s",
              background: tab === t ? "var(--bg-surface)" : "transparent",
              color: tab === t ? "var(--text-primary)" : "var(--text-muted)",
            }}>
              {t} ({counts[t]})
            </button>
          ))}
        </div>
        <section style={{ marginBottom: "var(--space-10)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <p className="t-label-accent" style={{ marginBottom: 6 }}>Payment verification</p>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>
                Pending payments ({payments.length})
              </h2>
            </div>
            {paymentMessage && (
              <p role="status" style={{ color: "var(--text-secondary)", fontSize: 13, maxWidth: 420, textAlign: "right" }}>
                {paymentMessage}
              </p>
            )}
          </div>

          {paymentsLoading ? (
            <div className="card" style={{ padding: "var(--space-6)" }}>
              <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Loading payment reviews...</p>
            </div>
          ) : payments.length === 0 ? (
            <div className="card" style={{ padding: "var(--space-6)" }}>
              <p style={{ color: "var(--text-muted)", fontSize: 14 }}>No payments are waiting for verification.</p>
            </div>
          ) : (
            <div className="card" style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ color: "var(--text-muted)", textAlign: "left" }}>
                    <th style={{ padding: "14px 16px" }}>Advertiser</th>
                    <th style={{ padding: "14px 16px" }}>Booking</th>
                    <th style={{ padding: "14px 16px" }}>Amount</th>
                    <th style={{ padding: "14px 16px" }}>Method / reference</th>
                    <th style={{ padding: "14px 16px" }}>Submitted</th>
                    <th style={{ padding: "14px 16px" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map(payment => (
                    <tr key={payment.id} style={{ borderTop: "1px solid var(--border-subtle)" }}>
                      <td style={{ padding: "14px 16px", color: "var(--text-primary)" }}>
                        {payment.profiles?.company_name || payment.profiles?.full_name || "Unknown advertiser"}
                      </td>
                      <td style={{ padding: "14px 16px", color: "var(--text-secondary)" }}>
                        <div>{payment.bookings?.reference || "—"}</div>
                        <small style={{ color: "var(--text-muted)" }}>
                          {payment.bookings?.screens
                            ? `${payment.bookings.screens.name} · ${payment.bookings.screens.city}`
                            : "Screen unavailable"}
                        </small>
                      </td>
                      <td style={{ padding: "14px 16px", color: "var(--text-primary)", whiteSpace: "nowrap" }}>
                        KES {Number(payment.amount).toLocaleString("en-KE")}
                      </td>
                      <td style={{ padding: "14px 16px", color: "var(--text-secondary)" }}>
                        <div style={{ textTransform: "capitalize" }}>{payment.method.replace("_", " ")}</div>
                        <code style={{ color: "var(--accent)", wordBreak: "break-all" }}>{payment.provider_reference}</code>
                      </td>
                      <td style={{ padding: "14px 16px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                        {new Date(payment.created_at).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", gap: 8, whiteSpace: "nowrap" }}>
                          <button
                            className="btn btn-primary btn-sm"
                            disabled={paymentActionLoading === payment.id}
                            onClick={() => reviewPayment(payment.id, "completed")}
                          >
                            {paymentActionLoading === payment.id ? "..." : "Verify"}
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            disabled={paymentActionLoading === payment.id}
                            onClick={() => reviewPayment(payment.id, "failed")}
                            style={{ color: "#ff4444", borderColor: "rgba(255,68,68,0.3)" }}
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {filtered.length === 0 ? (
          <div className="card" style={{ padding: "var(--space-16)", textAlign: "center" }}>
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>No {tab} screens.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.map(screen => (
              <div key={screen.id} className="card" style={{ padding: "var(--space-6)" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                      <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15, color: "var(--text-primary)" }}>{screen.name}</p>
                      <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", padding: "2px 8px", borderRadius: "999px", background: "var(--bg-overlay)", color: "var(--text-muted)" }}>{screen.screen_type}</span>
                    </div>
                    <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>{screen.address}, {screen.city}{screen.area ? ` · ${screen.area}` : ""}</p>
                    <div style={{ display: "flex", gap: 16, fontSize: 12, color: "var(--text-muted)" }}>
                      <span>KES {screen.price_per_day.toLocaleString()}/day</span>
                      {screen.profiles?.full_name && <span>Owner: <strong style={{ color: "var(--text-secondary)" }}>{screen.profiles.full_name}</strong></span>}
                      <span>{new Date(screen.created_at).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    {screen.status === "pending" && (<>
                      <button className="btn btn-primary btn-sm" disabled={actionLoading === screen.id} onClick={() => updateScreenStatus(screen.id, "active")}>{actionLoading === screen.id ? "..." : "✓ Approve"}</button>
                      <button className="btn btn-secondary btn-sm" disabled={actionLoading === screen.id} onClick={() => updateScreenStatus(screen.id, "suspended")} style={{ color: "#ff4444", borderColor: "rgba(255,68,68,0.3)" }}>Reject</button>
                    </>)}
                    {screen.status === "active" && <button className="btn btn-secondary btn-sm" disabled={actionLoading === screen.id} onClick={() => updateScreenStatus(screen.id, "suspended")} style={{ color: "#ffc107", borderColor: "rgba(255,193,7,0.3)" }}>{actionLoading === screen.id ? "..." : "Suspend"}</button>}
                    {screen.status === "suspended" && <button className="btn btn-secondary btn-sm" disabled={actionLoading === screen.id} onClick={() => updateScreenStatus(screen.id, "active")} style={{ color: "#00e676", borderColor: "rgba(0,230,118,0.3)" }}>{actionLoading === screen.id ? "..." : "Re-activate"}</button>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
