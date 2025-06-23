'use client';

import { AuthenticatedLayout } from '@/components/AuthenticatedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Image, Upload } from 'lucide-react';

export default function MediaPage() {
  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Media Files</h1>
            <p className="text-muted-foreground">
              Manage media files for your site
            </p>
          </div>
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Upload Files
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Your Media Library
            </CardTitle>
            <CardDescription>
              Upload and manage images, videos, and other media files
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Image className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No media files yet</h3>
              <p className="text-muted-foreground mb-4">
                Upload your first media file to get started
              </p>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload Your First File
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  );
} 