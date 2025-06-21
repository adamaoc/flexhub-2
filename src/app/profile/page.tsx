'use client'

import { useSession } from 'next-auth/react'
import { AuthenticatedLayout } from '@/components/AuthenticatedLayout'

export default function UsersPage() {
  const { data: session } = useSession()

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Profile
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your profile
          </p>
        </div>
        <div className="p-6">
            <div className="bg-muted p-4 rounded-md">
              <h4 className="font-medium text-card-foreground mb-2">User Information</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p><strong>Name:</strong> {session?.user?.name}</p>
                <p><strong>Email:</strong> {session?.user?.email}</p>
                <p><strong>Role:</strong> {session?.user?.role || 'USER'}</p>
                <p><strong>Status:</strong> {session?.user?.isActive ? 'Active' : 'Inactive'}</p>
              </div>
            </div>
          </div>
          </div>
    </AuthenticatedLayout>
  )
} 