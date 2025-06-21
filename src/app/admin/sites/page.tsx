'use client';

import { useSession } from 'next-auth/react';
import { AuthenticatedLayout } from '@/components/AuthenticatedLayout';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Globe, Users, FileText, Image, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface Site {
  id: string;
  name: string;
  domain: string | null;
  createdAt: string;
  users: Array<{
    id: string;
    name: string | null;
    email: string;
    role: string;
  }>;
  pages: Array<{
    id: string;
    title: string;
    slug: string;
    isPublished: boolean;
    createdAt: string;
  }>;
  blogPosts: Array<{
    id: string;
    title: string;
    slug: string;
    isPublished: boolean;
    publishedAt: string | null;
    createdAt: string;
  }>;
  mediaFiles: Array<{
    id: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
    createdAt: string;
  }>;
  _count: {
    pages: number;
    blogPosts: number;
    mediaFiles: number;
    users: number;
  };
}

export default function SitesPage() {
  const { data: session } = useSession();
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSites = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/sites');
      
      if (!response.ok) {
        throw new Error('Failed to fetch sites');
      }
      
      const data = await response.json();
      setSites(data.sites);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSites();
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getPublishedCount = (items: Array<{ isPublished: boolean }>) => {
    return items.filter(item => item.isPublished).length;
  };

  // Check if user has access to sites (admin or super admin)
  if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'SUPERADMIN') {
    return (
      <AuthenticatedLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Access Denied</h1>
            <p className="text-muted-foreground mt-2">
              You don't have permission to access this page. Admin privileges required.
            </p>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      {loading ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Sites</h1>
              <p className="text-muted-foreground">
                Manage your sites and their content
              </p>
            </div>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
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
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Sites</h1>
              <p className="text-muted-foreground">
                Manage your sites and their content
              </p>
            </div>
          </div>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-destructive mb-4">{error}</p>
                <Button onClick={fetchSites}>Try Again</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Sites</h1>
              <p className="text-muted-foreground">
                Manage your sites and their content
              </p>
            </div>
            <Button onClick={fetchSites} variant="outline">
              Refresh
            </Button>
          </div>

          {sites.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Globe className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No sites found</h3>
                  <p className="text-muted-foreground">
                    You don't have access to any sites yet.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {sites.map((site) => (
                <Card key={site.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-xl">{site.name}</CardTitle>
                        {site.domain && (
                          <CardDescription className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            {site.domain}
                          </CardDescription>
                        )}
                      </div>
                      <Badge variant="secondary">
                        {site._count.users} user{site._count.users !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <FileText className="h-3 w-3" />
                          <span className="font-medium">{site._count.pages}</span>
                        </div>
                        <span className="text-muted-foreground">Pages</span>
                        {site._count.pages > 0 && (
                          <div className="text-xs text-muted-foreground">
                            {getPublishedCount(site.pages)} published
                          </div>
                        )}
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <FileText className="h-3 w-3" />
                          <span className="font-medium">{site._count.blogPosts}</span>
                        </div>
                        <span className="text-muted-foreground">Posts</span>
                        {site._count.blogPosts > 0 && (
                          <div className="text-xs text-muted-foreground">
                            {getPublishedCount(site.blogPosts)} published
                          </div>
                        )}
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Image className="h-3 w-3" />
                          <span className="font-medium">{site._count.mediaFiles}</span>
                        </div>
                        <span className="text-muted-foreground">Media</span>
                      </div>
                    </div>

                    {site.users.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-1 text-sm font-medium">
                          <Users className="h-3 w-3" />
                          Users
                        </div>
                        <div className="space-y-1">
                          {site.users.slice(0, 3).map((user) => (
                            <div key={user.id} className="flex items-center justify-between text-xs">
                              <span className="truncate">{user.name || user.email}</span>
                              <Badge variant="outline" className="text-xs">
                                {user.role}
                              </Badge>
                            </div>
                          ))}
                          {site.users.length > 3 && (
                            <div className="text-xs text-muted-foreground">
                              +{site.users.length - 3} more
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      Created {format(new Date(site.createdAt), 'MMM d, yyyy')}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </AuthenticatedLayout>
  );
} 