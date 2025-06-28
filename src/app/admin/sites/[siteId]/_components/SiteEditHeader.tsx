"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import type { Site } from "@/types/site";

type SiteEditHeaderProps = {
  site: Site;
};

export function SiteEditHeader({ site }: SiteEditHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.push("/admin/sites")}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Sites
      </Button>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Edit Site: {site.name}
        </h1>
        <p className="text-muted-foreground">
          Manage site details, user assignments, and features
        </p>
      </div>
      <div className="ml-auto pr-4">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          Created {format(new Date(site.createdAt), "MMM d, yyyy")}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          Updated {format(new Date(site.updatedAt), "MMM d, yyyy")}
        </div>
      </div>
    </div>
  );
}
