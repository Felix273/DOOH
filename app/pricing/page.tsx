import type { Metadata } from "next"
import { MarketingPage, MarketingSection } from "@/app/components/MarketingPage"
import { formatCurrency } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Pricing",
  description: "Understand daily screen rates, campaign totals, and the DOOH marketplace fee before requesting a booking.",
}

const plans = [
  {
    name: "Starter",
    price: "Pay per screen",
    description: "For lean brands testing digital outdoor with short campaigns and focused locations.",
    features: ["Browse active inventory", "See daily rates before booking", "Request campaign dates", "Track booking status"],
  },
  {
    name: "Agency",
    price: "Campaign bundles",
    description: "For teams managing multiple brands, budgets, and flight dates across cities.",
    features: ["Compare multiple locations", "Plan client-ready campaigns", "Centralize booking history", "Request a consolidated quote"],
  },
  {
    name: "Media Owner",
    price: "12% platform fee",
    description: "List approved screens and receive qualified booking demand through the marketplace.",
    features: ["Keep control of your screen rates", "Review booking requests", "Receive payout-ready records", "See the fee before accepting"],
  },
]

const examples = [
  { label: "Nairobi starter example", screens: "1 screen", duration: "7 days", rate: 18000, subtotal: 126000 },
  { label: "Multi-screen example", screens: "3 screens", duration: "7 days", rate: 15000, subtotal: 315000 },
]

export default function PricingPage() {
  return (
    <MarketingPage
      eyebrow="Pricing"
      title="Understand the cost before you book."
      description="Advertisers pay the listed daily screen rate multiplied by campaign days. Every booking summary shows the subtotal, marketplace fee, and total before submission."
      primaryCta={{ label: "Estimate With Screens", href: "/screens" }}
      secondaryCta={{ label: "Register", href: "/register" }}
    >
      <MarketingSection
        eyebrow="Plans"
        title="Start with the workflow that fits your role."
        description="Screen rates vary by location, format, audience, and availability. Browse live inventory to see current prices."
      >
        <div className="pricing-grid">
          {plans.map((plan) => (
            <article key={plan.name} className="pricing-card">
              <p className="t-label-accent">{plan.name}</p>
              <h3>{plan.price}</h3>
              <p>{plan.description}</p>
              <ul>
                {plan.features.map((feature) => <li key={feature}>{feature}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </MarketingSection>

      <MarketingSection
        eyebrow="Worked examples"
        title="See how a campaign total is formed."
        description="These examples use illustrative screen rates. The live marketplace always shows the actual rate attached to each approved screen."
      >
        <div className="pricing-grid">
          {examples.map((example) => (
            <article key={example.label} className="pricing-card">
              <p className="t-label-accent">{example.label}</p>
              <h3>{formatCurrency(example.subtotal * 1.12)} total</h3>
              <p>{example.screens} · {example.duration} · illustrative rate {formatCurrency(example.rate)}/screen/day</p>
              <div className="stat-card" style={{ marginTop: 20, padding: "var(--space-4)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}><span>Subtotal</span><strong>{formatCurrency(example.subtotal)}</strong></div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16, marginTop: 8 }}><span>Marketplace fee</span><strong>{formatCurrency(example.subtotal * 0.12)}</strong></div>
              </div>
            </article>
          ))}
        </div>
      </MarketingSection>

      <MarketingSection
        eyebrow="Fee model"
        title="The marketplace fee is visible by design."
        description="The current advertiser booking calculation applies a 12% platform fee to the screen subtotal. Taxes, creative production, and third-party payment charges are not included unless stated in the booking summary."
      >
        <div className="marketing-stat-row">
          <div><strong>12%</strong><span>Platform fee</span></div>
          <div><strong>Daily</strong><span>Screen rates</span></div>
          <div><strong>Before booking</strong><span>Total shown</span></div>
        </div>
      </MarketingSection>
    </MarketingPage>
  )
}
