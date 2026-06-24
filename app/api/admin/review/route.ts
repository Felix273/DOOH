import { NextRequest, NextResponse } from "next/server"
import { createAdminClient, createUserScopedClient } from "@/lib/supabase/admin"

async function requireAdmin(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "")
  if (!token) {
    return { error: NextResponse.json({ error: "Missing session" }, { status: 401 }) }
  }

  const adminSupabase = createAdminClient()
  const supabase = createUserScopedClient(token)
  const { data: userData, error: userError } = await adminSupabase.auth.getUser(token)
  const user = userData.user

  if (userError || !user) {
    return { error: NextResponse.json({ error: "Invalid session" }, { status: 401 }) }
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, full_name")
    .eq("id", user.id)
    .single()

  if (profileError || profile?.role !== "admin") {
    return { error: NextResponse.json({ error: "Admin access required" }, { status: 403 }) }
  }

  return { supabase, profile }
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if ("error" in auth) return auth.error

  const [
    { data: screens, error: screensError },
    { data: bookings, error: bookingsError },
    { data: payments, error: paymentsError },
  ] = await Promise.all([
    auth.supabase
      .from("screens")
      .select("id, name, city, area, screen_type, price_per_day, status, created_at, profiles(company_name, full_name)")
      .eq("status", "pending")
      .order("created_at", { ascending: true }),
    auth.supabase
      .from("bookings")
      .select("id, reference, status, start_date, end_date, amount_total, screens(name, city), profiles(company_name, full_name)")
      .eq("status", "pending")
      .order("created_at", { ascending: true }),
    auth.supabase
      .from("payments")
      .select("id, amount, method, provider_reference, status, created_at, bookings(reference, screens(name, city)), profiles(company_name, full_name)")
      .eq("status", "pending")
      .order("created_at", { ascending: true }),
  ])

  if (screensError || bookingsError || paymentsError) {
    return NextResponse.json(
      { error: screensError?.message ?? bookingsError?.message ?? paymentsError?.message ?? "Could not load review queue" },
      { status: 500 },
    )
  }

  return NextResponse.json({
    profile: auth.profile,
    screens: screens ?? [],
    bookings: bookings ?? [],
    payments: payments ?? [],
  })
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin(request)
  if ("error" in auth) return auth.error

  const body = await request.json().catch(() => null) as
    | { type?: "screen" | "booking"; id?: string; status?: string }
    | null

  if (!body?.type || !body.id || !body.status) {
    return NextResponse.json({ error: "Missing review action" }, { status: 400 })
  }

  if (body.type === "screen") {
    if (!["active", "suspended"].includes(body.status)) {
      return NextResponse.json({ error: "Invalid screen status" }, { status: 400 })
    }

    const { error } = await auth.supabase
      .from("screens")
      .update({ status: body.status })
      .eq("id", body.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  }

  if (!["approved", "rejected"].includes(body.status)) {
    return NextResponse.json({ error: "Invalid booking status" }, { status: 400 })
  }

  const { error } = await auth.supabase
    .from("bookings")
    .update({ status: body.status })
    .eq("id", body.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
