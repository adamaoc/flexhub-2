"use client";

import { useSession } from "next-auth/react";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import type { Site } from "@/types/site";
import { SiteEditHeader } from "./_components/SiteEditHeader";
import { UserManagement } from "./_components/UserManagement";
import { SiteDetails } from "./_components/SiteDetails";
import { SiteFeatureStats } from "./_components/SiteFeatureStats";
import { FeaturesManagement } from "./_components/FeaturesManagement";
import { DeleteSiteAction } from "./_components/DeleteSiteAction";
import { ErrorState } from "./_components/ErrorState";
import { LoadingState } from "./_components/LoadingState";
import { SiteImageManagement } from "./_components/SiteImageManagement";

export default function EditSitePage() {
  const { data: session } = useSession();
  const params = useParams();
  const siteId = params.siteId as string;

  const [site, setSite] = useState<Site | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSite = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/sites/${siteId}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Site not found");
        }
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch site");
      }

      const data = await response.json();
      setSite(data.site);
    } catch (err) {
      console.error("Error fetching site:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [siteId]);

  useEffect(() => {
    if (siteId) {
      fetchSite();
    }
  }, [siteId, fetchSite]);

  // Check if user has access (super admin only)
  if (session?.user?.role !== "SUPERADMIN") {
    return (
      <AuthenticatedLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Access Denied
            </h1>
            <p className="text-muted-foreground mt-2">
              You don&apos;t have permission to access this page. Super admin
              privileges required.
            </p>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  if (loading) {
    return <LoadingState />;
  }

  if (error || !site) {
    return <ErrorState error={error} />;
  }

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <SiteEditHeader site={site} />

        <div className="grid gap-6 md:grid-cols-2">
          {/* Site Details */}
          <SiteDetails site={site} onSiteUpdate={fetchSite} />

          {/* User Management */}
          <UserManagement site={site} onSiteUpdate={fetchSite} />
        </div>

        {/* Site Feature Stats */}
        <SiteFeatureStats site={site} />

        {/* Site Image Management */}
        <SiteImageManagement site={site} onSiteUpdate={fetchSite} />

        {/* Features Management */}
        <FeaturesManagement site={site} onSiteUpdate={fetchSite} />

        {/* Delete Site Action */}
        <DeleteSiteAction site={site} onError={setError} />
      </div>
    </AuthenticatedLayout>
  );
}
