"use client";

import { useState } from "react";
import { useCurrentSite } from "@/hooks/use-current-site";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { SocialMediaManager } from "@/components/SocialMediaManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, Share2, AlertCircle, BarChart3 } from "lucide-react";

export default function SocialMediaPage() {
  const { currentSite } = useCurrentSite();
  const [activeTab, setActiveTab] = useState("channels");

  // Check if social media integration feature is enabled
  const isSocialMediaFeatureEnabled = currentSite?.features?.some(
    (feature) =>
      feature.feature === "SOCIAL_MEDIA_INTEGRATION" && feature.isEnabled
  );

  if (!currentSite) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </AuthenticatedLayout>
    );
  }

  if (!isSocialMediaFeatureEnabled) {
    return (
      <AuthenticatedLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Social Media Integration</h1>
            <p className="text-muted-foreground">
              Connect and display your social media channels publicly
            </p>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                <CardTitle>Feature Not Enabled</CardTitle>
              </div>
              <CardDescription>
                The Social Media Integration feature is not enabled for this
                site.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Contact your administrator to enable the Social Media
                Integration feature for this site. Once enabled, you&apos;ll be
                able to connect YouTube, Twitch, and other social media channels
                to display your stats publicly via API.
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">
                  What you can do with Social Media Integration:
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Connect multiple YouTube and Twitch channels</li>
                  <li>• Choose which statistics to display publicly</li>
                  <li>• Provide a public API endpoint for external websites</li>
                  <li>• Display subscriber counts, view counts, and more</li>
                  <li>• Real-time data updates with smart caching</li>
                </ul>
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
            <h1 className="text-3xl font-bold">Social Media Integration</h1>
            <p className="text-muted-foreground">
              Manage social media channels and public statistics for{" "}
              {currentSite.name}
            </p>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Feature Enabled
          </Badge>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="channels" className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Channels
            </TabsTrigger>
            <TabsTrigger value="api-usage" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              API & Usage
            </TabsTrigger>
          </TabsList>

          <TabsContent value="channels" className="space-y-6">
            <SocialMediaManager site={currentSite} />
          </TabsContent>

          <TabsContent value="api-usage" className="space-y-6">
            <div className="grid gap-6">
              {/* Public API Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Public API Endpoint
                  </CardTitle>
                  <CardDescription>
                    Use this endpoint to fetch social media data for external
                    websites
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      API URL
                    </label>
                    <div className="mt-1 p-3 bg-muted rounded-lg font-mono text-sm break-all">
                      {window.location.origin}/api/public/sites/{currentSite.id}
                      /social-media
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Features
                    </label>
                    <ul className="mt-2 text-sm text-muted-foreground space-y-1">
                      <li>• CORS enabled for cross-origin requests</li>
                      <li>• No authentication required</li>
                      <li>• Cached responses (5 minutes)</li>
                      <li>• Only returns active channels and enabled stats</li>
                      <li>• Automatic data refresh from social platforms</li>
                    </ul>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Example Usage
                    </label>
                    <div className="mt-2 p-3 bg-muted rounded-lg text-sm">
                      <code>
                        {`fetch('${window.location.origin}/api/public/sites/${currentSite.id}/social-media')
  .then(res => res.json())
  .then(data => {
    data.channels.forEach(channel => {
      console.log(\`\${channel.channelName}: \${channel.stats[0]?.value}\`);
    });
  });`}
                      </code>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Documentation Links */}
              <Card>
                <CardHeader>
                  <CardTitle>Documentation & Examples</CardTitle>
                  <CardDescription>
                    Learn how to integrate your social media data
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">Live Demo</div>
                      <div className="text-sm text-muted-foreground">
                        Interactive example showing how to use the API
                      </div>
                    </div>
                    <a
                      href={`/social-media-api-example.html?siteId=${currentSite.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                    >
                      View Demo
                      <Settings className="h-3 w-3" />
                    </a>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">Integration Guide</div>
                      <div className="text-sm text-muted-foreground">
                        Complete documentation with examples
                      </div>
                    </div>
                    <a
                      href="/SOCIAL_MEDIA_INTEGRATION.md"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                    >
                      View Docs
                      <Settings className="h-3 w-3" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AuthenticatedLayout>
  );
}
