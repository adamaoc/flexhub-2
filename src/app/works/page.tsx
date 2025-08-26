"use client";

import { useCurrentSite } from "@/hooks/use-current-site";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import WorksManager from "@/components/WorksManager";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";

export default function WorksPage() {
  const { currentSite } = useCurrentSite();

  // Check if works feature is enabled
  const isWorksFeatureEnabled = currentSite?.features?.some(
    (feature) => feature.feature === "WORKS" && feature.isEnabled
  );

  if (!currentSite) {
    return (
      <AuthenticatedLayout>
        <div>Loading...</div>
      </AuthenticatedLayout>
    );
  }

  if (!isWorksFeatureEnabled) {
    return (
      <AuthenticatedLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Works</h1>
            <p className="text-muted-foreground">
              Showcase your portfolio work and projects
            </p>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                <CardTitle>Feature Not Enabled</CardTitle>
              </div>
              <CardDescription>
                The Works feature is not enabled for this site.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Contact your administrator to enable the Works feature for this
                site. Once enabled, you&apos;ll be able to showcase your
                portfolio work and projects.
              </p>
            </CardContent>
          </Card>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Works</h1>
            <p className="text-muted-foreground">
              Showcase your portfolio work and projects for {currentSite.name}
            </p>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Feature Enabled
          </Badge>
        </div>

        <WorksManager />
      </div>
    </AuthenticatedLayout>
  );
}
