import Link from 'next/link'
import { Monitor } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[#0A0A0A] text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <Monitor className="w-4 h-4 text-[#FF6B35]" />
              </div>
              <span className="font-bold text-white text-lg">
                DOOH<span className="text-[#FF6B35]">.</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed">
              The easiest way to book digital billboard advertising in Kenya.
            </p>
          </div>

          {/* Advertisers */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Advertisers</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/screens" className="hover:text-white transition-colors">Browse Screens</Link></li>
              <li><Link href="/how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="/register?role=advertiser" className="hover:text-white transition-colors">Sign Up</Link></li>
            </ul>
          </div>

          {/* Media Owners */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Media Owners</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/register?role=media_owner" className="hover:text-white transition-colors">List Your Screen</Link></li>
              <li><Link href="/owner/dashboard" className="hover:text-white transition-colors">Owner Dashboard</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm">© 2025 DOOH Platform. All rights reserved.</p>
          <p className="text-sm">Built for Kenya 🇰🇪</p>
        </div>
      </div>
    </footer>
  )
}
