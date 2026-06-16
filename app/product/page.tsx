import type { Metadata } from "next"
import { MarketingPage, MarketingSection } from "@/app/components/MarketingPage"

export const metadata: Metadata = {
  title: "Product | DOOH",
  description: "Plan, book, approve, and manage digital out-of-home campaigns from one DOOH platform.",
}

const workflows = [
  {
    title: "Advertiser workspace",
    body: "Discover screens, estimate campaign cost, submit bookings, and track payment status without calling every media owner individually.",
  },
  {
    title: "Media owner console",
    body: "List inventory, upload screen imagery, review booking requests, and keep availability visible to demand partners.",
  },
  {
    title: "Admin operations",
    body: "Approve screens, monitor bookings, enforce platform rules, and keep the marketplace clean as supply grows.",
  },
]

const capabilities = [
  "Screen discovery by city, format, venue, and price",
  "Booking requests with date ranges and campaign notes",
  "Approval flows for screens and campaign operations",
  "Marketplace fees, payment records, payouts, and notifications",
]

export default function ProductPage() {
  return (
    <MarketingPage
      eyebrow="Product"
      title="A complete operating system for digital outdoor media."
      description="DOOH gives advertisers, media owners, and admins the same live workspace, so campaigns move from discovery to booking with less friction."
      primaryCta={{ label: "Start Booking", href: "/screens" }}
      secondaryCta={{ label: "Create Account", href: "/register" }}
    >
      <MarketingSection
        eyebrow="Workflows"
        title="Built around the three sides of the marketplace."
        description="The product is not just a landing page anymore. These flows are wired into the app and ready to grow with real Supabase data."
      >
        <div className="marketing-card-grid">
          {workflows.map((item) => (
            <article key={item.title} className="marketing-card">
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </MarketingSection>

      <MarketingSection
        eyebrow="Capabilities"
        title="What the baseline product already supports."
      >
        <div className="marketing-list-grid">
          {capabilities.map((capability) => (
            <div key={capability} className="marketing-list-item">
              <span aria-hidden="true" />
              <p>{capability}</p>
            </div>
          ))}
        </div>
      </MarketingSection>
    </MarketingPage>
  )
}
