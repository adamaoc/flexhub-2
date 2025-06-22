'use client';

import { useSession } from 'next-auth/react';
import { AuthenticatedLayout } from '@/components/AuthenticatedLayout';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Globe, Users, FileText, Image, Calendar, ArrowLeft, Save, UserPlus, UserMinus } from 'lucide-react';
import { format } from 'date-fns';

interface Site {
  id: string;
  name: string;
  domain: string | null;
  createdAt: string;
  updatedAt: string;
  users: Array<{
    id: string;
    name: string | null;
    email: string;
    role: string;
    image?: string | null;
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

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  image?: string | null;
}

export default function EditSitePage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const siteId = params.siteId as string;

  const [site, setSite] = useState<Site | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [addingUser, setAddingUser] = useState(false);
  const [removingUser, setRemovingUser] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    domain: '',
  });

  const fetchSite = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching site with ID:', siteId);
      const response = await fetch(`/api/sites/${siteId}`);
      
      console.log('🔍 Response status:', response.status);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Site not found');
        }
        const errorData = await response.json();
        console.log('🔍 Error data:', errorData);
        throw new Error(errorData.error || 'Failed to fetch site');
      }
      
      const data = await response.json();
      console.log('🔍 Site data received:', data);
      setSite(data.site);
      setFormData({
        name: data.site.name,
        domain: data.site.domain || '',
      });
    } catch (err) {
      console.error('🔍 Error fetching site:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        // Filter out users already assigned to this site
        const assignedUserIds = site?.users.map(u => u.id) || [];
        const available = data.users.filter((user: User) => !assignedUserIds.includes(user.id));
        setAvailableUsers(available);
      }
    } catch (error) {
      console.error('Failed to fetch available users:', error);
    }
  };

  useEffect(() => {
    if (siteId) {
      fetchSite();
    }
  }, [siteId]);

  useEffect(() => {
    if (site && addUserModalOpen) {
      fetchAvailableUsers();
    }
  }, [site, addUserModalOpen]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setSaveError('Site name is required');
      return;
    }

    try {
      setSaving(true);
      setSaveError(null);

      const response = await fetch(`/api/sites/${siteId}`, {
        method: 'PUT',
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
        throw new Error(data.error || 'Failed to update site');
      }

      // Update the site data
      setSite(prevSite => prevSite ? { ...prevSite, ...data.site } : null);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleAddUser = async () => {
    if (!selectedUserId) return;

    try {
      setAddingUser(true);

      const response = await fetch(`/api/sites/${siteId}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUserId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add user');
      }

      // Refresh site data to get updated user list
      await fetchSite();
      setSelectedUserId('');
      setAddUserModalOpen(false);
    } catch (error) {
      console.error('Failed to add user:', error);
    } finally {
      setAddingUser(false);
    }
  };

  const handleRemoveUser = async (userId: string) => {
    try {
      setRemovingUser(userId);

      const response = await fetch(`/api/sites/${siteId}/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to remove user');
      }

      // Refresh site data to get updated user list
      await fetchSite();
    } catch (error) {
      console.error('Failed to remove user:', error);
    } finally {
      setRemovingUser(null);
    }
  };

  const handleInputChange = (field: 'name' | 'domain', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (saveError) setSaveError(null);
  };

  const getPublishedCount = (items: Array<{ isPublished: boolean }>) => {
    return items.filter(item => item.isPublished).length;
  };

  // Check if user has access (super admin only)
  if (session?.user?.role !== 'SUPERADMIN') {
    return (
      <AuthenticatedLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Access Denied</h1>
            <p className="text-muted-foreground mt-2">
              You don&apos;t have permission to access this page. Super admin privileges required.
            </p>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-64" />
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  if (error || !site) {
    return (
      <AuthenticatedLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/admin/sites')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sites
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Edit Site</h1>
          </div>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-destructive mb-4">{error || 'Site not found'}</p>
                <Button onClick={() => router.push('/admin/sites')}>
                  Back to Sites
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/admin/sites')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sites
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Site</h1>
            <p className="text-muted-foreground">
              Manage site details and user assignments
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Site Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Site Details
              </CardTitle>
              <CardDescription>
                Update site name and domain information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Site Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter site name"
                    disabled={saving}
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
                    disabled={saving}
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty if you don&apos;t have a domain yet
                  </p>
                </div>
                {saveError && (
                  <div className="text-sm text-destructive">
                    {saveError}
                  </div>
                )}
                <Button type="submit" disabled={saving} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </form>

              <Separator className="my-6" />

              <div className="space-y-4">
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

                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  Created {format(new Date(site.createdAt), 'MMM d, yyyy')}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  Updated {format(new Date(site.updatedAt), 'MMM d, yyyy')}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Users ({site._count.users})
                  </CardTitle>
                  <CardDescription>
                    Manage user access to this site
                  </CardDescription>
                </div>
                <Dialog open={addUserModalOpen} onOpenChange={setAddUserModalOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add User
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Add User to Site</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="user">Select User</Label>
                        <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a user" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableUsers.map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src={user.image || undefined} />
                                    <AvatarFallback>
                                      {user.name?.charAt(0) || user.email.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium">{user.name || 'No name'}</div>
                                    <div className="text-xs text-muted-foreground">{user.email}</div>
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setAddUserModalOpen(false)}
                          disabled={addingUser}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleAddUser} disabled={!selectedUserId || addingUser}>
                          {addingUser ? 'Adding...' : 'Add User'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {site.users.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No users assigned to this site</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {site.users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.image || undefined} />
                          <AvatarFallback>
                            {user.name?.charAt(0) || user.email.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.name || 'No name'}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{user.role}</Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveUser(user.id)}
                          disabled={removingUser === user.id}
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthenticatedLayout>
  );
} 