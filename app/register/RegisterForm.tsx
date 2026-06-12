"use client"
import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [role, setRole] = useState<"advertiser" | "media_owner">(
    searchParams.get("role") === "media_owner" ? "media_owner" : "advertiser"
  )
  const [form, setForm] = useState({
    full_name: "",
    company_name: "",
    email: "",
    phone: "",
    password: "",
    confirm_password: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (form.password !== form.confirm_password) {
      setError("Passwords do not match")
      return
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    setLoading(true)
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.full_name,
            company_name: form.company_name,
            phone: form.phone,
            role,
          },
        },
      })

      if (signUpError) throw signUpError

      router.push(role === "media_owner" ? "/owner" : "/dashboard")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong")
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
      <div style={{ width: "100%", maxWidth: 480 }}>

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

        <div className="card-elevated" style={{ padding: "var(--space-8)" }}>
          <h1 style={{
            fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700,
            letterSpacing: "-0.02em", color: "var(--text-primary)", marginBottom: 8,
          }}>Create your account</h1>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: "var(--space-6)" }}>
            Join Kenya&apos;s leading digital OOH platform
          </p>

          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr",
            gap: 8, marginBottom: "var(--space-6)",
            background: "var(--bg-overlay)", borderRadius: "var(--radius-md)",
            padding: 4,
          }}>
            {[
              { value: "advertiser", label: "I want to advertise" },
              { value: "media_owner", label: "I own screens" },
            ].map(option => (
              <button
                key={option.value}
                onClick={() => setRole(option.value as "advertiser" | "media_owner")}
                style={{
                  padding: "10px 12px", borderRadius: "var(--radius-sm)",
                  fontSize: 13, fontWeight: 500, cursor: "pointer",
                  border: "none", transition: "all var(--transition-fast)",
                  background: role === option.value ? "var(--bg-surface)" : "transparent",
                  color: role === option.value ? "var(--text-primary)" : "var(--text-muted)",
                  boxShadow: role === option.value ? "var(--shadow-card)" : "none",
                }}
              >
                {option.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Full Name</label>
                <input className="input" type="text" placeholder="John Doe" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} required />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Company</label>
                <input className="input" type="text" placeholder="Acme Ltd" value={form.company_name} onChange={e => setForm({ ...form, company_name: e.target.value })} />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Email Address</label>
              <input className="input" type="email" placeholder="you@company.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Phone Number</label>
              <input className="input" type="tel" placeholder="+254 700 000 000" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Password</label>
                <input className="input" type="password" placeholder="Min 8 characters" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Confirm</label>
                <input className="input" type="password" placeholder="Repeat password" value={form.confirm_password} onChange={e => setForm({ ...form, confirm_password: e.target.value })} required />
              </div>
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
              {loading ? "Creating account..." : `Create ${role === "media_owner" ? "Media Owner" : "Advertiser"} Account →`}
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: 13, color: "var(--text-muted)", marginTop: "var(--space-6)" }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 500 }}>Log in</Link>
          </p>
        </div>

        <p style={{ textAlign: "center", fontSize: 12, color: "var(--text-muted)", marginTop: "var(--space-4)" }}>
          By creating an account you agree to our{" "}
          <Link href="/terms" style={{ color: "var(--text-secondary)" }}>Terms</Link>{" "}and{" "}
          <Link href="/privacy" style={{ color: "var(--text-secondary)" }}>Privacy Policy</Link>
        </p>
      </div>
    </div>
  )
}
