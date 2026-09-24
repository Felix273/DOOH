import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How DOOH Platform handles account, inventory, booking, and campaign information.",
}

export default function PrivacyPage() {
  return (
    <main style={{ minHeight: "100vh", background: "var(--bg-base)", padding: "var(--space-8)" }}>
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <Link href="/" style={{ color: "var(--accent)", textDecoration: "none", fontSize: 13 }}>Back home</Link>
        <article className="card-elevated" style={{ padding: "var(--space-10)", marginTop: "var(--space-4)" }}>
          <p className="t-label-accent" style={{ marginBottom: 8 }}>DOOH Platform</p>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 700, marginBottom: 12 }}>Privacy Policy</h1>
          <p style={{ color: "var(--text-muted)", marginBottom: 24 }}>Plain-language summary · Last updated September 2026</p>
          <div style={{ display: "grid", gap: 18, color: "var(--text-secondary)" }}>
            <p>DOOH Platform helps advertisers discover digital screens and helps media owners manage inventory and booking requests. This notice explains the information needed to operate those services.</p>
            <section><h2 className="t-heading" style={{ color: "var(--text-primary)", marginBottom: 8 }}>Information we collect</h2><p>We collect account details such as name, company, email, phone number, role, and authentication records. We also store screen listings, booking dates, campaign notes, creative references, payment records, payout records, and operational notifications created through the marketplace.</p></section>
            <section><h2 className="t-heading" style={{ color: "var(--text-primary)", marginBottom: 8 }}>How we use information</h2><p>We use this information to authenticate users, display inventory, calculate booking totals, route requests to the relevant media owner, maintain marketplace records, provide support, prevent misuse, and improve reliability. We do not need campaign data for unrelated advertising purposes.</p></section>
            <section><h2 className="t-heading" style={{ color: "var(--text-primary)", marginBottom: 8 }}>Sharing and service providers</h2><p>Booking and inventory details are shared with the advertiser, media owner, and platform administrators who need them to fulfil a transaction. Infrastructure, authentication, storage, and payment providers may process information on our behalf. We do not sell account information.</p></section>
            <section><h2 className="t-heading" style={{ color: "var(--text-primary)", marginBottom: 8 }}>Security and retention</h2><p>Access is restricted by role and database policies. We retain records for as long as needed to provide the marketplace, resolve disputes, meet legal or accounting obligations, and protect the service. No online system can guarantee absolute security.</p></section>
            <section><h2 className="t-heading" style={{ color: "var(--text-primary)", marginBottom: 8 }}>Your choices</h2><p>You may request access to, correction of, or deletion of your account information subject to records we must retain. Use the support channel associated with your account for privacy requests and include the email address used to register.</p></section>
            <section><h2 className="t-heading" style={{ color: "var(--text-primary)", marginBottom: 8 }}>Important notice</h2><p>This summary should be reviewed against the final operating entity, hosting providers, payment providers, and applicable Kenyan privacy requirements before production collection of personal or payment data.</p></section>
          </div>
        </article>
      </div>
    </main>
  )
}
