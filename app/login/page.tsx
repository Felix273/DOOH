"use client"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: "", password: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      })
      if (signInError) throw signInError

      // Fetch profile to get role
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single()

      if (profile?.role === "media_owner") {
        router.push("/owner")
      } else if (profile?.role === "admin") {
        router.push("/admin")
      } else {
        router.push("/dashboard")
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid email or password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: "100vh", background: "var(--bg-base)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "var(--space-8)",
    }}>
      <div style={{ width: "100%", maxWidth: 420 }}>

        {/* Logo */}
        <Link href="/" style={{
          display: "flex", alignItems: "center", gap: 8,
          marginBottom: "var(--space-10)", textDecoration: "none",
          justifyContent: "center",
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: 6,
            background: "var(--accent)", display: "flex",
            alignItems: "center", justifyContent: "center",
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="6" height="4" rx="1" fill="#080808"/>
              <rect x="9" y="1" width="6" height="4" rx="1" fill="#080808"/>
              <rect x="1" y="7" width="6" height="4" rx="1" fill="#080808"/>
              <rect x="9" y="7" width="6" height="4" rx="1" fill="#080808"/>
              <rect x="1" y="13" width="14" height="2" rx="1" fill="#080808"/>
            </svg>
          </div>
          <span style={{
            fontFamily: "var(--font-display)", fontWeight: 700,
            fontSize: 16, letterSpacing: "-0.02em", color: "var(--text-primary)",
          }}>
            DOOH<span style={{ color: "var(--accent)" }}>.</span>
          </span>
        </Link>

        {/* Card */}
        <div className="card-elevated" style={{ padding: "var(--space-8)" }}>
          <h1 style={{
            fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700,
            letterSpacing: "-0.02em", color: "var(--text-primary)", marginBottom: 8,
          }}>Welcome back</h1>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: "var(--space-6)" }}>
            Log in to your DOOH Platform account
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                Email Address
              </label>
              <input
                className="input"
                type="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
                autoFocus
              />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  Password
                </label>
                <Link href="/forgot-password" style={{ fontSize: 12, color: "var(--accent)", textDecoration: "none" }}>
                  Forgot password?
                </Link>
              </div>
              <input
                className="input"
                type="password"
                placeholder="Your password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            {error && (
              <div style={{
                padding: "10px 14px", borderRadius: "var(--radius-md)",
                background: "rgba(255,68,68,0.1)", border: "1px solid rgba(255,68,68,0.2)",
                fontSize: 13, color: "var(--status-error)",
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{ width: "100%", justifyContent: "center", marginTop: 4 }}
            >
              {loading ? "Logging in..." : "Log in →"}
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: 13, color: "var(--text-muted)", marginTop: "var(--space-6)" }}>
            Don&apos;t have an account?{" "}
            <Link href="/register" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 500 }}>
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
