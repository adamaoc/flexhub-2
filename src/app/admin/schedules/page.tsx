"use client";

import { useSession } from "next-auth/react";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import ScdQuoteRequestsDashboard from "@/components/ScdQuoteRequestsDashboard";
import DevisionBookingsDashboard from "@/components/DevisionBookingsDashboard";

export default function SchedulesPage() {
  const { data: session } = useSession();

  // Check if user has access to schedules (admin or super admin)
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPERADMIN") {
    return (
      <AuthenticatedLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Access Denied
            </h1>
            <p className="text-muted-foreground mt-2">
              You don&apos;t have permission to access this page. Admin
              privileges required.
            </p>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Schedules & Bookings
          </h1>
          <p className="text-muted-foreground">
            Manage cleaning service schedules and quote requests
          </p>
        </div>

        <ScdQuoteRequestsDashboard />
        <DevisionBookingsDashboard />
      </div>
    </AuthenticatedLayout>
  );
}
