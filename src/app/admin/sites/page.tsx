'use client';

import { useSession } from 'next-auth/react';
import { AuthenticatedLayout } from '@/components/AuthenticatedLayout';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Globe, Users, FileText, Image, Calendar, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

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
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
  });
  const router = useRouter();

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

  const getPublishedCount = (items: Array<{ isPublished: boolean }>) => {
    return items.filter(item => item.isPublished).length;
  };

  const handleCreateSite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setCreateError('Site name is required');
      return;
    }

    try {
      setCreateLoading(true);
      setCreateError(null);

      const response = await fetch('/api/sites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          domain: formData.domain.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create site');
      }

      // Add the new site to the list
      setSites(prevSites => [data.site, ...prevSites]);
      
      // Reset form and close modal
      setFormData({ name: '', domain: '' });
      setCreateModalOpen(false);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleInputChange = (field: 'name' | 'domain', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (createError) setCreateError(null);
  };

  // Check if user has access to sites (admin or super admin)
  if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'SUPERADMIN') {
    return (
      <AuthenticatedLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Access Denied</h1>
            <p className="text-muted-foreground mt-2">
              You don&apos;t have permission to access this page. Admin privileges required.
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
            <div className="flex items-center gap-2">
              <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Site
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Create New Site</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateSite} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Site Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Enter site name"
                        disabled={createLoading}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="domain">Domain (Optional)</Label>
                      <Input
                        id="domain"
                        value={formData.domain}
                        onChange={(e) => handleInputChange('domain', e.target.value)}
                        placeholder="example.com"
                        disabled={createLoading}
                      />
                      <p className="text-xs text-muted-foreground">
                        Leave empty if you don&apos;t have a domain yet
                      </p>
                    </div>
                    {createError && (
                      <div className="text-sm text-destructive">
                        {createError}
                      </div>
                    )}
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCreateModalOpen(false)}
                        disabled={createLoading}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createLoading}>
                        {createLoading ? 'Creating...' : 'Create Site'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
              <Button onClick={fetchSites} variant="outline">
                Refresh
              </Button>
            </div>
          </div>

          {sites.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Globe className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No sites found</h3>
                  <p className="text-muted-foreground">
                    You don&apos;t have access to any sites yet.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {sites.map((site) => (
                <Card
                  key={site.id}
                  className="hover:shadow-md transition-shadow cursor-pointer group"
                  onClick={() => router.push(`/admin/sites/${site.id}`)}
                >
                  <CardHeader className="flex flex-row items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-xl">{site.name}</CardTitle>
                      {site.domain && (
                        <CardDescription className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {site.domain}
                        </CardDescription>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant="secondary">
                        {site._count.users} user{site._count.users !== 1 ? 's' : ''}
                      </Badge>
                      <Button
                        size="sm"
                        variant="link"
                        className="p-0 h-auto text-xs text-primary underline opacity-80 group-hover:opacity-100"
                        onClick={e => {
                          e.stopPropagation();
                          router.push(`/admin/sites/${site.id}`);
                        }}
                      >
                        Edit
                      </Button>
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