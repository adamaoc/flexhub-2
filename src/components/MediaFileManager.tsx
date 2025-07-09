"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Upload,
  File,
  Image as ImageIcon,
  Video,
  Music,
  FileText,
  Folder,
  Trash2,
  Copy,
  Download,
  Plus,
  FolderOpen,
} from "lucide-react";
import { useCurrentSite } from "@/hooks/use-current-site";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface MediaFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  folderPath: string | null;
  description: string | null;
  createdAt: string;
}

interface MediaFileManagerProps {
  className?: string;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith("image/")) return ImageIcon;
  if (mimeType.startsWith("video/")) return Video;
  if (mimeType.startsWith("audio/")) return Music;
  if (mimeType === "application/pdf" || mimeType.startsWith("text/"))
    return FileText;
  return File;
};

const isImage = (mimeType: string) => mimeType.startsWith("image/");

export function MediaFileManager({ className }: MediaFileManagerProps) {
  const { currentSite } = useCurrentSite();
  const [filesByFolder, setFilesByFolder] = useState<
    Record<string, MediaFile[]>
  >({});
  const [folders, setFolders] = useState<string[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>("root");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload form state
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadFolderPath, setUploadFolderPath] = useState("root");
  const [uploadDescription, setUploadDescription] = useState("");
  const [newFolderName, setNewFolderName] = useState("");

  const fetchMediaFiles = useCallback(async () => {
    if (!currentSite) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/sites/${currentSite.id}/media`);
      if (!response.ok) throw new Error("Failed to fetch media files");

      const data = await response.json();
      setFilesByFolder(data.filesByFolder);
      setFolders(data.folders);
    } catch (error) {
      console.error("Error fetching media files:", error);
    } finally {
      setLoading(false);
    }
  }, [currentSite]);

  useEffect(() => {
    fetchMediaFiles();
  }, [fetchMediaFiles]);

  const handleFileUpload = async () => {
    if (!currentSite || uploadFiles.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadPromises = uploadFiles.map(async (file, index) => {
        const formData = new FormData();
        formData.append("file", file);
        if (uploadFolderPath && uploadFolderPath !== "root")
          formData.append("folderPath", uploadFolderPath);
        if (uploadDescription)
          formData.append("description", uploadDescription);

        const response = await fetch(`/api/sites/${currentSite.id}/media`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Upload failed");
        }

        // Update progress
        setUploadProgress(((index + 1) / uploadFiles.length) * 100);

        return response.json();
      });

      await Promise.all(uploadPromises);

      // Reset form
      setUploadFiles([]);
      setUploadFolderPath("root");
      setUploadDescription("");
      setShowUploadDialog(false);

      // Refresh files
      await fetchMediaFiles();
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileDelete = async (fileId: string) => {
    if (!currentSite) return;

    if (!confirm("Are you sure you want to delete this file?")) return;

    try {
      const response = await fetch(`/api/sites/${currentSite.id}/media`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileId }),
      });

      if (!response.ok) throw new Error("Failed to delete file");

      await fetchMediaFiles();
    } catch (error) {
      console.error("Error deleting file:", error);
      alert("Failed to delete file. Please try again.");
    }
  };

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      alert("URL copied to clipboard");
    } catch (error) {
      console.error("Error copying URL:", error);
      alert("Failed to copy URL");
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    setUploadFiles(droppedFiles);
    setShowUploadDialog(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setUploadFiles(selectedFiles);
    setShowUploadDialog(true);
  };

  const createNewFolder = () => {
    if (!newFolderName.trim()) return;

    const folderPath =
      uploadFolderPath === "root" || !uploadFolderPath
        ? newFolderName.trim()
        : `${uploadFolderPath}/${newFolderName.trim()}`;

    // Add the new folder to the folders array if it doesn't exist
    if (!folders.includes(folderPath)) {
      setFolders((prev) => [...prev, folderPath]);
    }

    setUploadFolderPath(folderPath);
    setNewFolderName("");
  };

  const currentFiles = filesByFolder[selectedFolder] || [];
  const availableFolders = ["root", ...folders];

  if (!currentSite) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Please select a site first.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Media Files</h2>
          <p className="text-muted-foreground">
            Manage media files for {currentSite.name}
          </p>
        </div>
        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => setShowUploadDialog(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Files
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Upload Files</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="folder-select">Target Folder</Label>
                <Select
                  value={uploadFolderPath}
                  onValueChange={setUploadFolderPath}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select or create folder" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="root">Root folder</SelectItem>
                    {folders.map((folder) => (
                      <SelectItem key={folder} value={folder}>
                        {folder}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="New folder name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                />
                <Button
                  variant="outline"
                  onClick={createNewFolder}
                  disabled={!newFolderName.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div>
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Add a description for your files..."
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                />
              </div>

              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
                  dragActive
                    ? "border-primary bg-primary/10"
                    : "border-muted-foreground/25 hover:border-muted-foreground/50"
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploadFiles.length > 0 ? (
                  <div>
                    <Upload className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <p className="font-medium">
                      {uploadFiles.length} file(s) selected
                    </p>
                    <div className="mt-2 space-y-1">
                      {uploadFiles.map((file, index) => (
                        <div
                          key={index}
                          className="text-sm text-muted-foreground"
                        >
                          {file.name} ({formatFileSize(file.size)})
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p>Click to select files or drag and drop</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Maximum file size: 50MB
                    </p>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />

              {uploading && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowUploadDialog(false)}
                  disabled={uploading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleFileUpload}
                  disabled={uploadFiles.length === 0 || uploading}
                >
                  {uploading ? "Uploading..." : "Upload"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Folder Navigation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5" />
            Folders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {availableFolders.map((folder) => (
              <Button
                key={folder}
                variant={selectedFolder === folder ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFolder(folder)}
                className="h-8"
              >
                {folder === "root" ? (
                  <FolderOpen className="h-4 w-4 mr-1" />
                ) : (
                  <Folder className="h-4 w-4 mr-1" />
                )}
                {folder === "root" ? "Root" : folder}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Files Grid */}
      <Card>
        <CardHeader>
          <CardTitle>
            Files in {selectedFolder === "root" ? "Root" : selectedFolder}
          </CardTitle>
          <CardDescription>
            {currentFiles.length} file(s) in this folder
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading files...</p>
            </div>
          ) : currentFiles.length === 0 ? (
            <div className="text-center py-8">
              <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No files in this folder</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentFiles.map((file) => {
                const FileIcon = getFileIcon(file.mimeType);
                return (
                  <Card key={file.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                        {isImage(file.mimeType) ? (
                          <div className="relative w-full h-full">
                            <Image
                              src={file.url}
                              alt={file.originalName}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <FileIcon className="h-12 w-12 text-muted-foreground" />
                        )}
                      </div>

                      <div className="space-y-2">
                        <div>
                          <h3
                            className="font-medium text-sm truncate"
                            title={file.originalName}
                          >
                            {file.originalName}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(file.size)}
                          </p>
                        </div>

                        {file.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {file.description}
                          </p>
                        )}

                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyUrl(file.url)}
                            className="flex-1"
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copy URL
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(file.url, "_blank")}
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleFileDelete(file.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
