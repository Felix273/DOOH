import Link from "next/link"

export default function TermsPage() {
  return (
    <main style={{ minHeight: "100vh", background: "var(--bg-base)", padding: "var(--space-8)" }}>
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <Link href="/" style={{ color: "var(--accent)", textDecoration: "none", fontSize: 13 }}>Back home</Link>
        <article className="card-elevated" style={{ padding: "var(--space-10)", marginTop: "var(--space-4)" }}>
          <p className="t-label-accent" style={{ marginBottom: 8 }}>DOOH Platform</p>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 700, marginBottom: 20 }}>Terms of Service</h1>
          <div style={{ display: "grid", gap: 18, color: "var(--text-secondary)" }}>
            <p>These starter terms describe the expected use of the DOOH Platform while the product is being completed.</p>
            <section>
              <h2 className="t-heading" style={{ color: "var(--text-primary)", marginBottom: 8 }}>Marketplace Use</h2>
              <p>Advertisers may request bookings for approved screens. Media owners are responsible for accurate inventory details, pricing, and operational availability.</p>
            </section>
            <section>
              <h2 className="t-heading" style={{ color: "var(--text-primary)", marginBottom: 8 }}>Approvals</h2>
              <p>Screen listings and campaign bookings can require review before going live. The platform may reject listings or campaigns that are inaccurate, unsafe, unlawful, or unsuitable for public display.</p>
            </section>
            <section>
              <h2 className="t-heading" style={{ color: "var(--text-primary)", marginBottom: 8 }}>Payments</h2>
              <p>Payment and payout features are represented in the data model but should be connected to approved payment providers before production use.</p>
            </section>
            <section>
              <h2 className="t-heading" style={{ color: "var(--text-primary)", marginBottom: 8 }}>Production Legal Review</h2>
              <p>Replace this page with counsel-reviewed terms before onboarding real advertisers, media owners, or payments.</p>
            </section>
          </div>
        </article>
      </div>
    </main>
  )
}
