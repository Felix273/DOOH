import { readFileSync, existsSync } from "node:fs"
import { resolve } from "node:path"
import { createClient } from "@supabase/supabase-js"

const envPath = resolve(process.cwd(), ".env.local")

if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (!match || process.env[match[1]]) continue

    const value = match[2].replace(/^['"]|['"]$/g, "")
    process.env[match[1]] = value
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const demoPassword = process.env.DEMO_PASSWORD ?? "DemoPass123!"

class NoopRealtimeTransport {
  CONNECTING = 0
  OPEN = 1
  CLOSING = 2
  CLOSED = 3
  readyState = this.CLOSED
  protocol = ""
  binaryType = "blob"
  bufferedAmount = 0
  extensions = ""
  onopen = null
  onmessage = null
  onclose = null
  onerror = null

  constructor(address) {
    this.url = String(address)
  }

  close() {}
  send() {}
  addEventListener() {}
  removeEventListener() {}
  dispatchEvent() {
    return false
  }
}

if (!url || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.")
  process.exit(1)
}

const supabase = createClient(url, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  realtime: {
    transport: NoopRealtimeTransport,
  },
})

const users = [
  {
    email: "advertiser.demo@dooh.local",
    role: "advertiser",
    full_name: "Amina Advertiser",
    company_name: "Demo Brands Ltd",
    phone: "+254700000101",
  },
  {
    email: "owner.demo@dooh.local",
    role: "media_owner",
    full_name: "Brian Media Owner",
    company_name: "Demo Screens Ltd",
    phone: "+254700000202",
  },
  {
    email: "admin.demo@dooh.local",
    role: "admin",
    full_name: "Admin Operator",
    company_name: "DOOH Platform",
    phone: "+254700000303",
  },
]

function isoDate(daysFromToday) {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() + daysFromToday)
  return date.toISOString().slice(0, 10)
}

async function ensureUser(user) {
  const { data: userList, error: listError } = await supabase.auth.admin.listUsers()
  if (listError) throw listError

  let existing = userList.users.find(item => item.email?.toLowerCase() === user.email)

  if (!existing) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: demoPassword,
      email_confirm: true,
      user_metadata: {
        full_name: user.full_name,
        company_name: user.company_name,
        phone: user.phone,
        role: user.role,
      },
    })

    if (error) throw error
    existing = data.user
  } else {
    const { data, error } = await supabase.auth.admin.updateUserById(existing.id, {
      password: demoPassword,
      email_confirm: true,
      user_metadata: {
        full_name: user.full_name,
        company_name: user.company_name,
        phone: user.phone,
        role: user.role,
      },
    })

    if (error) throw error
    existing = data.user
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .upsert({
      id: existing.id,
      full_name: user.full_name,
      company_name: user.company_name,
      phone: user.phone,
      role: user.role,
      is_verified: true,
    })

  if (profileError) throw profileError

  return existing
}

async function ensureScreen(ownerId, screen) {
  const { data: existing, error: findError } = await supabase
    .from("screens")
    .select("id")
    .eq("owner_id", ownerId)
    .eq("name", screen.name)
    .maybeSingle()

  if (findError) throw findError

  if (existing) {
    const { data, error } = await supabase
      .from("screens")
      .update(screen)
      .eq("id", existing.id)
      .select("id")
      .single()

    if (error) throw error
    return data
  }

  const { data, error } = await supabase
    .from("screens")
    .insert({ ...screen, owner_id: ownerId })
    .select("id")
    .single()

  if (error) throw error
  return data
}

async function ensureBooking(booking) {
  const { data, error } = await supabase
    .from("bookings")
    .upsert(booking, { onConflict: "reference" })
    .select("id")
    .single()

  if (error) throw error
  return data
}

async function ensurePayment(payment) {
  async function writePayment(method) {
    const payload = { ...payment, method }

    if (existing) {
      return supabase
        .from("payments")
        .update(payload)
        .eq("id", existing.id)
        .select("id")
        .single()
    }

    return supabase
      .from("payments")
      .insert(payload)
      .select("id")
      .single()
  }

  const { data: existing, error: findError } = await supabase
    .from("payments")
    .select("id")
    .eq("provider_reference", payment.provider_reference)
    .maybeSingle()

  if (findError) throw findError

  let { data, error } = await writePayment(payment.method)

  if (error && payment.method === "bank_transfer") {
    const fallback = await writePayment("card")
    data = fallback.data
    error = fallback.error
  }

  if (error) throw error
  return data
}

const [advertiser, owner] = await Promise.all(users.map(ensureUser))

const pendingScreen = await ensureScreen(owner.id, {
  name: "Demo Pending Screen - Westlands",
  description: "A pending demo listing for admin approval testing.",
  screen_type: "billboard",
  status: "pending",
  width_meters: 8,
  height_meters: 4,
  resolution_width: 1920,
  resolution_height: 1080,
  latitude: -1.2647,
  longitude: 36.8058,
  address: "Waiyaki Way, Westlands",
  city: "Nairobi",
  area: "Westlands",
  price_per_day: 18000,
  price_per_week: 110000,
  price_per_month: 420000,
  is_featured: false,
})

const activeScreen = await ensureScreen(owner.id, {
  name: "Demo Active Screen - CBD",
  description: "A live demo listing for advertiser booking tests.",
  screen_type: "mall",
  status: "active",
  width_meters: 6,
  height_meters: 3,
  resolution_width: 1920,
  resolution_height: 1080,
  latitude: -1.2864,
  longitude: 36.8172,
  address: "Kimathi Street, Nairobi CBD",
  city: "Nairobi",
  area: "CBD",
  price_per_day: 15000,
  price_per_week: 90000,
  price_per_month: 340000,
  is_featured: true,
})

const bookingAmount = {
  total_days: 5,
  amount_subtotal: 75000,
  platform_fee: 9000,
  amount_total: 84000,
}

const pendingBooking = await ensureBooking({
  reference: "DEMO-PENDING-BOOKING",
  advertiser_id: advertiser.id,
  screen_id: activeScreen.id,
  status: "pending",
  start_date: isoDate(7),
  end_date: isoDate(11),
  ...bookingAmount,
  creative_url: "https://example.com/demo-creative.jpg",
  creative_format: "Image, 1920x1080",
  payment_status: "pending",
  notes: "Demo pending booking for owner/admin approval testing.",
})

const approvedBooking = await ensureBooking({
  reference: "DEMO-APPROVED-UNPAID",
  advertiser_id: advertiser.id,
  screen_id: activeScreen.id,
  status: "approved",
  start_date: isoDate(14),
  end_date: isoDate(18),
  ...bookingAmount,
  creative_url: "https://example.com/demo-creative-approved.jpg",
  creative_format: "Image, 1920x1080",
  payment_status: "pending",
  notes: "Demo approved booking for payment verification testing.",
})

await ensurePayment({
  booking_id: approvedBooking.id,
  advertiser_id: advertiser.id,
  amount: bookingAmount.amount_total,
  currency: "KES",
  method: "bank_transfer",
  provider_reference: "BANK:DEMO-TRANSFER-001",
  status: "pending",
})

console.log("Demo data ready.")
console.log(`Password for all demo users: ${demoPassword}`)
console.log("")
console.log("Users:")
for (const user of users) {
  console.log(`- ${user.role}: ${user.email}`)
}
console.log("")
console.log("Seeded records:")
console.log(`- Pending screen: ${pendingScreen.id}`)
console.log(`- Active screen: ${activeScreen.id}`)
console.log(`- Pending booking: ${pendingBooking.id}`)
console.log(`- Approved unpaid booking: ${approvedBooking.id}`)
