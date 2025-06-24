'use client';

import { useSession } from 'next-auth/react';
import { AuthenticatedLayout } from '@/components/AuthenticatedLayout';
import { SiteSwitcher } from '@/components/SiteSwitcher';
import { FeatureStats } from '@/components/FeatureStats';
import { useCurrentSite } from '@/hooks/use-current-site';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Globe, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

export default function DashboardPage() {
  const { data: session } = useSession();
  const { currentSite, loading, error, refreshSite } = useCurrentSite();

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Welcome back, {session?.user?.name}
          </p>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
          </div>
        ) : error ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-destructive mb-4">{error}</p>
                <Button onClick={refreshSite}>Try Again</Button>
              </div>
            </CardContent>
          </Card>
        ) : currentSite ? (
          <div className="space-y-6">
            {/* Current Site Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <Globe className="h-6 w-6" />
                      {currentSite.name}
                      <SiteSwitcher />
                    </CardTitle>
                    {currentSite.domain && (
                      <CardDescription>
                        <a 
                          href={`https://${currentSite.domain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 hover:text-foreground transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                          {currentSite.domain}
                        </a>
                      </CardDescription>
                    )}
                  </div>
                  <Badge variant="secondary">
                    {currentSite._count.users} user{currentSite._count.users !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <FeatureStats currentSite={currentSite} />
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Recent Pages */}
              <Card>
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

              {/* Recent Blog Posts */}
              <Card>
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
            </div>

            {/* Site Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Site Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Created</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(currentSite.createdAt), 'MMMM d, yyyy')}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Team Members</p>
                    <div className="space-y-1">
                      {currentSite.users.map((user) => (
                        <div key={user.id} className="flex items-center justify-between text-sm">
                          <span>{user.name || user.email}</span>
                          <Badge variant="outline" className="text-xs">
                            {user.role}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Globe className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No sites found</h3>
                <p className="text-muted-foreground mb-4">
                  You don&apos;t have access to any sites yet. Contact your administrator to get access.
                </p>
                <Button onClick={refreshSite} variant="outline">
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AuthenticatedLayout>
  );
} 