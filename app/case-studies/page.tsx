import type { Metadata } from "next"
import { MarketingPage, MarketingSection } from "@/app/components/MarketingPage"

export const metadata: Metadata = {
  title: "Case Studies | DOOH",
  description: "Example digital out-of-home campaign scenarios for agencies, retail brands, and media owners.",
}

const studies = [
  {
    client: "Retail launch",
    result: "18-screen Nairobi burst",
    body: "A national retailer used CBD and mall inventory to support a weekend product launch, with booking records centralized for finance and campaign teams.",
  },
  {
    client: "Tourism campaign",
    result: "Coast and airport corridor plan",
    body: "A travel brand grouped premium traffic corridors and retail screens into one campaign request instead of negotiating each asset separately.",
  },
  {
    client: "Media owner growth",
    result: "42 listed screens",
    body: "A regional screen operator moved inventory into a searchable owner dashboard, giving demand partners a clearer path to book available dates.",
  },
]

export default function CaseStudiesPage() {
  return (
    <MarketingPage
      eyebrow="Case Studies"
      title="How teams can run outdoor campaigns with less operational drag."
      description="These sample scenarios show the workflows the platform is being built to support: discovery, booking, approval, payment, and owner fulfilment."
      primaryCta={{ label: "View Screens", href: "/screens" }}
      secondaryCta={{ label: "Join Marketplace", href: "/register" }}
    >
      <MarketingSection
        eyebrow="Examples"
        title="Campaign stories mapped to real product flows."
      >
        <div className="case-study-list">
          {studies.map((study, index) => (
            <article key={study.client} className="case-study-card">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <p className="t-label-accent">{study.client}</p>
                <h3>{study.result}</h3>
                <p>{study.body}</p>
              </div>
            </article>
          ))}
        </div>
      </MarketingSection>
    </MarketingPage>
  )
}
