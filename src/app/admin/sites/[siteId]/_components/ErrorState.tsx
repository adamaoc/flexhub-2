"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { ArrowLeft } from "lucide-react";

type ErrorStateProps = {
  error: string | null;
};

export function ErrorState({ error }: ErrorStateProps) {
  const router = useRouter();

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin/sites")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sites
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Edit Site</h1>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-destructive mb-4">
                {error || "Site not found"}
              </p>
              <Button onClick={() => router.push("/admin/sites")}>
                Back to Sites
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  );
}
