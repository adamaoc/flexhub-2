"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";

interface ImageUploadProps {
  label: string;
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  uploadEndpoint: string;
  className?: string;
  placeholder?: string;
  maxSizeMB?: number;
  acceptedTypes?: string[];
}

export function ImageUpload({
  label,
  value,
  onChange,
  onRemove,
  uploadEndpoint,
  className = "",
  placeholder = "Enter image URL or upload a file",
  maxSizeMB = 5,
  acceptedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"],
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!acceptedTypes.includes(file.type)) {
      alert(
        `Please select a valid image file. Accepted types: ${acceptedTypes.join(
          ", "
        )}`
      );
      return;
    }

    // Validate file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    await handleFileUpload(file);
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(uploadEndpoint, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to upload image");
      }

      const data = await response.json();
      onChange(data.url);
      setPreview(null);
    } catch (error) {
      console.error("Failed to upload image:", error);
      alert("Failed to upload image. Please try again.");
      setPreview(null);
    } finally {
      setUploading(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleUrlChange = (url: string) => {
    onChange(url);
  };

  const handleRemove = async () => {
    if (!value) return;

    try {
      // If it's a URL from our upload endpoint, try to delete it
      if (
        value.includes("digitaloceanspaces.com") ||
        value.includes("localhost:")
      ) {
        const deleteUrl = `${uploadEndpoint}?url=${encodeURIComponent(value)}`;
        await fetch(deleteUrl, {
          method: "DELETE",
        });
      }
    } catch (error) {
      console.error("Failed to delete image:", error);
      // Continue with removal even if delete fails
    }

    onChange("");
    setPreview(null);
    if (onRemove) {
      onRemove();
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const displayImage = preview || value;

  return (
    <div className={`space-y-4 ${className}`}>
      <Label htmlFor={`${label}-input`}>{label}</Label>

      {/* Current Image Display */}
      {displayImage && (
        <div className="relative">
          <div className="relative w-full max-w-md mx-auto bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
            <img
              src={displayImage}
              alt={label}
              className="w-full h-48 object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                target.nextElementSibling?.classList.remove("hidden");
              }}
            />
            <div className="hidden flex items-center justify-center h-48 text-gray-400">
              <ImageIcon className="h-8 w-8" />
              <span className="ml-2">Failed to load image</span>
            </div>
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={handleRemove}
            disabled={uploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Upload Area */}
      <div className="space-y-3">
        {/* File Upload Button */}
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={triggerFileSelect}
            disabled={uploading}
            className="flex-1"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Image
              </>
            )}
          </Button>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(",")}
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* URL Input */}
        <div className="space-y-1">
          <Label
            htmlFor={`${label}-url-input`}
            className="text-sm text-gray-600"
          >
            Or enter image URL:
          </Label>
          <Input
            id={`${label}-url-input`}
            type="url"
            value={value || ""}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder={placeholder}
            disabled={uploading}
          />
        </div>
      </div>

      {/* Upload Info */}
      <p className="text-xs text-gray-500">
        Accepted formats:{" "}
        {acceptedTypes
          .map((type) => type.split("/")[1])
          .join(", ")
          .toUpperCase()}
        . Max size: {maxSizeMB}MB.
      </p>
    </div>
  );
}
