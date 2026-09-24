import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms for using the DOOH Platform marketplace to list screens and request digital OOH bookings.",
}

export default function TermsPage() {
  return (
    <main style={{ minHeight: "100vh", background: "var(--bg-base)", padding: "var(--space-8)" }}>
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <Link href="/" style={{ color: "var(--accent)", textDecoration: "none", fontSize: 13 }}>Back home</Link>
        <article className="card-elevated" style={{ padding: "var(--space-10)", marginTop: "var(--space-4)" }}>
          <p className="t-label-accent" style={{ marginBottom: 8 }}>DOOH Platform</p>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 700, marginBottom: 12 }}>Terms of Service</h1>
          <p style={{ color: "var(--text-muted)", marginBottom: 24 }}>Plain-language summary · Last updated September 2026</p>
          <div style={{ display: "grid", gap: 18, color: "var(--text-secondary)" }}>
            <p>These terms govern use of the DOOH Platform marketplace by advertisers, media owners, and authorized administrators. By creating an account, you agree to use accurate information and follow applicable law.</p>
            <section><h2 className="t-heading" style={{ color: "var(--text-primary)", marginBottom: 8 }}>Accounts and roles</h2><p>Advertisers may discover screens and request campaign dates. Media owners may submit screen listings and review booking requests. Owners must provide accurate rates, locations, specifications, availability, and operating information. DOOH may request verification before publishing inventory.</p></section>
            <section><h2 className="t-heading" style={{ color: "var(--text-primary)", marginBottom: 8 }}>Bookings and approvals</h2><p>A booking request is not confirmed until the required owner or platform approval is recorded. Campaigns must use lawful, accurate, and publicly suitable creative. DOOH may reject or pause listings and campaigns that are unsafe, misleading, unavailable, or inconsistent with platform rules.</p></section>
            <section><h2 className="t-heading" style={{ color: "var(--text-primary)", marginBottom: 8 }}>Pricing and fees</h2><p>Advertisers pay the daily rate shown for the selected screen multiplied by the requested campaign days, plus any clearly disclosed platform or third-party charges. The booking summary shows the subtotal, platform fee, and total before submission. Media-owner payouts are subject to the marketplace fee and the applicable payout schedule.</p></section>
            <section><h2 className="t-heading" style={{ color: "var(--text-primary)", marginBottom: 8 }}>Changes and cancellation</h2><p>Availability can change until a booking is approved. Cancellation, rescheduling, refunds, make-goods, and screen-outage remedies must be shown in the booking confirmation or agreed with the relevant media owner. Users should not treat an unapproved request as reserved inventory.</p></section>
            <section><h2 className="t-heading" style={{ color: "var(--text-primary)", marginBottom: 8 }}>Content and responsibility</h2><p>Advertisers are responsible for the rights, accuracy, and suitability of submitted creative. Media owners are responsible for maintaining listed equipment and promptly reporting outages or inaccurate inventory. Each party remains responsible for its own tax, regulatory, and contractual obligations.</p></section>
            <section><h2 className="t-heading" style={{ color: "var(--text-primary)", marginBottom: 8 }}>Production review</h2><p>This summary must be reviewed against the final operating entity, payment providers, service levels, dispute process, and applicable Kenyan law before production onboarding or payment collection.</p></section>
          </div>
        </article>
      </div>
    </main>
  )
}
