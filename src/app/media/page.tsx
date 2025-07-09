"use client";

import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { MediaFileManager } from "@/components/MediaFileManager";

export default function MediaPage() {
  return (
    <AuthenticatedLayout>
      <MediaFileManager />
    </AuthenticatedLayout>
  );
}
