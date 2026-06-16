"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export default function ForgotPasswordPage() {
  const supabase = useMemo(() => createClient(), [])
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setMessage("")
    setLoading(true)

    const redirectTo = `${window.location.origin}/login`
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })

    setLoading(false)
    setMessage(error ? error.message : "Password reset instructions have been sent if that email exists.")
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)", display: "flex", alignItems: "center", justifyContent: "center", padding: "var(--space-8)" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <Link href="/login" style={{ color: "var(--accent)", textDecoration: "none", fontSize: 13 }}>Back to login</Link>
        <div className="card-elevated" style={{ padding: "var(--space-8)", marginTop: "var(--space-4)" }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
            Reset your password
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: "var(--space-6)" }}>
            Enter your account email and we will send password reset instructions.
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label className="t-label" style={{ display: "block", marginBottom: 6 }}>Email address</label>
              <input className="input" type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@company.com" required />
            </div>

            {message && (
              <div style={{ padding: "10px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-default)", color: "var(--text-secondary)", fontSize: 13 }}>
                {message}
              </div>
            )}

            <button className="btn btn-primary btn-lg" disabled={loading} style={{ justifyContent: "center" }}>
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
