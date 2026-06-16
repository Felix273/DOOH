"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import AppShell from "@/app/components/AppShell"
import { createClient } from "@/lib/supabase/client"

const screenTypes = [
  ["billboard", "Billboard"],
  ["mall", "Mall Screen"],
  ["transit", "Transit"],
  ["airport", "Airport"],
  ["retail", "Retail Media"],
]

export default function NewOwnerScreenPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [form, setForm] = useState({
    name: "",
    description: "",
    screen_type: "billboard",
    address: "",
    city: "",
    area: "",
    latitude: "",
    longitude: "",
    width_meters: "",
    height_meters: "",
    resolution_width: "",
    resolution_height: "",
    operating_hours_start: "06:00",
    operating_hours_end: "23:00",
    price_per_day: "",
    price_per_week: "",
    price_per_month: "",
    image_url: "",
  })
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setMessage("")
    setSubmitting(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push("/login")
      return
    }

    const { data: screen, error } = await supabase
      .from("screens")
      .insert({
        owner_id: user.id,
        name: form.name,
        description: form.description || null,
        screen_type: form.screen_type,
        address: form.address,
        city: form.city,
        area: form.area || null,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        width_meters: form.width_meters ? Number(form.width_meters) : null,
        height_meters: form.height_meters ? Number(form.height_meters) : null,
        resolution_width: form.resolution_width ? Number(form.resolution_width) : null,
        resolution_height: form.resolution_height ? Number(form.resolution_height) : null,
        operating_hours_start: form.operating_hours_start,
        operating_hours_end: form.operating_hours_end,
        price_per_day: Number(form.price_per_day),
        price_per_week: form.price_per_week ? Number(form.price_per_week) : null,
        price_per_month: form.price_per_month ? Number(form.price_per_month) : null,
      })
      .select("id")
      .single()

    if (error || !screen) {
      setMessage(error?.message ?? "Could not create screen")
      setSubmitting(false)
      return
    }

    if (form.image_url) {
      await supabase.from("screen_images").insert({
        screen_id: screen.id,
        url: form.image_url,
        is_primary: true,
      })
    }

    setSubmitting(false)
    router.push("/owner/screens")
  }

  return (
    <AppShell
      eyebrow="Media Owner"
      title="List a new screen"
      description="Submitted screens start as pending and become public after admin approval."
    >
      <form onSubmit={handleSubmit} className="card-elevated" style={{ padding: "var(--space-8)", display: "grid", gap: 18 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 14 }}>
          <div>
            <label className="t-label" style={{ display: "block", marginBottom: 6 }}>Screen name</label>
            <input className="input" value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} placeholder="Westlands Roundabout LED" required />
          </div>
          <div>
            <label className="t-label" style={{ display: "block", marginBottom: 6 }}>Format</label>
            <select className="input" value={form.screen_type} onChange={event => setForm({ ...form, screen_type: event.target.value })}>
              {screenTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="t-label" style={{ display: "block", marginBottom: 6 }}>Description</label>
          <textarea className="input" rows={4} value={form.description} onChange={event => setForm({ ...form, description: event.target.value })} placeholder="Audience, traffic, visibility, nearby landmarks..." />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 0.7fr 0.7fr", gap: 14 }}>
          <div>
            <label className="t-label" style={{ display: "block", marginBottom: 6 }}>Address</label>
            <input className="input" value={form.address} onChange={event => setForm({ ...form, address: event.target.value })} required />
          </div>
          <div>
            <label className="t-label" style={{ display: "block", marginBottom: 6 }}>City</label>
            <input className="input" value={form.city} onChange={event => setForm({ ...form, city: event.target.value })} required />
          </div>
          <div>
            <label className="t-label" style={{ display: "block", marginBottom: 6 }}>Area</label>
            <input className="input" value={form.area} onChange={event => setForm({ ...form, area: event.target.value })} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
          <div>
            <label className="t-label" style={{ display: "block", marginBottom: 6 }}>Latitude</label>
            <input className="input" type="number" step="any" value={form.latitude} onChange={event => setForm({ ...form, latitude: event.target.value })} required />
          </div>
          <div>
            <label className="t-label" style={{ display: "block", marginBottom: 6 }}>Longitude</label>
            <input className="input" type="number" step="any" value={form.longitude} onChange={event => setForm({ ...form, longitude: event.target.value })} required />
          </div>
          <div>
            <label className="t-label" style={{ display: "block", marginBottom: 6 }}>Width meters</label>
            <input className="input" type="number" step="0.01" value={form.width_meters} onChange={event => setForm({ ...form, width_meters: event.target.value })} />
          </div>
          <div>
            <label className="t-label" style={{ display: "block", marginBottom: 6 }}>Height meters</label>
            <input className="input" type="number" step="0.01" value={form.height_meters} onChange={event => setForm({ ...form, height_meters: event.target.value })} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
          <div>
            <label className="t-label" style={{ display: "block", marginBottom: 6 }}>Resolution width</label>
            <input className="input" type="number" value={form.resolution_width} onChange={event => setForm({ ...form, resolution_width: event.target.value })} />
          </div>
          <div>
            <label className="t-label" style={{ display: "block", marginBottom: 6 }}>Resolution height</label>
            <input className="input" type="number" value={form.resolution_height} onChange={event => setForm({ ...form, resolution_height: event.target.value })} />
          </div>
          <div>
            <label className="t-label" style={{ display: "block", marginBottom: 6 }}>Opens</label>
            <input className="input" type="time" value={form.operating_hours_start} onChange={event => setForm({ ...form, operating_hours_start: event.target.value })} required />
          </div>
          <div>
            <label className="t-label" style={{ display: "block", marginBottom: 6 }}>Closes</label>
            <input className="input" type="time" value={form.operating_hours_end} onChange={event => setForm({ ...form, operating_hours_end: event.target.value })} required />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          <div>
            <label className="t-label" style={{ display: "block", marginBottom: 6 }}>Price per day</label>
            <input className="input" type="number" min="0" value={form.price_per_day} onChange={event => setForm({ ...form, price_per_day: event.target.value })} required />
          </div>
          <div>
            <label className="t-label" style={{ display: "block", marginBottom: 6 }}>Price per week</label>
            <input className="input" type="number" min="0" value={form.price_per_week} onChange={event => setForm({ ...form, price_per_week: event.target.value })} />
          </div>
          <div>
            <label className="t-label" style={{ display: "block", marginBottom: 6 }}>Price per month</label>
            <input className="input" type="number" min="0" value={form.price_per_month} onChange={event => setForm({ ...form, price_per_month: event.target.value })} />
          </div>
        </div>

        <div>
          <label className="t-label" style={{ display: "block", marginBottom: 6 }}>Primary image URL</label>
          <input className="input" type="url" value={form.image_url} onChange={event => setForm({ ...form, image_url: event.target.value })} placeholder="https://..." />
        </div>

        {message && (
          <div style={{ padding: "10px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-default)", color: "var(--text-secondary)" }}>
            {message}
          </div>
        )}

        <button className="btn btn-primary btn-lg" disabled={submitting} style={{ justifyContent: "center" }}>
          {submitting ? "Submitting..." : "Submit screen for approval"}
        </button>
      </form>
    </AppShell>
  )
}
