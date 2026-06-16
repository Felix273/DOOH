import type { Metadata } from "next"
import { MarketingPage, MarketingSection } from "@/app/components/MarketingPage"

export const metadata: Metadata = {
  title: "About | DOOH",
  description: "Learn about the DOOH marketplace for digital outdoor media in Kenya.",
}

const principles = [
  "Make outdoor inventory easier to discover and book.",
  "Give media owners better tools to commercialize screens.",
  "Keep approvals, payments, and marketplace trust explicit.",
  "Build for Kenyan routes, cities, and buying patterns first.",
]

export default function AboutPage() {
  return (
    <MarketingPage
      eyebrow="About"
      title="We are building the operating layer for Kenya's DOOH market."
      description="The platform connects advertisers with verified digital screen inventory, while giving owners and admins the tools to keep campaigns moving."
      primaryCta={{ label: "Explore Product", href: "/product" }}
      secondaryCta={{ label: "Browse Network", href: "/network" }}
    >
      <MarketingSection
        eyebrow="Mission"
        title="Bring more clarity, speed, and trust to outdoor media."
        description="Outdoor campaigns should not depend on scattered spreadsheets, hidden availability, and manual approval chains. This app turns those steps into a shared marketplace workflow."
      >
        <div className="marketing-list-grid">
          {principles.map((principle) => (
            <div key={principle} className="marketing-list-item">
              <span aria-hidden="true" />
              <p>{principle}</p>
            </div>
          ))}
        </div>
      </MarketingSection>

      <section className="marketing-band">
        <div className="container marketing-split">
          <div>
            <p className="t-label-accent">What is next</p>
            <h2>From clean baseline to production marketplace.</h2>
          </div>
          <p className="t-body">
            The current build now has real marketing routes, dashboard routes, Supabase schema, role-aware access, and booking workflows. The next layer is richer data, stronger admin tools, and end-to-end payment integration.
          </p>
        </div>
      </section>
    </MarketingPage>
  )
}
