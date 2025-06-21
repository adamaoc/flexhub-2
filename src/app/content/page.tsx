'use client'

import { AuthenticatedLayout } from '@/components/AuthenticatedLayout'

export default function ContentPage() {
  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Content Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your content and media files
          </p>
        </div>
        
        <div className="bg-card overflow-hidden shadow-sm rounded-lg border">
          <div className="p-6">
            <h3 className="text-lg leading-6 font-medium text-card-foreground mb-4">
              Content Dashboard
            </h3>
            <p className="text-sm text-muted-foreground">
              This is where you'll manage your content, create new pages, and organize your media files.
            </p>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  )
} 