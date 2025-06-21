'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, X } from 'lucide-react';
import { toast } from 'sonner';

interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PageEditorProps {
  isOpen: boolean;
  onClose: () => void;
  page?: Page | null;
  siteId: string;
  onSave: () => void;
}

export function PageEditor({ isOpen, onClose, page, siteId, onSave }: PageEditorProps) {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    isPublished: false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!page;

  useEffect(() => {
    if (page) {
      setFormData({
        title: page.title,
        slug: page.slug,
        content: page.content || '',
        isPublished: page.isPublished,
      });
    } else {
      setFormData({
        title: '',
        slug: '',
        content: '',
        isPublished: false,
      });
    }
    setErrors({});
  }, [page, isOpen]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({ ...prev, title }));
    if (!isEditing) {
      setFormData(prev => ({ ...prev, slug: generateSlug(title) }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const url = isEditing 
        ? `/api/sites/${siteId}/pages/${page.id}`
        : `/api/sites/${siteId}/pages`;
      
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save page');
      }

      toast.success(isEditing ? 'Page updated successfully' : 'Page created successfully');
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving page:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save page');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!page || !confirm('Are you sure you want to delete this page? This action cannot be undone.')) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/sites/${siteId}/pages/${page.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete page');
      }

      toast.success('Page deleted successfully');
      onSave();
      onClose();
    } catch (error) {
      console.error('Error deleting page:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete page');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Page' : 'Create New Page'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update the page content and settings.'
              : 'Create a new page for your site.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Enter page title"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">/</span>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="page-slug"
                  className={errors.slug ? 'border-red-500' : ''}
                />
              </div>
              {errors.slug && (
                <p className="text-sm text-red-500">{errors.slug}</p>
              )}
              <p className="text-xs text-muted-foreground">
                The URL-friendly version of the title. This will be used in the page URL.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Enter page content (HTML supported)"
                rows={12}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                You can use HTML tags for formatting. Example: &lt;h1&gt;Heading&lt;/h1&gt;, &lt;p&gt;Paragraph&lt;/p&gt;
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isPublished"
                checked={formData.isPublished}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublished: checked }))}
              />
              <Label htmlFor="isPublished">Published</Label>
              <Badge variant={formData.isPublished ? "default" : "secondary"}>
                {formData.isPublished ? "Live" : "Draft"}
              </Badge>
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            <div className="flex items-center gap-2">
              {isEditing && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                  Delete
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {isEditing ? 'Update' : 'Create'} Page
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 