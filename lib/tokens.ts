// ============================================
// DOOH PLATFORM — Design Tokens (TypeScript)
// Single source of truth for JS/TS usage
// ============================================

export const colors = {
  // Canvas
  bgBase:     '#080808',
  bgSurface:  '#111111',
  bgElevated: '#1a1a1a',
  bgOverlay:  '#222222',

  // Text
  textPrimary:   '#f0f0f0',
  textSecondary: 'rgba(240, 240, 240, 0.55)',
  textMuted:     'rgba(240, 240, 240, 0.28)',
  textInverse:   '#080808',

  // Accent
  accent:    '#c8ff00',
  accentDim: 'rgba(200, 255, 0, 0.12)',
  accentGlow:'rgba(200, 255, 0, 0.06)',

  // Borders
  borderSubtle:  'rgba(240, 240, 240, 0.06)',
  borderDefault: 'rgba(240, 240, 240, 0.12)',
  borderStrong:  'rgba(240, 240, 240, 0.24)',

  // Status
  statusLive:   '#00e676',
  statusPaused: '#ffc107',
  statusDraft:  'rgba(240, 240, 240, 0.28)',
  statusError:  '#ff4444',
} as const

export const fonts = {
  display: "'Space Grotesk', 'Helvetica Neue', Arial, sans-serif",
  body:    "'Inter', 'Helvetica Neue', Arial, sans-serif",
  mono:    "'Space Mono', 'Courier New', monospace",
} as const

export const spacing = {
  1: '4px',  2: '8px',  3: '12px', 4: '16px',
  5: '20px', 6: '24px', 8: '32px', 10: '40px',
  12: '48px',16: '64px',20: '80px',24: '96px',
  32: '128px',
} as const

export const radius = {
  sm:   '4px',
  md:   '8px',
  lg:   '12px',
  xl:   '20px',
  pill: '999px',
} as const

export const layout = {
  maxWidth:     '1280px',
  navHeight:    '64px',
  sidebarWidth: '240px',
} as const

// Campaign status types
export type CampaignStatus = 'live' | 'paused' | 'draft' | 'scheduled' | 'ended'
export type ScreenStatus = 'online' | 'offline' | 'maintenance'

// Color map for status badges
export const statusColors: Record<CampaignStatus, { color: string; bg: string; border: string }> = {
  live:      { color: '#00e676', bg: 'rgba(0,230,118,0.10)',  border: 'rgba(0,230,118,0.20)'  },
  paused:    { color: '#ffc107', bg: 'rgba(255,193,7,0.10)',  border: 'rgba(255,193,7,0.20)'  },
  draft:     { color: 'rgba(240,240,240,0.28)', bg: 'rgba(240,240,240,0.05)', border: 'rgba(240,240,240,0.08)' },
  scheduled: { color: '#c8ff00', bg: 'rgba(200,255,0,0.10)',  border: 'rgba(200,255,0,0.20)'  },
  ended:     { color: 'rgba(240,240,240,0.28)', bg: 'rgba(240,240,240,0.05)', border: 'rgba(240,240,240,0.08)' },
}
