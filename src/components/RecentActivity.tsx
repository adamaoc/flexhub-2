import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Page {
  id: string;
  title: string;
  slug: string;
  isPublished: boolean;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  isPublished: boolean;
}

interface SiteFeature {
  id: string;
  feature: string;
  isEnabled: boolean;
  config: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

interface Site {
  pages: Page[];
  blogPosts: BlogPost[];
  features: SiteFeature[];
}

interface RecentActivityProps {
  currentSite: Site;
}

export function RecentActivity({ currentSite }: RecentActivityProps) {
  // Helper function to check if a feature is enabled
  const isFeatureEnabled = (featureType: string) => {
    return currentSite.features?.some(f => f.feature === featureType && f.isEnabled) || false;
  };

  // Get enabled cards to render
  const getEnabledCards = () => {
    const cards = [];

    // Pages card - only show if PAGES feature is enabled
    if (isFeatureEnabled('PAGES')) {
      cards.push(
        <Card key="pages">
          <CardHeader>
            <CardTitle className="text-lg">Recent Pages</CardTitle>
            <CardDescription>
              Latest pages in your site
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentSite.pages.length > 0 ? (
              <div className="space-y-3">
                {currentSite.pages.slice(0, 3).map((page) => (
                  <div key={page.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{page.title}</p>
                      <p className="text-sm text-muted-foreground">/{page.slug}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={page.isPublished ? "default" : "secondary"}>
                        {page.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No pages yet</p>
            )}
          </CardContent>
        </Card>
      );
    }

    // Blog Posts card - only show if BLOG_POSTS feature is enabled
    if (isFeatureEnabled('BLOG_POSTS')) {
      cards.push(
        <Card key="blog-posts">
          <CardHeader>
            <CardTitle className="text-lg">Recent Blog Posts</CardTitle>
            <CardDescription>
              Latest blog posts in your site
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentSite.blogPosts.length > 0 ? (
              <div className="space-y-3">
                {currentSite.blogPosts.slice(0, 3).map((post) => (
                  <div key={post.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{post.title}</p>
                      <p className="text-sm text-muted-foreground">/{post.slug}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={post.isPublished ? "default" : "secondary"}>
                        {post.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No blog posts yet</p>
            )}
          </CardContent>
        </Card>
      );
    }

    return cards;
  };

  const enabledCards = getEnabledCards();

  // If no features are enabled, show a message
  if (enabledCards.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No content features are enabled for this site. Enable the Pages or Blog Posts features to see recent activity.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Use responsive grid that adapts to the number of enabled cards
  const gridClass = enabledCards.length === 1 
    ? "grid gap-6 md:grid-cols-1 max-w-2xl" 
    : "grid gap-6 md:grid-cols-2";

  return (
    <div className={gridClass}>
      {enabledCards}
    </div>
  );
} 