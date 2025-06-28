"use client";

import { useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Image as ImageIcon, Upload, X, Camera } from "lucide-react";
import type { Site } from "@/types/site";
import Image from "next/image";

type SiteImageManagementProps = {
  site: Site;
  onSiteUpdate: () => Promise<void>;
};

export function SiteImageManagement({
  site,
  onSiteUpdate,
}: SiteImageManagementProps) {
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (
    file: File,
    imageType: "logo" | "coverImage"
  ) => {
    if (imageType === "logo") {
      setUploadingLogo(true);
    } else {
      setUploadingCover(true);
    }

    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("imageType", imageType);

      const response = await fetch(`/api/sites/${site.id}/images`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Failed to upload ${imageType}`);
      }

      // Clear previews and refresh site data
      setLogoPreview(null);
      setCoverPreview(null);
      await onSiteUpdate();
    } catch (error) {
      console.error(`Failed to upload ${imageType}:`, error);
      alert(`Failed to upload ${imageType}. Please try again.`);
    } finally {
      setUploadingLogo(false);
      setUploadingCover(false);
    }
  };

  const handleFileSelect = (
    event: React.ChangeEvent<HTMLInputElement>,
    imageType: "logo" | "coverImage"
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (imageType === "logo") {
        setLogoPreview(result);
      } else {
        setCoverPreview(result);
      }
    };
    reader.readAsDataURL(file);

    // Upload the file
    handleImageUpload(file, imageType);
  };

  const handleRemoveImage = async (imageType: "logo" | "coverImage") => {
    try {
      const response = await fetch(`/api/sites/${site.id}/images`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageType }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Failed to remove ${imageType}`);
      }

      await onSiteUpdate();
    } catch (error) {
      console.error(`Failed to remove ${imageType}:`, error);
      alert(`Failed to remove ${imageType}. Please try again.`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Site Images
        </CardTitle>
        <CardDescription>
          Manage your site&apos;s logo and cover image
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Logo Section */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Site Logo</Label>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center bg-muted/10">
              {logoPreview ? (
                <div className="relative w-full h-full">
                  <Image
                    src={logoPreview}
                    alt="Logo preview"
                    fill
                    className="object-contain rounded-lg"
                  />
                </div>
              ) : site.logo ? (
                <div className="relative w-full h-full">
                  <Image
                    src={site.logo}
                    alt="Site logo"
                    fill
                    className="object-contain rounded-lg"
                  />
                </div>
              ) : (
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => logoInputRef.current?.click()}
                disabled={uploadingLogo}
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploadingLogo ? "Uploading..." : "Upload Logo"}
              </Button>
              {site.logo && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveImage("logo")}
                >
                  <X className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              )}
            </div>
          </div>
          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFileSelect(e, "logo")}
            className="hidden"
          />
          <p className="text-xs text-muted-foreground">
            Recommended: Square image, max 5MB
          </p>
        </div>

        {/* Cover Image Section */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Cover Image</Label>
          <div className="space-y-3">
            <div className="w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center bg-muted/10">
              {coverPreview ? (
                <div className="relative w-full h-full">
                  <Image
                    src={coverPreview}
                    alt="Cover preview"
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              ) : site.coverImage ? (
                <div className="relative w-full h-full">
                  <Image
                    src={site.coverImage}
                    alt="Site cover"
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              ) : (
                <div className="text-center">
                  <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No cover image
                  </p>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => coverInputRef.current?.click()}
                disabled={uploadingCover}
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploadingCover ? "Uploading..." : "Upload Cover"}
              </Button>
              {site.coverImage && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveImage("coverImage")}
                >
                  <X className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              )}
            </div>
          </div>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFileSelect(e, "coverImage")}
            className="hidden"
          />
          <p className="text-xs text-muted-foreground">
            Recommended: 16:9 aspect ratio, max 5MB
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
