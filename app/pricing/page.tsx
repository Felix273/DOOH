import type { Metadata } from "next"
import { MarketingPage, MarketingSection } from "@/app/components/MarketingPage"

export const metadata: Metadata = {
  title: "Pricing | DOOH",
  description: "Simple campaign pricing for advertisers and transparent marketplace fees for media owners.",
}

const plans = [
  {
    name: "Starter",
    price: "Pay per screen",
    description: "For lean brands testing digital outdoor with short campaigns and focused locations.",
    features: ["Browse live screen inventory", "Request campaign dates", "Track booking status"],
  },
  {
    name: "Agency",
    price: "Campaign bundles",
    description: "For teams managing multiple brands, budgets, and flight dates across cities.",
    features: ["Multi-location planning", "Client-ready campaign notes", "Booking history"],
  },
  {
    name: "Media Owner",
    price: "12% platform fee",
    description: "List approved screens and receive qualified booking demand through the marketplace.",
    features: ["Screen listing workflow", "Booking review dashboard", "Payout-ready records"],
  },
]

export default function PricingPage() {
  return (
    <MarketingPage
      eyebrow="Pricing"
      title="Transparent pricing for campaigns and inventory partners."
      description="Advertisers pay based on screen rate and campaign duration. Media owners keep control of inventory, while platform fees stay visible."
      primaryCta={{ label: "Estimate With Screens", href: "/screens" }}
      secondaryCta={{ label: "Register", href: "/register" }}
    >
      <MarketingSection
        eyebrow="Plans"
        title="Start with the workflow that fits your role."
        description="The app can price campaigns from actual screen records once your inventory is loaded."
      >
        <div className="pricing-grid">
          {plans.map((plan) => (
            <article key={plan.name} className="pricing-card">
              <p className="t-label-accent">{plan.name}</p>
              <h3>{plan.price}</h3>
              <p>{plan.description}</p>
              <ul>
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </MarketingSection>

      <MarketingSection
        eyebrow="Fee Model"
        title="The marketplace fee is visible by design."
        description="The current baseline uses a 12% platform fee in booking calculations, giving us a clean starting point for payment and payout logic."
      >
        <div className="marketing-stat-row">
          <div>
            <strong>12%</strong>
            <span>Platform fee</span>
          </div>
          <div>
            <strong>Daily</strong>
            <span>Screen rates</span>
          </div>
          <div>
            <strong>Dates</strong>
            <span>Campaign duration</span>
          </div>
        </div>
      </MarketingSection>
    </MarketingPage>
  )
}
