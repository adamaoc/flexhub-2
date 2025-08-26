"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ui/image-upload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { useCurrentSite } from "@/hooks/use-current-site";
import { toast } from "sonner";

const WORK_CATEGORIES = [
  { value: "WEBSITE", label: "Website" },
  { value: "VIDEO", label: "Video" },
  { value: "CLI_TOOL", label: "CLI Tool" },
  { value: "SEO", label: "SEO" },
  { value: "SOCIAL_MEDIA", label: "Social Media" },
  { value: "ADVERTISING", label: "Advertising" },
  { value: "DESIGN", label: "Design" },
  { value: "CONSULTING", label: "Consulting" },
];

const WORK_TYPES = [
  { value: "WORK", label: "Work" },
  { value: "WEBSITE", label: "Website" },
];

interface WorkFormProps {
  mode: "create" | "edit";
  workId?: string;
}

export function WorkForm({ mode, workId }: WorkFormProps) {
  const router = useRouter();
  const { currentSite } = useCurrentSite();
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    image: "",
    logo: "",
    description: "",
    excerpt: "",
    type: "WORK" as "WORK" | "WEBSITE",
    date: "",
    client: "",
    featured: false,
    technologies: "",
    duration: "",
    results: "",
    githubUrl: "",
    videoUrl: "",
    url: "",
  });

  const fetchWork = useCallback(async () => {
    if (!currentSite || !workId) return;

    try {
      setLoading(true);
      const response = await fetch(
        `/api/sites/${currentSite.id}/works/${workId}`
      );
      if (response.ok) {
        const work = await response.json();
        setFormData({
          title: work.title,
          category: work.category,
          image: work.image || "",
          logo: work.logo || "",
          description: work.description,
          excerpt: work.excerpt || "",
          type: work.type,
          date: work.date.split("T")[0], // Convert to YYYY-MM-DD format
          client: work.client || "",
          featured: work.featured,
          technologies: work.technologies.join(", "),
          duration: work.duration || "",
          results: work.results || "",
          githubUrl: work.githubUrl || "",
          videoUrl: work.videoUrl || "",
          url: work.url || "",
        });
      } else {
        toast.error("Failed to fetch work details");
        router.push("/works");
      }
    } catch (error) {
      console.error("Error fetching work:", error);
      toast.error("Failed to fetch work details");
      router.push("/works");
    } finally {
      setLoading(false);
    }
  }, [currentSite, workId, router]);

  useEffect(() => {
    if (mode === "edit" && workId) {
      fetchWork();
    }
  }, [mode, workId, fetchWork]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSite) return;

    setSaving(true);

    try {
      const technologiesArray = formData.technologies
        .split(",")
        .map((tech) => tech.trim())
        .filter((tech) => tech.length > 0);

      const payload = {
        ...formData,
        technologies: technologiesArray,
        date: new Date(formData.date).toISOString(),
      };

      const url =
        mode === "create"
          ? `/api/sites/${currentSite.id}/works`
          : `/api/sites/${currentSite.id}/works/${workId}`;

      const response = await fetch(url, {
        method: mode === "create" ? "POST" : "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success(
          mode === "create"
            ? "Work created successfully"
            : "Work updated successfully"
        );
        router.push("/works");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to save work");
      }
    } catch (error) {
      console.error("Error saving work:", error);
      toast.error("Failed to save work");
    } finally {
      setSaving(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "WEBSITE":
        return "🌐";
      case "VIDEO":
        return "🎥";
      case "CLI_TOOL":
        return "⚡";
      case "SEO":
        return "🔍";
      case "SOCIAL_MEDIA":
        return "📱";
      case "ADVERTISING":
        return "📢";
      case "DESIGN":
        return "🎨";
      case "CONSULTING":
        return "💼";
      default:
        return "📂";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/works")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Works
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Work Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Enter work title"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Enter detailed work description (HTML markup allowed)"
                  rows={4}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  You can use HTML markup for rich formatting
                </p>
              </div>
              <div>
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) =>
                    setFormData({ ...formData, excerpt: e.target.value })
                  }
                  placeholder="Enter a brief plain text excerpt for summaries"
                  rows={2}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Plain text excerpt used for summaries and previews
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {WORK_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {getCategoryIcon(cat.value)} {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="type">Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: "WORK" | "WEBSITE") =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {WORK_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="date">Project Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Project Details */}
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="client">Client</Label>
                  <Input
                    id="client"
                    value={formData.client}
                    onChange={(e) =>
                      setFormData({ ...formData, client: e.target.value })
                    }
                    placeholder="Client name"
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: e.target.value })
                    }
                    placeholder="e.g., 2 weeks, 3 months"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="technologies">
                  Technologies (comma-separated)
                </Label>
                <Input
                  id="technologies"
                  value={formData.technologies}
                  onChange={(e) =>
                    setFormData({ ...formData, technologies: e.target.value })
                  }
                  placeholder="React, TypeScript, Node.js"
                />
              </div>
              <div>
                <Label htmlFor="results">Results/Outcomes</Label>
                <Textarea
                  id="results"
                  value={formData.results}
                  onChange={(e) =>
                    setFormData({ ...formData, results: e.target.value })
                  }
                  placeholder="Describe measurable results or outcomes"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Media & Links */}
          <Card>
            <CardHeader>
              <CardTitle>Media & Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <ImageUpload
                    label="Project Image"
                    value={formData.image}
                    onChange={(url) => setFormData({ ...formData, image: url })}
                    uploadEndpoint={`/api/sites/${currentSite?.id}/works/images`}
                    placeholder="https://example.com/project-image.jpg"
                  />
                </div>
                <div>
                  <ImageUpload
                    label="Logo"
                    value={formData.logo}
                    onChange={(url) => setFormData({ ...formData, logo: url })}
                    uploadEndpoint={`/api/sites/${currentSite?.id}/works/images`}
                    placeholder="https://example.com/logo.png"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="url">Project URL</Label>
                  <Input
                    id="url"
                    type="url"
                    value={formData.url}
                    onChange={(e) =>
                      setFormData({ ...formData, url: e.target.value })
                    }
                    placeholder="https://example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="githubUrl">GitHub URL</Label>
                  <Input
                    id="githubUrl"
                    type="url"
                    value={formData.githubUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, githubUrl: e.target.value })
                    }
                    placeholder="https://github.com/user/repo"
                  />
                </div>
                <div>
                  <Label htmlFor="videoUrl">Video URL</Label>
                  <Input
                    id="videoUrl"
                    type="url"
                    value={formData.videoUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, videoUrl: e.target.value })
                    }
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Display Options */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Display Options</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, featured: checked })
                  }
                />
                <Label htmlFor="featured">
                  Featured work (show on homepage)
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4 mb-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/works")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                saving ||
                !formData.title ||
                !formData.description ||
                !formData.category ||
                !formData.date
              }
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {mode === "create" ? "Create Work" : "Update Work"}
                </>
              )}
            </Button>
          </div>

          {/* Professional Disclaimer */}
          <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-600 text-center">
              <strong>Privacy Notice:</strong> All information entered in this
              form will be publicly visible on your portfolio. Please ensure
              that you only include information that you are comfortable sharing
              publicly. Do not include sensitive personal data or confidential
              client information.
            </p>
          </div>
        </div>
      </form>

      {/* Additional bottom spacing */}
      <div className="pb-16"></div>
    </div>
  );
}
