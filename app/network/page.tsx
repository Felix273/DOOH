import type { Metadata } from "next"
import Link from "next/link"
import { MarketingPage, MarketingSection } from "@/app/components/MarketingPage"

export const metadata: Metadata = {
  title: "Network | DOOH",
  description: "Explore the DOOH screen network across Kenya's busiest commercial, transit, and retail environments.",
}

const cities = [
  { name: "Nairobi", screens: "724", formats: "CBD, highways, malls, transit" },
  { name: "Mombasa", screens: "198", formats: "tourism corridors, retail, port access" },
  { name: "Kisumu", screens: "112", formats: "CBD, lakefront, arterial roads" },
  { name: "Nakuru", screens: "89", formats: "highway, retail, commuter hubs" },
  { name: "Eldoret", screens: "76", formats: "CBD, stadium, campus routes" },
  { name: "Thika", screens: "45", formats: "industrial, highway, mall inventory" },
]

export default function NetworkPage() {
  return (
    <MarketingPage
      eyebrow="Network"
      title="Premium screens where Kenyan audiences actually move."
      description="Browse a growing network of roadside, mall, transit, and venue-based digital screens, then move straight into campaign booking."
      primaryCta={{ label: "Browse Live Screens", href: "/screens" }}
      secondaryCta={{ label: "Add Your Screens", href: "/owner/screens/new" }}
    >
      <MarketingSection
        eyebrow="Coverage"
        title="Major commercial corridors, one searchable network."
        description="Use this page as the public network overview; use the screens page for inventory-level browsing and booking."
      >
        <div className="marketing-metric-grid">
          {cities.map((city) => (
            <article key={city.name} className="marketing-metric-card">
              <div>
                <p className="t-label">{city.name}</p>
                <strong>{city.screens}</strong>
              </div>
              <p>{city.formats}</p>
            </article>
          ))}
        </div>
      </MarketingSection>

      <section className="marketing-band">
        <div className="container marketing-split">
          <div>
            <p className="t-label-accent">Inventory Types</p>
            <h2>Roadside impact, retail context, and transit frequency.</h2>
          </div>
          <div className="marketing-card-grid compact">
            {["Digital billboards", "Mall screens", "Transit displays", "Venue screens"].map((format) => (
              <Link key={format} href="/screens" className="marketing-card link-card">
                <h3>{format}</h3>
                <p>Explore available inventory and request campaign dates.</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </MarketingPage>
  )
}
