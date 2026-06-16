import Link from "next/link"

export default function PrivacyPage() {
  return (
    <main style={{ minHeight: "100vh", background: "var(--bg-base)", padding: "var(--space-8)" }}>
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <Link href="/" style={{ color: "var(--accent)", textDecoration: "none", fontSize: 13 }}>Back home</Link>
        <article className="card-elevated" style={{ padding: "var(--space-10)", marginTop: "var(--space-4)" }}>
          <p className="t-label-accent" style={{ marginBottom: 8 }}>DOOH Platform</p>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 700, marginBottom: 20 }}>Privacy Policy</h1>
          <div style={{ display: "grid", gap: 18, color: "var(--text-secondary)" }}>
            <p>This starter privacy page summarizes the platform data flows currently represented in the app.</p>
            <section>
              <h2 className="t-heading" style={{ color: "var(--text-primary)", marginBottom: 8 }}>Account Data</h2>
              <p>We store profile details such as name, company, phone, email identity, and role so advertisers and media owners can use the marketplace.</p>
            </section>
            <section>
              <h2 className="t-heading" style={{ color: "var(--text-primary)", marginBottom: 8 }}>Marketplace Data</h2>
              <p>Screen listings, booking requests, creative references, payments, payouts, and notifications are stored to operate the campaign workflow.</p>
            </section>
            <section>
              <h2 className="t-heading" style={{ color: "var(--text-primary)", marginBottom: 8 }}>Access Controls</h2>
              <p>The database uses row-level security so users can access only the records relevant to their role, while admins can review and manage platform operations.</p>
            </section>
            <section>
              <h2 className="t-heading" style={{ color: "var(--text-primary)", marginBottom: 8 }}>Production Legal Review</h2>
              <p>Replace this page with counsel-reviewed privacy language before collecting real user or payment data.</p>
            </section>
          </div>
        </article>
      </div>
    </main>
  )
}
