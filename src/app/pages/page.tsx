'use client';

import { useSession } from 'next-auth/react';
import { AuthenticatedLayout } from '@/components/AuthenticatedLayout';
import { useCurrentSite } from '@/hooks/use-current-site';
import { PageEditor } from '@/components/PageEditor';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Plus, 
  Edit, 
  Trash2, 
  FileText, 
  Calendar,
  Eye,
  EyeOff,
  RefreshCw,
  Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';

interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function PagesPage() {
  const { data: session } = useSession();
  const { currentSite } = useCurrentSite();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);

  const fetchPages = async () => {
    if (!currentSite) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/sites/${currentSite.id}/pages`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch pages');
      }
      
      const data = await response.json();
      setPages(data.pages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, [currentSite]);

  const handleCreatePage = () => {
    setEditingPage(null);
    setIsEditorOpen(true);
  };

  const handleEditPage = (page: Page) => {
    setEditingPage(page);
    setIsEditorOpen(true);
  };

  const handleSave = () => {
    fetchPages();
  };

  const filteredPages = pages.filter(page => 
    page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (isPublished: boolean) => {
    return isPublished ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        <Eye className="w-3 h-3 mr-1" />
        Published
      </Badge>
    ) : (
      <Badge variant="secondary">
        <EyeOff className="w-3 h-3 mr-1" />
        Draft
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy HH:mm');
  };

  if (!currentSite) {
    return (
      <AuthenticatedLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pages</h1>
            <p className="text-muted-foreground">
              Manage your site's static pages
            </p>
          </div>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No site selected</h3>
                <p className="text-muted-foreground">
                  You need to have access to a site to manage pages.
                </p>
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pages</h1>
            <p className="text-muted-foreground">
              Manage static pages for {currentSite.name}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={fetchPages} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button onClick={handleCreatePage}>
              <Plus className="h-4 w-4 mr-2" />
              Create Page
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search pages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-destructive mb-4">{error}</p>
                <Button onClick={fetchPages}>Try Again</Button>
              </div>
            </CardContent>
          </Card>
        ) : filteredPages.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchTerm ? 'No pages found' : 'No pages yet'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm 
                    ? 'Try adjusting your search terms.'
                    : 'Create your first page to get started.'
                  }
                </p>
                {!searchTerm && (
                  <Button onClick={handleCreatePage}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Page
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredPages.map((page) => (
              <Card key={page.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-xl">{page.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <span className="font-mono text-sm">/{page.slug}</span>
                        {getStatusBadge(page.isPublished)}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditPage(page)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Last updated: {formatDate(page.updatedAt)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Created: {formatDate(page.createdAt)}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        Content preview:
                      </div>
                      <div className="text-sm line-clamp-3">
                        {page.content 
                          ? page.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...'
                          : 'No content yet'
                        }
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Page Editor Modal */}
        <PageEditor
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          page={editingPage}
          siteId={currentSite.id}
          onSave={handleSave}
        />
      </div>
    </AuthenticatedLayout>
  );
} 