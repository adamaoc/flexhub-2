'use client'

import { SessionProvider } from 'next-auth/react'
import { CurrentSiteProvider } from '@/hooks/use-current-site'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CurrentSiteProvider>
        {children}
      </CurrentSiteProvider>
    </SessionProvider>
  )
} 