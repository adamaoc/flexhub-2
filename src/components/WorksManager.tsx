"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useCurrentSite } from "@/hooks/use-current-site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Github,
  Play,
  Star,
  Calendar,
  User,
  Clock,
  Target,
} from "lucide-react";
import { toast } from "sonner";

interface Work {
  id: string;
  title: string;
  category: string;
  image?: string;
  logo?: string;
  description: string;
  excerpt?: string;
  type: "WORK" | "WEBSITE";
  date: string;
  client?: string;
  featured: boolean;
  technologies: string[];
  duration?: string;
  results?: string;
  githubUrl?: string;
  videoUrl?: string;
  url?: string;
  createdAt: string;
  updatedAt: string;
}

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

export default function WorksManager() {
  const router = useRouter();
  const { currentSite } = useCurrentSite();
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [featuredFilter, setFeaturedFilter] = useState("all");

  const fetchWorks = useCallback(async () => {
    if (!currentSite) return;

    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (categoryFilter && categoryFilter !== "all")
        params.append("category", categoryFilter);
      if (featuredFilter && featuredFilter !== "all")
        params.append("featured", featuredFilter);

      const response = await fetch(
        `/api/sites/${currentSite.id}/works?${params}`
      );
      if (response.ok) {
        const data = await response.json();
        setWorks(data.works || []);
      } else {
        toast.error("Failed to fetch works");
      }
    } catch (error) {
      console.error("Error fetching works:", error);
      toast.error("Failed to fetch works");
    } finally {
      setLoading(false);
    }
  }, [currentSite, searchTerm, categoryFilter, featuredFilter]);

  useEffect(() => {
    fetchWorks();
  }, [fetchWorks]);

  const handleDelete = async (workId: string) => {
    if (!currentSite) return;

    try {
      const response = await fetch(
        `/api/sites/${currentSite.id}/works/${workId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        toast.success("Work deleted successfully");
        fetchWorks();
      } else {
        toast.error("Failed to delete work");
      }
    } catch (error) {
      console.error("Error deleting work:", error);
      toast.error("Failed to delete work");
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
    return <div>Loading works...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Portfolio Works</h2>
          <p className="text-muted-foreground">
            Manage your portfolio works and projects
          </p>
        </div>
        <Button onClick={() => router.push("/works/create")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Work
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <Input
          placeholder="Search works..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {WORK_CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {getCategoryIcon(cat.value)} {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={featuredFilter} onValueChange={setFeaturedFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="true">Featured</SelectItem>
            <SelectItem value="false">Not Featured</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Works Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {works.map((work) => (
          <Card key={work.id} className="relative">
            {work.featured && (
              <Badge className="absolute top-2 right-2 z-10" variant="default">
                <Star className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            )}

            {work.image && (
              <div className="aspect-video bg-muted rounded-t-lg overflow-hidden">
                <img
                  src={work.image}
                  alt={work.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-lg">{work.title}</CardTitle>
                    {work.logo && (
                      <img
                        src={work.logo}
                        alt={`${work.client || "Work"} logo`}
                        className="w-6 h-6 object-contain rounded"
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {getCategoryIcon(work.category)}{" "}
                      {work.category.replace("_", " ")}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {work.type}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {work.excerpt || work.description}
              </p>

              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  {new Date(work.date).toLocaleDateString()}
                </div>

                {work.client && (
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3" />
                    {work.client}
                  </div>
                )}

                {work.duration && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    {work.duration}
                  </div>
                )}

                {work.results && (
                  <div className="flex items-center gap-2">
                    <Target className="h-3 w-3" />
                    <span className="line-clamp-1">{work.results}</span>
                  </div>
                )}
              </div>

              {work.technologies.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {work.technologies.slice(0, 3).map((tech) => (
                    <Badge key={tech} variant="outline" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                  {work.technologies.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{work.technologies.length - 3} more
                    </Badge>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <div className="flex gap-1">
                  {work.url && (
                    <Button size="sm" variant="outline" asChild>
                      <a
                        href={work.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  )}
                  {work.githubUrl && (
                    <Button size="sm" variant="outline" asChild>
                      <a
                        href={work.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Github className="h-3 w-3" />
                      </a>
                    </Button>
                  )}
                  {work.videoUrl && (
                    <Button size="sm" variant="outline" asChild>
                      <a
                        href={work.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Play className="h-3 w-3" />
                      </a>
                    </Button>
                  )}
                </div>

                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(`/works/${work.id}/edit`)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Work</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete &quot;{work.title}
                          &quot;? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(work.id)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {works.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-muted-foreground">
              <div className="text-4xl mb-4">📂</div>
              <h3 className="text-lg font-semibold mb-2">No works found</h3>
              <p className="text-sm mb-4">
                {searchTerm ||
                (categoryFilter && categoryFilter !== "all") ||
                (featuredFilter && featuredFilter !== "all")
                  ? "Try adjusting your filters to see more results."
                  : "Get started by adding your first work to showcase your portfolio."}
              </p>
              <Button onClick={() => router.push("/works/create")}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Work
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
