'use client'

import { AuthenticatedLayout } from '@/components/AuthenticatedLayout'

export default function SettingsPage() {
  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Settings
          </h1>
          <p className="text-muted-foreground mt-2">
            Configure your application settings
          </p>
        </div>
        
        <div className="bg-card overflow-hidden shadow-sm rounded-lg border">
          <div className="p-6">
            <h3 className="text-lg leading-6 font-medium text-card-foreground mb-4">
              Application Settings
            </h3>
            <p className="text-sm text-muted-foreground">
              This is where you will configure application settings, manage integrations, and customize your experience.
            </p>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  )
} 