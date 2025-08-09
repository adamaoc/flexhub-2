import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";
import { getCurrentSiteAndPages } from "@/lib/server-utils";

export async function PagesDataProvider() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

  const { pages, error } = await getCurrentSiteAndPages(session.user.email);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pages</h1>
          <p className="text-muted-foreground">
            Manage static pages for your site
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Page
        </Button>
      </div>

      {error ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Your Pages
            </CardTitle>
            <CardDescription>
              Create and manage static pages for your website
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Access Error</h3>
              <p className="text-muted-foreground mb-4">
                {error === "No sites found"
                  ? "You don&apos;t have access to any sites. Contact your administrator to get access to a site."
                  : "There was an error accessing your site. Please try again or contact support."}
              </p>
              <Button variant="outline" disabled>
                Create Page
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : pages.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Your Pages
            </CardTitle>
            <CardDescription>
              Create and manage static pages for your website
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No pages yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first page to get started
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Page
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Your Pages ({pages.length})
            </CardTitle>
            <CardDescription>
              Create and manage static pages for your website
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pages.map((page) => (
                <div
                  key={page.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h3 className="font-medium">{page.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      /{page.slug}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
