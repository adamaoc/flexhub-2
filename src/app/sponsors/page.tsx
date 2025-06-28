"use client";

import { useState, useEffect, useCallback } from "react";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCurrentSite } from "@/hooks/use-current-site";
import {
  Trophy,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";

interface Sponsor {
  id: string;
  name: string;
  url?: string;
  logo?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function SponsorsPage() {
  const { currentSite } = useCurrentSite();
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);

  // Get the sponsor feature info for this site
  const sponsorFeature = currentSite?.features?.find(
    (f) => f.feature === "SPONSORS" && f.isEnabled
  );
  const featureDisplayName = sponsorFeature?.displayName || "Sponsors";
  const featureDescription =
    sponsorFeature?.description || "Manage sponsors for your site";
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    logo: "",
    active: true,
  });

  const fetchSponsors = useCallback(async () => {
    if (!currentSite) return;

    try {
      const response = await fetch(`/api/sites/${currentSite.id}/sponsors`);
      if (response.ok) {
        const data = await response.json();
        setSponsors(data);
      } else {
        toast.error(`Failed to fetch ${featureDisplayName.toLowerCase()}`);
      }
    } catch {
      toast.error(`Error fetching ${featureDisplayName.toLowerCase()}`);
    } finally {
      setLoading(false);
    }
  }, [currentSite, featureDisplayName]);

  useEffect(() => {
    if (currentSite) {
      fetchSponsors();
    }
  }, [currentSite, fetchSponsors]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentSite) return;

    try {
      const url = editingSponsor
        ? `/api/sites/${currentSite.id}/sponsors/${editingSponsor.id}`
        : `/api/sites/${currentSite.id}/sponsors`;

      const method = editingSponsor ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(
          editingSponsor
            ? "Entry updated successfully"
            : "Entry created successfully"
        );
        setIsCreateDialogOpen(false);
        setEditingSponsor(null);
        resetForm();
        fetchSponsors();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to save entry");
      }
    } catch (error) {
      toast.error("Error saving entry");
      console.error(error);
    }
  };

  const handleDelete = async (sponsorId: string) => {
    if (!currentSite) return;

    try {
      const response = await fetch(
        `/api/sites/${currentSite.id}/sponsors/${sponsorId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        toast.success("Entry deleted successfully");
        fetchSponsors();
      } else {
        toast.error("Failed to delete entry");
      }
    } catch (error) {
      toast.error("Error deleting entry");
      console.error(error);
    }
  };

  const handleEdit = (sponsor: Sponsor) => {
    setEditingSponsor(sponsor);
    setFormData({
      name: sponsor.name,
      url: sponsor.url || "",
      logo: sponsor.logo || "",
      active: sponsor.active,
    });
    setIsCreateDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      url: "",
      logo: "",
      active: true,
    });
  };

  const openCreateDialog = () => {
    setEditingSponsor(null);
    resetForm();
    setIsCreateDialogOpen(true);
  };

  if (!currentSite) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">
            Please select a site to manage {featureDisplayName.toLowerCase()}
          </p>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {featureDisplayName}
            </h1>
            <p className="text-muted-foreground">{featureDescription}</p>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Add New
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Your {featureDisplayName}
            </CardTitle>
            <CardDescription>{featureDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Loading {featureDisplayName.toLowerCase()}...
                </p>
              </div>
            ) : sponsors.length === 0 ? (
              <div className="text-center py-8">
                <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No {featureDisplayName.toLowerCase()} yet
                </h3>
                <p className="text-muted-foreground mb-4">
                  Add your first entry to get started
                </p>
                <Button onClick={openCreateDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Entry
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Logo</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sponsors.map((sponsor) => (
                    <TableRow key={sponsor.id}>
                      <TableCell className="font-medium">
                        {sponsor.name}
                      </TableCell>
                      <TableCell>
                        {sponsor.logo ? (
                          <div className="flex items-center gap-2">
                            <ImageIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              Logo set
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            No logo
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {sponsor.url ? (
                          <a
                            href={sponsor.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-600 hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Visit
                          </a>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            No URL
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={sponsor.active ? "default" : "secondary"}
                        >
                          {sponsor.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {new Date(sponsor.createdAt).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(sponsor)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Entry
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete &quot;
                                  {sponsor.name}&quot;? This action cannot be
                                  undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(sponsor.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingSponsor ? "Edit Entry" : "Add New Entry"}
              </DialogTitle>
              <DialogDescription>
                {editingSponsor
                  ? "Update the information below."
                  : `Add a new ${featureDisplayName
                      .toLowerCase()
                      .slice(0, -1)} to your site.`}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder={`Enter ${featureDisplayName
                    .toLowerCase()
                    .slice(0, -1)} name`}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">Website URL</Label>
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
              <div className="space-y-2">
                <Label htmlFor="logo">Logo URL</Label>
                <Input
                  id="logo"
                  type="url"
                  value={formData.logo}
                  onChange={(e) =>
                    setFormData({ ...formData, logo: e.target.value })
                  }
                  placeholder="https://example.com/logo.png"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, active: checked })
                  }
                />
                <Label htmlFor="active">Active</Label>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingSponsor ? "Update Entry" : "Add Entry"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AuthenticatedLayout>
  );
}
