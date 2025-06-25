'use client';

import { useState } from 'react';
import { useCurrentSite } from '@/hooks/use-current-site';
import { AuthenticatedLayout } from '@/components/AuthenticatedLayout';
import ContactFormManager from '@/components/ContactFormManager';
import ContactSubmissionsManager from '@/components/ContactSubmissionsManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, MessageSquare, AlertCircle } from "lucide-react";

export default function ContactManagementPage() {
  const { currentSite } = useCurrentSite();
  const [activeTab, setActiveTab] = useState('submissions');

  // Check if contact management feature is enabled
  const isContactFeatureEnabled = currentSite?.features?.some(
    feature => feature.feature === 'CONTACT_MANAGEMENT' && feature.isEnabled
  );

  if (!currentSite) {
    return <div>Loading...</div>;
  }

  if (!isContactFeatureEnabled) {
    return (
      <AuthenticatedLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Contact Management</h1>
            <p className="text-muted-foreground">
              Manage your contact forms and submissions
            </p>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                <CardTitle>Feature Not Enabled</CardTitle>
              </div>
              <CardDescription>
                The Contact Management feature is not enabled for this site.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Contact your administrator to enable the Contact Management feature for this site.
                Once enabled, you&apos;ll be able to create custom contact forms and manage submissions.
              </p>
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
            <h1 className="text-3xl font-bold">Contact Management</h1>
            <p className="text-muted-foreground">
              Manage your contact forms and submissions for {currentSite.name}
            </p>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Feature Enabled
          </Badge>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="submissions" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Submissions
            </TabsTrigger>
            <TabsTrigger value="form-settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Form Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="submissions" className="space-y-6">
            <ContactSubmissionsManager />
          </TabsContent>

          <TabsContent value="form-settings" className="space-y-6">
            <ContactFormManager />
          </TabsContent>
        </Tabs>
      </div>
    </AuthenticatedLayout>
  );
} 