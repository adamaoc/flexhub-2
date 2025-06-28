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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Settings, Plus, X, Edit } from "lucide-react";
import type { Site } from "@/types/site";
import { useEffect } from "react";

type FeaturesManagementProps = {
  site: Site;
  onSiteUpdate: () => Promise<void>;
};

type AvailableFeature = {
  value: string;
  label: string;
  description: string;
};

export function FeaturesManagement({
  site,
  onSiteUpdate,
}: FeaturesManagementProps) {
  // Features management state
  const [addFeatureModalOpen, setAddFeatureModalOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<string>("");
  const [addingFeature, setAddingFeature] = useState(false);
  const [removingFeature, setRemovingFeature] = useState<string | null>(null);
  const [togglingFeature, setTogglingFeature] = useState<string | null>(null);
  const [availableFeatures, setAvailableFeatures] = useState<
    AvailableFeature[]
  >([]);
  const [loadingFeatures, setLoadingFeatures] = useState(false);
  const [editFeatureModalOpen, setEditFeatureModalOpen] = useState(false);
  const [editingFeature, setEditingFeature] = useState<
    Site["features"][0] | null
  >(null);
  const [editFormData, setEditFormData] = useState({
    displayName: "",
    description: "",
  });
  const [updatingFeature, setUpdatingFeature] = useState(false);

  // Fetch available feature definitions
  useEffect(() => {
    const fetchAvailableFeatures = async () => {
      try {
        setLoadingFeatures(true);
        const response = await fetch("/api/features/definitions");
        if (response.ok) {
          const data = await response.json();
          setAvailableFeatures(data.features || []);
        }
      } catch (error) {
        console.error("Failed to fetch available features:", error);
        // Fallback to empty array if API fails
        setAvailableFeatures([]);
      } finally {
        setLoadingFeatures(false);
      }
    };

    fetchAvailableFeatures();
  }, []);

  // Features management functions
  const handleAddFeature = async () => {
    if (!selectedFeature) return;

    try {
      setAddingFeature(true);

      const response = await fetch(`/api/sites/${site.id}/features`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          feature: selectedFeature,
          isEnabled: true,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to add feature");
      }

      // Refresh site data to get updated features list
      await onSiteUpdate();
      setSelectedFeature("");
      setAddFeatureModalOpen(false);
    } catch (error) {
      console.error("Failed to add feature:", error);
    } finally {
      setAddingFeature(false);
    }
  };

  const handleRemoveFeature = async (featureId: string) => {
    try {
      setRemovingFeature(featureId);

      const response = await fetch(
        `/api/sites/${site.id}/features/${featureId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to remove feature");
      }

      // Refresh site data to get updated features list
      await onSiteUpdate();
    } catch (error) {
      console.error("Failed to remove feature:", error);
    } finally {
      setRemovingFeature(null);
    }
  };

  const handleToggleFeature = async (featureId: string, isEnabled: boolean) => {
    try {
      setTogglingFeature(featureId);

      const response = await fetch(
        `/api/sites/${site.id}/features/${featureId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            isEnabled: !isEnabled,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update feature");
      }

      // Refresh site data to get updated features list
      await onSiteUpdate();
    } catch (error) {
      console.error("Failed to update feature:", error);
    } finally {
      setTogglingFeature(null);
    }
  };

  const handleEditFeature = (feature: Site["features"][0]) => {
    setEditingFeature(feature);
    setEditFormData({
      displayName: feature.displayName,
      description: feature.description || "",
    });
    setEditFeatureModalOpen(true);
  };

  const handleUpdateFeature = async () => {
    if (!editingFeature || !site) return;

    try {
      setUpdatingFeature(true);

      const response = await fetch(
        `/api/sites/${site.id}/features/${editingFeature.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            displayName: editFormData.displayName,
            description: editFormData.description,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update feature");
      }

      // Refresh site data to get updated features list
      await onSiteUpdate();
      setEditFeatureModalOpen(false);
      setEditingFeature(null);
    } catch (error) {
      console.error("Failed to update feature:", error);
    } finally {
      setUpdatingFeature(false);
    }
  };

  const getAvailableFeatures = () => {
    if (!site || !availableFeatures.length) return [];
    const enabledFeatures = site.features.map((f) => f.feature);
    return availableFeatures.filter((f) => !enabledFeatures.includes(f.value));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Site Features ({site.features.length})
            </CardTitle>
            <CardDescription>
              Manage which features are available for this site
            </CardDescription>
          </div>
          <Dialog
            open={addFeatureModalOpen}
            onOpenChange={setAddFeatureModalOpen}
          >
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Feature
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Feature to Site</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="feature">Select Feature</Label>
                  <Select
                    value={selectedFeature}
                    onValueChange={setSelectedFeature}
                    disabled={loadingFeatures}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          loadingFeatures
                            ? "Loading features..."
                            : "Choose a feature"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableFeatures().map((feature) => (
                        <SelectItem key={feature.value} value={feature.value}>
                          <div>
                            <div className="font-medium">{feature.label}</div>
                            <div className="text-xs text-muted-foreground">
                              {feature.description}
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
                    onClick={() => setAddFeatureModalOpen(false)}
                    disabled={addingFeature}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddFeature}
                    disabled={!selectedFeature || addingFeature}
                  >
                    {addingFeature ? "Adding..." : "Add Feature"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      {/* Edit Feature Dialog */}
      <Dialog
        open={editFeatureModalOpen}
        onOpenChange={setEditFeatureModalOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Feature</DialogTitle>
            <DialogDescription>
              Customize the display name and description for this feature on
              your site.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={editFormData.displayName}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    displayName: e.target.value,
                  })
                }
                placeholder="Enter display name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editFormData.description}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    description: e.target.value,
                  })
                }
                placeholder="Enter description"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setEditFeatureModalOpen(false)}
                disabled={updatingFeature}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateFeature}
                disabled={updatingFeature || !editFormData.displayName}
              >
                {updatingFeature ? "Updating..." : "Update Feature"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <CardContent>
        {site.features.length === 0 ? (
          <div className="text-center py-8">
            <Settings className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              No features enabled for this site
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {site.features.map((feature) => {
              return (
                <div
                  key={feature.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="font-medium">{feature.displayName}</div>
                      <div className="text-sm text-muted-foreground">
                        {feature.description || "No description available"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={feature.isEnabled}
                        onCheckedChange={() =>
                          handleToggleFeature(feature.id, feature.isEnabled)
                        }
                        disabled={togglingFeature === feature.id}
                      />
                      <span className="text-sm text-muted-foreground">
                        {feature.isEnabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditFeature(feature)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveFeature(feature.id)}
                      disabled={removingFeature === feature.id}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
