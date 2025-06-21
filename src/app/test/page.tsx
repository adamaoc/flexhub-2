'use client'

import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'

export default function TestPage() {
  const { data: session, status } = useSession()

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-foreground">Test Page</h1>
        
        <div className="bg-card border rounded-lg p-6 space-y-4">
          <h2 className="text-2xl font-semibold text-card-foreground">Authentication Status</h2>
          <p className="text-muted-foreground">Status: {status}</p>
          {session ? (
            <div className="space-y-2">
              <p className="text-foreground">Logged in as: {session.user?.name}</p>
              <p className="text-foreground">Email: {session.user?.email}</p>
              <p className="text-foreground">Role: {session.user?.role}</p>
            </div>
          ) : (
            <p className="text-muted-foreground">Not logged in</p>
          )}
        </div>

        <div className="bg-card border rounded-lg p-6 space-y-4">
          <h2 className="text-2xl font-semibold text-card-foreground">Button Test</h2>
          <div className="flex gap-4 flex-wrap">
            <Button variant="default">Default Button</Button>
            <Button variant="outline">Outline Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="destructive">Destructive Button</Button>
            <Button variant="ghost">Ghost Button</Button>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6 space-y-4">
          <h2 className="text-2xl font-semibold text-card-foreground">Color Test</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-primary text-primary-foreground p-4 rounded">Primary</div>
            <div className="bg-secondary text-secondary-foreground p-4 rounded">Secondary</div>
            <div className="bg-accent text-accent-foreground p-4 rounded">Accent</div>
            <div className="bg-muted text-muted-foreground p-4 rounded">Muted</div>
            <div className="bg-destructive text-destructive-foreground p-4 rounded">Destructive</div>
            <div className="bg-card text-card-foreground p-4 rounded border">Card</div>
          </div>
        </div>
      </div>
    </div>
  )
} 