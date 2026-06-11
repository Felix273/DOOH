'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, Monitor } from 'lucide-react'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      backgroundColor: '#fff', borderBottom: '1px solid #F3F4F6',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>

          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '34px', height: '34px', backgroundColor: '#0A0A0A',
              borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Monitor size={16} color="#FF6B35" />
            </div>
            <span style={{ fontWeight: '800', color: '#0A0A0A', fontSize: '18px', letterSpacing: '-0.5px' }}>
              DOOH<span style={{ color: '#FF6B35' }}>.</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <Link href="/screens" style={{ fontSize: '14px', fontWeight: '500', color: '#6B7280' }}>Browse Screens</Link>
            <Link href="/how-it-works" style={{ fontSize: '14px', fontWeight: '500', color: '#6B7280' }}>How It Works</Link>
            <Link href="/pricing" style={{ fontSize: '14px', fontWeight: '500', color: '#6B7280' }}>Pricing</Link>
          </div>

          {/* Desktop CTA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link href="/login" style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
              Log in
            </Link>
            <Link href="/register?role=advertiser" style={{
              fontSize: '14px', fontWeight: '600', backgroundColor: '#0A0A0A',
              color: '#fff', padding: '8px 18px', borderRadius: '8px'
            }}>
              Get Started
            </Link>
            <Link href="/register?role=media_owner" style={{
              fontSize: '14px', fontWeight: '600', backgroundColor: '#FF6B35',
              color: '#fff', padding: '8px 18px', borderRadius: '8px'
            }}>
              List Your Screen
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
