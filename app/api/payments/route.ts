import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

type PaymentMethod = "mpesa" | "card" | "bank_transfer"

async function getUser(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "")
  if (!token) {
    return { error: NextResponse.json({ error: "Missing session" }, { status: 401 }) }
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase.auth.getUser(token)

  if (error || !data.user) {
    return { error: NextResponse.json({ error: "Invalid session" }, { status: 401 }) }
  }

  return { supabase, user: data.user }
}

export async function POST(request: NextRequest) {
  const auth = await getUser(request)
  if ("error" in auth) return auth.error

  const body = await request.json().catch(() => null) as
    | { bookingId?: string; method?: PaymentMethod; reference?: string }
    | null

  if (!body?.bookingId || !body.method || !body.reference?.trim()) {
    return NextResponse.json({ error: "Booking, method, and reference are required" }, { status: 400 })
  }

  if (!["mpesa", "card", "bank_transfer"].includes(body.method)) {
    return NextResponse.json({ error: "Unsupported payment method" }, { status: 400 })
  }

  const { data: booking, error: bookingError } = await auth.supabase
    .from("bookings")
    .select("id, advertiser_id, status, amount_total, payment_status")
    .eq("id", body.bookingId)
    .single()

  if (bookingError || !booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 })
  }

  if (booking.advertiser_id !== auth.user.id) {
    return NextResponse.json({ error: "You can only pay for your own bookings" }, { status: 403 })
  }

  if (booking.status !== "approved") {
    return NextResponse.json({ error: "Booking must be approved before payment" }, { status: 400 })
  }

  if (booking.payment_status === "paid") {
    return NextResponse.json({ error: "Booking is already marked paid" }, { status: 400 })
  }

  const reference = body.method === "bank_transfer"
    ? `BANK:${body.reference.trim().replace(/^BANK:/i, "")}`
    : body.reference.trim()

  let { data: payment, error } = await auth.supabase
    .from("payments")
    .insert({
      booking_id: booking.id,
      advertiser_id: auth.user.id,
      amount: booking.amount_total,
      method: body.method,
      provider_reference: reference,
      status: "pending",
    })
    .select("id, status, provider_reference")
    .single()

  if (error && body.method === "bank_transfer") {
    const fallback = await auth.supabase
      .from("payments")
      .insert({
        booking_id: booking.id,
        advertiser_id: auth.user.id,
        amount: booking.amount_total,
        method: "card",
        provider_reference: reference,
        status: "pending",
      })
      .select("id, status, provider_reference")
      .single()

    payment = fallback.data
    error = fallback.error
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ payment })
}

export async function PATCH(request: NextRequest) {
  const auth = await getUser(request)
  if ("error" in auth) return auth.error

  const { data: profile } = await auth.supabase
    .from("profiles")
    .select("role")
    .eq("id", auth.user.id)
    .single()

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 })
  }

  const body = await request.json().catch(() => null) as
    | { paymentId?: string; status?: "completed" | "failed" }
    | null

  if (!body?.paymentId || !body.status) {
    return NextResponse.json({ error: "Payment and status are required" }, { status: 400 })
  }

  const { data: payment, error: paymentError } = await auth.supabase
    .from("payments")
    .update({ status: body.status })
    .eq("id", body.paymentId)
    .select("id, booking_id, status, provider_reference")
    .single()

  if (paymentError || !payment) {
    return NextResponse.json({ error: paymentError?.message ?? "Payment not found" }, { status: 500 })
  }

  if (body.status === "completed") {
    const { error } = await auth.supabase
      .from("bookings")
      .update({
        payment_status: "paid",
        payment_reference: payment.provider_reference,
      })
      .eq("id", payment.booking_id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  return NextResponse.json({ payment })
}
