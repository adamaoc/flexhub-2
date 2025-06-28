"use client";

import { Card, CardContent } from "@/components/ui/card";
import { FileText, Image as ImageIcon, Mail, Users } from "lucide-react";
import type { Site } from "@/types/site";

type SiteWithExtendedCounts = Site & {
  _count: Site["_count"] & {
    contactSubmissions?: number;
    sponsors?: number;
  };
};

type SiteFeatureStatsProps = {
  site: SiteWithExtendedCounts;
};

export function SiteFeatureStats({ site }: SiteFeatureStatsProps) {
  const getPublishedCount = (items: Array<{ isPublished: boolean }>) => {
    return items.filter((item) => item.isPublished).length;
  };

  // Check which features are enabled for this site
  const enabledFeatures = site.features
    .filter((feature) => feature.isEnabled)
    .map((feature) => feature.feature);

  const hasPages = enabledFeatures.includes("PAGES");
  const hasBlogPosts = enabledFeatures.includes("BLOG_POSTS");
  const hasMediaFiles = enabledFeatures.includes("MEDIA_FILES");
  const hasContactManagement = enabledFeatures.includes("CONTACT_MANAGEMENT");
  const hasSponsors = enabledFeatures.includes("SPONSORS");

  // Build array of stats to display
  const statsToShow = [];

  if (hasPages) {
    statsToShow.push({
      icon: FileText,
      count: site._count.pages,
      label: "Pages",
      publishedCount:
        site._count.pages > 0 ? getPublishedCount(site.pages) : null,
    });
  }

  if (hasBlogPosts) {
    statsToShow.push({
      icon: FileText,
      count: site._count.blogPosts,
      label: "Posts",
      publishedCount:
        site._count.blogPosts > 0 ? getPublishedCount(site.blogPosts) : null,
    });
  }

  if (hasMediaFiles) {
    statsToShow.push({
      icon: ImageIcon,
      count: site._count.mediaFiles,
      label: "Media",
      publishedCount: null, // Media files don't have published state
    });
  }

  if (hasContactManagement) {
    statsToShow.push({
      icon: Mail,
      count: site._count.contactSubmissions || 0,
      label: "Contacts",
      publishedCount: null, // Contact submissions don't have published state
    });
  }

  if (hasSponsors) {
    statsToShow.push({
      icon: Users,
      count: site._count.sponsors || 0,
      label: "Sponsors",
      publishedCount: null, // Sponsors don't have published state
    });
  }

  // Don't render the card if no relevant features are enabled
  if (statsToShow.length === 0) {
    return null;
  }

  // Determine grid columns based on number of stats
  const gridCols =
    statsToShow.length === 1
      ? "grid-cols-1"
      : statsToShow.length === 2
      ? "grid-cols-2"
      : "grid-cols-3";

  return (
    <Card>
      <CardContent>
        <div className="space-y-4 pt-6">
          <div className={`grid ${gridCols} gap-4 text-sm`}>
            {statsToShow.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <IconComponent className="h-3 w-3" />
                    <span className="font-medium">{stat.count}</span>
                  </div>
                  <span className="text-muted-foreground">{stat.label}</span>
                  {stat.publishedCount !== null && (
                    <div className="text-xs text-muted-foreground">
                      {stat.publishedCount} published
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
