"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
import { Trash2 } from "lucide-react";
import type { Site } from "@/types/site";

type DeleteSiteActionProps = {
  site: Site;
  onError: (error: string) => void;
};

export function DeleteSiteAction({ site, onError }: DeleteSiteActionProps) {
  const router = useRouter();
  const [deletingSite, setDeletingSite] = useState(false);

  const handleDeleteSite = async () => {
    try {
      setDeletingSite(true);

      const response = await fetch(`/api/sites/${site.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete site");
      }

      // Redirect to sites list after successful deletion
      router.push("/admin/sites");
    } catch (error) {
      console.error("Failed to delete site:", error);
      onError(error instanceof Error ? error.message : "Failed to delete site");
    } finally {
      setDeletingSite(false);
    }
  };

  return (
    <div className="flex justify-end mt-8 mb-10 pb-10">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" size="lg" className="shadow-lg">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Site
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              site &quot;{site.name}&quot; and all of its data including:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>{site._count.pages} pages</li>
                <li>{site._count.blogPosts} blog posts</li>
                <li>{site._count.mediaFiles} media files</li>
                <li>All user assignments and features</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingSite}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSite}
              disabled={deletingSite}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletingSite ? "Deleting..." : "Delete Site"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
