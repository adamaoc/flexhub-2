"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Globe, Save } from "lucide-react";
import type { Site } from "@/types/site";

type SiteDetailsProps = {
  site: Site;
  onSiteUpdate: () => Promise<void>;
};

export function SiteDetails({ site, onSiteUpdate }: SiteDetailsProps) {
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: site.name,
    description: site.description || "",
    domain: site.domain || "",
  });

  const handleInputChange = (
    field: "name" | "description" | "domain",
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (saveError) setSaveError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setSaveError("Site name is required");
      return;
    }

    try {
      setSaving(true);
      setSaveError(null);

      const response = await fetch(`/api/sites/${site.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          domain: formData.domain.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update site");
      }

      // Refresh site data
      await onSiteUpdate();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  return (
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
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter site name"
              disabled={saving}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Brief description of the site"
              disabled={saving}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Describe the purpose or content of this site
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="domain">Domain (Optional)</Label>
            <Input
              id="domain"
              value={formData.domain}
              onChange={(e) => handleInputChange("domain", e.target.value)}
              placeholder="example.com"
              disabled={saving}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty if you don&apos;t have a domain yet
            </p>
          </div>
          {saveError && (
            <div className="text-sm text-destructive">{saveError}</div>
          )}
          <Button type="submit" disabled={saving} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
