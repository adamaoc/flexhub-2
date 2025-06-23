'use client'

import { SessionProvider } from 'next-auth/react'
import { CurrentSiteProvider } from '@/hooks/use-current-site'
import { ThemeProvider } from '@/hooks/use-theme'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <CurrentSiteProvider>
          {children}
        </CurrentSiteProvider>
      </ThemeProvider>
    </SessionProvider>
  )
} 